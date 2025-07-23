const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const INPUT_DIR = path.join(__dirname, "src/assets/Image"); // PNGs
const JPG_OUTPUT_DIR = path.join(__dirname, "src/assets"); // JPGs
const WEBP_OUTPUT_DIR = path.join(__dirname, "src/assets/webP"); // WebPs

// Ensure webP output folder exists
if (!fs.existsSync(WEBP_OUTPUT_DIR)) {
  fs.mkdirSync(WEBP_OUTPUT_DIR, { recursive: true });
}

// Read all files in input directory
fs.readdirSync(INPUT_DIR)
  .filter((file) => /\.png$/i.test(file)) // Only .png files
  .forEach((file) => {
    const inputPath = path.join(INPUT_DIR, file);
    const baseName = path.parse(file).name;

    // Convert to JPG
    sharp(inputPath)
      .jpeg({ quality: 80 })
      .toFile(path.join(JPG_OUTPUT_DIR, `${baseName}.jpg`))
      .then(() => console.log(`✅ Converted ${file} → ${baseName}.jpg`))
      .catch((err) =>
        console.error(`❌ Error converting ${file} to JPG:`, err)
      );

    // Convert to WebP
    sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(path.join(WEBP_OUTPUT_DIR, `${baseName}.webp`))
      .then(() => console.log(`✅ Converted ${file} → ${baseName}.webp`))
      .catch((err) =>
        console.error(`❌ Error converting ${file} to WebP:`, err)
      );
  });
