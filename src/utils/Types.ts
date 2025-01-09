import { sheets_v4 } from "googleapis";

export enum RawSheet {
  "DUMMIES" = "DUMMIES",
  "SPEED" = "SPEED",
  "OBBY" = "OBBY",
  "BP" = "BP",
}

export type PlayerField =
  | "Username"
  | "Knowledge"
  | "BonusPoints"
  | "Dummies"
  | "Speed"
  | "Obby";

export type SerialisedPlayer = {
  Username: string;
  Knowledge: number | undefined;
  BonusPoints: number | undefined;
  Dummies: number | undefined;
  Speed: number | undefined;
  Obby: number | undefined;
};

export type ValueRange = sheets_v4.Schema$ValueRange;
