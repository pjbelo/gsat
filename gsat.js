/*
Simple implementation of GSAT
To execute this file in the terminal:

node gsat.js

Node.js is required

To generate lighter csv files: 
- Comment line 62 and uncomment line 61
- Remove or comment 'expression' on lines 126,134,141
*/


const { performance } = require("perf_hooks");
const fs = require("fs");

// change filename here to read cnf data from other file
//const cnfFileName = "./cnf/simple_v3_c2.cnf";
//const cnfFileName = "./cnf/quinn.cnf";
const cnfFileName = "./cnf/zebra_v155_c1135.cnf";


//checks if it is a solution for given CNF
function isSolution(solution, cnf) {
  let isExpressionTrue = true;

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

    isExpressionTrue = isExpressionTrue && isClauseTrue;
  }

  return isExpressionTrue;
}

//flips variables of solution
function flipCurrentSolution(solution, index) {
  const newSolution = [...solution];
  newSolution[index] = +!newSolution[index];

  return newSolution;
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

//GSat
function gsat(cnf, maxTries, maxFlips) {
  for (let i = 0; i < maxTries; i++) {
    let solution = generateSolution(cnf);
    let index = 0;
    for (let j = 0; j < maxFlips; j++) {
      if (isSolution(solution, cnf)) {
        // return { solution, flips: j, tries: i + 1 };
        return { solution: "solution found", flips: j, tries: i + 1 };
      }
      if (index >= solution.length) {
        index = 0;
      }
      solution = flipCurrentSolution(solution, index);
      index++;
    }
  }
  return {
    solution: "no satisfying assignment found",
    flips: maxFlips,
    tries: maxTries,
  };
}

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



// Read cnf from file
function readCnfFromFile(cnfFileName) {
  let cnf = [];
  let clause;
  let clauseNumber = 0;
  let numberOfVariables;
  let numberOfClauses;
  
  let lines = fs.readFileSync(cnfFileName).toString().split(/\n/);
  //console.log(lines);
  lines.forEach((line => {

    if (line[0]=="c") // comment lines
    {
      console.log(line);
    } 
    else if(line[0]=="p") // header line
    {
      let header = line.split(" ");
      numberOfVariables = header[2];
      numberOfClauses = header[3];

      console.log(`numberOfVariables: ${numberOfVariables}`);
      console.log(`numberOfClauses: ${numberOfClauses}`);

    } 
    else // clauses
    {
      //console.log(line);

      clause = [];
      for (let i = 0; i < numberOfVariables; i++) {
        clause[i]=0;
      }

      let cnfClause = line.split(" ");
      cnfClause.forEach((variable) => {
        if (variable > 0)
        {
          clause[variable-1] = 1;
        }
        else if (variable < 0)
        {
          clause[(-1 * variable) -1] = -1;
        }
      });
      if (clauseNumber < numberOfClauses)
      {
        cnf.push(clause);
      }
      clauseNumber ++;
    }

  }));

  //console.log("cnf:");
  //console.log(cnf);

  return cnf;
}



//Generate tests with random clause size and clause number and write results in a csv file
function main(totalOfTests = 10, maxTries = 3, maxFlips = 10) {
  const stream = fs.createWriteStream("results.csv");

  stream.once("open", () => {
    stream.write(
      "Test number,Execution time (ms),Clause number,Clause size,Expression,Solution,Flips,Tries\n"
    );

    for (let i = 0; i < totalOfTests; i++) {
      const clauseNumber = Math.round(Math.random() * 10 * (i + 1));
      const clauseSize = Math.round(Math.random() * 10 * (i + 1));

      const cnf = generateCNF(clauseNumber, clauseSize);
      const expression = getExpression(cnf);

      const start = performance.now();
      const solution = gsat(cnf, maxTries, maxFlips);
      const end = performance.now();

      stream.write(
        `${i + 1},${end - start},${clauseNumber},${clauseSize},${expression},"${
          solution.solution
        }",${solution.flips},${solution.tries}\n`
      );

      //Uncomment this line to print results in terminal
      // console.log(`Test ${i + 1}`);
      // console.log("Clause size:", clauseSize);
      // console.log("Clause number:", clauseNumber);
      // console.log("Expression: ", expression);
      // console.log("Solution: ", JSON.stringify(solution.solution));
      // console.log("Flips: ", solution.flips);
      // console.log(`Execution time: ${end - start} ms`);
    }
    stream.end();
  });
}

//Generate tests from cnf file with diferent maxFlips and maxTries and write results in a csv file
function mainFromFile(maxTries = 5, maxFlips = 1000) {
  const cnf = readCnfFromFile(cnfFileName);  
  const expression = getExpression(cnf);
  const start = performance.now();
  const solution = gsat(cnf, maxTries, maxFlips);
  const end = performance.now();



      //Uncomment this line to print results in terminal
       //console.log(`Test ${i + 1}`);
       //console.log("Clause size:", clauseSize);
       //console.log("Clause number:", clauseNumber);
       console.log("Expression: ", expression);
       console.log("Solution: ", JSON.stringify(solution.solution));
       console.log("Flips: ", solution.flips);
       console.log(`Execution time: ${end - start} ms`);


}

main();
mainFromFile();
