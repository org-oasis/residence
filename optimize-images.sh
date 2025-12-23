#!/bin/bash

TARGET_DIR="./public/assets"
MAX_WIDTH=1000
QUALITY=60  # 0-100 (60 is a good balance for AVIF)

if ! command -v mogrify &> /dev/null; then
    echo "ImageMagick is not installed."
    echo "Please install it first (e.g., 'sudo apt-get install imagemagick')."
    exit 1
fi

echo "Scanning '$TARGET_DIR' for AVIF images..."

# Find and Optimize
# 'find' locates all .avif files recursively
# 'mogrify' processes them in place (overwrite)
# -resize '1000>' : Only resize if width is larger than 1000px
# -quality 60     : Compress to 60% quality

find "$TARGET_DIR" -type f -name "*.avif" -exec mogrify -monitor -resize "${MAX_WIDTH}>" -quality "$QUALITY" {} +

echo "--------------------------------------------------"
echo "✅ Optimization Complete!"
