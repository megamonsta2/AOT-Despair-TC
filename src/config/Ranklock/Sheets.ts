import { RanklockField } from "../../utils/Types.js";

export const SHEET_ID = "1rufDLllXJb2RLseYxvqxhfFzYP9XQ5P4pzsX1OyN_cg";

export const RAW_SHEET_NAME = "REQUESTS";
export const RAW_CELL_DATA = {
  INDEXES: {
    USERNAME: 2,
    REASON: 3,
    EVIDENCE: 4,
    START_DATE: 0,
    END_DATE: 5,
  } as { [key in RanklockField]: number },

  START_COLUMN: "A",
  END_COLUMN: "F",
  APPROVED_COLUMN: "G",
  COMPLETED_COLUMN: "H",

  START_ROW: 2,
};

export const PARSED_SHEET_NAME = "DATA";
export const PARSED_CELL_DATA = {
  START_COLUMN: "B",
  END_COLUMN: "G",
  START_ROW: 6,
};
