// ===============================
// SPARX SOLVER — LOCAL MATH ENGINE
// ===============================

// --- Utility ---
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// --- Arithmetic ---
function solveArithmetic(expr) {
  try {
    const value = Function('"use strict"; return (' + expr + ');')();
    return { answer: value, steps: `Arithmetic evaluation:\n${expr} = ${value}` };
  } catch {
    return null;
  }
}

// --- Linear Equation: ax + b = c ---
function solveLinear(eq) {
  const cleaned = eq.replace(/\s+/g, "");
  const parts = cleaned.split("=");

  if (parts.length !== 2) return null;

  const left = parts[0];
  const right = Number(parts[1]);
  if (isNaN(right)) return null;

  const match = left.match(/^([+-]?\d*)x([+-]\d+)?$/);
  if (!match) return null;

  let a = match[1] === "" || match[1] === "+" ? 1 :
          (match[1] === "-" ? -1 : Number(match[1]));
  let b = match[2] ? Number(match[2]) : 0;

  const x = (right - b) / a;

  return {
    answer: x,
    steps:
`Linear equation:
${eq}

a = ${a}
b = ${b}
c = ${right}

x = (c - b) / a
x = (${right} - ${b}) / ${a}
x = ${x}`
  };
}

// --- Quadratic: ax^2 + bx + c = 0 ---
function solveQuadratic(expr) {
  const cleaned = expr.replace(/\s+/g, "");
  const match = cleaned.match(/^([+-]?\d*)x\^2([+-]\d*)x([+-]\d+)=0$/);

  if (!match) return null;

  let a = match[1] === "" || match[1] === "+" ? 1 :
          (match[1] === "-" ? -1 : Number(match[1]));
  let b = Number(match[2]);
  let c = Number(match[3]);

  const D = b*b - 4*a*c;
  if (D < 0) return { answer: null, steps: "No real roots." };

  const x1 = (-b + Math.sqrt(D)) / (2*a);
  const x2 = (-b - Math.sqrt(D)) / (2*a);

  return {
    answer: [x1, x2],
    steps:
`Quadratic:
${expr}

a = ${a}, b = ${b}, c = ${c}
Discriminant = ${D}

x₁ = ${x1}
x₂ = ${x2}`
  };
}

// --- Matrix operations ---
function parseMatrix(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function matrixAdd(A, B) {
  if (A.length !== B.length || A[0].length !== B[0].length) return null;
  return A.map((row, i) => row.map((v, j) => v + B[i][j]));
}

function matrixMultiply(A, B) {
  if (A[0].length !== B.length) return null;
  const result = [];
  for (let i = 0; i < A.length; i++) {
    result[i] = [];
    for (let j = 0; j < B[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < B.length; k++) sum += A[i][k] * B[k][j];
      result[i][j] = sum;
    }
  }
  return result;
}

function matrixDet(A) {
  if (A.length === 2 && A[0].length === 2) {
    return A[0][0]*A[1][1] - A[0][1]*A[1][0];
  }
  return null;
}

// --- Calculus (basic) ---
function derivative(expr) {
  // Very basic: derivative of x^n
  const match = expr.match(/^(\d*)x\^(\d+)$/);
  if (!match) return null;

  const coef = match[1] === "" ? 1 : Number(match[1]);
  const power = Number(match[2]);

  return {
    answer: `${coef * power}x^${power - 1}`,
    steps: `d/dx of ${expr} = ${coef * power}x^${power - 1}`
  };
}

// --- Main solver ---
function solveMath(input) {
  const expr = input.trim();

  // Matrix?
  if (expr.startsWith("[[")) {
    return { answer: "Matrix detected. Use matrixAdd/matrixMultiply.", steps: "" };
  }

  // Quadratic?
  if (expr.includes("x^2")) {
    const q = solveQuadratic(expr);
    if (q) return q;
  }

  // Linear?
  if (expr.includes("=")) {
    const lin = solveLinear(expr);
    if (lin) return lin;
  }

  // Arithmetic?
  const ar = solveArithmetic(expr);
  if (ar) return ar;

  return { answer: null, steps: "Unsupported expression (v1)." };
}
