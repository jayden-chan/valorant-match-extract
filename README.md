# Valorant Match Data Extractor

Simple script to extract match metadata from a Valorant screenshot

## Usage
### Dependencies
* Deno
* ImageMagick
* Tesseract OCR

### Initial Setup

```bash
git clone https://github.com/jayden-chan/valorant-match-extract
cd valorant-match-extract
mkdir img tesseract
```

### Extract data from a screenshot
```bash
deno run \
    --allow-run \
    --allow-write="tesseract,." \
    --allow-read="agents" \
    src/index.ts --gen Screenshot.png
```

### Print the data in your desired format
```bash
deno run --allow-read="tesseract" src/index.ts md
deno run --allow-read="tesseract" src/index.ts json
deno run --allow-read="tesseract" src/index.ts toml
```

#### Deno Permissions
* `--allow-run`: Running the ImageMagick and Tesseract subprocesses
* `--allow-read`: Reading the `agents` images and the extracted Tesseract data
* `--allow-write`: Writing the agents list to a text file, writing intermediate cropped
    images
