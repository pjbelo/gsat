/*
Implementation of tests for GSAT
To execute this file in the terminal:

node main.js

Node.js is required
*/

const { performance } = require("perf_hooks");
const fs = require("fs");
const path = require('path');
const cnf = require("./cnf");
const sat = require("./sat");

//Generate tests for fisrt aproach of gsat with random clause size and clause number and write results in a csv file
function testRandomGsat(totalOfTests = 100, maxTries = 3, maxFlips = 10) {
  const stream = fs.createWriteStream("./results/resultsGsat.csv");

  stream.once("open", () => {
    stream.write(
      "Test number,Execution time (ms),Clause number,Clause size,Solution,Flips,Tries\n"
    );

    for (let i = 0; i < totalOfTests; i++) {
      const clauseNumber = Math.round(Math.random() * 10 * (i + 1));
      const clauseSize = Math.round(Math.random() * 10 * (i + 1));

      const expression = cnf.generateCNF(clauseNumber, clauseSize);
      // const expressionStr = cnf.getExpression(expression);

      const start = performance.now();
      const solution = sat.gsat(expression, maxTries, maxFlips);
      const end = performance.now();

      stream.write(
        `${i + 1},${end - start},${clauseNumber},${clauseSize},"${
          solution.solution
        }",${solution.flips},${solution.tries}\n`
      );

      //Uncomment this line to print results in terminal
      // console.log(`Test ${i + 1}`);
      // console.log("Clause size:", clauseSize);
      // console.log("Clause number:", clauseNumber);
      // console.log("Expression: ", expressionStr);
      // console.log("Solution: ", JSON.stringify(solution.solution));
      // console.log("Flips: ", solution.flips);
      // console.log(`Execution time: ${end - start} ms`);
    }
    stream.end();
  });
}

//Generate tests for genetic aproach with random clause size and clause number and write results in a csv file
function testRandomGenetic(totalOfTests = 100, maxMutations = 3, popSize = 10) {
  const stream = fs.createWriteStream("./results/resultsGenetic.csv");

  stream.once("open", () => {
    stream.write(
      "Test number,Execution time (ms),Clause number,Clause size,Solution,Mutations\n"
    );

    for (let i = 0; i < totalOfTests; i++) {
      const clauseNumber = Math.round(Math.random() * 10 * (i + 1));
      const clauseSize = Math.round(Math.random() * 10 * (i + 1));

      const expression = cnf.generateCNF(clauseNumber, clauseSize);
      // const expressionStr = cnf.getExpression(expression);

      const start = performance.now();
      const solution = sat.geneticSat(expression, popSize, maxMutations);
      const end = performance.now();

      stream.write(
        `${i + 1},${end - start},${clauseNumber},${clauseSize},"${
          solution.solution
        }",${solution.mutations}\n`
      );

      //Uncomment this line to print results in terminal
      //   console.log(`Test ${i + 1}`);
      //   console.log("Clause size:", clauseSize);
      //   console.log("Clause number:", clauseNumber);
      //   console.log("Expression: ", expressionStr);
      //   console.log("Solution: ", solution.solution);
      //   console.log("Mutations: ", solution.mutations);
      //   console.log(`Execution time: ${end - start} ms`);
    }
    stream.end();
  });
}

