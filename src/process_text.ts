import StringBuffer from "./string_buffer.ts";

function read(path: string) {
  return Deno.readTextFileSync(`tesseract/${path}.txt`).replace(/\n?\f/g, "");
}

function nameProcessor(contents: string) {
  return contents.replace(/\r?\n\r?\n/g, "\n").split(/\r?\n/g);
}

function columnProcessor(contents: string) {
  return contents.split(/\r?\n/g).map((cell) => Number(cell));
}

const FILES = {
  player_names: nameProcessor,
  scores: columnProcessor,
  K: columnProcessor,
  D: columnProcessor,
  A: columnProcessor,
  econ: columnProcessor,
  first_bloods: columnProcessor,
  plants: columnProcessor,
  defuses: columnProcessor,
};

export function processText(format: string): string {
  const table: (number | string)[][] = [
    ["#"].concat([...Array(10).keys()].map((e) => `${e + 1}`)),
    ["player_name"],
    ["scr"],
    ["K"],
    ["D"],
    ["A"],
    ["eco"],
    ["FB"],
    ["pl"],
    ["df"],
  ];

  Object.entries(FILES).forEach(([file, func], idx) => {
    const contents = read(file);
    const data = func(contents);

    if (data.length !== 10) {
      console.error("WARN: Wrong column length encountered");
    }

    table[idx + 1] = table[idx + 1].concat(data);
  });

  const maxes = Array(10).fill(0);
  table.forEach((col, idx) => {
    const max = col.reduce((a, b) => {
      return Math.max(a as number, `${b}`.length);
    }, 0);

    maxes[idx] = max;
  });

  const meta = read("meta");
  const home = Number(read("home"));
  const away = Number(read("away"));

  const ret = new StringBuffer();

  switch (format) {
    case "md":
      ret.pushLine(meta);
      ret.pushLine(`${home} - ${away} (${home < away ? "DEFEAT" : "VICTORY"})`);
      ret.pushLine();

      for (let i = 0; i < table[0].length; i++) {
        let row = "|";
        for (let j = 0; j < table.length; j++) {
          row += ` ${`${table[j][i]}`.padEnd(maxes[j], " ")} |`;
        }

        ret.pushLine(row);
        if (i === 0) {
          ret.pushLine(
            maxes.reduce((a, b) => `${a}${"-".repeat(b + 2)}|`, "|")
          );
        }
      }
      break;

    case "json":
      ret.pushLine(
        JSON.stringify({
          meta,
          score: {
            home,
            away,
          },
          scoreboard: table,
        })
      );

    default:
      throw new TypeError("Invalid output format");
  }

  return ret.get();
}
