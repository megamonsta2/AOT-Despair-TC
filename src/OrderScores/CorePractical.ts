// Modules
import { AddScores } from "./Storage.js";
import { CorePractical } from "../Constants.js";

// Variables
const MAX_SCORE = 10;

// Module Setup
export default async () => {
  await Promise.all([
    GetScores(CorePractical.Musket),
    GetScores(CorePractical.Speed),
    GetScores(CorePractical.Dummies),
    GetScores(CorePractical.ObstacleCourse),
    GetScores(CorePractical.GasConservation),
  ]);
};

async function GetScores(prac: CorePractical) {
  await AddScores(prac, prac, MAX_SCORE, (player, score: number) => {
    player.AddCorePractical(prac, score);
  });
}
