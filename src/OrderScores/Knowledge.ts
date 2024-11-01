// Modules
import { LogPlayer } from "./Storage.js";
import { ReadFile } from "../Files.js";
import {
  WaitForKey,
  FormatError,
  SendErrors,
  ValidateScore,
} from "../Utils.js";

// Variables
const MAX_SCORE = 50;

// Module Setup
export default async () => {
  const [RawNames, RawScores] = await GetData();
  LogPlayers(RawNames, RawScores);
};

async function GetData() {
  let [RawNames, RawScores] = await ReadFiles();
  const ErrorMessages: string[] = [];

  // Check lengths
  while (!(RawNames.length == RawScores.length)) {
    console.warn(
      "The length of the knowledge test names and scores are NOT the same.\r\nWhen this is amended, press any key.",
    );
    WaitForKey();

    [RawNames, RawScores] = await ReadFiles();
  }

  while (true) {
    let AllValid = true;

    for (let i = 0; i < RawScores.length; i++) {
      // Get vars
      const score = Number(RawScores[i].trim());
      const line_number = i + 1;
      const result = ValidateScore(score, MAX_SCORE);

      // If invalid, add to error messages
      if (!result[0]) {
        ErrorMessages.push(FormatError(result[1], line_number));
        AllValid = false;
      }
    }

    // Check if valid
    if (!AllValid) {
      SendErrors("knowledge", ErrorMessages);

      // Recalculate vars
      RawScores = await ReadFile("KnowledgeScores");
      ErrorMessages.length = 0;
    } else {
      break;
    }
  }

  return [RawNames, RawScores];
}

function ReadFiles(): Promise<string[][]> {
  return Promise.all([ReadFile("KnowledgeNames"), ReadFile("KnowledgeScores")]);
}

function LogPlayers(RawNames: string[], RawScores: string[]) {
  for (let i = 0; i < RawNames.length; i++) {
    const name = RawNames[i].trim();
    const score = Number(RawScores[i].trim());

    LogPlayer({ Name: name, Score: score }, (player, score: number) => {
      player.AddKnowledge(score);
    });
  }
}
