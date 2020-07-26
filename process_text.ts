const read = Deno.readTextFileSync;

const stripFF = (contents: string) => {
  return contents.replace(/\n?\f/g, "");
};

const nameProcessor = (contents: string) => {
  return stripFF(contents)
    .replace(/\r?\n\r?\n/g, "\n")
    .split("\n");
};

const genericColumnProcessor = (contents: string) => {
  return stripFF(contents)
    .split(/\r?\n/g)
    .map((cell) => Number(cell));
};

const files = {
  player_names: nameProcessor,
  scores: genericColumnProcessor,
  K: genericColumnProcessor,
  D: genericColumnProcessor,
  A: genericColumnProcessor,
  econ: genericColumnProcessor,
  first_bloods: genericColumnProcessor,
  plants: genericColumnProcessor,
  defuses: genericColumnProcessor,
};

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

Object.entries(files).forEach(([file, func], idx) => {
  const contents = read(`${file}.txt`);
  const data = func(contents);

  if (data.length !== 10) {
    console.error("wrong length");
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

const meta = stripFF(read("meta.txt"));
const home = Number(stripFF(read("home.txt")));
const away = Number(stripFF(read("away.txt")));

switch (Deno.args[0]) {
  case "md":
    console.log(meta);
    console.log(`${home} - ${away} (${home < away ? "DEFEAT" : "VICTORY"})`);
    console.log();

    for (let i = 0; i < table[0].length; i++) {
      let row = "|";
      for (let j = 0; j < table.length; j++) {
        row += ` ${`${table[j][i]}`.padEnd(maxes[j], " ")} |`;
      }

      console.log(row);
      if (i === 0) {
        console.log(maxes.reduce((a, b) => `${a}${"-".repeat(b + 2)}|`, "|"));
      }
    }
    break;
  case "json":
    console.log(
      JSON.stringify({
        meta,
        score: {
          home,
          away,
        },
        scoreboard: table,
      })
    );
}
