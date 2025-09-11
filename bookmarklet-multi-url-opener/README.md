# 🚀 Multi-URL Opener

Instantly open multiple URLs from pasted text with intelligent detection and protocol correction. Perfect for OSINT investigations, research workflows, and productivity automation.

## Screenshot
![Multi-URL Opener Interface](/assets/screenshots/multi-url-opener.png)

## ✨ Features

### 🧠 Smart URL Detection
- **Universal Format Support**: Automatically detects URLs separated by newlines, commas, semicolons, pipes, tabs, or multiple spaces
- **Protocol Auto-Correction**: Adds `https://` to URLs missing protocols for seamless opening
- **Duplicate Filtering**: Automatically removes duplicate URLs for clean processing
- **Format Flexibility**: Handles mixed separator formats in a single paste operation

### 🎯 OSINT & Research Optimized
- **Batch Investigation**: Open multiple target domains, profiles, or resources simultaneously
- **Live URL Counter**: Real-time display of detected valid URLs for immediate feedback
- **Preview Display**: Shows first few URLs with count for verification before opening
- **Professional Interface**: Clean, distraction-free design optimized for research workflows

### 🛡️ Browser-Friendly Operation
- **Popup Blocker Circumvention**: Controlled timing (250ms delays) prevents browser blocking
- **Performance Awareness**: Warns before opening 50+ URLs to prevent browser strain
- **CSP Compatible**: Works on strict websites (banking, government, security-focused sites)
- **Cross-Browser Support**: Compatible with Chrome, Firefox, Safari, and Edge

## 🚀 Installation

### Method 1: Manual Bookmark Creation
1. Copy the minified bookmarklet code from the bottom of [multi-url-opener.js](multi-url-opener.js)
2. Create a new bookmark in your browser
3. Paste the code as the bookmark URL
4. Name it "Multi-URL Opener" and save

### Method 2: Drag & Drop Installation
1. Visit the [installation page](../../install.html)
2. Drag the "Multi-URL Opener" button to your bookmarks bar
3. Ready to use!

## 📖 Usage

1. **Navigate** to any webpage (the bookmarklet works anywhere)
2. **Click** the Multi-URL Opener bookmark
3. **Paste** your URLs into the textarea (any format supported)
4. **Watch** the live counter update as URLs are detected
5. **Click** "Open All URLs" to launch them with controlled timing
6. **Monitor** the progress as URLs open in new tabs

### Supported Input Formats
```
# Newline-separated
example.com
https://google.com
www.github.com

# Comma-separated
site1.com, site2.com, site3.com

# Space-separated
domain1.org domain2.org domain3.org

# Mixed formats (all in one paste)
example.com, https://google.com
stackoverflow.com github.com
www.reddit.com
```

## 🛠️ Use Cases

### 🔍 OSINT Investigations
- Open multiple target domains for reconnaissance
- Batch investigate social media profiles across platforms
- Verify multiple URLs for threat intelligence gathering
- Launch competitor analysis across multiple websites
- Investigate related domains from certificate transparency logs

### 📚 Research & Academia
- Open multiple academic papers or articles simultaneously
- Launch research resources from bibliography lists
- Investigate multiple news sources for fact-checking
- Access multiple data sources for comparative analysis
- Open related research links from reference lists

### 💼 Professional Workflows
- Validate multiple client websites for accessibility
- Open competitor websites for market analysis
- Launch multiple testing environments simultaneously
- Access various documentation sources for development
- Open multiple monitoring dashboards at once

### 🔗 General Productivity
- Bulk open bookmarked research materials
- Launch multiple learning resources for study sessions
- Open related articles from reading lists
- Access multiple tools or platforms for workflow setup
- Organize and launch project-related resources

## 🔧 Technical Details

### Compatibility
- **Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Websites**: All websites (CSP compatible, works on restricted sites)
- **Operating Systems**: Windows, macOS, Linux (browser-dependent)

### What Gets Processed
- **Valid URLs**: Domain names with proper TLD structure
- **Protocol Addition**: Automatically prepends `https://` to protocol-less URLs
- **Cleaned Input**: Removes surrounding quotes, brackets, and whitespace
- **Deduplication**: Filters identical URLs automatically

### Performance Characteristics
- **Memory Efficient**: Processes large URL lists without memory leaks
- **Controlled Timing**: 250ms delays between URL openings prevent browser blocking
- **Resource Cleanup**: Automatically cleans up global variables and event listeners
- **Error Handling**: Gracefully handles malformed URLs and network issues

### Security Features
- **No External Calls**: All processing happens locally in the browser
- **Safe DOM Manipulation**: Uses secure methods compatible with strict CSP
- **Input Sanitization**: Validates and cleans all URL inputs before processing
- **Popup Management**: Secure popup creation with proper window references

## 🛡️ Privacy & Security

- **Local Processing**: All URL detection and processing happens entirely in your browser
- **No Data Transmission**: No URLs or data are sent to external servers
- **Open Source**: Fully transparent code with comprehensive documentation
- **CSP Compliant**: Works on security-conscious websites with strict policies
- **Memory Safe**: Proper cleanup prevents data persistence after use

## 🎛️ Advanced Features

### Keyboard Shortcuts
- **Ctrl+Enter**: Open all URLs (when URLs are detected)
- **Escape**: Close the interface
- **Tab Navigation**: Full keyboard accessibility

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](../../CONTRIBUTING.md) for details on:
- Code standards and style requirements
- Testing procedures for new features
- Documentation requirements
- Bug report and feature request processes

## 🆘 Troubleshooting

### Common Issues

**Popup Blocked**
- Enable popups for the current website
- Check browser popup settings
- Try using the bookmarklet on a different site first

**URLs Not Opening**
- Verify URL format (domain.tld structure required)
- Check for typos in pasted URLs
- Ensure URLs contain valid domain names

**Performance Issues with Many URLs**
- Browser may slow down with 100+ URLs
- Consider opening in smaller batches
- Close other tabs to free up memory

**Interface Not Appearing**
- Check if popup windows are enabled
- Verify JavaScript is enabled in browser
- Try refreshing the page and clicking again

**URLs Opening Too Fast**
- Built-in 250ms delay should prevent this
- If issues persist, try opening fewer URLs at once
- Check browser's popup handling settings

### Browser-Specific Notes

**Chrome**: Excellent compatibility, may warn about multiple popups
**Firefox**: Works perfectly, respects popup preferences
**Safari**: Full compatibility, may require popup permission
**Edge**: Complete support, inherits Chrome's popup behavior

## 📄 License

MIT License - see [LICENSE](../../LICENSE) file for details.

---

**Made with ❤️ for OSINT researchers, investigators, and productivity enthusiasts**

*Perfect for security research, academic investigations, and professional workflows requiring efficient multi-URL handling.*