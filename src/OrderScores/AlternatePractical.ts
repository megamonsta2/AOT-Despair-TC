// Modules
import { AddScores } from "./Storage.js";
import { AlternatePractical } from "../Constants.js";

// Variables
const MAX_SCORE = 40;

// Module Setup
export default async () => {
  await Promise.all([
    GetScores(AlternatePractical.TitanTraining),
    GetScores(AlternatePractical.Tundra),
    GetScores(AlternatePractical.MusketRetrieval),
  ]);
};

async function GetScores(prac: AlternatePractical) {
  await AddScores(prac, prac, MAX_SCORE, (player, score: number) => {
    player.AddAlternatePractical(prac, score);
  });
}
