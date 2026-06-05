# Bookmarklets for OSINT & Investigations

> 10 lightweight JavaScript bookmarklets for OSINT, security research, and CTF competitions. No browser extension installation required. Source code is readable and auditable.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bookmarklets](https://img.shields.io/badge/bookmarklets-10-blue.svg)](.)
[![DOI](https://zenodo.org/badge/1001460201.svg)](https://doi.org/10.5281/zenodo.15722541)

## Why Bookmarklets?

Browser extensions require installation and explicit permission grants. Bookmarklets work differently:

- **No install** — drag to your bookmark bar and click to run
- **No extension permissions** — no access to browser APIs like history, tabs, or cross-site data. Note: bookmarklets do execute with the same privileges as the active page, including access to its DOM, cookies, and session data
- **No external calls by design** — these bookmarklets are written to process data locally in the browser. You can verify this by reviewing the source code, which is intentionally kept readable
- **Portable** — works in any browser, easy to share, inspect, and audit
- **Transparent** — the entire source is visible JavaScript you can read before running

## Quick Start

**Option 1:** Visit the [Interactive Installer](https://htmlpreview.github.io/?https://github.com/gl0bal01/bookmarklets/blob/main/install.html) — drag and drop buttons to your bookmark bar.

**Option 2:** Browse individual bookmarklet folders, copy the minified JavaScript from the `.js` file, and save it as a bookmark URL.

## Tools

| Tool | Description |
|------|-------------|
| [LinkedIn OSINT Extractor](bookmarklet-linkedin-osint-extractor/) | Attempt to extract posts, comments, timestamps, and engagement metrics from LinkedIn via DOM parsing. Export as TXT, JSON, HTML, or CSV. May break when LinkedIn changes its page structure. |
| [Domain OSINT Hub](bookmarklet-domain-osint-hub/) | Launch 18+ OSINT services for any domain with one click. Preset system for common workflows. |
| [Expose Hidden Content](bookmarklet-expose-hidden/) | Reveal HTML comments, hidden elements, and concealed content with color-coded highlighting. |
| [URLs Extractor](bookmarklet-url-extractor/) | Extract all links and resources from a page. Generates searchable HTML and TXT reports. Handles Base64 content. |
| [Enhanced Image Downloader](bookmarklet-image-batch-dl/) | Download images with size filtering, auto-scrolling for lazy-loaded content, and metadata generation. |
| [Username Generator](bookmarklet-username-generator/) | Generate 500+ username variations from a name for cross-platform OSINT searches. |
| [Multi-URL Opener](bookmarklet-multi-url-opener/) | Paste a list of URLs and open them all at once. Smart detection and protocol correction. |
| [Website Recon Scanner](bookmarklet-website-recon-scanner/) | Scan 80+ paths for sensitive files, security headers, technologies, social links, and contacts. Export TXT/JSON/HTML. |
| [Vessel Tracker](bookmarklet-vessel-tracker/) | Generate tracking links across maritime platforms using IMO, MMSI, or vessel name. |
| [Google Maps Review Extractor](bookmarklet-google-maps-review-extractor/) | Extract Google Maps reviews (reviewer, rating, exact network timestamps) with auto-scroll and dedup. Export a searchable, sortable HTML report. |

## Use Cases

**OSINT Investigations** — Social media data parsing (results depend on current site structure), profile analysis, timeline mapping, domain reconnaissance.

**CTF Competitions** — Hidden element discovery, HTML comment analysis, URL and resource extraction.

**Security Research** — Web application testing, content analysis, hidden information discovery.

## License

MIT License — see [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
