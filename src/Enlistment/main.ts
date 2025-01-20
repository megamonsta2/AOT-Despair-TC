import {
  SHEET_ID,
  RAW_SHEET_NAME,
  RAW_CELL_DATA,
  PARSED_SHEET_NAME,
  PARSED_CELL_DATA,
} from "../config/Enlistment/Sheets.js";

import {
  ValueRange,
  RawRequestRow,
  RawEnlistmentData,
  ParsedEnlistmentData,
} from "../utils/Types.js";
import { GetSheetData, SetSheetData, ParseSheetBool } from "../utils/Sheets.js";

let RequestRows: number[];

const RAW_START_ROW = RAW_CELL_DATA.START_ROW;
const RAW_INDEXES = RAW_CELL_DATA.INDEXES;

export default async function main() {
  // Get rows to get data from
  const rawRows = await GetRequestRows();
  if (!rawRows) return;
  RequestRows = rawRows;

  console.log(RequestRows);

  // Get data from rows
  const Requests = await GetRequests();
  if (!Requests) return;

  // Parse raw data
  const ParsedRequests = ParseRequests(Requests);

  // Post data to sheet
  await PostParsedRequests(ParsedRequests);
}

// Get Raw Requests
async function GetRequestRows() {
  // Get sheet response
  const response = await GetSheetData(SHEET_ID, [
    `${RAW_SHEET_NAME}!${RAW_CELL_DATA.COMPLETED_COLUMN}${RAW_START_ROW}:${RAW_CELL_DATA.COMPLETED_COLUMN}`,
  ]);
  if (!response) {
    console.warn("Failed to get enlistment request status!");
    return;
  }

  // Get cell data
  const status = response[0].values as [RawRequestRow][] | undefined;
  if (!status) {
    console.warn("Cell values from enlistment request status don't exist!");
    return;
  }

  // Prepare rows var
  const rows: number[] = [];

  // Assign every row with valid data to rawRows
  status.forEach(function (rawData, i) {
    // Get raw approved and completed
    const row = i + RAW_START_ROW;
    const raw = rawData[0];

    // Verify they exist
    if (!raw) {
      console.warn(
        `${row} does not have the correct enlistment request status!`,
      );
      return;
    }

    // Verify the data is approved and not completed
    const completed = ParseSheetBool(raw);
    if (completed) return;

    // Add to array
    rows.push(row);
  });

  return rows;
}

async function GetRequests(): Promise<RawEnlistmentData[] | undefined> {
  // Gets sheet ranges to call
  const ranges: string[] = [];
  RequestRows.forEach(function (row) {
    ranges.push(GetRequestRange(row));
  });

  // Gets sheet data
  const response = await GetSheetData(SHEET_ID, ranges);
  if (!response) {
    console.warn("Failed to get enlistment requests!");
    return;
  }

  // Loops through response, stores all rows in RanklockRequests
  const Requests: RawEnlistmentData[] = [];
  // Used because when removing row from RequestRows, the index shifts in RequestRows but not the parent tbl
  let rowsOffset = 0;
  response.forEach(function (x, i) {
    const values = x.values as [RawEnlistmentData] | undefined;

    if (!values) {
      RemoveRow(i - rowsOffset);
      rowsOffset += 1;
      return;
    }

    Requests.push(values[0]);
  });

  // Returns
  return Requests;
}

// Parse Requests
function ParseRequests(requests: RawEnlistmentData[]): ParsedEnlistmentData[] {
  const parsedData: ParsedEnlistmentData[] = [];

  // Loop through every raw row
  let rowsOffset = 0;
  requests.forEach(function (x, i) {
    const consent = GetConsent(x[RAW_INDEXES.CONSENT]);

    if (!consent) {
      RemoveRow(i - rowsOffset);
      rowsOffset += 1;
      return;
    }

    parsedData.push({
      Username: x[RAW_INDEXES.USERNAME],
      LoreName: x[RAW_INDEXES.LORE_NAME],
      Origin: x[RAW_INDEXES.ORIGIN],
      Consent: consent,
    });
  });

  return parsedData;
}

function GetConsent(raw: string): boolean | undefined {
  if (raw === "Yes") return true;
  if (raw === "No") return false;

  return undefined;
}

// Post Parsed
async function PostParsedRequests(parsedData: ParsedEnlistmentData[]) {
  // Setup ranges
  const ranges: ValueRange[] = [];

  console.log(parsedData);
  console.log(RequestRows);

  // Add player data
  const PlayerPromise = GetPostRanges(parsedData).then(function (PlayerData) {
    if (PlayerData) {
      ranges.push(PlayerData);
    } else {
      console.warn("Failed to get parsed data to write onto sheet!");
    }
  });

  // Add request data
  RequestRows.forEach(function (row) {
    ranges.push(GetPostStatusData(row));
  });

  await PlayerPromise;

  console.log(ranges);

  // Write to sheet
  await SetSheetData(SHEET_ID, ranges);
}

async function GetPostRanges(parsedData: ParsedEnlistmentData[]) {
  // Get start row to write from
  const startRow = await GetPostStartRow();
  if (!startRow) {
    return;
  }

  // Get date
  const today = ParseDate(new Date());

  // Get data to write with
  const range = `${PARSED_SHEET_NAME}!${PARSED_CELL_DATA.START_COLUMN}${startRow}:${PARSED_CELL_DATA.END_COLUMN}`;
  const values: [string, string, string, string][] = [];

  parsedData.forEach(function (cadet) {
    values.push([today, cadet.Username, cadet.LoreName, cadet.Origin]);
  });

  return {
    range,
    values,
  } as ValueRange;
}

async function GetPostStartRow(): Promise<number | undefined> {
  // Get sheet data
  const response = await GetSheetData(SHEET_ID, [
    `${PARSED_SHEET_NAME}!${PARSED_CELL_DATA.START_COLUMN}${PARSED_CELL_DATA.START_ROW}:${PARSED_CELL_DATA.START_COLUMN}`,
  ]);
  if (!response) {
    console.warn("Failed to get enlistment start row!");
    return;
  }

  // Get usernames
  const cells = response[0].values;
  if (!cells) {
    // If no cells, just return start row
    return PARSED_CELL_DATA.START_ROW;
  }

  // Otherwise, return the number of cells + start row
  // E.g. start row is 2, there are 2 cells, 4 will be returned
  return cells.length + PARSED_CELL_DATA.START_ROW;
}

function GetPostStatusData(row: number): ValueRange {
  return {
    range: `${RAW_SHEET_NAME}!${RAW_CELL_DATA.COMPLETED_COLUMN}${row}`,
    values: [["TRUE"]],
  } as ValueRange;
}

// Other
function RemoveRow(index: number) {
  RequestRows = RequestRows.slice(0, index).concat(
    RequestRows.slice(index + 1),
  );
}

function GetRequestRange(num: number) {
  return `${RAW_SHEET_NAME}!${RAW_CELL_DATA.START_COLUMN}${num}:${RAW_CELL_DATA.END_COLUMN}${num}`;
}

function ParseDate(date: Date) {
  return `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
}
