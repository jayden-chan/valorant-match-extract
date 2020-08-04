# Valorant Match Data Extractor

Simple script to extract match metadata from a Valorant screenshot

## Usage
### Dependencies
* Deno
* ImageMagick
* Tesseract OCR

```
git clone https://github.com/jayden-chan/valorant-match-extract
mkdir img tesseract

# Extract the data from the screenshot
deno run --allow-run src/index.ts --gen Screenshot_1.png

# Print the data in your desired format
deno run --allow-read src/index.ts md
deno run --allow-read src/index.ts json
deno run --allow-read src/index.ts toml
```
