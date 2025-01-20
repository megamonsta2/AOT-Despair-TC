import { EnlistmentField } from "../../utils/Types.js";

export const SHEET_ID = "1rufDLllXJb2RLseYxvqxhfFzYP9XQ5P4pzsX1OyN_cg";

export const RAW_SHEET_NAME = "ENLISTMENT REQUESTS";
export const RAW_CELL_DATA = {
  INDEXES: {
    USERNAME: 1,
    LORE_NAME: 2,
    ORIGIN: 3,
    CONSENT: 4,
  } as { [key in EnlistmentField | "CONSENT"]: number },

  START_COLUMN: "A",
  END_COLUMN: "E",
  COMPLETED_COLUMN: "F",

  START_ROW: 2,
};

export const PARSED_SHEET_NAME = "ENLISTMENT";
export const PARSED_CELL_DATA = {
  INDEXES: {
    USERNAME: 1,
    LORE_NAME: 2,
    ORIGIN: 3,
    DATE: 0,
  } as { [key in EnlistmentField | "DATE"]: number },

  START_COLUMN: "B",
  END_COLUMN: "E",
  START_ROW: 6,
};
