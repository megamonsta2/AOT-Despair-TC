import { sheets_v4 } from "googleapis";

export type Practical = "Dummies" | "Speed" | "Obby";
export type Exam = "Knowledge" | "BonusPoints" | Practical;
export type PlayerField = "Username" | Exam;

export type SerialisedPlayer = {
  Username: string;
} & {
  [key in Exam]: number | undefined;
};

export type ValueRange = sheets_v4.Schema$ValueRange;
