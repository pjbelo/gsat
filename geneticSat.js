/*
Simple implementation of GSAT
To execute this file in the terminal:

node geneticSat.js

Node.js is required

To generate lighter csv files: 
- Comment line 61, 78 and uncomment line 60 and 77
- Remove or comment 'expression' on lines 176,184 and 191
*/

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

//generates random solution
function generateSolution(cnf) {
  const length = Math.max(...cnf.map((clause) => clause.length));
  let solution = [];
  for (let i = 0; i < length; i++) {
    solution.push(Math.round(Math.random()));
  }
  return solution;
}

//Genetic Sat
function geneticSat(cnf, popSize, maxMutations) {
  let solutions = [];
  for (let i = 0; i < maxMutations; i++) {
    if (solutions.length) {
      const validatedSolutions = [];

      for (let j = 0; j < solutions.length; j++) {
        const validateSolution = isSolution(solutions[j], cnf);

        if (validateSolution.isSolution) {
        //   return { solution: "solution found", mutations: i };
          return { solution: solution[j], mutations: i };
        }

        validatedSolutions.push({
          solution: solutions[j],
          trueClauses: validateSolution.trueClauses,
        });
      }

      solutions = mutateSolutions(validatedSolutions, popSize);
    } else {
      for (let j = 0; j < popSize; j++) {
        const solution = generateSolution(cnf);
        const validateSolution = isSolution(solution, cnf);

        if (validateSolution.isSolution) {
        //   return { solution: "solution found", mutations: 0 };
          return { solution, mutations: 0 };
        }

        solutions.push({ solution, trueClauses: validateSolution.trueClauses });
      }

      solutions = mutateSolutions(solutions, popSize);
    }
  }
  return {
    solution: "no satisfying assignment found",
    mutations: maxMutations,
  };
}

//Create new list of mutated solutions
function mutateSolutions(solutions, populationSize) {
    if (solutions.length <= 2) {
      return solutions.map((solution) => solution.solution.reverse());
    }

  const sortedSolutions = solutions
    .sort((a, b) => b.trueClauses - a.trueClauses)
    .map((solution) => solution.solution);
  const bestSolutions = sortedSolutions.slice(0, Math.ceil(populationSize / 2));
  const solutionLength = bestSolutions[0].length;
  const mutatedSolutions = [];

  for (let i = 0; i < bestSolutions.length; i++) {
    const firstPart = bestSolutions[i].slice(0, Math.ceil(solutionLength / 2));
    const secondPart = bestSolutions[bestSolutions.length - (1 + i)].slice(
      Math.ceil(-solutionLength / 2)
    );

    const firstMutation = [...firstPart]
    firstMutation.push(...secondPart);

    mutatedSolutions.push(firstMutation);

    if(mutatedSolutions.length !== populationSize){
        const secondMutation = [...secondPart]
        secondMutation.push(...firstPart);
        
        mutatedSolutions.push(secondMutation);
    }
  }

  return mutatedSolutions;
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

const { performance } = require("perf_hooks");
const fs = require("fs");

//Generate tests with random clause size and clause number and write results in a csv file
function main(totalOfTests = 10, maxMutations = 3, popSize = 10) {
  const stream = fs.createWriteStream("resultsGenetic.csv");

  stream.once("open", () => {
    stream.write(
      "Test number,Execution time (ms),Clause number,Clause size,Expression,Solution,Mutations\n"
    );

    for (let i = 0; i < totalOfTests; i++) {
      const clauseNumber = Math.round(Math.random() * 10 * (i + 1));
      const clauseSize = Math.round(Math.random() * 10 * (i + 1));

      const cnf = generateCNF(clauseNumber, clauseSize);
      const expression = getExpression(cnf);

      const start = performance.now();
      const solution = geneticSat(cnf, popSize, maxMutations);
      const end = performance.now();

      stream.write(
        `${i + 1},${end - start},${clauseNumber},${clauseSize},${expression},"${
          solution.solution
        }",${solution.mutations}\n`
      );

      //Uncomment this line to print results in terminal
      //   console.log(`Test ${i + 1}`);
      //   console.log("Clause size:", clauseSize);
      //   console.log("Clause number:", clauseNumber);
      //   console.log("Expression: ", expression);
      //   console.log("Solution: ", solution.solution);
      //   console.log("Mutations: ", solution.mutations);
      //   console.log(`Execution time: ${end - start} ms`);
    }
    stream.end();
  });
}

main();