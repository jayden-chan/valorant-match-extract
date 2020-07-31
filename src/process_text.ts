import StringBuffer from "./string_buffer.ts";

const PREDEF_COLS = 2;

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function pivotScoreboard(
  scoreboard: (string | number)[][]
): (string | number)[][] {
  scoreboard = scoreboard.slice(1);
  const ret: (string | number)[][] = Array(scoreboard[0].length)
    .fill(null)
    .map(() => []);

  for (let i = 0; i < scoreboard.length; i++) {
    for (let j = 0; j < scoreboard[0].length; j++) {
      ret[j][i] = scoreboard[i][j];
    }
  }

  return ret;
}

function read(path: string) {
  return Deno.readTextFileSync(`tesseract/${path}.txt`)
    .replace(/\n?\f/g, "")
    .trim();
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
  const agents = read("agents").split("\n");
  const table: (number | string)[][] = [
    ["#"].concat([...Array(10).keys()].map((e) => `${e + 1}`)),
    ["agent"].concat(agents),
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
      console.error(`WARN: Wrong column length encountered (${data.length})`);
      console.error(data);
      console.error(contents);
      console.error(file);
    }

    table[idx + PREDEF_COLS] = table[idx + PREDEF_COLS].concat(data);
  });

  const maxes = Array(10).fill(0);
  table.forEach((col, idx) => {
    const max = col.reduce((a, b) => {
      return Math.max(a as number, `${b}`.length);
    }, 0);

    maxes[idx] = max;
  });

  const meta = read("meta").split(/\r?\n/g);
  const home = Number(read("home"));
  const away = Number(read("away"));

  if (meta.length !== 4) {
    throw new Error("Failed to properly extract metadata");
  }

  const ret = new StringBuffer();

  switch (format) {
    case "md":
      ret.pushLine(meta.join("\n"));
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
        JSON.stringify(
          {
            meta,
            score: {
              home,
              away,
            },
            scoreboard: pivotScoreboard(table),
          },
          null,
          2
        )
      );
      break;

    case "toml":
      ret.pushLine(`[[games]]`);
      ret.pushLine(
        `date = "${meta[0]
          .split(" ")
          .map((val, idx) => (idx === 0 ? capitalize(val) : val))
          .join(" ")}"`
      );
      ret.pushLine(`map = "${capitalize(meta[2].split("- ")[1])}"`);
      ret.pushLine(`score = [ ${home}, ${away} ]`);
      ret.pushLine(`time = "${meta[3]}"`);
      ret.pushLine("scoreboard = [");
      pivotScoreboard(table)
        .slice(1)
        .forEach((row) => {
          ret.pushLine(`  [ ${row.map((v) => `"${v}"`).join(", ")} ],`);
        });
      ret.pushLine("]");
      ret.pushLine();
      break;

    default:
      throw new TypeError("Invalid output format");
  }

  return ret.get();
}
