import { PlayerField } from "../utils/Types.js";

export const INPUT_FOLDER = "inputs";
export const PARSED_FOLDER = "parsed";

export const INPUT_FILES: { [key in PlayerField]: string } = {
  Username: "Usernames.json",
  Knowledge: "Knowledge.json",
  BonusPoints: "BonusPoints.json",

  Dummies: "Dummies.json",
  Speed: "Speed.json",
  Obby: "Obby.json",
};
export const PARSED_FILES = {
  Valid: "Valid.json",
  Invalid: "Invalid.json",
};
