# 🔗 Advanced URL Extractor Bookmarklet

A powerful JavaScript bookmarklet that extracts all URLs from any webpage and generates comprehensive reports in both TXT and interactive HTML formats. Perfect for ctf players, web investigations, SEO analysis, link auditing, and security research.

## Screenshot
![A typical ctf Osint player](/assets/screenshots/url-extraction-report.jpg)

## ✨ Features

### 📊 Comprehensive Extraction
- **All URLs**: Extracts both links (`href`) and resources (`src`) from any webpage
- **Smart Deduplication**: Automatically removes duplicate URLs
- **Title Extraction**: Captures link titles, alt text, and anchor text for context
- **Type Classification**: Distinguishes between clickable links and resources (images, scripts, stylesheets)

### 📋 Professional Reports
- **Dual Format Output**: Creates both TXT and HTML files
- **Detailed Headers**: Includes page title, site name, extraction date/time, and URL counts
- **Organized Layout**: Links appear first, followed by resources at the bottom
- **Date-Stamped Filenames**: Files named as `sitename_urls_YYYY-MM-DD.txt/html`

### 🎯 Interactive HTML Features
- **Clickable Links**: All URLs are directly clickable and open in new tabs
- **Live Search**: Real-time filtering as you type
- **Visual Organization**: Color-coded sections with clear headers
- **Anchor Navigation**: Click statistics to jump to Links or Resources sections
- **Base64 Image Preview**: Automatically displays embedded images inline
- **Base64 Decoding**: Shows decoded content for scripts, stylesheets, and data URLs
- **Advanced SVG Support**: Robust handling of complex SVG elements and animations
- **Smart Title Extraction**: Multiple fallback methods for meaningful link descriptions
- **Responsive Design**: Works on desktop and mobile devices
- **Statistics Dashboard**: Quick overview with clickable navigation

## 🚀 Installation

### Method 1: Manual Bookmark Creation
1. Copy the bookmarklet minified code from the [bookmarklet-url-extractor.js](bookmarklet-url-extractor.js) file
2. Create a new bookmark in your browser
3. Set the bookmark name to "Extract URLs" (or any name you prefer)
4. Paste the entire JavaScript code as the bookmark URL
5. Save the bookmark

