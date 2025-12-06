const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const inputDir = path.join(__dirname, "src/assets");
const MAX_WIDTH = 1600;
const QUALITY = 80;

fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error("Error reading input directory:", err);
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(inputDir, file);

    // Only process image files in the root assets dir (excluding subdirs for now if any, though verify shows only 'webp' and 'Image' folders which we might skip or handle if needed. Based on plan, we target root assets first where large jpgs are)
    if (/\.(png|jpg|jpeg)$/i.test(file)) {
      
      const image = sharp(filePath);
      
      image.metadata().then(metadata => {
        if (metadata.width > MAX_WIDTH) {
          console.log(`Processing ${file}: ${metadata.width}px -> ${MAX_WIDTH}px`);
          
          // Resize and compress
          // Create a temporary buffer then write back to avoid race conditions with reading/writing same file
          image
            .resize({ width: MAX_WIDTH })
            .jpeg({ quality: QUALITY, mozjpeg: true }) // optimized jpeg
            .png({ quality: QUALITY, compressionLevel: 8 }) // optimized png
            .toBuffer()
            .then(buffer => {
              fs.writeFile(filePath, buffer, err => {
                if(err) console.error(`Error saving ${file}:`, err);
                else console.log(`✓ Optimized ${file}`);
              });
            })
            .catch(err => console.error(`Error processing ${file}:`, err));

        } else {
             // Even if width is smaller, we might want to compress? 
             // For now, let's just compress if it's large, but logic says "Resize: If width > 1600px". 
             // Plan said "Resize & Compress", implying we do both.
             // Let's safe-guard: if it's already small, just compress it to ensure optimization.
             console.log(`Optimizing ${file}: ${metadata.width}px (width ok, compressing)`);
             image
                .jpeg({ quality: QUALITY, mozjpeg: true })
                .png({ quality: QUALITY, compressionLevel: 8 }) 
                .toBuffer()
                .then(buffer => {
                  fs.writeFile(filePath, buffer, err => {
                    if(err) console.error(`Error saving ${file}:`, err);
                    else console.log(`✓ Optimized ${file}`);
                  });
                })
                .catch(err => console.error(`Error processing ${file}:`, err));
        }
      });
    }
  });
});
