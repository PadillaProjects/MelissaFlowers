const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const inputDir = path.join(__dirname, "src/assets"); // Change this to match your assets folder
const outputDir = path.join(__dirname, "src/assets/webp");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error("Error reading input directory:", err);
    return;
  }

  files.forEach((file) => {
    const inputFilePath = path.join(inputDir, file);
    const outputFilePath = path.join(
      outputDir,
      file.replace(/\.(png|jpg|jpeg)$/, ".webp")
    );

    // Only process image files
    if (/\.(png|jpg|jpeg)$/.test(file)) {
      sharp(inputFilePath)
        .webp({ quality: 80 }) // Adjust quality if needed
        .toFile(outputFilePath)
        .then(() =>
          console.log(`Converted: ${file} -> ${path.basename(outputFilePath)}`)
        )
        .catch((err) => console.error(`Error converting ${file}:`, err));
    }
  });
});
