#!/bin/bash

# Path to impact.js and your game's main .js
IMPACT_LIBRARY=lib/impact/impact.js
GAME=lib/game/main.js

# Output file
OUTPUT_FILE=game.min.js


# Change CWD to Impact's base dir and bake!
#cd ..
php tools/bake.php $IMPACT_LIBRARY $GAME $OUTPUT_FILE
cp game.min.js release/

mkdir -p release/media
cp -R media/* release/media/
cp -R release/* ~/Dropbox/Public/LudumDare/26/

open "https://dl.dropboxusercontent.com/u/917628/LudumDare/26/index.html"
