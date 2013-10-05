var confiningStrut = require('../index');
var esprima = require('esprima');

exports.testSimple = function(test){
    var input = 'function \n helloWorld /* comment */ ( \n ) {\n}',
        output = confiningStrut.addToStrings(input),
        toString = esprima.parse(output).body.pop().expression.right.body.body[0].argument.value;

    test.equals(toString, input);

    test.done();
};
