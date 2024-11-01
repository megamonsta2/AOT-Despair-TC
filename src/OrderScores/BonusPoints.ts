// Modules
import { AddScores } from "./Storage.js";

// Variables
const MAX_SCORE = 10;

// Module Setup
export default async () => {
  await AddScores(
    "Bonus Points",
    "BonusPoints",
    MAX_SCORE,
    (player, score: number) => {
      player.AddBonusPoints(score, MAX_SCORE);
    },
  );
};
