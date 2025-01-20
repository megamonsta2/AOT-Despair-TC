import { Exam } from "../../utils/Types.js";

export const MAX_SCORE: { [key in Exam | "AltPrac"]: number } = {
  Knowledge: 50,
  BonusPoints: 10,
  Dummies: 20,
  Speed: 20,
  Obby: 10,
  AltPrac: 50,
};

export const SPEED_TIMES = {
  Upper: 40,
  Lower: 20,
};

export const PASS_RATE = 60;
export const TOP_CADET_DATA = {
  POINT_REQ: 90,
  LIMIT: 10,
};
