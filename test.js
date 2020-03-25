var xI = -0.3417;
var xIminusOne = -0.5292;

// var fx = Math.pow(xI, 3) - 0.165 * Math.pow(xI, 2) + 3.993 * Math.pow(10, -4);
// var fxMinusOne =
//   Math.pow(xIminusOne, 3) -
//   0.165 * Math.pow(xIminusOne, 2) +
//   3.993 * Math.pow(10, -4);

var fx = -11 - 22 * xI + 17 * Math.pow(xI, 2) - 2.5 * Math.pow(xI, 3);
var fxMinusOne =
  -11 -
  22 * xIminusOne +
  17 * Math.pow(xIminusOne, 2) -
  2.5 * Math.pow(xIminusOne, 3);

var xPlusOne = xI - (fx * (xI - xIminusOne)) / (fx - fxMinusOne);

console.log("f(xi): " + fx);
console.log("F(xi-1): " + fxMinusOne);
console.log("F(xi+1): " + xPlusOne);
