# Website Recon Scanner Bookmarklet

Comprehensive website intelligence gathering tool for OSINT investigations, security assessments, and reconnaissance. Scans 80+ paths and analyzes page content in a single click.

## Screenshot
![Website Recon Scanner Interface](../assets/screenshots/website-recon-scanner.png)

## Features

### File & Path Scanning
- **Sensitive file detection**: .git/HEAD, .env, backup.sql, .htpasswd, phpinfo.php, and more
- **Discovery files**: robots.txt, sitemap.xml, security.txt, humans.txt, manifest.json, ads.txt
- **Well-known URIs**: openid-configuration, apple-app-site-association, assetlinks.json, security.txt, jwks.json
- **API endpoints**: REST APIs, GraphQL, Swagger/OpenAPI docs, admin panels, WordPress endpoints
- **Development files**: package.json, composer.json, Dockerfile, .gitignore, CHANGELOG.md

### Security Analysis
- **Security headers audit**: CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, and more
- **Critical vs non-critical classification** with visual severity indicators
- **Server/technology disclosure detection** via response headers

### Page Intelligence
- **Technology detection**: 50+ patterns covering frameworks (React, Vue, Angular, Next.js), CMS (WordPress, Shopify, Drupal), analytics (GA, GTM, Hotjar), CDNs (Cloudflare, AWS, Fastly), and server-side tech
- **Meta information extraction**: title, description, Open Graph, canonical URL, language
- **Cookie analysis**: lists all accessible cookies
- **Social media link discovery**: 15 platforms including Facebook, Twitter/X, LinkedIn, GitHub, Discord, Mastodon, Bluesky
- **Contact extraction**: emails from page text and mailto links, phone numbers from tel links
- **External resource mapping**: identifies all third-party domains loaded (scripts, stylesheets, images, iframes)

### Export & Reporting
- **TXT report**: structured text with summary and all findings
- **JSON export**: machine-readable format for further analysis
- **HTML report**: styled report suitable for sharing or archiving

### Interface
- Dark-themed popup window with summary dashboard
- Color-coded severity indicators (critical, warning, good)
- Collapsible category sections
- Progress bar with file-by-file status
- Stop button to abort long scans
- Mobile responsive

## Installation

### Drag & Drop
Visit the [Interactive Installer](https://htmlpreview.github.io/?https://github.com/gl0bal01/bookmarklets/blob/main/install.html) and drag the Website Recon button to your bookmark bar.

### Manual
1. Copy the minified JavaScript code from the bottom of `website-recon-scanner.js`
2. Create a new bookmark in your browser
3. Paste the code as the bookmark URL

## Usage

1. Navigate to any website you want to scan
2. Click the bookmarklet in your bookmark bar
3. A popup window opens with the scanner interface
4. Click **Start Scan** to begin reconnaissance
5. Review results by clicking on category headers to expand them
6. Export findings using the TXT, JSON, or HTML buttons

## What It Scans

| Category | Items | Purpose |
|----------|-------|---------|
| Sensitive Files | 18 paths | Exposed git repos, backups, config files |
| Discovery Files | 15 paths | robots.txt, sitemaps, manifests |
| Well-Known URIs | 11 paths | OpenID, app associations, security policies |
| API Endpoints | 21 paths | REST APIs, admin panels, login pages |
| Development Files | 14 paths | Package managers, Docker, documentation |
| Security Headers | 11+ headers | CSP, HSTS, X-Frame-Options |
| Technologies | 50+ patterns | Frameworks, CMS, analytics, CDNs |
| Social Media | 15 platforms | Links to social profiles |

## Browser Compatibility

Works in all modern browsers (Chrome, Firefox, Edge, Safari, Brave). Requires popup permissions for the target site.

## Limitations

- File scanning only works for same-origin paths (browser CORS restriction)
- Security headers are extracted from responses to scanned files, not from a dedicated request
- Cookie analysis is limited to cookies accessible via `document.cookie` (HttpOnly cookies are not visible)
- Technology detection is heuristic-based and may not catch all technologies

## Contributing

Contributions welcome! Please see the main repository's [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.
