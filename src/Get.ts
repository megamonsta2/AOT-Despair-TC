import { writeFile } from "fs/promises";
import { join } from "path";

import { INPUT_FOLDER, INPUT_FILES } from "./config/Paths.js";
import {
  RAW_SHEET_ID,
  RAW_SHEET_NAMES,
  RAW_CELL_DATA,
  RAW_KNOWLEDGE_CELL_DATA,
} from "./config/Sheets.js";

import { GetSheetData } from "./utils/Sheets.js";
import { Exam, ValueRange } from "./utils/Types.js";

const knowledgeFile = INPUT_FILES.Knowledge;

export default async function GetRawData() {
  const response = await GetSheetData(RAW_SHEET_ID, GetRawRanges());
  if (!response) {
    console.warn(
      "The response when getting raw data from the sheet was invalid!",
    );
    return;
  }

  // Handle sheets
  const Promises: Promise<void>[] = [];
  for (const sheet of Object.values(response)) {
    Promises.push(WriteRawData(sheet));
  }

  return Promise.all(Promises);
}

function GetRawRanges(): string[] {
  const column = RAW_CELL_DATA.SCORE_COLUMN;
  const range = `${column}${RAW_CELL_DATA.START_ROW}:${column}`;
  const ranges: string[] = [];

  for (const key of Object.values(RAW_SHEET_NAMES)) {
    ranges.push(`${key}!${range}`); // E.g. DUMMIES!C2:C
  }

  // Knowledge
  ranges.push(
    `${RAW_SHEET_NAMES.Knowledge}!${RAW_KNOWLEDGE_CELL_DATA.SCORE_COLUMN}${RAW_CELL_DATA.START_ROW}:${RAW_KNOWLEDGE_CELL_DATA.NAME_COLUMN}`,
  );

  return ranges;
}

async function WriteRawData(data: ValueRange) {
  const range = data.range;
  if (!range) return;

  const values = data.values;
  if (!values) return;

  // Get file name
  const fileName = GetFileName(range);
  if (!fileName) {
    console.warn(`${fileName} is not valid raw score sheet.`);
    return;
  }

  if (fileName == knowledgeFile) {
    return writeFile(join(INPUT_FOLDER, knowledgeFile), JSON.stringify(values));
  } else {
    // Parse scores
    const parsedValues: string[] = [];

    for (const value of values) {
      parsedValues.push(value[0]);
    }

    return writeFile(
      join(INPUT_FOLDER, fileName),
      JSON.stringify(parsedValues),
    );
  }
}

function GetFileName(range: string) {
  const sheetName = range.substring(0, range.indexOf("!"));

  if (sheetName == RAW_SHEET_NAMES.Knowledge) {
    return INPUT_FILES.Knowledge;
  }

  for (const [currentExam, currentSheet] of Object.entries(RAW_SHEET_NAMES)) {
    if (sheetName == currentSheet) {
      return INPUT_FILES[currentExam as Exam];
    }
  }

  return INPUT_FILES.BonusPoints;
}
