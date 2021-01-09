/*
Implementation of two approaches of the GSAT algorithm 
*/

const cnf = require("./cnf");

//GSat
function gsat(expression, maxTries, maxFlips) {
  for (let i = 0; i < maxTries; i++) {
    let solution = cnf.generateSolution(expression);
    let index = 0;
    for (let j = 0; j < maxFlips; j++) {
      if (cnf.isSolution(solution, expression).isSolution) {
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

//flips variables of solution
function flipCurrentSolution(solution, index) {
  const newSolution = [...solution];
  newSolution[index] = +!newSolution[index];

  return newSolution;
}

//Genetic Sat
function geneticSat(expression, maxMutations, popSize) {
  let solutions = [];
  for (let i = 0; i < maxMutations; i++) {
    if (solutions.length) {
      const validatedSolutions = [];

      for (let j = 0; j < solutions.length; j++) {
        const validateSolution = cnf.isSolution(solutions[j], expression);

        if (validateSolution.isSolution) {
          return { solution: "solution found", mutations: i };
          // return { solution: solution[j], mutations: i };
        }

        validatedSolutions.push({
          solution: solutions[j],
          trueClauses: validateSolution.trueClauses,
        });
      }

      solutions = mutateSolutions(validatedSolutions, popSize);
    } else {
      for (let j = 0; j < popSize; j++) {
        const solution = cnf.generateSolution(expression);
        const validateSolution = cnf.isSolution(solution, expression);

        if (validateSolution.isSolution) {
          return { solution: "solution found", mutations: 0 };
          // return { solution, mutations: 0 };
        }

        solutions.push({
          solution,
          trueClauses: validateSolution.trueClauses,
        });
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

    const firstMutation = [...firstPart];
    firstMutation.push(...secondPart);

    mutatedSolutions.push(firstMutation);

    if (mutatedSolutions.length !== populationSize) {
      const secondMutation = [...secondPart];
      secondMutation.push(...firstPart);

      mutatedSolutions.push(secondMutation);
    }
  }

  return mutatedSolutions;
}

module.exports = { gsat, geneticSat };
