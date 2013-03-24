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
