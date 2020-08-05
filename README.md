# Valorant Match Data Extractor

Simple script to extract match metadata from a Valorant screenshot

## Usage
### Dependencies
* Deno
* ImageMagick
* Tesseract OCR

```bash
git clone https://github.com/jayden-chan/valorant-match-extract
cd valorant-match-extract
mkdir img tesseract

# Extract the data from the screenshot
deno run --allow-run --allow-write --allow-read src/index.ts --gen Screenshot.png

# Print the data in your desired format
deno run --allow-read src/index.ts md
deno run --allow-read src/index.ts json
deno run --allow-read src/index.ts toml
```
