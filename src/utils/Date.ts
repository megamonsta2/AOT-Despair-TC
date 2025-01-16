const DATE_PATTERN = /([0-9]+)\/([0-9]+)\/([0-9]+)/;

export default function ParseDate(raw: string | undefined): Date | undefined {
  if (!raw) {
    console.warn("No data!");
    return;
  }

  const patternResult = DATE_PATTERN.exec(raw);
  if (!patternResult) {
    console.warn(`${raw} is not a valid date!`);
    return;
  }

  const [day, month, year] = [
    Number(patternResult[1]),
    Number(patternResult[2]),
    Number(patternResult[3]),
  ];

  if (ValidateDate(day) || ValidateDate(month) || ValidateDate(year)) {
    console.warn(`${day}/${month}/${year} is an invalid date!`);
    return;
  }

  return new Date(year, month - 1, day);
}

function ValidateDate(dateNum: number) {
  return isNaN(dateNum) || dateNum <= 0;
}
