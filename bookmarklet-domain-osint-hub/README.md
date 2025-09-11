# 🔍 Domain OSINT Hub Bookmarklet

Professional domain reconnaissance toolkit with selective service launching and intelligent popup handling.
It also includes a powerful report generation system that transforms your investigation workflow into professional documentation.

## Screenshot
![Domain OSINT Hub Interface](/assets/screenshots/domain-osint-hub.jpg)

## ✨ Features

### 🎯 Selective Service Management
- **Checkbox Controls**: Select only the OSINT services you need for targeted analysis
- **Smart Defaults**: All services unchecked by default to prevent overwhelming tab opening
- **Bulk Selection**: "Check All" and "Uncheck All" buttons for quick management
- **Service Counter**: Real-time display of selected services count

### 🚀 Intelligent Popup Handling
- **Batch Processing**: Opens services in batches of 5 to bypass popup blockers
- **Progressive Loading**: 1-second delays between batches for optimal browser performance
- **Status Feedback**: Real-time progress updates during bulk operations
- **Popup Recovery**: Detailed instructions for enabling popups if blocked

### 🔒 Security & Compliance
- **CSP Compliant**: No eval(), safe DOM manipulation, works on strict sites
- **Cross-Browser**: Chrome, Firefox, Safari, Edge compatibility
- **Local Processing**: All analysis performed locally, no data sent to external servers
- **Clean Cleanup**: Proper memory management and resource cleanup

### 🎨 Professional Interface
- **Modern Design**: Clean, responsive interface with professional styling
- **Keyboard Shortcuts**: Ctrl+A (check all), Ctrl+D (uncheck all), Enter (update), Esc (close)
- **Visual Indicators**: Special highlighting for long-process services (SSL Labs)
- **Responsive Layout**: Works on desktop and mobile browsers

## 🚀 Installation

### Method 1: Manual Bookmark Creation
1. Copy the minified bookmarklet code from the bottom of [domain-osint-hub.js](domain-osint-hub.js)
2. Create a new bookmark in your browser
3. Paste the code as the bookmark URL
4. Name it "Domain OSINT Hub"
5. Save the bookmark

### Method 2: Drag and Drop (from install.html)
1. Visit the [installation page](../../install.html)
2. Drag the "Domain OSINT Hub" button to your bookmarks bar
3. The bookmarklet will be automatically installed

## 📖 Usage

### Basic Operation
1. **Navigate** to any webpage or have a domain in mind
2. **Click** the Domain OSINT Hub bookmark
3. **Verify** the auto-detected domain or enter a new one
4. **Select** desired OSINT services using checkboxes
5. **Click** "Open Selected Services" to launch analysis

### Advanced Features
- **Domain Auto-Detection**: Automatically extracts domain from current webpage
- **Manual Entry**: Enter any domain for analysis via the input field
- **Selective Analysis**: Choose specific services based on your investigation needs
- **Batch Management**: Use bulk selection buttons for efficiency

## 🛠️ Use Cases

### 🔍 Security Research
- Threat intelligence gathering on suspicious domains
- Infrastructure mapping and reconnaissance
- Certificate transparency monitoring
- Historical domain analysis

### 🕵️ Digital Forensics
- Domain reputation analysis during incident response
- Tracking domain registration and ownership changes
- Identifying related infrastructure and subdomains
- Analyzing domain hosting and DNS history

### 🏢 Competitive Intelligence
- Technology stack analysis of competitor websites
- Infrastructure assessment and security posture
- Domain portfolio analysis and monitoring
- Historical website content investigation

## 🔧 Technical Details

### Compatibility
- **Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Websites**: All websites including those with strict Content Security Policy
- **Mobile**: Responsive design works on mobile browsers

### OSINT Services Included
- **VirusTotal**: Comprehensive domain reputation analysis
- **URLVoid**: Multi-engine domain reputation checking
- **crt.sh**: Certificate transparency log searches
- **CertSpotter API**: Certificate monitoring and subdomain discovery
- **Wayback Machine**: Historical website content and changes
- **ViewDNS**: IP history, WHOIS, and reverse IP lookups
- **Shodan**: Internet-connected device and service discovery
- **Robtex**: DNS and IP address analysis
- **SecurityTrails**: Historical DNS and infrastructure data
- **DNSlytics**: Domain and DNS analytics
- **DNSDumpster**: DNS reconnaissance and mapping
- **MXToolbox**: Email and DNS diagnostic tools
- **Whoisology**: Historical WHOIS data analysis
- **Host.io**: Domain intelligence and analytics
- **DomainTools**: Professional domain research tools
- **BuiltWith**: Technology profiling and analysis
- **SSL Labs**: Comprehensive SSL/TLS security testing (marked as long process)

### Smart Popup Management
The bookmarklet implements sophisticated popup handling:
- **Batch Opening**: Services opened in groups of 5 tabs
- **Timed Delays**: 1-second delays between batches prevent browser overload
- **User Confirmation**: Clear confirmation dialog before opening multiple tabs
- **Progress Tracking**: Real-time status updates during bulk operations
- **Error Recovery**: Graceful handling of popup blockers with user guidance

## 🛡️ Privacy & Security

### Data Protection
- **Local Processing**: All domain analysis performed in your browser
- **No Tracking**: No user behavior tracking or analytics
- **No External Calls**: Bookmarklet code makes no network requests
- **Open Source**: Fully transparent, auditable code

### Security Features
- **CSP Compliance**: Works on banking sites, government sites, and other security-strict websites
- **Input Sanitization**: All user inputs properly validated and sanitized
- **XSS Prevention**: Safe DOM manipulation prevents cross-site scripting
- **Memory Management**: Proper cleanup prevents memory leaks

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes following our coding standards
4. Test across multiple browsers and websites
5. Submit a pull request with detailed description

## 🆘 Troubleshooting

### Common Issues

**Popup Blocked Error**
- Click the popup blocker icon in your browser's address bar
- Select "Always allow popups from this site"
- Try the bookmarklet again
- Alternatively, hold Ctrl/Cmd while clicking the bookmark

**Domain Not Detected**
- Manually enter the domain in the popup input field
- Ensure domain format is correct (e.g., example.com, not http://example.com)
- Check that domain contains at least one dot

**Services Won't Open**
- Ensure you've selected at least one service checkbox
- Check that your browser allows multiple tab opening
- Some services may require specific browser permissions

**Interface Appears Broken**
- Try refreshing the page and using the bookmarklet again
- Check browser console for any error messages
- Ensure JavaScript is enabled in browser settings

### Browser-Specific Notes

**Chrome**
- May show popup warning on first use - allow popups for best experience
- Works excellently with batch opening feature

**Firefox**
- May require confirmation for opening multiple tabs
- All features fully supported

**Safari**
- Popup blocker may be more aggressive - adjust settings if needed
- Mobile Safari requires manual popup permission

**Edge**
- Full compatibility with all features
- SmartScreen may occasionally flag external OSINT sites

## 📄 License

MIT License - see [LICENSE](../../LICENSE) file for details.

---

**Made with ❤️ for security researchers, digital investigators, and OSINT professionals**
