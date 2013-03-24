var confiningStrut = require('../index');

exports.testSimple = function(test){
    var input = 'function helloWorld(){}',
        output = confiningStrut.addToStrings(input);

    test.equals(output, [
        "function helloWorld() {",
        "}",
        "helloWorld.toString = function () {",
        "    return '" + input + "';",
        "};"
    ].join('\n'));

    test.done();
};
