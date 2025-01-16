import {
  SHEET_ID,
  RAW_SHEET_NAME,
  RAW_CELL_DATA,
  PARSED_SHEET_NAME,
  PARSED_CELL_DATA,
} from "../config/Ranklock/Sheets.js";

import {
  ValueRange,
  RawRanklockData,
  ParsedRanklockData,
  RawRequestRow,
} from "../utils/Types.js";
import { GetSheetData, SetSheetData, ParseSheetBool } from "../utils/Sheets.js";
import ValidateDate from "../utils/Date.js";

let RequestRows: number[];

const RAW_START_ROW = RAW_CELL_DATA.START_ROW;
const RAW_INDEXES = RAW_CELL_DATA.INDEXES;

export default async function main() {
  // Get rows to get data from
  const rawRows = await GetRequestRows();
  if (!rawRows) return;
  RequestRows = rawRows;

  // Get data from rows
  const RawRanklockRequests = await GetRanklockRequests();
  if (!RawRanklockRequests) return;

  // Parse raw data
  const ParsedRanklockRequests = ParseRanklockRequests(RawRanklockRequests);

  // Post data to sheet
  await PostParsedRequests(ParsedRanklockRequests);
}

// Get Raw Requests
async function GetRequestRows() {
  // Get sheet response
  const response = await GetSheetData(SHEET_ID, [
    `${RAW_SHEET_NAME}!${RAW_CELL_DATA.APPROVED_COLUMN}${RAW_START_ROW}:${RAW_CELL_DATA.COMPLETED_COLUMN}`,
  ]);
  if (!response) {
    console.warn("Failed to get ranklock request status!");
    return;
  }

  // Get cell data
  const status = response[0].values as
    | [RawRequestRow, RawRequestRow][]
    | undefined;
  if (!status) {
    console.warn("Cell values from ranklock request status don't exist!");
    return;
  }

  // Prepare rows var
  const rows: number[] = [];

  // Assign every row with valid data to rawRows
  status.forEach(function (rawData, i) {
    // Get raw approved and completed
    const row = i + RAW_START_ROW;
    const rawApproved = rawData[0];
    const rawCompleted = rawData[1];

    // Verify they exist
    if (!rawApproved || !rawCompleted) {
      console.warn(`${row} does not have the correct ranklock request status!`);
      return;
    }

    // Verify the data is approved and not completed
    const approved = ParseSheetBool(rawApproved);
    const completed = ParseSheetBool(rawCompleted);

    // If not approved, or is completed, return early
    if (!approved || completed) return;

    // Add to array
    rows.push(row);
  });

  return rows;
}

async function GetRanklockRequests(): Promise<RawRanklockData[] | undefined> {
  // Gets sheet ranges to call
  const ranges: string[] = [];
  RequestRows.forEach(function (row) {
    ranges.push(GetRanklockRequestRange(row, row));
  });

  // Gets sheet data
  const response = await GetSheetData(SHEET_ID, ranges);
  if (!response) {
    console.warn("Failed to get ranklock requests!");
    return;
  }

  // Loops through response, stores all rows in RanklockRequests
  const RanklockRequests: RawRanklockData[] = [];
  // Used because when removing row from RequestRows, the index shifts in RequestRows but not the parent tbl
  let rowsOffset = 0;
  response.forEach(function (x, i) {
    const values = x.values as [RawRanklockData] | undefined;

    if (!values) {
      RemoveRow(i - rowsOffset);
      rowsOffset += 1;
      return;
    }

    RanklockRequests.push(values[0]);
  });

  // Returns
  return RanklockRequests;
}

// Parse Requests
function ParseRanklockRequests(
  requests: RawRanklockData[],
): ParsedRanklockData[] {
  const parsedData: ParsedRanklockData[] = [];

  // Loop through every raw row
  let rowsOffset = 0;
  requests.forEach(function (x, i) {
    // Get dates
    const [startDate, endDate] = [
      ValidateDate(x[RAW_INDEXES.START_DATE]),
      ValidateDate(x[RAW_INDEXES.END_DATE]),
    ];

    // Invalid dates
    if (!startDate || !endDate) {
      RemoveRow(i - rowsOffset);
      rowsOffset += 1;
      return;
    }

    parsedData.push({
      Username: x[RAW_INDEXES.USERNAME],
      Reason: x[RAW_INDEXES.REASON],
      Evidence: x[RAW_INDEXES.EVIDENCE],
      Start: startDate,
      End: endDate,
    });
  });

  return parsedData;
}

// Post Parsed
async function PostParsedRequests(parsedData: ParsedRanklockData[]) {
  // Setup ranges
  const ranges: ValueRange[] = [];

  // Add player data
  const PlayerPromise = GetPostPlayerData(parsedData).then(
    function (PlayerData) {
      if (PlayerData) {
        ranges.push(PlayerData);
      } else {
        console.warn("Failed to get parsed data to write onto sheet!");
      }
    },
  );

  // Add request data
  RequestRows.forEach(function (row) {
    ranges.push(GetPostStatusData(row));
  });

  await PlayerPromise;

  // Write to sheet
  await SetSheetData(SHEET_ID, ranges);
}

async function GetPostPlayerData(parsedData: ParsedRanklockData[]) {
  // Get start row to write from
  const startRow = await GetPostStartRow();
  if (!startRow) {
    return;
  }

  // Get data to write with
  const range = `${PARSED_SHEET_NAME}!${PARSED_CELL_DATA.START_COLUMN}${startRow}:${PARSED_CELL_DATA.END_COLUMN}`;
  const values: [string, string, string, string, string, string][] = [];

  parsedData.forEach(function (cadet) {
    values.push([
      cadet.Username,
      cadet.Reason,
      cadet.Evidence,
      "",
      ParsePostDate(cadet.Start),
      ParsePostDate(cadet.End),
    ]);
  });

  return {
    range,
    values,
  } as ValueRange;
}

function ParsePostDate(date: Date): string {
  return `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
}

async function GetPostStartRow(): Promise<number | undefined> {
  // Get sheet data
  const response = await GetSheetData(SHEET_ID, [
    `${PARSED_SHEET_NAME}!${PARSED_CELL_DATA.START_COLUMN}${PARSED_CELL_DATA.START_ROW}:${PARSED_CELL_DATA.START_COLUMN}`,
  ]);
  if (!response) {
    console.warn("Failed to get ranklock data usernames!");
    return;
  }

  // Get usernames
  const usernames = response[0].values;
  if (!usernames) {
    // If no usernames, just return start row
    return PARSED_CELL_DATA.START_ROW;
  }

  // Otherwise, return the length of the usernames + start row
  // E.g. start row is 2, there are 2 usernames, 4 will be returned
  return usernames.length + PARSED_CELL_DATA.START_ROW;
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

function GetRanklockRequestRange(lower: number, upper: number) {
  return `${RAW_SHEET_NAME}!${RAW_CELL_DATA.START_COLUMN}${lower}:${RAW_CELL_DATA.END_COLUMN}${upper}`;
}
