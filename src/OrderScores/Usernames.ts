// Modules
import { AddPlayer } from "./Storage.js";
import { GROUP_ID, ROLE_ID } from "../Constants.js";

// Types
type ParsedJSON = {
  nextPageCursor: string | undefined;
  data: ParsedPlayers;
};
type ParsedPlayers = {
  username: string;
}[];

// Variables
let NextCursor: string | undefined = "";
let FetchCompleted = false;
let AmtFetched = 0;
let AmtProcessed = 0;

// Module Setup
export default async () => {
  // Run func
  await FetchUsernames();

  // Yield until fully fetched and processed
  while (!FetchCompleted && AmtFetched != AmtProcessed) {
    Wait();
  }
};

async function FetchUsernames() {
  // Repeat until next cursor is nil
  while (typeof NextCursor == "string") {
    const CurrentURL = `https://groups.roblox.com/v1/groups/${GROUP_ID}/roles/${ROLE_ID}/users?limit=100&sortOrder=Desc&cursor=${NextCursor}&`;

    try {
      // Get response
      const response = await fetch(CurrentURL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const ParsedResult: ParsedJSON = JSON.parse(await response.text());

      // Assign new cursor
      NextCursor = ParsedResult.nextPageCursor;

      // Add usernames to data
      AmtFetched += ParsedResult.data.length;

      for (const player of ParsedResult.data) {
        ProcessUsername(player.username);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  FetchCompleted = true;
}

async function ProcessUsername(username: string) {
  AddPlayer(username);
  AmtProcessed += 1;
}

async function Wait(delay?: number) {
  await new Promise((resolve) => setTimeout(resolve, delay || 30));
}
