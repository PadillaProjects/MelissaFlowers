# Adding New Images to the Gallery

This guide walks you through the complete process of adding new flower arrangement images to the Melissa's Flowers website.

## Prerequisites

- Node.js and npm/yarn installed
- Image files (preferably JPG or PNG format)
- Access to the project directory

## Quick Start (Automated)

### 1. Add Your Image Files

Place your new image files in the `src/assets/` directory.

**Naming Convention:**
- Use PascalCase (e.g., `RosasRojas.jpg`, `ArregloNuevo.jpg`)
- Avoid spaces and special characters
- Use descriptive names

**Example:**
```bash
cp ~/Downloads/my-new-arrangement.jpg src/assets/ArregloEspecial.jpg
```

### 2. Run the Automated Processing Script

This single command handles everything:

```bash
npm run process:images
```

This will automatically:
- ✅ Optimize images (resize to 1600px max, compress with quality 80)
- ✅ Generate WebP versions for faster loading
- ✅ Create blurhash placeholders for smooth transitions

### 3. Update the Gallery Data

Open `src/pages/HomePage.js` and add your new item to the `items` array:

```javascript
{
  id: 21, // Use next available ID
  name: "Arreglo Especial",
  images: [
    getImageSources("ArregloEspecial"),
    // Add more images if you have multiple angles
    // getImageSources("ArregloEspecial2"),
  ],
  blurhashes: [
    blurhashes["ArregloEspecial"],
    // Add corresponding blurhashes for additional images
    // blurhashes["ArregloEspecial2"],
  ],
  description: "Arreglo Especial",
},
```

**Important Notes:**
- The image name in `getImageSources()` must match your filename (without extension)
- The blurhash key must match exactly
- If you have multiple images of the same item, add them all to the arrays

### 4. Test Locally

Your dev server should auto-reload. Check:
- ✓ Image appears in the gallery
- ✓ Blurhash placeholder shows while loading
- ✓ Image loads correctly when scrolled into view
- ✓ Clicking opens the modal with full-size image

### 5. Deploy

When everything looks good, deploy to production:

```bash
npm run update
```

This will:
1. Build the production version
2. Commit changes to git
3. Deploy to GitHub Pages

---

## Manual Process (Advanced)

If you prefer to run each step individually:

### 1. Optimize Images
```bash
node optimizeImages.js
```

### 2. Convert to WebP
```bash
npm run convert:webp
```

### 3. Generate Blurhashes
```bash
node generate-blurhashes.js
```

---

## Quick Reference

```bash
# Automated workflow (recommended):
npm run process:images        # Process all images automatically
# Edit HomePage.js to add gallery items
npm run update                # Deploy to production

# Manual workflow:
node optimizeImages.js        # Step 1: Optimize
npm run convert:webp          # Step 2: WebP conversion
node generate-blurhashes.js   # Step 3: Blurhashes
# Edit HomePage.js to add gallery items
npm run update                # Deploy
```

## Troubleshooting

**Image not showing up?**
- Check that the filename matches exactly in `getImageSources()`
- Verify the image exists in both `src/assets/` and `src/assets/webp/`
- Check browser console for errors

**Blurhash not working?**
- Ensure you ran the processing script after adding images
- Check that the key in `blurhashes.json` matches your filename
- Verify the blurhash string is not empty

**Image quality issues?**
- Original images should be high quality (at least 1200px wide)
- The optimization uses quality 80, which is a good balance
- For critical images, you can adjust quality in `processImages.js`

**Script errors?**
- Make sure all dependencies are installed: `npm install`
- Check that image files are valid JPG/PNG formats
- Ensure you have write permissions in the project directory

## File Structure

```
src/
├── assets/
│   ├── YourImage.jpg          # Optimized original
│   └── webp/
│       └── YourImage.webp     # WebP version
├── blurhashes.json            # Generated blurhash codes
└── pages/
    └── HomePage.js            # Gallery data configuration
```

## What the Processing Script Does

The `processImages.js` script runs three operations in sequence:

1. **Image Optimization**
   - Resizes images larger than 1600px to 1600px width
   - Compresses JPEGs with mozjpeg (quality 80)
   - Compresses PNGs (compression level 8)
   - Maintains aspect ratio

2. **WebP Conversion**
   - Creates modern WebP versions of all images
   - Uses quality 80 for optimal size/quality balance
   - Saves to `src/assets/webp/` directory

3. **Blurhash Generation**
   - Creates blur placeholder hashes for each image
   - Saves to `src/blurhashes.json`
   - Used for smooth loading transitions
