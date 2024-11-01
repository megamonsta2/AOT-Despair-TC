// Modules
import { writeFile } from "fs/promises";
import { ReadFile } from "./Files.js";
import { FormatError, SendErrors, ValidateScore } from "./Utils.js";
import { OUTPUT_FOLDER } from "./Constants.js";

// Variables
const INPUT_FILE = "Unsorted";
const OUTPUT_FILE = `${OUTPUT_FOLDER}/Sorted.txt`;
const REGEX_PATTERN = /[A-z0-9_]+ - ([0-9]+) \(.+\)/;
const MAX_SCORE = 100;

const SortedScores: Map<number, string[]> = new Map();

export default async () => {
  await SortScores();
  await OutputScores();
};

async function SortScores() {
  const Errors: string[] = [];
  let InputData = await ReadFile(INPUT_FILE);

  while (true) {
    let AllValid = true;

    for (let i = 0; i < InputData.length; i++) {
      // Get vars
      const line = InputData[i];
      const line_number = i + 1;

      // Ignore empty strings
      if (line == "") {
        continue;
      }

      // Get parsed data
      const result = ValidateLine(line);

      // If valid, add to scores
      if (result[0]) {
        AddScore(line, result[1]);
      } else {
        // Otherwise add to error messages
        Errors.push(FormatError(result[1], line_number));
        AllValid = false;
      }
    }

    // Check if valid
    if (!AllValid) {
      await SendErrors("Sorted Scores", Errors);

      // Recalculate vars
      InputData = await ReadFile(INPUT_FILE);
      SortedScores.clear();
      Errors.length = 0;
    } else {
      break;
    }
  }
}

function AddScore(line: string, score: number) {
  let ScoreArray: string[];

  // Check if array exists for score
  if (SortedScores.has(score)) {
    ScoreArray = SortedScores.get(score) as string[];
  } else {
    ScoreArray = [];
    SortedScores.set(score, ScoreArray);
  }

  ScoreArray.push(line);
}

export function ValidateLine(line: string): [true, number] | [false, string] {
  const PatternResult = REGEX_PATTERN.exec(line);
  if (!PatternResult) {
    return [false, `Data on line number {0} is not valid score data.`];
  }

  const score = Number(PatternResult[1]);
  const result = ValidateScore(score, MAX_SCORE);

  if (result[0]) {
    return [true, score];
  } else {
    return result;
  }
}

async function OutputScores() {
  const Output: string[] = [];

  for (let i = 100; i >= 0; i--) {
    // Get scores
    const Scores = SortedScores.get(i);

    // Skip if no data
    if (!Scores) {
      continue;
    }

    // Add each score to output
    for (const line of Scores) {
      Output.push(line);
    }
  }

  await writeFile(OUTPUT_FILE, Output.join("\r\n"), "utf8");
}
