math.config({
//number: 'BigNumber', //'number'(=default), 'BigNumber', or 'Fraction'
//precision: 16, //Number of significant digits for BigNumbers
//notation: 'fixed', //‘auto’(=default), 'fixed', 'exponential', 'engineering', Regular number notation for numbers having an absolute value between lower and upper bounds, and uses exponential notation elsewhere. Lower bound is included, upper bound is excluded. For example 123.4 and 1.4e7.
//lowerExp: -10, //Exponent determining the lower boundary for formatting a value with an exponent when notation='auto. Default value is -3.
//upperExp: 10, //Exponent determining the upper boundary for formatting a value with an exponent when notation='auto. Default value is 5.
callback: 'function' // A custom formatting function, invoked for all numeric elements in value, for example all elements of a matrix, or the real and imaginary parts of a complex number. This callback can be used to override the built-in numeric notation with any type of formatting. Function callback is called with value as parameter and must return a string.
});
var parenthesis = 'auto',    // keep, auto, all (default is:keep)
    implicit = 'hide',       // hide, show
    autoexecution = true;   // if autoexecution becomes false, only the execute button works