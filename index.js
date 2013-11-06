/**
    # Confining Strut

    [ECMAScript 5.1 defines
    Function.prototype.toString](http://es5.github.com/#x15.3.4.2) as
    follows:

    > An implementation-dependent representation of the function is
    > returned. This representation has the syntax of a
    > FunctionDeclaration. Note in particular that the use and
    > placement of white space, line terminators, and semicolons
    > within the representation String is implementation-dependent.

    The definition only requires that the String returned is a valid
    FunctionDeclaration. That raises a few questions:

    * How can we get a FunctionDeclaration from a FunctionExpression?
    * Why is the representation implementation-dependent?
    * Does the returned String even have to represent the Function?

    Let's redefine Function's toString as the following:

    > For FunctionDeclarations, the literal text input which defined
    > the function is returned. For FunctionExpressions, the returned
    > String is undefined.

    This program/library takes code that contains function
    declarations, like so:

        function helloWorld(){console.log(42);}
        console.log(helloWorld.toString());

    And turns the code into:

        function helloWorld() {
            console.log(42);
        }
        helloWorld.toString = function () {
            return 'function helloWorld(){console.log(42);}';
        };
        console.log(helloWorld.toString());

    As you can see, the toString function has been "baked" into the
    JavaScript output.
**/

function addToStringForFunctionDeclarations(content, ast) {
    require('estraverse').traverse(ast, {
        enter: function(node, parent) {
            var code, i;
            if(node.type != 'FunctionDeclaration') return;

            code = content.slice(node.range[0], node.range[1]);
            i = parent.body.indexOf(node);
            parent.body.splice(i + 1, 0, {
                type: 'ExpressionStatement',
                expression: {
                    type: 'AssignmentExpression',
                    operator: '=',
                    left: {
                        type: 'MemberExpression',
                        object: node.id,
                        property: {
                            type: 'identifier',
                            name: 'toString'
                        }
                    },
                    right: {
                        type: 'FunctionExpression',
                        params: [],
                        body: {
                            type: 'BlockStatement',
                            body: [{
                                type: 'ReturnStatement',
                                argument: {
                                    type: 'Literal',
                                    value: code
                                }
                            }]
                        }
                    }
                }
            });
        }
    });
}
exports.addToStringForFunctionDeclarations = addToStringForFunctionDeclarations;

function addToStrings(content) {
    var ast = require('esprima').parse(content, {range: true});
    addToStringForFunctionDeclarations(content, ast);
    return require('escodegen').generate(ast);
}
exports.addToStrings = addToStrings;

function main(filename) {
    var content = require('fs').readFileSync(process.argv[2], 'utf8');
    console.log(addToStrings(content));
}
exports.main = main;

if(require.main == module) {
    main();
}
