import { access, mkdir, readdir, unlink, writeFile } from "fs/promises";
import { join } from "path";

import {
  INPUT_FOLDER as MAIN_INPUT_FOLDER,
  PARSED_FOLDER as MAIN_PARSED_FOLDER,
} from "../config/Paths.js";
import {
  INPUT_FOLDER,
  INPUT_FILES,
  PARSED_FOLDER,
  PARSED_FILES,
} from "../config/AwaitingTesting/Paths.js";

export default async function ResetFiles() {
  await CreateDir(MAIN_INPUT_FOLDER);
  await CreateDir(MAIN_PARSED_FOLDER);
  await CreateDir(INPUT_FOLDER);
  await CreateDir(PARSED_FOLDER);
  // Delete existing files
  await Promise.all([RemoveFiles(INPUT_FOLDER), RemoveFiles(PARSED_FOLDER)]);

  // Create new files
  await Promise.all([
    CreateFiles(INPUT_FOLDER, INPUT_FILES),
    CreateFiles(PARSED_FOLDER, PARSED_FILES),
  ]);

  console.log("Reset files!");
}

async function CreateDir(path: string) {
  try {
    await access(path);
  } catch {
    await mkdir(path);
  }
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
