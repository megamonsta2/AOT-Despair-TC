import { mkdir, readFile, access, writeFile } from "fs/promises";
import { join } from "path";

import {
  SHEET_ID,
  PARSED_SHEET_NAME,
  PARSED_CELL_DATA,
} from "../config/Ranklock/Sheets.js";
import { INPUT_FOLDER, INPUT_FILE } from "../config/Ranklock/Paths.js";

import { RawRanklockData, ComparisonRanklockData } from "../utils/Types.js";
import { GetSheetData } from "../utils/Sheets.js";
import ValidateDate from "../utils/Date.js";

const RanklockExpired: string[] = []; // Cadets that have their ranklock past the expire date
const RanklockNotFound: string[] = []; // Cadets that are ranklocked in game but have no data on the sheet
const RanklockMissing: string[] = []; // Cadets that are ranklocked on the sheet but aren't in game
const GAME_CADET_PATH = join(INPUT_FOLDER, INPUT_FILE);

export default async function main() {
  const SheetCadets = await GetSheetCadets();
  if (!SheetCadets) return;

  const GameCadets = await GetGameCadets();
  if (!GameCadets) return;

  CompareCadets(SheetCadets, GameCadets);
  Display();
}

// Get Data
async function GetSheetCadets() {
  const response = await GetSheetData(SHEET_ID, [
    `${PARSED_SHEET_NAME}!${PARSED_CELL_DATA.START_COLUMN}${PARSED_CELL_DATA.START_ROW}:${PARSED_CELL_DATA.END_COLUMN}`,
  ]);
  if (!response) {
    console.warn("Failed to get sheet data when comparing!");
    return;
  }

  const values = response[0].values as RawRanklockData | undefined;
  if (!values) {
    console.warn("Failed to get sheet values when comparing!");
    return;
  }

  const Cadets: Map<string, ComparisonRanklockData> = new Map();
  values.forEach(function (x) {
    const [startDate, endDate] = [
      ValidateDate(x[PARSED_CELL_DATA.INDEXES.START_DATE]),
      ValidateDate(x[PARSED_CELL_DATA.INDEXES.END_DATE]),
    ];

    if (!startDate || !endDate) {
      console.warn("Failed to get dates!");
      return;
    }

    const username = x[PARSED_CELL_DATA.INDEXES.USERNAME];
    Cadets.set(username, {
      Start: startDate,
      End: endDate,
    });
  });

  return Cadets;
}

async function GetGameCadets(): Promise<string[] | undefined> {
  // Create folder if doesn't exist
  try {
    await access(INPUT_FOLDER);
  } catch {
    await mkdir(INPUT_FOLDER);
  }

  // Create file if doesn't exist
  if (!(await GameCadetsExists())) {
    console.warn("No input file, creating now.");
    await writeFile(GAME_CADET_PATH, "");
    return;
  }

  // Return data
  const data = await readFile(join(INPUT_FOLDER, INPUT_FILE), "utf-8");
  if (data === "") {
    return [];
  } else {
    return (await JSON.parse(data)) as string[];
  }
}

async function GameCadetsExists() {
  try {
    await access(GAME_CADET_PATH);
    return true;
  } catch {
    return false;
  }
}

// Compare data
function CompareCadets(
  SheetCadets: Map<string, ComparisonRanklockData>,
  GameCadets: string[],
) {
  const CurrentDate = new Date();

  // Go through every cadet found in game
  let i = 0;
  while (i < GameCadets.length) {
    const username = GameCadets[i];
    const sheetData = SheetCadets.get(username);

    // Ranklocked in game but no data found in sheet
    if (!sheetData) {
      GameCadets.splice(i);
      RanklockNotFound.push(username);
      continue;
    }

    // Ranklock times are invalid
    // Start date occurs after current OR end date occurred before current
    if (sheetData.Start > CurrentDate || sheetData.End < CurrentDate) {
      RanklockExpired.push(username);
    }

    SheetCadets.delete(username);
    i += 1;
  }

  // Go through every remaining cadets in sheet
  SheetCadets.forEach(function (data, username) {
    // If start date occurs before current and end date occurs after current
    if (data.Start < CurrentDate && data.End > CurrentDate) {
      RanklockMissing.push(username);
    }
  });
}

function Display() {
  console.warn("THESE CADETS HAVE THEIR RANKLOCK EXPIRED!\nUNRANK THEM!");
  RanklockExpired.forEach((x) => console.log(x));
  console.log("\n");

  console.warn(
    "THESE CADETS ARE RANKED IN GAME BUT NOT ON THE SHEET!\nUNRANK THEM!",
  );
  RanklockNotFound.forEach((x) => console.log(x));
  console.log("\n");

  console.warn(
    "THESE CADETS ARE RANKED ON THE SHEET BUT NOT IN GAME!\nRANK THEM!",
  );
  RanklockMissing.forEach((x) => console.log(x));
}
