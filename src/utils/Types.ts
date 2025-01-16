import { sheets_v4 } from "googleapis";

export type ValueRange = sheets_v4.Schema$ValueRange;
export type InputOptions = {
  [key: string]: {
    Name: string;
    Function: () => Promise<unknown>;
  };
};

export type Practical = "Dummies" | "Speed" | "Obby";
export type Exam = "Knowledge" | "BonusPoints" | Practical;
export type PlayerField = "Username" | Exam;
export type SerialisedPlayer = {
  Username: string;
} & {
  [key in Exam]: number | undefined;
};

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
