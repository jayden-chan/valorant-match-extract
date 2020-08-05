type Section = {
  [key: string]: {
    crop: [number, number, number, number];
    charset?: string;
    threshold?: number;
  };
};

const NUMBERS_CHARSET = "1234567890";
const META_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890 :.-";
const AGENTS_START = [281, 351];
const DEFAULT_THRESHOLD = 80;

const IMAGE_SECTIONS: Section = {
  player_names: {
    crop: [380, 520, 335, 350],
  },
  scores: {
    crop: [100, 520, 683, 350],
    charset: NUMBERS_CHARSET,
  },
  K: {
    crop: [64, 520, 823, 350],
    charset: NUMBERS_CHARSET,
  },
  D: {
    crop: [64, 520, 871, 350],
    charset: NUMBERS_CHARSET,
  },
  A: {
    crop: [64, 520, 920, 350],
    charset: NUMBERS_CHARSET,
  },
  econ: {
    crop: [95, 520, 1000, 350],
    charset: NUMBERS_CHARSET,
  },
  first_bloods: {
    crop: [64, 520, 1170, 350],
    charset: NUMBERS_CHARSET,
  },
  plants: {
    crop: [64, 520, 1323, 350],
    charset: NUMBERS_CHARSET,
  },
  defuses: {
    crop: [64, 520, 1475, 350],
    charset: NUMBERS_CHARSET,
  },
  meta: {
    crop: [181, 101, 1631, 164],
    charset: META_CHARSET,
    threshold: 45,
  },
  home: {
    crop: [140, 76, 648, 91],
    threshold: 45,
    charset: NUMBERS_CHARSET,
  },
  away: {
    crop: [140, 76, 1050, 88],
    threshold: 45,
    charset: NUMBERS_CHARSET,
  },
};

export async function processImage(path: string): Promise<boolean> {
  const discoveredAgents = [];
  const textDecoder = new TextDecoder();

  for (let i = 0; i < 10; i++) {
    console.log(`Analyzing agent image #${i + 1}`);
    const coords = [AGENTS_START[0], AGENTS_START[1] + 52 * i];

    const agentCrop = Deno.run({
      stdout: "null",
      stderr: "null",
      cmd: [
        "convert",
        path,
        "-crop",
        `50x50+${coords[0]}+${coords[1]}`,
        "cropped.png",
      ],
    });

    const cropStatus = await agentCrop.status();
    if (!cropStatus.success) {
      console.log(`Failed to run imagemagick on agent ${i + 1}`);
      return false;
    } else {
      let leastErr = [Number.MAX_SAFE_INTEGER, ""];

      for (const dirEntry of Deno.readDirSync("./agents")) {
        const agent = dirEntry.name.slice(0, -4);
        const compare = Deno.run({
          stdout: "piped",
          stderr: "piped",
          cmd: [
            "magick",
            "compare",
            "-metric",
            "DSSIM",
            "cropped.png",
            `agents/${agent}.png`,
            "tmp.png",
          ],
        });

        try {
          const result = await compare.stderrOutput();
          const resultNum = Number(textDecoder.decode(result).split(" ")[0]);
          if (resultNum < leastErr[0]) {
            leastErr = [resultNum, agent];
          }
        } catch (e) {
          console.error(
            `Failed to compare cropped agent image to agent ${agent}`
          );
          console.error(e);
          return false;
        }
      }

      discoveredAgents[i] = leastErr[1];
    }

    agentCrop.close();
  }

  Deno.writeTextFile("tesseract/agents.txt", discoveredAgents.join("\n"));
  Deno.remove("cropped.png");
  Deno.remove("tmp.png");

  for (const [key, info] of Object.entries(IMAGE_SECTIONS)) {
    const [c0, c1, c2, c3] = info.crop;
    console.log(`Converting section "${key}"`);
    const convert = Deno.run({
      stdout: "null",
      stderr: "null",
      cmd: [
        "convert",
        path,
        "-crop",
        `${c0}x${c1}+${c2}+${c3}`,
        "-resize",
        "500%",
        "-threshold",
        `${info.threshold ?? DEFAULT_THRESHOLD}%`,
        "-negate",
        "-colorspace",
        "gray",
        "-colors",
        "2",
        "+dither",
        "-type",
        "bilevel",
        `img/${key}.tif`,
      ],
    });

    const convert_status = await convert.status();
    if (!convert_status.success) {
      console.log(`Failed to run imagemagick on ${key}`);
      return false;
    }

    convert.close();

    const config = info.charset
      ? ["-c", `tessedit_char_whitelist=${info.charset}`]
      : [];
    const tesseract = Deno.run({
      stdout: "null",
      stderr: "null",
      cmd: [
        "tesseract",
        `img/${key}.tif`,
        `tesseract/${key}`,
        "-l",
        "eng",
        "--psm",
        "6",
        "--dpi",
        "70",
      ].concat(config),
    });

    const tesseract_status = await tesseract.status();
    if (!tesseract_status.success) {
      console.log(`Failed to run tesseract on ${key}`);
      return false;
    }

    tesseract.close();
  }

  return true;
}
