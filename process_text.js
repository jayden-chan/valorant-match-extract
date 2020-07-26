const { readFileSync } = require("fs");

const stripFormFeed = (contents) => {
  return contents.replace(/\n?\f/g, "");
};

const nameProcessor = (contents) => {
  return stripFormFeed(contents)
    .replace(/\r?\n\r?\n/g, "\n")
    .split("\n");
};

const genericColumnProcessor = (contents) => {
  return stripFormFeed(contents).split(/\r?\n/g);
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

const table = [
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
  const contents = readFileSync(`${file}.txt`, { encoding: "utf8" });
  const data = func(contents);

  if (data.length !== 10) {
    console.error("wrong length");
  }

  table[idx + 1] = table[idx + 1].concat(data);
});

const maxes = Array(10).fill(0);
table.forEach((col, idx) => {
  const max = col.reduce((a, b) => {
    return Math.max(a, b.length);
  }, 0);

  maxes[idx] = max;
});

console.log(stripFormFeed(readFileSync("meta.txt", { encoding: "utf8" })));
const home_score = stripFormFeed(
  readFileSync("home_score.txt", { encoding: "utf8" })
);
const away_score = stripFormFeed(
  readFileSync("away_score.txt", { encoding: "utf8" })
);
console.log(
  `${home_score} - ${away_score} (${
    Number(home_score) < Number(away_score) ? "DEFEAT" : "VICTORY"
  })`
);
console.log();

for (let i = 0; i < table[0].length; i++) {
  let row = "|";
  for (let j = 0; j < table.length; j++) {
    row += ` ${table[j][i].padEnd(maxes[j], " ")} |`;
  }

  console.log(row);
  if (i === 0) {
    console.log(maxes.reduce((a, b) => `${a}${"-".repeat(b + 2)}|`, "|"));
  }
}
