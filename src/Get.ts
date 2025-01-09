import { sheets_v4 } from "googleapis";
import { writeFile } from "fs/promises";
import { join } from "path";

import sheetsData from "./config/Sheets.json" with { type: "json" };
import files from "./config/Paths.json" with { type: "json" };

import { GetSheetData } from "./utils/Sheets.js";
import { RawSheet } from "./utils/Types.js";

const knowledgeFile = files.Inputs.Knowledge;
const InputFiles = {
  KNOWLEDGE: knowledgeFile,
  DUMMIES: files.Inputs.Dummies,
  SPEED: files.Inputs.Speed,
  OBBY: files.Inputs.Obby,
  BP: files.Inputs.BonusPoints,
} as { [key: string]: string };

export default async function GetRawData() {
  const response = await GetSheetData(sheetsData.RAW.SHEET_ID, GetRawRanges());
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
  const RawData = sheetsData.RAW;
  const column = RawData.SCORE_COLUMN;
  const range = `${column}${RawData.START_ROW}:${column}`;
  const ranges: string[] = [];

  for (const key in RawSheet) {
    ranges.push(`${key}!${range}`); // E.g. DUMMIES!C2:C
  }

  // Knowledge
  const KnowledgeData = RawData.Knowledge;
  ranges.push(
    `${KnowledgeData.SHEET}!${KnowledgeData.SCORE_COLUMN}${RawData.START_ROW}:${KnowledgeData.NAME_COLUMN}`,
  );

  return ranges;
}

async function WriteRawData(data: sheets_v4.Schema$ValueRange) {
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
    return writeFile(
      join(files.InputFolder, knowledgeFile),
      JSON.stringify(values),
    );
  } else {
    // Parse scores
    const parsedValues: string[] = [];

    for (const value of values) {
      parsedValues.push(value[0]);
    }

    return writeFile(
      join(files.InputFolder, fileName),
      JSON.stringify(parsedValues),
    );
  }
}

function GetFileName(range: string) {
  const sheetName = range.substring(0, range.indexOf("!"));
  return InputFiles[sheetName];
}
