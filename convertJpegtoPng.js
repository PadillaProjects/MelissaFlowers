// convertJpegToPng.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const INPUT_DIR = path.join(__dirname, "src/assets/Image"); // Source JPEGs
const OUTPUT_DIR = path.join(__dirname, "src/assets"); // Target PNGs go here

fs.readdirSync(INPUT_DIR)
  .filter((file) => /\.(jpe?g)$/i.test(file)) // Only JPG/JPEG files
  .forEach((file) => {
    const inputPath = path.join(INPUT_DIR, file);
    const outputFileName = path.parse(file).name + ".png";
    const outputPath = path.join(OUTPUT_DIR, outputFileName);

    sharp(inputPath)
      .png()
      .toFile(outputPath)
      .then(() => {
        console.log(`✅ Converted: ${file} → ${outputFileName}`);
        // Optional: delete original JPEG
        // fs.unlinkSync(inputPath);
      })
      .catch((err) => console.error(`❌ Error converting ${file}:`, err));
  });
