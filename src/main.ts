import input from "./utils/Input.js";
import awaitingTesting from "./AwaitingTesting/main.js";

const InputData = new input({
  a: {
    Name: "Awaiting Testing Scores",
    Function: awaitingTesting,
  },
});

InputData.run();
