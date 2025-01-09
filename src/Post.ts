import { join } from "path";

import sheetsData from "./config/Sheets.json" with { type: "json" };
import paths from "./config/Paths.json" with { type: "json" };
import exams from "./config/Exams.json" with { type: "json" };

import { ReadFile } from "./Files.js";
import input from "./utils/Input.js";
import {
  GetSheets,
  GetSheetData,
  SetSheetData,
  CloneSheet,
} from "./utils/Sheets.js";
import { SerialisedPlayer, PlayerField, ValueRange } from "./utils/Types.js";
import clipboard from "clipboardy";

const parsedSheetsData = sheetsData.PARSED;
const sheet_id = parsedSheetsData.SHEET_ID;
const columns = parsedSheetsData.COLUMNS;
const start_row = parsedSheetsData.START_ROW;
const end_row = parsedSheetsData.END_ROW;

const displayPattern = /.+ - ([0-9]+) \(.+ K \| .+ P | .+ B\)/;

export default async function main() {
  try {
    const ClassNumber = await GetClassNumber();
    const sheet_name = `Class ${ClassNumber}`;

    const cloneSuccess = await CloneSheet(
      sheet_id,
      parsedSheetsData.DEFAULT_SHEET,
      sheet_name,
    );
    if (!cloneSuccess) {
      console.warn("Failed to post to sheets.");
      return;
    }

    const parsedPlayers = await ReadParsedFile();
    const ranges: ValueRange[] = [
      // Class
      {
        range: sheet_name + "!B3",
        values: [[sheet_name]],
      },

      // Fields
      GetValues(sheet_name, parsedPlayers, "Username"),
      GetValues(sheet_name, parsedPlayers, "Knowledge"),
      GetValues(sheet_name, parsedPlayers, "BonusPoints"),
      GetValues(sheet_name, parsedPlayers, "Dummies"),
      GetValues(sheet_name, parsedPlayers, "Speed"),
      GetValues(sheet_name, parsedPlayers, "Obby"),
    ];

    await SetSheetData(sheet_id, ranges);
    console.log("Posted successfully!");

    const DisplayData = await GetSheetData(sheet_id, [
      `${sheet_name}!${columns.Display}${start_row}:${columns.Display}${end_row}`,
    ]);
    if (!DisplayData) return;

    const values = DisplayData[0].values;
    if (!values) return;

    await SortDisplay(values);
  } catch (err) {
    console.warn("ERROR");
    console.warn(err);
  }
}

async function GetClassNumber(): Promise<number> {
  while (true) {
    const sheets = await GetSheets(sheet_id);
    const response = await input("What class is it? ");

    const classNum = Number(response);
    if (
      isNaN(classNum) || // NaN class num
      classNum % 1 !== 0 || // Non int
      classNum < 100 || // Less than 100
      classNum > 999 || // Above 999
      sheets?.includes(`Class ${classNum}`) // Sheet already exists
    ) {
      console.warn("Invalid class number!");
      continue;
    }

    return classNum;
  }
}

async function ReadParsedFile(): Promise<SerialisedPlayer[]> {
  const path = join(".", paths.ParsedFolder, paths.Parsed.Valid);
  return JSON.parse(await ReadFile(path));
}

function GetValues(
  sheet_name: string,
  players: SerialisedPlayer[],
  field: PlayerField,
): ValueRange {
  const values: [string][] = [];

  players.forEach(function (player) {
    const data = player[field];

    if (typeof data === "string" || typeof data === "number") {
      values.push([String(data)]);
    } else {
      values.push([""]);
    }
  });

  return {
    range: `${sheet_name}!${columns[field]}${start_row}:${columns[field]}${end_row}`,
    values: values,
  };
}

async function SortDisplay(display: string[][]) {
  const Sorted: Map<number, string[]> = new Map();
  const TopCadets: string[] = [];
  const Graduates: string[] = [];
  const Failures: string[] = [];
  let Array: string[] = TopCadets;

  for (const row of display) {
    const player = row[0];
    const patternResult = displayPattern.exec(player);
    if (!patternResult) continue;

    const score = Number(patternResult[1]);
    if (!score || isNaN(score)) continue;

    const Scores = Sorted.get(score);
    if (Scores) {
      Scores.push(player);
    } else {
      Sorted.set(score, [player]);
    }
  }

  for (let i = 100; i >= 0; i--) {
    const Scores = Sorted.get(i);
    if (!Scores) continue;

    for (const player of Scores) Array.push(player);

    if (i < exams.PASS) {
      Array = Failures;
    } else if (TopCadets.length >= exams.TOP_LIMIT || i < exams.TOP) {
      Array = Graduates;
    } else {
      Array = TopCadets;
    }
  }

  await clipboard.write(
    TopCadets.join("\n") +
      "\n" +
      Graduates.join("\n") +
      "\n" +
      Failures.join("\n"),
  );

  console.log("Sorted copied successfully!");
}
