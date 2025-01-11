import { join } from "path";
import clipboard from "clipboardy";

import { PARSED_FOLDER, PARSED_FILES } from "./config/Paths.js";
import {
  PARSED_SHEET,
  PARSED_SHEET_ID,
  PARSED_CELL_DATA,
  PARSED_COLUMN_DATA,
} from "./config/Sheets.js";
import { PASS_RATE, TOP_CADET_DATA } from "./config/Exams.js";

import { ReadFile } from "./Files.js";
import input from "./utils/Input.js";
import {
  GetSheets,
  GetSheetData,
  SetSheetData,
  CloneSheet,
} from "./utils/Sheets.js";
import { SerialisedPlayer, PlayerField, ValueRange } from "./utils/Types.js";

const displayPattern = /.+ - ([0-9]+) \(.+ K \| .+ P | .+ B\)/;

export default async function main() {
  try {
    const ClassNumber = await GetClassNumber();
    const sheet_name = `Class ${ClassNumber}`;

    const cloneSuccess = await CloneSheet(
      PARSED_SHEET_ID,
      PARSED_SHEET,
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

    await SetSheetData(PARSED_SHEET_ID, ranges);
    console.log("Posted successfully!");

    const DisplayData = await GetSheetData(PARSED_SHEET_ID, [
      `${sheet_name}!${PARSED_COLUMN_DATA.Display}${PARSED_CELL_DATA.START_ROW}:${PARSED_COLUMN_DATA.Display}${PARSED_CELL_DATA.END_ROW}`,
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
    const sheets = await GetSheets(PARSED_SHEET_ID);
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
  const path = join(".", PARSED_FOLDER, PARSED_FILES.Valid);
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
    range: `${sheet_name}!${PARSED_COLUMN_DATA[field]}${PARSED_CELL_DATA.START_ROW}:${PARSED_COLUMN_DATA[field]}${PARSED_CELL_DATA.END_ROW}`,
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

    if (i < PASS_RATE) {
      Array = Failures;
    } else if (
      TopCadets.length >= TOP_CADET_DATA.LIMIT ||
      i < TOP_CADET_DATA.POINT_REQ
    ) {
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
