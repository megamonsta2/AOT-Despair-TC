import { readdir, unlink, writeFile, readFile } from "fs/promises";
import paths from "./config/Paths.json" with { type: "json" };
import { join } from "path";

export function ReadFile(path: string) {
  return readFile(path, "utf-8");
}

export default async function ResetFiles() {
  // Delete existing files
  await Promise.all([
    RemoveFiles(paths.InputFolder),
    RemoveFiles(paths.ParsedFolder),
  ]);

  // Create new files
  await Promise.all([
    CreateFiles(paths.InputFolder, paths.Inputs),
    CreateFiles(paths.ParsedFolder, paths.Parsed),
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
