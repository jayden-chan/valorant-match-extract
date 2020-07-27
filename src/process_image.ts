const DEFAULT_THRESHOLD = 80;
const IMAGE_SECTIONS: {
  [key: string]: { crop: string; threshold?: number };
} = {
  player_names: {
    crop: "380x520+335+350",
  },
  scores: {
    crop: "100x520+683+350",
  },
  K: {
    crop: "64x520+823+350",
  },
  D: {
    crop: "64x520+871+350",
  },
  A: {
    crop: "64x520+920+350",
  },
  econ: {
    crop: "95x520+1000+350",
  },
  first_bloods: {
    crop: "64x520+1170+350",
  },
  plants: {
    crop: "64x520+1323+350",
  },
  defuses: {
    crop: "64x520+1475+350",
  },
  meta: {
    crop: "181x101+1631+164",
    threshold: 45,
  },
  home: {
    crop: "140x76+648+91",
    threshold: 45,
  },
  away: {
    crop: "140x76+1050+88",
    threshold: 45,
  },
};

export async function processImage(path: string): Promise<boolean> {
  for (const [key, info] of Object.entries(IMAGE_SECTIONS)) {
    console.log(`Converting section "${key}"`);
    const convert = Deno.run({
      stdout: "null",
      stderr: "null",
      cmd: [
        "convert",
        path,
        "-crop",
        info.crop,
        "-resize",
        "300%",
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
      ],
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
