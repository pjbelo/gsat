/*
Utility to generate cnf and solutions
*/

const fs = require("fs");

//generates random CNF
function generateCNF(clauseNumber, clauseSize) {
  let cnf = [];
  for (let i = 0; i < clauseNumber; i++) {
    let clause = [];
    for (let j = 0; j < clauseSize; j++) {
      const randomValue = Math.random();
      let integer = Math.round(randomValue);
      if (integer && randomValue < 0.7) {
        integer = integer * -1;
      }

      clause.push(integer);
    }
    if (clause.find((literal) => literal !== 0)) {
      cnf.push(clause);
    }
  }
  return cnf.length ? cnf : generateCNF(clauseNumber, clauseSize);
}

// Read cnf from file
function readCnfFromFile(cnfFileName) {
  let cnf = [];
  let clause;
  let clauseNumber = 0;
  let numberOfVariables;
  let numberOfClauses;
  let lines = fs.readFileSync(cnfFileName).toString().split(/\n/);

  lines.forEach((line) => {
    if (line[0] == "c") {
      // comment lines
      console.log(line);
    } else if (line[0] == "p") {
      // header line
      let header = line.split(" ");
      numberOfVariables = header[2];
      numberOfClauses = header[3];

      console.log(`numberOfVariables: ${numberOfVariables}`);
      console.log(`numberOfClauses: ${numberOfClauses}`);
    } // clauses
    else {
      clause = [];
      for (let i = 0; i < numberOfVariables; i++) {
        clause[i] = 0;
      }

      let cnfClause = line.split(" ");
      cnfClause.forEach((variable) => {
        if (variable > 0) {
          clause[variable - 1] = 1;
        } else if (variable < 0) {
          clause[-1 * variable - 1] = -1;
        }
      });
      if (clauseNumber < numberOfClauses) {
        cnf.push(clause);
      }
      clauseNumber++;
    }
  });

  return cnf;
}

//Get string representation of CNF
function getExpression(cnf) {
  return cnf
    .map((clause) =>
      clause
        .map((literal, idx) =>
          literal ? (literal < 0 ? `¬X${idx + 1}` : `X${idx + 1}`) : ""
        )
        .join(" ")
        .replace(/\s+/g, "∨")
        .replace(/^∨/, "")
        .replace(/^/, "(")
        .replace(/∨$/, "")
        .replace(/$/, ")")
    )
    .join("∧");
}

//generates random solution
function generateSolution(cnf) {
  const length = Math.max(...cnf.map((clause) => clause.length));
  let solution = [];
  for (let i = 0; i < length; i++) {
    solution.push(Math.round(Math.random()));
  }
  return solution;
}

//checks if it is a solution for given CNF
function isSolution(solution, cnf) {
  let isExpressionTrue = true;
  let trueClauses = 0;

  for (let i = 0; i < cnf.length; i++) {
    let isClauseTrue = false;

    for (let j = 0; j < cnf[i].length; j++) {
      if (cnf[i][j] === 1) {
        isClauseTrue = isClauseTrue || !!solution[j];
      }
      if (cnf[i][j] === -1) {
        isClauseTrue = isClauseTrue || !solution[j];
      }
    }
    if (isClauseTrue) {
      trueClauses++;
    }
    isExpressionTrue = isExpressionTrue && isClauseTrue;
  }

  return { isSolution: isExpressionTrue, trueClauses };
}

module.exports = {
  generateCNF,
  readCnfFromFile,
  getExpression,
  generateSolution,
  isSolution,
};
