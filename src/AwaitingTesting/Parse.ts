import { join } from "path";
import { readFile, writeFile } from "fs/promises";

import {
  MAX_SCORE,
  SPEED_TIMES,
  OBBY_TIMES,
} from "../config/AwaitingTesting/Exams.js";
import {
  INPUT_FILES,
  INPUT_FOLDER,
  PARSED_FILES,
  PARSED_FOLDER,
} from "../config/AwaitingTesting/Paths.js";

import Player from "./Player.js";
import { SerialisedPlayer } from "../utils/Types.js";
import { AddError, DisplayErrors, Errored } from "../utils/Error.js";

/*

THIS IS THE DATA FORMAT FOR EACH INPUT

USERNAMES
[
    "USERNAME",
    "USERNAME"
]

KNOWLEDGE
[
    [ "SCORE / 50", "USERNAME" ]
]

DUMMIES
[
    "** Participants **\n- USERNAME | xKILLS kills\n\n**Hosted by: HOST**\n**Ended by: HOST**"
]

SPEED
[
    "USERNAME - SECONDS"
]

OBBY
[
    "** Succeeded **\n- USERNAME | MINS:SECS:MILISECS\n\n** Failed **\n- USERNAME | MINS:SECS:MILISECS\n\n**Hosted by: HOST**\n**Ended by: HOST**"
]

BP
[
    "USERNAME - POINTS"
]

*/

type DefaultInput = string[];
type KnowledgeInput = [string, string][];

const ValidPlayers: Map<string, Player> = new Map();
const InvalidPlayers: Map<string, Player> = new Map();

const ObbyScores: Map<Player, number[]> = new Map();
const BPScores: Map<Player, number[]> = new Map();

const KnowledgeScorePattern = /([0-9]+) \/ [0-9]+/;
const DummiesPattern = /- ([A-z0-9_]+) \| x([0-9]+) kills/;
const ObbyPattern = /- ([A-z0-9_]+) \| ([0-9]+):([0-9]+):[0-9]+/;
const ManualPattern = /([A-z0-9_]+) - ([0-9]+)/;

export default async function main() {
  ValidPlayers.clear();
  InvalidPlayers.clear();

  // Get usernames
  await ParseUsernames();

  // Assign scores
  while (true) {
    ObbyScores.clear();
    BPScores.clear();
    await ResetPlayers();

    await Promise.all([
      ParseKnowledge(),
      ParseDummies(),
      ParseSpeed(),
      ParseObby(),
      ParseBP(),
      ParseTundra(),
      ParseTitanTraining(),
    ]);

    if (Errored()) {
      await DisplayErrors();
    } else {
      break;
    }
  }

  AddObbyScores();
  AddBPScores();
  await WritePlayersToFile();

  console.log(ValidPlayers);
  console.log(InvalidPlayers);

  console.log("Parsed!");
}

function ResetPlayers() {
  const ValidPromise: Promise<void> = new Promise(function (resolve) {
    ValidPlayers.forEach(function (player) {
      player.Reset();
    });

    resolve();
  });

  const InvalidPromise: Promise<void> = new Promise(function (resolve) {
    InvalidPlayers.forEach(function (player) {
      player.Reset();
    });

    resolve();
  });

  return Promise.all([ValidPromise, InvalidPromise]);
}

// Usernames
async function ParseUsernames() {
  const Promises: Promise<void>[] = [];
  const raw: DefaultInput = await ReadInputFile(INPUT_FILES.Username);

  for (const username of raw) {
    Promises.push(
      new Promise(function (resolve) {
        const NewPlayer = new Player(username);
        const key = GetPlayerKey(username);

        ValidPlayers.set(key, NewPlayer);
        resolve();
      }),
    );
  }

  return Promises;
}

// Knowledge
async function ParseKnowledge() {
  const raw: KnowledgeInput = await ReadInputFile(INPUT_FILES.Knowledge);
  const Promises: Promise<void>[] = [];

  for (const data of raw) {
    Promises.push(ParseKnowledgePlayer(data));
  }

  return Promise.all(Promises);
}

function ParseKnowledgePlayer(data: [string, string]): Promise<void> {
  return new Promise(function (resolve) {
    const username = data[1];
    const score = ParseKnowledgeScore(username, data[0]);
    if (!score) {
      resolve();
      return;
    }

    const PlayerObj = GetPlayer(username);
    PlayerObj.AddKnowledge(score);

    resolve();
  });
}

function ParseKnowledgeScore(username: string, raw: string): number | void {
  const PatternResult = KnowledgeScorePattern.exec(raw);
  if (!PatternResult) {
    AddError("Knowledge", `${username} has an invalid score: ${raw}!`);
    return;
  }

  if (PatternResult[0] !== raw) {
    AddError("Knowledge", `"${raw}" does not contain ONLY a knowledge score!`);
    return;
  }

  const ParsedScore = Number(PatternResult[1]);
  if (
    isNaN(ParsedScore) ||
    ParsedScore < 0 ||
    ParsedScore > MAX_SCORE.Knowledge
  ) {
    AddError("Knowledge", `"${ParsedScore}" is out of bounds!`);
    return;
  }

  return ParsedScore;
}

