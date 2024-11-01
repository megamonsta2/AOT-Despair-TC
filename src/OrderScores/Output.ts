// Modules
import { writeFile, appendFile } from "fs/promises";
import Player from "./PlayerClass.js";
import { GetPlayers, GetMissingPlayers } from "./Storage.js";
import { OUTPUT_FOLDER } from "../Constants.js";

// Variables
const HEADER = [
  "Username",
  "Knowledge",
  "Bonus",
  "Dummies",
  "Speed",
  "Musket",
  "ObstacleCourse",
  "GasConservation",
  "TitanTraining",
  "Tundra",
  "MusketRetrival",
];
const SCORES_DOC = `${OUTPUT_FOLDER}/Scores.csv`;
const MISSING_DOC = `${OUTPUT_FOLDER}/Missing.csv`;

// Module Setup
export default () => {
  return Promise.all([
    Log("players", GetPlayers(), SCORES_DOC),
    Log("missing", GetMissingPlayers(), MISSING_DOC),
  ]);
};

async function Log(Type: string, Players: Map<string, Player>, file: string) {
  // Clear data
  await writeFile(file, "");

  // Write header
  await appendFile(file, HEADER.join(",") + "\n");

  // Loop through players
  for (const player of Players.values()) {
    // Get data
    const LogData = [
      player.Username,
      GetScore(player.Knowledge),
      GetScore(player.BonusPoints),
      GetScore(player.Dummies),
      GetScore(player.Speed),
      GetScore(player.Musket),
      GetScore(player.ObstacleCourse),
      GetScore(player.GasConservation),
      GetScore(player.TitanTraining),
      GetScore(player.Tundra),
      GetScore(player.MusketRetrieval),
    ];

    // Append to log file
    await appendFile(file, LogData.join(",") + "\n");
  }

  console.log(`Logged ${Type}!`);
}

function GetScore(score: number | undefined) {
  if (score) {
    return String(score);
  } else {
    return "";
  }
}
