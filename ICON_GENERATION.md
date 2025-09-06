# Icon Generation Guide

## Missing Icons
The following icons are referenced but missing from the project:

### Required Icons for PWA
- `/public/icons/icon-144x144.png` (most critical - referenced in manifest)
- `/public/icons/icon-192x192.png` (for apple-touch-icon)
- `/public/icons/icon-512x512.png` (for PWA)

### Quick Fix Applied
- Updated manifest.json to only reference existing icons
- Updated layout.tsx to use existing favicon.svg for apple-touch-icon
- Removed font preload that was causing warnings

### To Generate Missing Icons
1. Use your existing favicon.svg as the source
2. Generate PNG versions at required sizes:
   ```bash
   # Using ImageMagick (if available)
   convert favicon.svg -resize 144x144 public/icons/icon-144x144.png
   convert favicon.svg -resize 192x192 public/icons/icon-192x192.png
   convert favicon.svg -resize 512x512 public/icons/icon-512x512.png
   ```

3. Or use online tools like:
   - https://realfavicongenerator.net/
   - https://favicon.io/favicon-converter/

### Current Status
✅ Fixed `useSimpleInputs` error in RideSearchForm
✅ Fixed deprecated meta tag
✅ Removed problematic font preload
✅ Updated manifest to use existing icons only
⚠️  Some icons still missing but won't cause errors