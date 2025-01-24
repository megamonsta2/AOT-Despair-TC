import { PlayerField } from "../../utils/Types.js";
import {
  INPUT_FOLDER as MAIN_INPUT_FOLDER,
  PARSED_FOLDER as MAIN_PARSED_FOLDER,
} from "../Paths.js";

export const INPUT_FOLDER = `${MAIN_INPUT_FOLDER}/AwaitingTesting`;
export const PARSED_FOLDER = MAIN_PARSED_FOLDER;

export const INPUT_FILES: { [key in PlayerField]: string } = {
  Username: "Usernames.txt",
  Knowledge: "Knowledge.json",
  BonusPoints: "BonusPoints.json",

  Dummies: "Dummies.json",
  Speed: "Speed.json",
  Obby: "Obby.json",

  TitanTraining: "TitanTraining.json",
  Tundra: "Tundra.json",
};
export const PARSED_FILES = {
  Valid: "Valid.json",
  Invalid: "Invalid.json",
};
