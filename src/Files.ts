// Modules
import { access, mkdir, writeFile, readFile } from "fs/promises";
import { INPUT_FOLDER, OUTPUT_FOLDER } from "./Constants.js";

// Variables
const INPUT_FILES = [
  "KnowledgeNames.txt",
  "KnowledgeScores.txt",
  "BonusPoints.txt",

  "Musket.txt",
  "Speed.txt",
  "Dummies.txt",
  "ObstacleCourse.txt",
  "GasConservation.txt",

  "TitanTraining.txt",
  "Tundra.txt",
  "MusketRetrieval.txt",

  "Unsorted.txt",
];

const OUTPUT_FILES = ["Scores.csv", "Missing.csv", "Sorted.txt"];

// Export Functions
export async function Create(): Promise<void[]> {
  return Promise.all([
    CreatePaths(INPUT_FOLDER, INPUT_FILES),
    CreatePaths(OUTPUT_FOLDER, OUTPUT_FILES),
  ]);
}

export async function Clear(): Promise<void[]> {
  return Promise.all([
    ClearPaths(INPUT_FOLDER, INPUT_FILES),
    ClearPaths(OUTPUT_FOLDER, OUTPUT_FILES),
  ]);
}

// Checking
async function PathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// Creation
async function CreatePaths(folder: string, files: string[]): Promise<void> {
  // Create dir
  await CreateDir(folder);

  // Get promise array
  const promises: Promise<void>[] = files.map(async (file) => {
    // Create file
    await CreateFile(`${folder}/${file}`);
  });

  // Wait for
  await Promise.all(promises);
}

async function CreateDir(path: string): Promise<void> {
  // Check folder exists
  if (!(await PathExists(path))) {
    // Create folder if it doesn't
    try {
      await mkdir(path);
    } catch (error) {
      console.error(`Error creating directory: ${path}`, error);
    }
  }
}

async function CreateFile(path: string): Promise<void> {
  // Check fie exists
  if (!(await PathExists(path))) {
    // Create file if it doesn't
    try {
      await writeFile(path, "");
    } catch (error) {
      console.error(`Error creating file: ${path}`, error);
    }
  }
}

// Clearing
async function ClearPaths(folder: string, files: string[]): Promise<void> {
  // Get promise array
  const promises: Promise<void>[] = files.map(async (file) => {
    // Clear file
    await ClearFile(`${folder}/${file}`);
  });

  // Wait for
  await Promise.all(promises);
}

async function ClearFile(path: string): Promise<void> {
  // Check file exists
  if (await PathExists(path)) {
    // Create file if it doesn't
    try {
      await writeFile(path, "");
    } catch (error) {
      console.error(`Error clearing file: ${path}`, error);
    }
  } else {
    console.warn(`${path} doesn't exist.`);
  }
}

// Reading
export async function ReadFile(FileName: string): Promise<string[]> {
  const data = (
    await readFile(`${INPUT_FOLDER}/${FileName}.txt`, "utf8")
  ).split("\r\n");

  // Is table with 1 empty string
  if (data.length == 1 && data[0] == "") {
    return [];
  } else {
    return data;
  }
}
