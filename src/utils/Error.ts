import { getInput } from "../utils/Input.js";

const Errors: Map<string, string[]> = new Map();
let HasErrored = false;

export function AddError(header: string, err: string) {
  const Array = Errors.get(header);
  if (Array) {
    Array.push(err);
  } else {
    Errors.set(header, [err]);
  }

  HasErrored = true;
}

export function DisplayErrors() {
  console.warn("ERROR DISPLAY\n");
  Errors.forEach(function (array: string[], header: string) {
    console.warn(header);

    for (const err of array) {
      console.log(err);
    }
  });

  Errors.clear();
  HasErrored = false;

  console.warn("Press enter when resolved!");
  return getInput("");
}

export function Errored() {
  return HasErrored;
}