// Dummies
async function ParseDummies() {
  const raw: DefaultInput = await ReadInputFile(INPUT_FILES.Dummies);

  for (const set of raw) {
    ParseDummiesSet(set);
  }
}

function ParseDummiesSet(data: string) {
  const splitData = data.split("\n");

  for (const line of splitData) {
    if (line.includes("Participants")) {
      continue;
    }

    if (line === "") {
      break;
    }

    // Format: - USERNAME | xKILLS kills
    const PatternResult = DummiesPattern.exec(line);
    if (!PatternResult) {
      AddError("Dummies", `${line} is an invalid player!`);
      continue;
    }

    if (PatternResult[0] !== line) {
      AddError("Dummies", `${line} contains more than the regex pattern!`);
      continue;
    }

    const username = PatternResult[1];
    const kills = Number(PatternResult[2]);
    if (isNaN(kills) || kills < 0) {
      AddError("Dummies", `${username} has an invalid amount of dummy kills!`);
      continue;
    }

    const PlayerObj = GetPlayer(username);
    PlayerObj.AddDummies(ParseDummiesScore(kills));
  }
}

function ParseDummiesScore(kills: number): number {
  const max = MAX_SCORE.Dummies;

  if (kills > max) {
    return max;
  } else {
    return kills;
  }
}

// Speed
async function ParseSpeed() {
  const raw: DefaultInput = await ReadInputFile(INPUT_FILES.Speed);

  for (const set of raw) {
    for (const line of set.split("\n")) {
      ParseSpeedPlayer(line);
    }
  }
}

function ParseSpeedPlayer(line: string) {
  const PatternResult = ManualPattern.exec(line);
  if (!PatternResult) {
    AddError("Speed", `${line} is an invalid line!`);

    return;
  }

  if (PatternResult[0] !== line) {
    AddError("Speed", `${line} contains more than the regex pattern!`);

    return;
  }

  const username = PatternResult[1];
  const secs = Number(PatternResult[2]);

  if (isNaN(secs) || secs < 0) {
    AddError("Speed", `${username} has an invalid amount of seconds!`);

    return;
  }

  const PlayerObj = GetPlayer(username);
  PlayerObj.AddSpeed(ParseSpeedScore(secs));
}

function ParseSpeedScore(secs: number): number {
  if (secs <= SPEED_TIMES.Lower) {
    return MAX_SCORE.Speed;
  } else if (secs >= SPEED_TIMES.Upper) {
    return 0;
  } else {
    return SPEED_TIMES.Upper - secs;
  }
}

// Obby
async function ParseObby() {
  const raw: DefaultInput = await ReadInputFile(INPUT_FILES.Obby);

  for (const set of raw) {
    ParseObbySet(set);
  }
}

function ParseObbySet(data: string) {
  let GettingPlayers: "Pass" | "Fail" = "Pass";
  const splitData = data.split("\n");

  for (const line of splitData) {
    if (line.includes("Host")) {
      break;
    } else if (line.includes("Succeeded")) {
      GettingPlayers = "Pass";
      continue;
    } else if (line.includes("Failed")) {
      GettingPlayers = "Fail";
      continue;
    } else if (line === "") {
      continue;
    }

    // Format: - USERNAME | MINS:SECS:MILISECS
    const PatternResult = ObbyPattern.exec(line);
    if (!PatternResult) {
      AddError("Obby", `${line} is an invalid player!`);
      continue;
    } else if (PatternResult[0] !== line) {
      AddError("Obby", `${line} contains more than the regex pattern!`);
      continue;
    }

    const username = PatternResult[1];
    const [mins, secs] = [Number(PatternResult[2]), Number(PatternResult[3])];

    if (isNaN(mins) || isNaN(secs)) {
      AddError("Obby", `${username} has an invalid obby time!`);
      continue;
    }

    const PlayerObj = GetPlayer(username);
    const PlayerObby = ObbyScores.get(PlayerObj);
    const points = ParseObbyScore(GettingPlayers, mins, secs);

    if (PlayerObby) {
      PlayerObby.push(points);
    } else {
      ObbyScores.set(PlayerObj, [points]);
    }
  }
}

// TODO: OBBY CALCULATOR
function ParseObbyScore(
  status: "Pass" | "Fail",
  mins: number,
  secs: number,
): number {
  secs += mins * 60;

  if (status === "Fail") return 0;
  if (secs >= OBBY_TIMES.Fail) return 0;
  if (secs <= OBBY_TIMES.Max) return MAX_SCORE.Obby;

  // Secs over max time required (e.g. 98 - 80 = 18)
  // Half it and round down to be the points to take off (e.g. floor(18 / 2) = 9)
  const diff = Math.floor((secs - OBBY_TIMES.Max) / 2);

  return MAX_SCORE.Obby - diff;
}

