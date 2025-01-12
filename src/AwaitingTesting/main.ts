import input from "../utils/Input.js";
import files from "./Files.js";
import get from "./Get.js";
import parse from "./Parse.js";
import post from "./Post.js";

const inputData = new input({
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
});

export default inputData.run;
