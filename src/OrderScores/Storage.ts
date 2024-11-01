// Modules
import { ReadFile } from "../Files.js";
import { SendErrors, FormatError, ValidateScore } from "../Utils.js";
import Player from "./PlayerClass.js";

// Types
type RawScore = { Name: string; Score: number };

// Variables
const Players: Map<string, Player> = new Map<string, Player>();
const Missing: Map<string, Player> = new Map<string, Player>();

const FORMAT = "USERNAME - PATTERN";
const REGEX_PATTERN = /([A-z0-9_]+) - ([0-9]+)/;

export function GetPlayers() {
  return Players;
}

function GetPlayer(username: string): Player | undefined {
  return Players.get(GetId(username));
}

export function AddPlayer(username: string) {
  Players.set(GetId(username), new Player(username));
}

export function GetMissingPlayers() {
  return Missing;
}

function GetMissingPlayer(username: string): Player | undefined {
  return Missing.get(GetId(username));
}

function AddMissingPlayer(username: string): Player {
  const MissingPlayer = new Player(username);
  Missing.set(GetId(username), MissingPlayer);
  return MissingPlayer;
}

export function RemoveMissingPlayer(username: string) {
  Missing.delete(GetId(username));
}

export function ResetPlayers() {
  Players.clear();
  Missing.clear();
}

function GetId(username: string): string {
  return username.toLowerCase();
}

// Score Functions
export async function AddScores(
  type: string,
  file: string,
  max: number,
  func: (player: Player, score: number) => void,
) {
  const Scores = await GetScores(type, file, max);
  const Promises: Promise<void>[] = [];

  for (let i = 0; i < Scores.length; i++) {
    LogPlayer(Scores[i], func);
  }

  return Promise.all(Promises);
}

async function GetScores(type: string, file: string, max: number) {
  let CurrentInput = await ReadFile(file);
  const Scores: RawScore[] = [];
  const Errors: string[] = [];

  // Check if scores are valid
  while (true) {
    let AllValid = true;

    for (let index = 0; index < CurrentInput.length; index++) {
      // Get vars
      const line = CurrentInput[index];
      const line_number = index + 1;

      // Ignore empty strings
      if (line == "") {
        continue;
      }

      // Get parsed data
      const result = ValidateLine(line, max);

      // If valid, add to scores
      if (result[0]) {
        Scores.push({ Name: result[1], Score: result[2] });
      } else {
        // Otherwise add to error messages
        Errors.push(FormatError(result[1], line_number));
        AllValid = false;
      }
    }

    // Check if valid
    if (!AllValid) {
      await SendErrors(type, Errors);

      // Recalculate vars
      CurrentInput = await ReadFile(file);
      Scores.length = 0;
      Errors.length = 0;
    } else {
      break;
    }
  }

  return Scores;
}

export function ValidateLine(
  line: string,
  max: number,
): [true, string, number] | [false, string] {
  const PatternResult = REGEX_PATTERN.exec(line);
  if (!PatternResult) {
    return [
      false,
      `Data on line number {0} does not match the format ${FORMAT}.`,
    ];
  }

  const name = PatternResult[1];
  const score = Number(PatternResult[2]);
  const result = ValidateScore(score, max);

  if (result[0]) {
    return [true, name, score];
  } else {
    return result;
  }
}

export function LogPlayer(
  Score: RawScore,
  func: (player: Player, score: number) => void,
) {
  const name = Score.Name;
  const score = Score.Score;

  // Check if player is AT
  const player = GetPlayer(name);
  if (player) {
    // Player exists as AT
    func(player, score);
    return;
  }

  // Check if has missing data
  let MissingPlayer = GetMissingPlayer(name);
  if (!MissingPlayer) {
    MissingPlayer = AddMissingPlayer(name);
  }

  // Run func
  func(MissingPlayer, score);
}
