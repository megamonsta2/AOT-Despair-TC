import { sheets_v4 } from "googleapis";

// Other
export type ValueRange = sheets_v4.Schema$ValueRange;
export type InputOptions = {
  [key: string]: {
    Name: string;
    Function: () => Promise<unknown>;
  };
};

// Scores
export type Practical = "Dummies" | "Speed" | "Obby";
export type Exam = "Knowledge" | "BonusPoints" | Practical;
export type PlayerField = "Username" | Exam;
export type SerialisedPlayer = {
  Username: string;
} & {
  [key in Exam]: number | undefined;
};

// Ranklocks
export type RanklockField =
  | "USERNAME"
  | "REASON"
  | "EVIDENCE"
  | "START_DATE"
  | "END_DATE"
  | "APPROVED";
export type RawRequestRow = SheetBool | undefined;
export type SheetBool = "TRUE" | "FALSE";

export type RawRanklockData = [string, string, string, string, string, string];
export interface ComparisonRanklockData {
  Start: Date;
  End: Date;
}
export interface ParsedRanklockData extends ComparisonRanklockData {
  Username: string;
  Reason: string;
  Evidence: string;
}

// Enlistment
export type EnlistmentField = "USERNAME" | "LORE_NAME" | "ORIGIN";
export type RawEnlistmentData = [string, string, string, string];
export interface ParsedEnlistmentData {
  Username: string;
  LoreName: string;
  Origin: string;
  Consent: boolean;
}
