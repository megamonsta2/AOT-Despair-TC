import { createInterface } from "readline";
import { InputOptions } from "./Types.js";

export function getInput(query: string): Promise<string> {
  const readlineInterface = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(function (resolve) {
    readlineInterface.question(query, function (answer) {
      readlineInterface.close();
      resolve(answer);
    });
  });
}

export default class Input {
  Options: InputOptions;

  constructor(Options: InputOptions) {
    this.Options = Options;

    this.Options.q = {
      Name: "Quit",
      Function: async () => {},
    };
  }

  async run() {
    while (true) {
      console.log("Pick what to do!");
      for (const [key, value] of Object.entries(this.Options)) {
        console.log(`${key}: ${value.Name}`);
      }

      const response = (await getInput("")).toLowerCase();
      if (response === "q") {
        return;
      }

      const responseData = this.Options[response];
      if (!responseData) {
        console.warn("Invalid, enter another key.");
        continue;
      }

      await responseData.Function();
      console.log("");
    }
  }
}
