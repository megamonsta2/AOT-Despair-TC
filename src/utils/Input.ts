import { createInterface } from "readline";

export default function input(query: string): Promise<string> {
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
