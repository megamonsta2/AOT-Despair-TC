import { Exam, PlayerField } from "../../utils/Types.js";

export const RAW_SHEET_ID = "1LRXwIcf5PbtzLPDS2MWCP-IVR3B__vXcb63Nhixy_ww";
export const RAW_SHEET_NAMES: { [key in Exam]: string } = {
  Knowledge: "KNOWLEDGE",
  Dummies: "DUMMIES",
  Speed: "SPEED",
  Obby: "OBBY",
  BonusPoints: "BP",
};
export const RAW_CELL_DATA = {
  START_ROW: 2,
  NAME_COLUMN: "B",
  SCORE_COLUMN: "C",
};
export const RAW_KNOWLEDGE_CELL_DATA = {
  NAME_COLUMN: "C",
  SCORE_COLUMN: "B",
};

export const PARSED_SHEET_ID = "1ZV86i_IKpIAc6-uJcUSaxPn7BzIBuiTAkCf5GuzNfcQ";
export const PARSED_SHEET = "Class DEFAULT";
export const PARSED_CELL_DATA = {
  CLASS_NUMBER_CELL: "B3",
  START_ROW: 5,
  END_ROW: 499,
};

export const PARSED_COLUMN_DATA: {
  [key in PlayerField]: string;
} & { Display: string } = {
  Username: "C",
  Knowledge: "G",
  BonusPoints: "I",
  Dummies: "M",
  Speed: "O",
  Obby: "Q",
  Tundra: "S",
  TitanTraining: "U",
  Display: "W",
};
