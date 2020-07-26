#!/bin/zsh

set -e

if [ -z "$1" ]; then
    echo "No image supplied"
    exit 1
fi

echo "Processing images... (this may take a minute)"
convert $1 \
    -crop 380x520+335+350 \
    -resize 200% \
    -threshold 80% \
    -negate \
    -colorspace gray \
    -colors 2 +dither \
    -type bilevel \
    img/player_names.tif

convert $1 \
    -crop 100x520+683+350 \
    -resize 200% \
    -threshold 80% \
    -negate \
    -colorspace gray \
    -colors 2 +dither \
    -type bilevel \
    img/scores.tif

convert $1 \
    -crop 64x520+823+350 \
    -resize 200% \
    -threshold 80% \
    -negate \
    -colorspace gray \
    -colors 2 +dither \
    -type bilevel \
    img/K.tif

convert $1 \
    -crop 64x520+871+350 \
    -resize 200% \
    -threshold 80% \
    -negate \
    -colorspace gray \
    -colors 2 +dither \
    -type bilevel \
    img/D.tif

convert $1 \
    -crop 64x520+920+350 \
    -resize 200% \
    -threshold 80% \
    -negate \
    -colorspace gray \
    -colors 2 +dither \
    -type bilevel \
    img/A.tif

convert $1 \
    -crop 95x520+1000+350 \
    -resize 200% \
    -threshold 80% \
    -negate \
    -colorspace gray \
    -colors 2 +dither \
    -type bilevel \
    img/econ.tif

convert $1 \
    -crop 64x520+1170+350 \
    -resize 200% \
    -threshold 80% \
    -negate \
    -colorspace gray \
    -colors 2 +dither \
    -type bilevel \
    img/first_bloods.tif

convert $1 \
    -crop 64x520+1323+350 \
    -resize 200% \
    -threshold 80% \
    -negate \
    -colorspace gray \
    -colors 2 +dither \
    -type bilevel \
    img/plants.tif

convert $1 \
    -crop 64x520+1475+350 \
    -resize 200% \
    -threshold 80% \
    -negate \
    -colorspace gray \
    -colors 2 +dither \
    -type bilevel \
    img/defuses.tif

convert $1 \
    -crop 181x101+1631+164 \
    -resize 300% \
    -threshold 45% \
    -negate \
    -colorspace gray \
    -colors 2 +dither \
    -type bilevel \
    img/meta.tif

convert $1 \
    -crop 140x76+648+91 \
    -resize 300% \
    -threshold 45% \
    -negate \
    -colorspace gray \
    -colors 2 +dither \
    -type bilevel \
    img/home_score.tif

convert $1 \
    -crop 140x76+1050+88 \
    -resize 300% \
    -threshold 45% \
    -negate \
    -colorspace gray \
    -colors 2 +dither \
    -type bilevel \
    img/away_score.tif

echo "Extracting text..."
tesseract img/player_names.tif player_names -l eng --psm 4 --dpi 70 2>/dev/null
tesseract img/scores.tif       scores       -l eng --psm 6 --dpi 70 2>/dev/null
tesseract img/K.tif            K            -l eng --psm 6 --dpi 70 2>/dev/null
tesseract img/D.tif            D            -l eng --psm 6 --dpi 70 2>/dev/null
tesseract img/A.tif            A            -l eng --psm 6 --dpi 70 2>/dev/null
tesseract img/econ.tif         econ         -l eng --psm 6 --dpi 70 2>/dev/null
tesseract img/first_bloods.tif first_bloods -l eng --psm 6 --dpi 70 2>/dev/null
tesseract img/plants.tif       plants       -l eng --psm 6 --dpi 70 2>/dev/null
tesseract img/defuses.tif      defuses      -l eng --psm 6 --dpi 70 2>/dev/null
tesseract img/meta.tif         meta         -l eng --psm 6 --dpi 70 2>/dev/null
tesseract img/home_score.tif   home_score   -l eng --psm 6 --dpi 70 2>/dev/null
tesseract img/away_score.tif   away_score   -l eng --psm 6 --dpi 70 2>/dev/null

echo "Processing extracted text..."
echo
node process_text.js
