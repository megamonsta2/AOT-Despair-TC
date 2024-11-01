import { createInterface } from "readline";

export async function SendErrors(type: string, Errors: string[]) {
  // Display error messages
  console.warn(`These are the errors for the ${type} input.`);
  Errors.forEach((msg: string) => console.warn(msg));

  // Wait for input
  console.warn("When the errors are amended, press any key.");
  await WaitForKey();
}

export function WaitForKey(): Promise<void> {
  return new Promise((resolve) => {
    // Get interface
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Once a key is pressed, close then resolve
    process.stdin.once("data", () => {
      rl.close();
      resolve();
    });
  });
}

export function FormatError(format: string, line_number: number): string {
  return format.replace(/\{0\}/, () => {
    return String(line_number);
  });
}

export function ValidateScore(
  score: number,
  max: number,
): [true] | [false, string] {
  if (isNaN(score)) {
    return [false, "The score on line {0} is not a number."];
  }

  if (!Number.isInteger(score)) {
    return [false, "The score on line {0} is not an integer (whole number)."];
  }

  if (score > max) {
    return [
      false,
      `The score on line {0} is greater than the maximum score (${max}).`,
    ];
  }

  if (score < 0) {
    return [false, "The score on line {0} is less than 0."];
  }

  return [true];
}
