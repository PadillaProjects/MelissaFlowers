#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { encode } = require("blurhash");

// Configuration
const ASSETS_DIR = path.join(__dirname, "src/assets");
const WEBP_DIR = path.join(ASSETS_DIR, "webp");
const BLURHASH_OUTPUT = path.join(__dirname, "src/blurhashes.json");
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 80;
const WEBP_QUALITY = 80;

console.log("🚀 Starting image processing pipeline...\n");

// Step 1: Optimize images
async function optimizeImages() {
  console.log("📸 Step 1: Optimizing images...");
  
  const files = fs.readdirSync(ASSETS_DIR)
    .filter(file => /\.(png|jpg|jpeg)$/i.test(file));

  for (const file of files) {
    const filePath = path.join(ASSETS_DIR, file);
    const image = sharp(filePath);
    
    try {
      const metadata = await image.metadata();
      
      if (metadata.width > MAX_WIDTH) {
        console.log(`  ↓ Resizing ${file}: ${metadata.width}px → ${MAX_WIDTH}px`);
        await image
          .resize({ width: MAX_WIDTH })
          .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
          .png({ quality: JPEG_QUALITY, compressionLevel: 8 })
          .toFile(filePath + '.tmp');
        
        fs.renameSync(filePath + '.tmp', filePath);
      } else {
        console.log(`  ✓ Compressing ${file}: ${metadata.width}px`);
        await image
          .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
          .png({ quality: JPEG_QUALITY, compressionLevel: 8 })
          .toFile(filePath + '.tmp');
        
        fs.renameSync(filePath + '.tmp', filePath);
      }
    } catch (err) {
      console.error(`  ✗ Error processing ${file}:`, err.message);
    }
  }
  
  console.log("✅ Image optimization complete!\n");
}

// Step 2: Convert to WebP
async function convertToWebP() {
  console.log("🎨 Step 2: Converting to WebP...");
  
  if (!fs.existsSync(WEBP_DIR)) {
    fs.mkdirSync(WEBP_DIR, { recursive: true });
  }

  const files = fs.readdirSync(ASSETS_DIR)
    .filter(file => /\.(png|jpg|jpeg)$/i.test(file));

  for (const file of files) {
    const inputPath = path.join(ASSETS_DIR, file);
    const outputPath = path.join(WEBP_DIR, file.replace(/\.(png|jpg|jpeg)$/i, ".webp"));

    try {
      await sharp(inputPath)
        .webp({ quality: WEBP_QUALITY })
        .toFile(outputPath);
      
      console.log(`  ✓ ${file} → ${path.basename(outputPath)}`);
    } catch (err) {
      console.error(`  ✗ Error converting ${file}:`, err.message);
    }
  }
  
  console.log("✅ WebP conversion complete!\n");
}

// Step 3: Generate blurhashes
async function generateBlurhashes() {
  console.log("🌈 Step 3: Generating blurhashes...");
  
  const files = fs.readdirSync(WEBP_DIR)
    .filter(file => file.endsWith(".webp"));
  
  const results = {};

  for (const file of files) {
    const fullPath = path.join(WEBP_DIR, file);
    const baseName = path.parse(file).name;

    try {
      const image = sharp(fullPath).resize(32, 32, { fit: "inside" });
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
      
      results[baseName] = hash;
      console.log(`  ✓ ${file} → ${hash.substring(0, 20)}...`);
    } catch (err) {
      console.error(`  ✗ Error processing ${file}:`, err.message);
    }
  }

  fs.writeFileSync(BLURHASH_OUTPUT, JSON.stringify(results, null, 2));
  console.log(`✅ Blurhashes saved to: ${BLURHASH_OUTPUT}\n`);
}

// Main execution
async function main() {
  try {
    await optimizeImages();
    await convertToWebP();
    await generateBlurhashes();
    
    console.log("🎉 All done! Your images are ready to use.");
    console.log("\n📝 Next steps:");
    console.log("   1. Add your new items to src/pages/HomePage.js");
    console.log("   2. Test locally to verify everything looks good");
    console.log("   3. Run 'npm run update' to deploy\n");
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

main();
