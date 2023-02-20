replacements = {};
// our extended configuration options
const anglesConfig = {
    rad: "Angles and arcs are measured in radians, click here to change it.",
    deg: "Angles and arcs are measured in degrees, click here to change it.",
    grad: "Angles and arcs are measured in gradients, click here to change it.",
    unit: 'rad',
    getDescr : function(u) {
        switch(u) {
            case "rad": return this.rad;
            case "deg": return this.deg;
            case "grad": return this.grad;
        }
    },
    toggleUnit : function() {
        switch(this.unit) {
            case "rad": this.unit = "deg"; break;
            case "deg": this.unit = "grad"; break;
            case "grad": this.unit = "rad"; break;
        }
    }
};

// create trigonometric functions replacing the input depending on angle config
const fns1 = ['sin', 'cos', 'tan', 'sec', 'cot', 'csc'];
fns1.forEach(function(name) {
  const fn = math[name]; // the original function
  const fnNumber = function (x) {
    // convert from configured type of angles to radians
    var temp;
    switch (anglesConfig.unit) {
        case 'deg' : temp = fn(math.mod(x,360)*math.PI/180); break;
        case 'grad': temp = fn(math.mod(x,400)*math.PI/200); break;
        default : temp=x/(math.tau); temp= math.abs(temp)>1 ? x-math.floor(temp)*math.tau : x; temp = fn(temp);
        //default: temp=fn(x); return math.abs(temp)<1e-12 ? 0 : (math.abs(temp)>1e+11 ? (math.sign(temp)>0 ? Infinity : -Infinity) : temp);
    }
    return math.abs(temp)<1.0E-10 ? 0 : temp;
  };
  // create a typed-function which check the input types
  replacements[name] = math.typed(name, {
    'number | Complex': fnNumber,
    'Array | Matrix': function (x) {
      return math.map(x, fnNumber);
    }
  });
});

// create trigonometric functions replacing the output depending on angle config
const fns2 = ['asin', 'acos', 'atan', 'atan2', 'acot', 'acsc', 'asec', 'arg'];
fns2.forEach(function(name) {
  const fn = math[name]; // the original function
  const fnNumber = function (x) {
    const result = fn(x);
    if (typeof result === 'number') {
      // convert to radians to configured type of angles
      switch(anglesConfig.unit) {
        case 'deg':  return result / 2 / Math.PI * 360;
        case 'grad': return result / 2 / Math.PI * 400;
        default: return result;
      }
    }
    return result;
  };
  // create a typed-function which check the input types
  replacements[name] = math.typed(name, {
    'number | Complex': fnNumber,
    'Array | Matrix': function (x) {
      return math.map(x, fnNumber);
    }
  });
});

// import all replacements into math.js, override existing trigonometric functions
math.import(replacements, {override: true});