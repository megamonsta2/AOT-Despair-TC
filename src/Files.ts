import { readdir, unlink, writeFile, readFile } from "fs/promises";
import { join } from "path";

import {
  INPUT_FOLDER,
  INPUT_FILES,
  PARSED_FOLDER,
  PARSED_FILES,
} from "./config/Paths.js";

export function ReadFile(path: string) {
  return readFile(path, "utf-8");
}

export default async function ResetFiles() {
  // Delete existing files
  await Promise.all([RemoveFiles(INPUT_FOLDER), RemoveFiles(PARSED_FOLDER)]);

  // Create new files
  await Promise.all([
    CreateFiles(INPUT_FOLDER, INPUT_FILES),
    CreateFiles(PARSED_FOLDER, PARSED_FILES),
  ]);

  console.log("Reset files!");
}

async function RemoveFiles(path: string) {
  const files = await readdir(path);

  for (const file of files) {
    unlink(join(path, file));
  }
}

function CreateFiles(path: string, files: { [key: string]: string }) {
  const Promises: Promise<void>[] = [];

  for (const file of Object.values(files)) {
    Promises.push(writeFile(join(path, file), ""));
  }

  return Promise.all(Promises);
}
