import { google, sheets_v4 } from "googleapis";

import credentials from "../config/SheetCredentials.json" with { type: "json" };
import { ValueRange } from "./Types.js";

const auth = new google.auth.JWT(
  credentials.client_email,
  undefined,
  credentials.private_key,
  ["https://www.googleapis.com/auth/spreadsheets"],
);
const sheets = google.sheets({ version: "v4", auth });

export async function GetSheets(id: string): Promise<string[] | undefined> {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: id,
  });
  const responseSheets = response.data.sheets;

  if (!responseSheets) {
    return;
  }

  const titles: string[] = [];
  for (const sheet of responseSheets) {
    const title = sheet.properties?.title;
    if (typeof title === "string") {
      titles.push(title);
    }
  }

  return titles;
}

async function GetSheet(id: string, name: string) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: id,
  });
  const responseSheets = response.data.sheets;

  if (!responseSheets) {
    return;
  }

  const sheet = responseSheets.find(function (s) {
    if (s.properties?.title === name) {
      return s;
    }
  });

  if (!sheet) {
    console.warn(`Not found sheet with name ${name}!`);
    return;
  }

  const sheetId = sheet.properties?.sheetId;
  if (typeof sheetId === "number") {
    return sheetId;
  } else {
    return;
  }
}

export async function GetSheetData(id: string, ranges: string[]) {
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: id,
    ranges,
  });

  return response.data.valueRanges;
}

export async function SetSheetData(id: string, ranges: ValueRange[]) {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: id,
    requestBody: {
      valueInputOption: "USER_ENTERED", // or 'USER_ENTERED' for formulas
      data: ranges,
    },
  });
}

export async function CloneSheet(
  id: string,
  oldSheet: string,
  newSheet: string,
): Promise<boolean> {
  const sheetId = await GetSheet(id, oldSheet);
  if (typeof sheetId !== "number") {
    return false;
  }

  await BatchUpdate(id, [
    {
      duplicateSheet: {
        sourceSheetId: sheetId,
        newSheetName: newSheet,
      },
    },
  ]);

  return true;
}

function BatchUpdate(id: string, requests: sheets_v4.Schema$Request[]) {
  return sheets.spreadsheets.batchUpdate({
    spreadsheetId: id,
    requestBody: {
      requests,
    },
  });
}