function AddObbyScores() {
  for (const [player, points] of ObbyScores.entries()) {
    for (const point of points) {
      player.AddObby(point);
    }
  }
}

// Speed
async function ParseBP() {
  const raw: DefaultInput = await ReadInputFile(INPUT_FILES.BonusPoints);

  for (const set of raw) {
    for (const line of set.split("\n")) {
      ParseBPPlayer(line);
    }
  }
}

function ParseBPPlayer(line: string) {
  const PatternResult = ManualPattern.exec(line);
  if (!PatternResult) {
    AddError("BP", `${line} is an invalid line!`);

    return;
  } else if (PatternResult[0] !== line) {
    AddError("BP", `${line} contains more than the regex pattern!`);

    return;
  }

  const username = PatternResult[1];
  const points = Number(PatternResult[2]);

  if (isNaN(points) || points < 0) {
    AddError(
      "BP",
      `${username} was given an invalid amount of BP: ${PatternResult[2]}!`,
    );
    return;
  }

  const PlayerObj = GetPlayer(username);
  const PlayerBP = BPScores.get(PlayerObj);
  if (PlayerBP) {
    PlayerBP.push(points);
  } else {
    BPScores.set(PlayerObj, [points]);
  }
}

function AddBPScores() {
  for (const [player, points] of BPScores.entries()) {
    for (const point of points) {
      player.AddBonusPoints(point);
    }
  }
}

// Alt Practicals
async function ParseTundra() {
  const raw: DefaultInput = await ReadInputFile(INPUT_FILES.Tundra);

  for (const set of raw) {
    for (const line of set.split("\n")) {
      ParseTundraPlayer(line);
    }
  }
}

function ParseTundraPlayer(line: string) {
  const PatternResult = ManualPattern.exec(line);
  if (!PatternResult) {
    AddError("Tundra", `${line} is an invalid line!`);

    return;
  } else if (PatternResult[0] !== line) {
    AddError("Tundra", `${line} contains more than the regex pattern!`);

    return;
  }

  const username = PatternResult[1];
  const points = Number(PatternResult[2]);

  if (isNaN(points) || points < 0) {
    AddError(
      "Tundra",
      `${username} was given an invalid amount of Tundra Points: ${PatternResult[2]}!`,
    );
    return;
  }

  const PlayerObj = GetPlayer(username);
  PlayerObj.AddTundra(ParseAltPracScore(points));
}

async function ParseTitanTraining() {
  const raw: DefaultInput = await ReadInputFile(INPUT_FILES.TitanTraining);

  for (const set of raw) {
    for (const line of set.split("\n")) {
      ParseTitanTrainingPlayer(line);
    }
  }
}

function ParseTitanTrainingPlayer(line: string) {
  const PatternResult = ManualPattern.exec(line);
  if (!PatternResult) {
    AddError("TitanTraining", `${line} is an invalid line!`);

    return;
  } else if (PatternResult[0] !== line) {
    AddError("TitanTraining", `${line} contains more than the regex pattern!`);

    return;
  }

  const username = PatternResult[1];
  const points = Number(PatternResult[2]);

  if (isNaN(points) || points < 0) {
    AddError(
      "TitanTraining",
      `${username} was given an invalid amount of TT Points: ${PatternResult[2]}!`,
    );
    return;
  }

  const PlayerObj = GetPlayer(username);
  PlayerObj.AddTitanTraining(ParseAltPracScore(points));
}

function ParseAltPracScore(score: number) {
  if (score > MAX_SCORE.AltPrac) return MAX_SCORE.AltPrac;
  if (score < 0) return 0;
  return score;
}

// Other
function GetPlayerKey(user: string) {
  return user.toLowerCase();
}

function GetPlayer(username: string): Player {
  const key = GetPlayerKey(username);

  const ValidPlayer = ValidPlayers.get(key);
  if (ValidPlayer) {
    return ValidPlayer;
  }

  const InvalidPlayer = InvalidPlayers.get(key);
  if (InvalidPlayer) {
    return InvalidPlayer;
  }

  const NewPlayer = new Player(username);
  InvalidPlayers.set(key, NewPlayer);
  return NewPlayer;
}

async function ReadInputFile(file: string) {
  const raw = await readFile(join(INPUT_FOLDER, file), "utf-8");
  if (raw === "") {
    return "";
  } else {
    return JSON.parse(raw);
  }
}

function WritePlayersToFile() {
  const ValidData: SerialisedPlayer[] = [];
  const InvalidData: SerialisedPlayer[] = [];

  const ValidPath = join(PARSED_FOLDER, PARSED_FILES.Valid);
  const InvalidPath = join(PARSED_FOLDER, PARSED_FILES.Invalid);

  for (const Player of ValidPlayers.values()) {
    ValidData.push(Player.Serialise());
  }

  for (const Player of InvalidPlayers.values()) {
    InvalidData.push(Player.Serialise());
  }

  return Promise.all([
    writeFile(ValidPath, JSON.stringify(ValidData)),
    writeFile(InvalidPath, JSON.stringify(InvalidData)),
  ]);
}