// Generate tests from cnf parsed from files on cnf directory
function testAllFilesInFolder(maxTries = 5, maxFlips = 100) {
  const testFolder = "./cnf/";

  const stream = fs.createWriteStream("./results/resultsFiles.csv");

  stream.once("open", () => {
    stream.write(
      "Filename,GSAT Execution time (ms),GSAT Solution,GSAT Flips,GSAT Tries,Genetic Execution time (ms),Genetic Solution,Genetic mutations\n"
    );
    fs.readdirSync(testFolder).forEach((file) => {
      const expression = cnf.readCnfFromFile(testFolder + file);

      const start = performance.now();
      const solution = sat.gsat(expression, maxTries, maxFlips);
      const gsatEnd = performance.now();

      const maxMutations = maxTries;
      const popSize = maxFlips;
      const geneticSolution = sat.geneticSat(expression, maxMutations, popSize);
      const geneticEnd = performance.now();

      stream.write(
        `${file},${gsatEnd - start},"${solution.solution}",${solution.flips},${
          solution.tries
        },${geneticEnd - gsatEnd},${geneticSolution.solution},${
          geneticSolution.mutations
        }\n`
      );

      //Uncomment this line to print results in terminal
       console.log(`Filename ${file}`);
       console.log("Gsat Solution: ", JSON.stringify(solution.solution));
       console.log("Genetic Solution: ", JSON.stringify(geneticSolution.solution));
       console.log("Flips: ", solution.flips);
       console.log("Tries: ", solution.tries);
       console.log("Mutations: ", geneticSolution.mutations);
       console.log(`Gsat Execution time: ${gsatEnd - start} ms`);
       console.log(`Genetic Execution time: ${geneticEnd - gsatEnd} ms`);
    });

    stream.end();
  });


}



// change filename here to read cnf data from other file
//const cnfFileName = "./cnf/simple_v3_c2.cnf";
const cnfFileName = "./cnf/quinn.cnf";
//const cnfFileName = "./cnf/zebra_v155_c1135.cnf";
//const cnfFileName = "./cnf/hanoi4.cnf";
//const cnfFileName = "./cnf/par8-1-c.cnf";
//const cnfFileName = "./cnf/aim-50-1_6-yes1-4.cnf";



// Generate tests from cnf file with diferent maxFlips and maxTries and write results in a csv file
// Initial maxTries and maxFlips will be incremented (+1, *2) in each new test
function testFile(totalOfTests = 10, maxTries = 5, maxFlips = 1000) {
  //const cnf = readCnfFromFile(cnfFileName);  
  const expression = cnf.readCnfFromFile(cnfFileName);
  // console.log("Expression: ", expression);

  const stream = fs.createWriteStream(`./results/results_testFile-${path.basename(cnfFileName)}.csv`);

  stream.once("open", () => {

    stream.write(`Filename: ${cnfFileName} \n`);
    //stream.write(`Expression: ${expression} \n`);
    stream.write(
      "GSAT Execution time (ms),GSAT Solution,GSAT Flips,GSAT Tries,Genetic Execution time (ms),Genetic Solution,Genetic mutations\n"
    );

    for (let i = 0; i < totalOfTests; i++) {

      const start = performance.now();
      const solution = sat.gsat(expression, maxTries + i, maxFlips * (i+1));
      const gsatEnd = performance.now();

      const maxMutations = maxTries + i;
      const popSize = maxFlips * (i+1);
      const geneticSolution = sat.geneticSat(expression, maxMutations, popSize);
      const geneticEnd = performance.now();

      stream.write(
        `${gsatEnd - start},${solution.solution},${solution.flips},${
          solution.tries
        },${geneticEnd - gsatEnd},${geneticSolution.solution},${
          geneticSolution.mutations
        }\n`
      );

      //Uncomment this line to print results in terminal
      console.log(`Filename ${cnfFileName}`);
      console.log("Gsat Solution: ", JSON.stringify(solution.solution));
      console.log("Genetic Solution: ", JSON.stringify(geneticSolution.solution));
      console.log("Flips: ", solution.flips);
      console.log("Tries: ", solution.tries);
      console.log("Mutations: ", geneticSolution.mutations);
      console.log(`Gsat Execution time: ${gsatEnd - start} ms`);
      console.log(`Genetic Execution time: ${geneticEnd - gsatEnd} ms`);      

    }

    stream.end();
  });

}






//Uncomment to execute desired tests
function main() {
  testRandomGsat();
  testRandomGenetic();
  testAllFilesInFolder();
  testFile();
}

main();