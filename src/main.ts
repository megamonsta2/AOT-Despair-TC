import { exit } from "process";
import input from "./utils/Input.js";
import files from "./Files.js";
import get from "./Get.js";
import parse from "./Parse.js";
import post from "./Post.js";

const Options = {
  a: {
    Name: "Reset Files",
    Function: files,
  },
  b: {
    Name: "Get Raw Data",
    Function: get,
  },
  c: {
    Name: "Parse Input Files",
    Function: parse,
  },
  d: {
    Name: "Post to Sheets",
    Function: post,
  },
  q: {
    Name: "Quit",
    Function: exit,
  },
} as {
  [key: string]: {
    Name: string;
    Function: () => Promise<unknown>;
  };
};

async function main() {
  while (true) {
    console.log("Pick what to do!");
    for (const [key, value] of Object.entries(Options)) {
      console.log(`${key}: ${value.Name}`);
    }

    const response = (await input("")).toLowerCase();
    if (response in Options) {
      await Options[response].Function();
      console.log("");
    } else {
      console.warn("Invalid, enter another key.");
    }
  }
}

main();
