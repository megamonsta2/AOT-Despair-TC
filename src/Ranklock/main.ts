import input from "../utils/Input.js";
import update from "./Update.js";

const inputData = new input({
  a: {
    Name: "Update Requests onto Data",
    Function: update,
  },
});

export default async function () {
  await inputData.run();
}
