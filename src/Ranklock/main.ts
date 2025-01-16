import input from "../utils/Input.js";
import update from "./Update.js";
import compare from "./Compare.js";

const inputData = new input({
  a: {
    Name: "Update Requests onto Data",
    Function: update,
  },
  b: {
    Name: "Compare Game Ranks to Sheet",
    Function: compare,
  },
});

export default async function () {
  await inputData.run();
}
