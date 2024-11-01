// Modules
import { ResetPlayers } from "./Storage.js";
import GetUsernames from "./Usernames.js";
import GetKnowledge from "./Knowledge.js";
import GetCorePractical from "./CorePractical.js";
import GetAlternatePractical from "./AlternatePractical.js";
import GetBonusPoints from "./BonusPoints.js";
// import Validate from "./Validate.js";
// import Output from "./Output.js";

// Module Setup
export default async () => {
  ResetPlayers();

  await GetUsernames();
  console.log("Gotten usernames.");
  await GetKnowledge();
  console.log("Gotten knowledge scores.");
  await GetCorePractical();
  console.log("Gotten core practical scores.");
  await GetAlternatePractical();
  console.log("Gotten alternate practical scores.");
  await GetBonusPoints();
  console.log("Gotten bonus points.");

  // await Validate();
  // await Output();
};
