const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { encode } = require("blurhash");

// Folder where your .webp files are stored
const IMAGES_DIR = path.join(__dirname, "src/assets/webp");

// Resize to 32x32 for speed
const TARGET_WIDTH = 32;
const TARGET_HEIGHT = 32;

// Helper to process a single image
async function generateBlurHashForImage(imagePath) {
  const image = sharp(imagePath).resize(TARGET_WIDTH, TARGET_HEIGHT, {
    fit: "inside",
  });

  const { data, info } = await image
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const hash = encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4,
    4
  );
  return hash;
}

async function main() {
  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((file) => file.endsWith(".webp"));
  const results = {};

  for (const file of files) {
    const fullPath = path.join(IMAGES_DIR, file);
    const baseName = path.parse(file).name;

    try {
      const hash = await generateBlurHashForImage(fullPath);
      results[baseName] = hash;
      console.log(`✅ ${file} → ${hash}`);
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err.message);
    }
  }

  // Save output to a JSON file
  const outputPath = path.join(__dirname, "src", "blurhashes.json");

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n🎉 Done! Saved blurhashes to: ${outputPath}`);
}

main();