### Method 2: Drag & Drop (Chrome/Firefox)
1. Open this README in your browser
2. Drag this link to your bookmarks bar: **[Extract URLs](#)** *(Note: GitHub doesn't allow JavaScript links, use Method 1)*

## 📖 Usage

1. **Navigate** to any webpage you want to analyze
2. **Click** the "Extract URLs" bookmark in your browser
3. **Wait** for the extraction to complete (usually instant)
4. **Download** - Two files will be automatically downloaded:
   - `sitename_urls_YYYY-MM-DD.txt` - Plain text report
   - `sitename_urls_YYYY-MM-DD.html` - Interactive HTML report

## 📁 Output Examples

### TXT Report Format
```
================================================================================
                           URL EXTRACTION REPORT
================================================================================

Page Title: Example Website - Home
Site: example.com
URL: https://example.com/
Extraction Date: 2025-06-13 at 14:30
Total URLs Found: 45
Links: 28
Resources: 17

================================================================================
                              EXTRACTED URLS
================================================================================

[Link] About Us
https://example.com/about

[Link] Contact
https://example.com/contact

[Resource] Tracking Pixel (Base64 Image)
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==

Image Preview: [Shows 1x1 transparent pixel]

[Resource] Matomo Analytics Script (Base64)
data:text/javascript;base64,CiAgdmFyIF9wYXEgPSB3aW5kb3cuX3BhcSA9IHdpbmRvdy5fcGFxIHx8IFtdOwo=

Decoded content:
var _paq = window._paq = window._paq || [];
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);...
```

### HTML Report Features
- 🎨 **Professional styling** with color-coded sections
- 🔍 **Search functionality** to filter URLs instantly
- 📊 **Statistics dashboard** showing totals and breakdowns
- 🖱️ **Clickable links** that open in new tabs
- ⚓ **Anchor navigation** - click stats to jump to sections
- 🖼️ **Image previews** for base64 encoded images (PNG, JPEG, GIF, etc.)
- 🔓 **Base64 decoding** for data URLs (scripts, images, etc.)
- 🎯 **Advanced SVG handling** - no more `[object SVGAnimatedString]` errors
- 📝 **Smart titles** - extracts meaningful descriptions from multiple sources
- 📱 **Responsive design** for all screen sizes

## 🛠️ Use Cases

### 🔍 Web Investigation
- Security research and penetration testing
- Website structure analysis
- Hidden endpoint discovery
- Asset enumeration

### 📈 SEO & Marketing
- Link auditing and analysis
- Competitor research
- Site structure mapping
- Resource optimization

### 🔧 Development
- Debugging broken links
- Asset inventory
- Migration planning
- Quality assurance testing

## 🔧 Technical Details

### Compatibility
- **Browsers**: Chrome, Firefox, Safari, Edge (all modern browsers)
- **Websites**: Works on any webpage (respects same-origin policy)
- **Mobile**: Fully compatible with mobile browsers

### What Gets Extracted
- **Links**: All `<a href="">` elements (including complex SVG links)
- **Images**: `<img src="">`, `<picture>`, `<source>`, base64 encoded images
- **Scripts**: `<script src="">`, inline base64 scripts
- **Stylesheets**: `<link rel="stylesheet">`, inline base64 CSS
- **Media**: `<video>`, `<audio>`, `<embed>`, `<object>`
- **Iframes**: `<iframe src="">`
- **Data URLs**: Base64 encoded content with automatic decoding and image preview
- **SVG Elements**: Robust handling of `SVGAnimatedString` objects and complex SVG structures
- **And more**: Any element with `src` or `href` attributes

### Data Processing
- Automatic deduplication using JavaScript `Set`
- Multi-source title extraction (textContent, aria-label, title, alt attributes)
- Advanced SVG compatibility (handles `animVal`, `baseVal`, and complex objects)
- Base64 decoding for data URLs with automatic image preview
- Smart filtering (removes empty, null, and invalid URLs)
- Alphabetical sorting within categories
- Safe HTML encoding for special characters
- Intelligent anchor navigation with section jumping

## 🛡️ Privacy & Security

- **Local Processing**: All extraction happens in your browser
- **No Data Transmission**: Nothing is sent to external servers
- **No Storage**: No data is stored or cached
- **Open Source**: Fully transparent code you can inspect

## 🤝 Contributing

Contributions are welcome! Please feel free to:
- Report bugs or issues
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Bookmarklet doesn't work**
- Ensure you copied the complete JavaScript code
- Check that the bookmark URL starts with `javascript:`
- Try refreshing the page and clicking again

**No files downloaded**
- Check your browser's download settings
- Ensure pop-ups are allowed for the site
- Try on a different webpage

**SVG and complex elements**
- Showing `[object SVGAnimatedString]` - **Fixed in latest version with robust handling**
- Modern websites with complex SVG navigation elements
- Enhanced title extraction from multiple attribute sources
- Proper handling of animated and dynamic SVG properties

**Base64 data URLs and images**
- Automatically decoded and displayed in HTML reports
- Image previews shown inline for visual inspection
- Common in modern websites for embedded scripts, stylesheets, and tracking pixels
- Look for "Image Preview" and "Decoded content" sections in HTML output

### Browser-Specific Notes

**Chrome**: May show security warnings for JavaScript bookmarks - click "Allow"

**Firefox**: Works seamlessly with all features

**Safari**: May require enabling "Allow JavaScript from Bookmarks" in settings

---

**⭐ Star this repository if you find it useful!**

**Made with ❤️ for ctf players, web investigators and developers**

