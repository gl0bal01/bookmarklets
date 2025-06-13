# 🖼️ Image Batch Downloader Bookmarklet

A powerful, feature-rich bookmarklet that intelligently downloads images from any webpage with advanced filtering, auto-scrolling for lazy-loaded content, and customizable output options.

## ✨ Features

### 🎯 Smart Image Detection
- **Auto-scrolling detection** - Automatically scrolls through the page to find lazy-loaded images
- **Configurable size filtering** - Set any minimum image size (including 0 for all images)
- **Background image detection** - Finds images in CSS backgrounds and inline styles
- **Multiple image formats** - Supports JPG, PNG, GIF, WebP, SVG, and more

### 🎛️ Customizable Options
- **Original filenames** - Keep the actual image names from URLs or use numbered format
- **Smart ZIP naming** - Use webpage title + date or custom naming
- **README generation** - Creates detailed documentation with page info and image list
- **Selective downloading** - Preview and choose which images to download

### 🚀 Advanced Capabilities
- **Lazy loading compatible** - Works with modern websites using Intersection Observer
- **Duplicate handling** - Automatically manages duplicate filenames
- **Error resilience** - Continues working even if some images fail to load
- **Progress tracking** - Real-time progress indicator during page scanning

## 📋 How It Works

1. **Page Scanning**: Auto-scrolls through the entire page to trigger lazy-loaded images
2. **Image Analysis**: Filters images by your specified minimum size
3. **Preview Dialog**: Shows thumbnails of all found images with selection options
4. **Batch Download**: Creates a ZIP file with images, metadata, and optional README

## 🛠️ Installation

1. **Create a new bookmark** in your browser
2. **Copy the code** from [`bookmarklet-image-batch-dl.js`](bookmarklet-image-batch-dl.js)
3. **Paste as URL** - Set the bookmarklet code as the bookmark URL
4. **Click on any webpage** to start downloading images

## 🎮 Usage

1. **Click the bookmarklet** on any webpage
2. **Set minimum size** - Enter desired minimum image dimensions (or 0 for all)
3. **Wait for scanning** - Watch the auto-scroll progress indicator
4. **Configure options**:
   - ✅ Keep original image filenames
   - ✅ Include README file with page info
   - ✅ Use page name in ZIP filename
   - ✅ Select/Deselect all images
5. **Preview & select** - Choose which images to download from thumbnails
6. **Download** - Get your organized ZIP file!

## 📦 Output Structure

```
Website_Name_2025-06-13_images.zip
├── sunset-beach-photo.jpg          # Original filename preserved
├── mountain-landscape.png
├── city-skyline_1920x1080.jpg      # With dimensions if numbered
├── README.md                       # Page info and download details
└── images_metadata.json            # Technical metadata
```

### README.md Content
- Source webpage title and URL
- Download timestamp
- Filter settings used
- Complete list of downloaded images with dimensions
- Technical details about the download process

### Metadata JSON
```json
[
  {
    "originalFilename": "sunset-beach.jpg",
    "url": "https://example.com/images/sunset.jpg",
    "width": 1920,
    "height": 1080,
    "isBackgroundImage": false
  }
]
```

## 🌐 Compatibility

- **Browsers**: Chrome, Firefox, Safari, Edge (all modern browsers)
- **Websites**: Works with any website including:
  - Social media platforms (Instagram, Pinterest, etc.)
  - Image galleries and portfolios
  - E-commerce sites
  - News and blog sites
  - Any site with lazy-loading images

## 🔧 Technical Details

- **Dependencies**: Uses JSZip library (loaded from CDN)
- **Image Detection**: Combines DOM queries, computed styles, and background image parsing
- **Lazy Loading**: Auto-scrolls with 250ms delays for proper image loading
- **Error Handling**: Graceful failure with detailed console logging
- **Memory Efficient**: Processes images in batches to avoid browser limits

## 💡 Pro Tips

- **Use 0 minimum size** to download ALL images including icons and thumbnails
- **Enable "Original filenames"** to keep meaningful image names
- **Include README** for documentation when archiving image collections
- **Works great for research** - automatically documents source URLs and metadata

## Screenshot
![A typical ctf Osint player](/assets/screenshots/bulk-download.jpg)

## 🐛 Troubleshooting

**No images found?**
- Some images might be in iframes or require login
- Try scrolling manually first, then run the bookmarklet
- Check if images are SVG or CSS-only graphics

**Download fails?**
- Some images might be CORS-protected
- Very large images might timeout - the tool will skip them and continue

**Browser blocks download?**
- Enable downloads in your browser settings
- Some browsers limit ZIP file sizes

## 🔄 Changelog

### Latest Version
- ✅ Auto-scrolling for lazy-loaded images
- ✅ Configurable minimum image size (including 0)
- ✅ Original filename preservation
- ✅ README file generation
- ✅ Smart ZIP naming with page titles
- ✅ Select/deselect all functionality
- ✅ Enhanced error handling
- ✅ Progress indicators

---

**⭐ Star this repo if you find it useful!**

*Made for researchers, ctf players and anyone who needs to efficiently collect images from the web.*