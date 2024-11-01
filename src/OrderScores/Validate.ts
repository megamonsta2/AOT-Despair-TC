// Modules
import { GetMissingPlayers, RemoveMissingPlayer } from "./Storage.js";
import { GROUP_ID, ROLE_ID } from "../Constants.js";

// Types
type PlayerData = {
  Username: string;
  UserId: number;
};
type PlayerJSON = {
  name: string;
  id: number;
};
type GroupJSON = {
  group: {
    id: number;
  };
  role: {
    id: number;
  };
}[];

// Module Setup
export default async () => {
  const Usernames = GetUsernames();
  const PlayerData = await CheckPlayersExist(Usernames);
  const PlayersInGroup = await CheckPlayersInGroup(PlayerData);
  await RemovePlayers(PlayersInGroup);
};

function GetUsernames() {
  const MissingPlayers = GetMissingPlayers();
  const usernames: string[] = [];

  MissingPlayers.forEach((player) => usernames.push(player.Username));

  return usernames;
}

async function CheckPlayersExist(Usernames: string[]) {
  const URL = `https://users.roblox.com/v1/usernames/users`;
  const PlayerData: PlayerData[] = [];

  try {
    // Get response
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usernames: Usernames }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const ParsedResult: PlayerJSON[] = JSON.parse(await response.text()).data;

    // Add usernames to user id list
    for (const Data of ParsedResult) {
      const Username = Data.name;
      const UserId = Data.id;
      PlayerData.push({ Username: Username, UserId: UserId });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return PlayerData;
}

async function CheckPlayersInGroup(PlayerData: PlayerData[]) {
  const Promises: Promise<void>[] = [];
  const PlayersInGroup: string[] = [];

  // Loop through every player
  for (const player of PlayerData) {
    // Add promise to tbl
    Promises.push(
      // Check player in group
      CheckPlayerInGroup(player.UserId).then((InGroup: boolean) => {
        // If in group, add user to tbl
        if (InGroup) {
          PlayersInGroup.push(player.Username);
        }
      }),
    );
  }

  // Wait for promises to resolve
  await Promise.all(Promises);

  return PlayersInGroup;
}

async function CheckPlayerInGroup(UserId: number): Promise<boolean> {
  const CurrentURL = `https://groups.roblox.com/v1/users/${UserId}/groups/roles`;

  try {
    // Get response
    const response = await fetch(CurrentURL);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const ParsedResult: GroupJSON = JSON.parse(await response.text()).data;

    // Check if player is found
    for (let i = 0; i < ParsedResult.length; i++) {
      // Get username
      const CurrentGroup = ParsedResult[i];
      const GroupId = CurrentGroup.group.id;
      const RoleId = CurrentGroup.role.id;

      // Group found
      if (String(GroupId) == GROUP_ID) {
        if (String(RoleId) == ROLE_ID) {
          // AT role
          console.warn(
            `The player with the id ${UserId} is of AT rank, but wasn't caught when getting Usernames.`,
          );

          // Found as AT, this should never occur, but if it does then return false
          return false;
        } else {
          // Not AT, probably died
          return true;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  // Group never found, not in group
  return false;
}

function RemovePlayers(Usernames: string[]): Promise<void[]> {
  const Promises: Promise<void>[] = [];

  for (const username of Usernames) {
    Promises.push(
      new Promise((resolve) => {
        RemoveMissingPlayer(username);
        resolve();
      }),
    );
  }

  return Promise.all(Promises);
}
