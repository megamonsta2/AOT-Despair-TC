import input from "./utils/Input.js";
import awaitingTesting from "./AwaitingTesting/main.js";
import ranklock from "./Ranklock/main.js";
import enlistment from "./Enlistment/main.js";

const InputData = new input({
  a: {
    Name: "Awaiting Testing Scores",
    Function: awaitingTesting,
  },
  b: {
    Name: "Ranklocks",
    Function: ranklock,
  },
  c: {
    Name: "Enlistment",
    Function: enlistment,
  },
});

InputData.run();
