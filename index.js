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

var escodegen = require('escodegen');

function nodeContent(content, node) {
    var lines = content.split('\n').slice(node.loc.start.line - 1, node.loc.end.line);
    lines[0] = lines[0].substr(node.loc.start.column);
    lines[lines.length - 1] = lines[lines.length - 1].substr(0, node.loc.end.column);

    return lines.join('\n');
}
exports.nodeContent = nodeContent;

function addToStringForFunctionDeclarations(content, ast) {
    require('estraverse').traverse(ast, {
        enter: function(node, parent) {
            var code, i;
            if(node.type != 'FunctionDeclaration') return;

            code = nodeContent(content, node);
            for(i = 0; i < parent.body.length; i++) {
                if(parent.body[i] != node) continue;
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
                return;
            }
            if(parent && parent.body) parent.body = [];
        }
    });
}
exports.addToStringForFunctionDeclarations = addToStringForFunctionDeclarations;

function addToStrings(content) {
    var ast = require('esprima').parse(content, {loc: true});
    addToStringForFunctionDeclarations(content, ast);
    return escodegen.generate(ast);
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
