// Modules
import { question } from "readline-sync";
import { Create as CreateFiles, Clear as ClearFiles } from "./Files.js";
// import OrderScores from "./OrderScores/index.js";
// import Sort from "./Sort.js";

// Variables
const QUESTION =
  "What action?\r\n1. Create Files\r\n2. Clear Files\r\n3. Order Scores\r\n4. Sort Scores\r\n5. Quit\r\n> ";

// Module Setup
async function main() {
  while (true) {
    const answer = question(QUESTION);

    if (answer == "1") {
      await CreateFiles();
    } else if (answer == "2") {
      await ClearFiles();
      // } else if (answer == "3") {
      //   await OrderScores();
      // } else if (answer == "4") {
      //   await Sort();
    } else if (answer == "5") {
      process.exit();
    } else {
      console.log("Invalid input!");
    }
  }
}

enum test {
  "a" = "g",
  "b" = "gdf",
  "c" = "dg",
}

console.log(test);
console.log(test.a);

main();
