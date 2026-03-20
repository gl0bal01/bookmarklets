/*!
 * Bookmarklet: Website Recon Scanner v2.0.0
 * Description: Comprehensive website intelligence gathering tool for OSINT investigations
 * Version: 2.0.0
 * Author: gl0bal01
 * Tags: osint, investigation, security, reconnaissance, web-analysis, headers, technology
 * Compatibility: all-browsers
 * Last Updated: 2026-03-20
 *
 * Note: This bookmarklet uses innerHTML to build its own UI in an isolated popup window.
 * All content is generated from local scan results, not from untrusted user input.
 * This is standard practice for bookmarklet UI construction.
 */

javascript:(function(){
    'use strict';

    const CONFIG = {
        version: '2.0.0',
        name: 'Website Recon Scanner',
        windowName: 'websiteReconScannerV2',
        scanDelay: 150,
        timeout: 8000,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
    };

    if (window.websiteReconScanner) {
        try { window.websiteReconScanner.focus(); return; }
        catch(e) { try { window.websiteReconScanner.close(); } catch(err) {} }
    }

    try {
        let currentTarget = '';
        let currentOrigin = '';
        try {
            if (window.location && window.location.href) {
                currentTarget = window.location.href;
                currentOrigin = window.location.origin;
            }
        } catch(e) { currentTarget = ''; currentOrigin = ''; }

        // Store parent document references before opening popup
        const parentDoc = document;
        const parentCookies = document.cookie;

        let scanResults = {
            discoveryFiles: [],
            developmentFiles: [],
            wellKnown: [],
            apiEndpoints: [],
            securityFiles: [],
            metaInfo: [],
            technologies: [],
            securityHeaders: [],
            cookies: [],
            socialMedia: [],
            externalResources: [],
            contacts: [],
            summary: {}
        };

        // ===================== FILE DEFINITIONS =====================

        const discoveryFiles = [
            { path: '/robots.txt', name: 'robots.txt', description: 'Search engine crawl instructions' },
            { path: '/sitemap.xml', name: 'sitemap.xml', description: 'XML sitemap for search engines' },
            { path: '/sitemap_index.xml', name: 'sitemap_index.xml', description: 'Sitemap index file' },
            { path: '/security.txt', name: 'security.txt', description: 'Security contact info (RFC 9116)' },
            { path: '/humans.txt', name: 'humans.txt', description: 'Team and technology credits' },
            { path: '/manifest.json', name: 'manifest.json', description: 'Web app manifest (PWA)' },
            { path: '/manifest.webmanifest', name: 'manifest.webmanifest', description: 'Web app manifest alt' },
            { path: '/browserconfig.xml', name: 'browserconfig.xml', description: 'IE/Edge tile configuration' },
            { path: '/crossdomain.xml', name: 'crossdomain.xml', description: 'Flash cross-domain policy' },
            { path: '/ads.txt', name: 'ads.txt', description: 'Authorized digital sellers' },
            { path: '/app-ads.txt', name: 'app-ads.txt', description: 'App authorized digital sellers' },
            { path: '/favicon.ico', name: 'favicon.ico', description: 'Site favicon' },
            { path: '/apple-touch-icon.png', name: 'apple-touch-icon.png', description: 'iOS home screen icon' },
            { path: '/feed/', name: 'feed/', description: 'RSS/Atom feed' },
            { path: '/rss', name: 'rss', description: 'RSS feed alternate' },
            { path: '/atom.xml', name: 'atom.xml', description: 'Atom feed' }
        ];

        const developmentFiles = [
            { path: '/README.md', name: 'README.md', description: 'Project documentation' },
            { path: '/LICENSE', name: 'LICENSE', description: 'License information' },
            { path: '/LICENSE.txt', name: 'LICENSE.txt', description: 'License information (txt)' },
            { path: '/package.json', name: 'package.json', description: 'Node.js package info' },
            { path: '/composer.json', name: 'composer.json', description: 'PHP Composer config' },
            { path: '/Gemfile', name: 'Gemfile', description: 'Ruby dependencies' },
            { path: '/requirements.txt', name: 'requirements.txt', description: 'Python dependencies' },
            { path: '/.env', name: '.env', description: 'Environment variables (sensitive!)' },
            { path: '/.env.example', name: '.env.example', description: 'Example environment file' },
            { path: '/docker-compose.yml', name: 'docker-compose.yml', description: 'Docker Compose config' },
            { path: '/Dockerfile', name: 'Dockerfile', description: 'Docker build file' },
            { path: '/Makefile', name: 'Makefile', description: 'Build automation' },
            { path: '/CHANGELOG.md', name: 'CHANGELOG.md', description: 'Version history' },
            { path: '/.gitignore', name: '.gitignore', description: 'Git ignore rules' }
        ];

        const securityFiles = [
            { path: '/.git/HEAD', name: '.git/HEAD', description: 'Git repository exposed (critical!)' },
            { path: '/.git/config', name: '.git/config', description: 'Git config exposed (critical!)' },
            { path: '/.svn/entries', name: '.svn/entries', description: 'SVN repository exposed' },
            { path: '/.DS_Store', name: '.DS_Store', description: 'macOS directory metadata' },
            { path: '/server-status', name: 'server-status', description: 'Apache server status' },
            { path: '/server-info', name: 'server-info', description: 'Apache server info' },
            { path: '/phpinfo.php', name: 'phpinfo.php', description: 'PHP info page (sensitive!)' },
            { path: '/info.php', name: 'info.php', description: 'PHP info alternate' },
            { path: '/elmah.axd', name: 'elmah.axd', description: 'ASP.NET error log' },
            { path: '/trace.axd', name: 'trace.axd', description: 'ASP.NET trace info' },
            { path: '/wp-config.php.bak', name: 'wp-config.php.bak', description: 'WordPress config backup' },
            { path: '/web.config', name: 'web.config', description: 'IIS configuration' },
            { path: '/.htaccess', name: '.htaccess', description: 'Apache configuration' },
            { path: '/.htpasswd', name: '.htpasswd', description: 'Apache password file (critical!)' },
            { path: '/backup.sql', name: 'backup.sql', description: 'Database backup (critical!)' },
            { path: '/dump.sql', name: 'dump.sql', description: 'Database dump (critical!)' },
            { path: '/debug.log', name: 'debug.log', description: 'Debug log file' },
            { path: '/error.log', name: 'error.log', description: 'Error log file' }
        ];

        const wellKnownFiles = [
            { path: '/.well-known/security.txt', name: 'security.txt', description: 'Security contact (RFC 9116)' },
            { path: '/.well-known/openid-configuration', name: 'openid-configuration', description: 'OpenID Connect discovery' },
            { path: '/.well-known/apple-app-site-association', name: 'apple-app-site-association', description: 'iOS universal links' },
            { path: '/.well-known/assetlinks.json', name: 'assetlinks.json', description: 'Android app links' },
            { path: '/.well-known/change-password', name: 'change-password', description: 'Password change URL' },
            { path: '/.well-known/mta-sts.txt', name: 'mta-sts.txt', description: 'Mail Transfer Agent STS policy' },
            { path: '/.well-known/dnt-policy.txt', name: 'dnt-policy.txt', description: 'Do Not Track policy' },
            { path: '/.well-known/nodeinfo', name: 'nodeinfo', description: 'Fediverse node info' },
            { path: '/.well-known/webfinger', name: 'webfinger', description: 'WebFinger discovery' },
            { path: '/.well-known/matrix/server', name: 'matrix/server', description: 'Matrix server delegation' },
            { path: '/.well-known/jwks.json', name: 'jwks.json', description: 'JSON Web Key Set' }
        ];

        const apiEndpoints = [
            { path: '/api', name: 'API Root', description: 'Main API endpoint' },
            { path: '/api/v1', name: 'API v1', description: 'API version 1' },
            { path: '/api/v2', name: 'API v2', description: 'API version 2' },
            { path: '/graphql', name: 'GraphQL', description: 'GraphQL endpoint' },
            { path: '/swagger', name: 'Swagger UI', description: 'Swagger API docs' },
            { path: '/swagger.json', name: 'swagger.json', description: 'Swagger specification' },
            { path: '/api-docs', name: 'API Docs', description: 'API documentation' },
            { path: '/openapi.json', name: 'openapi.json', description: 'OpenAPI specification' },
            { path: '/rest', name: 'REST', description: 'REST API root' },
            { path: '/wp-json', name: 'WP REST API', description: 'WordPress REST API' },
            { path: '/wp-json/wp/v2/users', name: 'WP Users API', description: 'WordPress user enumeration' },
            { path: '/admin', name: 'Admin Panel', description: 'Administration interface' },
            { path: '/administrator', name: 'Administrator', description: 'Joomla admin panel' },
            { path: '/wp-admin', name: 'WP Admin', description: 'WordPress admin panel' },
            { path: '/wp-login.php', name: 'WP Login', description: 'WordPress login page' },
            { path: '/login', name: 'Login', description: 'Login page' },
            { path: '/health', name: 'Health Check', description: 'Health endpoint' },
            { path: '/status', name: 'Status', description: 'Status endpoint' },
            { path: '/metrics', name: 'Metrics', description: 'Prometheus metrics' },
            { path: '/debug', name: 'Debug', description: 'Debug endpoint' },
            { path: '/xmlrpc.php', name: 'XML-RPC', description: 'WordPress XML-RPC (attack surface)' }
        ];

        // ===================== TECHNOLOGY PATTERNS =====================

        const techPatterns = [
            // Frameworks
            { name: 'jQuery', pattern: /jquery[.\-\/]?(\d[\d.]*)?/i, type: 'Library' },
            { name: 'React', pattern: /react[.\-\/]|__react/i, type: 'Framework' },
            { name: 'Angular', pattern: /angular[.\-\/]|ng-version/i, type: 'Framework' },
            { name: 'Vue.js', pattern: /vue[.\-\/]|__vue/i, type: 'Framework' },
            { name: 'Svelte', pattern: /svelte[.\-\/]/i, type: 'Framework' },
            { name: 'Next.js', pattern: /next[.\-\/]|__next|_next/i, type: 'Framework' },
            { name: 'Nuxt.js', pattern: /nuxt[.\-\/]|__nuxt/i, type: 'Framework' },
            { name: 'Gatsby', pattern: /gatsby/i, type: 'Framework' },
            { name: 'Ember.js', pattern: /ember[.\-\/]/i, type: 'Framework' },
            { name: 'Backbone.js', pattern: /backbone[.\-\/]/i, type: 'Framework' },
            { name: 'htmx', pattern: /htmx[.\-\/]/i, type: 'Library' },
            { name: 'Alpine.js', pattern: /alpine[.\-\/]|x-data/i, type: 'Library' },
            // CSS Frameworks
            { name: 'Bootstrap', pattern: /bootstrap[.\-\/]/i, type: 'CSS' },
            { name: 'Tailwind CSS', pattern: /tailwind/i, type: 'CSS' },
            { name: 'Bulma', pattern: /bulma[.\-\/]/i, type: 'CSS' },
            { name: 'Foundation', pattern: /foundation[.\-\/]/i, type: 'CSS' },
            // CMS
            { name: 'WordPress', pattern: /wp-content|wp-includes|wordpress/i, type: 'CMS' },
            { name: 'Drupal', pattern: /drupal|sites\/default\/files/i, type: 'CMS' },
            { name: 'Joomla', pattern: /joomla|\/media\/system/i, type: 'CMS' },
            { name: 'Shopify', pattern: /shopify|cdn\.shopify\.com/i, type: 'CMS' },
            { name: 'Squarespace', pattern: /squarespace/i, type: 'CMS' },
            { name: 'Wix', pattern: /wix\.com|wixstatic/i, type: 'CMS' },
            { name: 'Webflow', pattern: /webflow/i, type: 'CMS' },
            { name: 'Ghost', pattern: /ghost[.\-\/]/i, type: 'CMS' },
            // Utilities
            { name: 'Lodash', pattern: /lodash[.\-\/]/i, type: 'Library' },
            { name: 'Moment.js', pattern: /moment[.\-\/](\d|min)/i, type: 'Library' },
            { name: 'Axios', pattern: /axios[.\-\/]/i, type: 'Library' },
            { name: 'D3.js', pattern: /d3[.\-\/](\d|min)/i, type: 'Library' },
            { name: 'Three.js', pattern: /three[.\-\/]/i, type: 'Library' },
            { name: 'Socket.IO', pattern: /socket\.io/i, type: 'Library' },
            { name: 'GSAP', pattern: /gsap|greensock/i, type: 'Library' },
            // Analytics & Tracking
            { name: 'Google Analytics', pattern: /google-analytics|googletagmanager|gtag|ga\.js|analytics\.js/i, type: 'Analytics' },
            { name: 'Google Tag Manager', pattern: /googletagmanager\.com\/gtm/i, type: 'Analytics' },
            { name: 'Facebook Pixel', pattern: /connect\.facebook\.net|fbevents/i, type: 'Analytics' },
            { name: 'Hotjar', pattern: /hotjar/i, type: 'Analytics' },
            { name: 'Mixpanel', pattern: /mixpanel/i, type: 'Analytics' },
            { name: 'Segment', pattern: /segment\.com|analytics\.min\.js/i, type: 'Analytics' },
            { name: 'Plausible', pattern: /plausible/i, type: 'Analytics' },
            { name: 'Matomo', pattern: /matomo|piwik/i, type: 'Analytics' },
            // CDN & Infrastructure
            { name: 'Cloudflare', pattern: /cloudflare|cf-ray/i, type: 'Infrastructure' },
            { name: 'AWS CloudFront', pattern: /cloudfront\.net/i, type: 'Infrastructure' },
            { name: 'Fastly', pattern: /fastly/i, type: 'Infrastructure' },
            { name: 'Akamai', pattern: /akamai/i, type: 'Infrastructure' },
            { name: 'Vercel', pattern: /vercel|\.vercel\.app/i, type: 'Infrastructure' },
            { name: 'Netlify', pattern: /netlify/i, type: 'Infrastructure' },
            // Server-side hints
            { name: 'PHP', pattern: /\.php|x-powered-by.*php/i, type: 'Server' },
            { name: 'ASP.NET', pattern: /asp\.net|__viewstate|aspnet/i, type: 'Server' },
            { name: 'Ruby on Rails', pattern: /ruby|rails/i, type: 'Server' },
            { name: 'Django', pattern: /csrfmiddlewaretoken|django/i, type: 'Server' },
            { name: 'Laravel', pattern: /laravel/i, type: 'Server' },
            { name: 'Express', pattern: /express/i, type: 'Server' }
        ];

        const socialPlatforms = [
            { name: 'Facebook', pattern: /facebook\.com|fb\.com/i },
            { name: 'Twitter/X', pattern: /twitter\.com|x\.com/i },
            { name: 'LinkedIn', pattern: /linkedin\.com/i },
            { name: 'Instagram', pattern: /instagram\.com/i },
            { name: 'YouTube', pattern: /youtube\.com|youtu\.be/i },
            { name: 'TikTok', pattern: /tiktok\.com/i },
            { name: 'GitHub', pattern: /github\.com/i },
            { name: 'Reddit', pattern: /reddit\.com/i },
            { name: 'Pinterest', pattern: /pinterest\.com/i },
            { name: 'Discord', pattern: /discord\.gg|discord\.com/i },
            { name: 'Telegram', pattern: /t\.me|telegram\.org/i },
            { name: 'Mastodon', pattern: /mastodon|joinmastodon/i },
            { name: 'Bluesky', pattern: /bsky\.app|bsky\.social/i },
            { name: 'Medium', pattern: /medium\.com/i },
            { name: 'Threads', pattern: /threads\.net/i }
        ];

        const securityHeadersList = [
            { name: 'Content-Security-Policy', critical: true, description: 'Controls resource loading' },
            { name: 'Strict-Transport-Security', critical: true, description: 'Enforces HTTPS (HSTS)' },
            { name: 'X-Frame-Options', critical: true, description: 'Clickjacking protection' },
            { name: 'X-Content-Type-Options', critical: false, description: 'MIME sniffing prevention' },
            { name: 'X-XSS-Protection', critical: false, description: 'XSS filter (legacy)' },
            { name: 'Referrer-Policy', critical: false, description: 'Controls referrer info' },
            { name: 'Permissions-Policy', critical: false, description: 'Feature permissions' },
            { name: 'Cross-Origin-Opener-Policy', critical: false, description: 'Cross-origin isolation' },
            { name: 'Cross-Origin-Embedder-Policy', critical: false, description: 'Cross-origin embedding' },
            { name: 'Cross-Origin-Resource-Policy', critical: false, description: 'Cross-origin resource sharing' },
            { name: 'X-Permitted-Cross-Domain-Policies', critical: false, description: 'Flash/PDF cross-domain' }
        ];

        // ===================== POPUP WINDOW =====================

        const windowFeatures = CONFIG.isMobile
            ? 'width=420,height=750,scrollbars=yes,resizable=yes'
            : 'width=900,height=950,scrollbars=yes,resizable=yes';

        window.websiteReconScanner = window.open('', CONFIG.windowName, windowFeatures);
        if (!window.websiteReconScanner) {
            alert('Popup blocked! Please allow popups for this site.');
            return;
        }

        const popupDoc = window.websiteReconScanner.document;
        popupDoc.open();
        popupDoc.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Website Recon Scanner</title></head><body></body></html>');
        popupDoc.close();

        // ===================== STYLES =====================

        const style = popupDoc.createElement('style');
        style.textContent = [
            '* { box-sizing: border-box; margin: 0; padding: 0; }',
            'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; line-height: 1.5; }',
            '.container { max-width: 860px; margin: 0 auto; }',
            '.header { text-align: center; padding: 24px 0; border-bottom: 1px solid #1e293b; margin-bottom: 24px; }',
            '.header h1 { font-size: 22px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }',
            '.header .target { font-size: 14px; color: #94a3b8; word-break: break-all; }',
            '.header .target a { color: #60a5fa; text-decoration: none; }',
            '.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 24px; }',
            '.summary-card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px; text-align: center; transition: border-color 0.2s; }',
            '.summary-card.critical { border-color: #ef4444; }',
            '.summary-card.warning { border-color: #f59e0b; }',
            '.summary-card.good { border-color: #22c55e; }',
            '.summary-number { font-size: 28px; font-weight: 700; color: #f1f5f9; }',
            '.summary-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }',
            '.controls { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }',
            '.btn { padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; color: white; }',
            '.btn:hover { transform: translateY(-1px); }',
            '.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }',
            '.btn-scan { background: #3b82f6; flex: 1; min-width: 140px; }',
            '.btn-scan:hover { background: #2563eb; }',
            '.btn-export { background: #1e293b; border: 1px solid #334155; color: #cbd5e1; }',
            '.btn-export:hover { background: #334155; }',
            '.btn-stop { background: #ef4444; }',
            '.btn-stop:hover { background: #dc2626; }',
            '.progress-section { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px; margin-bottom: 24px; display: none; }',
            '.progress-text { font-size: 13px; color: #94a3b8; margin-bottom: 8px; }',
            '.progress-bar-bg { background: #334155; border-radius: 4px; height: 6px; overflow: hidden; }',
            '.progress-bar-fill { background: linear-gradient(90deg, #3b82f6, #8b5cf6); height: 100%; width: 0%; border-radius: 4px; transition: width 0.3s; }',
            '.category-section { margin-bottom: 16px; background: #1e293b; border: 1px solid #334155; border-radius: 10px; overflow: hidden; }',
            '.category-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; cursor: pointer; user-select: none; transition: background 0.2s; }',
            '.category-header:hover { background: #334155; }',
            '.category-left { display: flex; align-items: center; gap: 10px; }',
            '.category-icon { font-size: 16px; }',
            '.category-name { font-weight: 600; font-size: 14px; color: #f1f5f9; }',
            '.category-badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }',
            '.badge-found { background: #166534; color: #86efac; }',
            '.badge-none { background: #334155; color: #94a3b8; }',
            '.badge-critical { background: #991b1b; color: #fca5a5; }',
            '.category-arrow { color: #64748b; transition: transform 0.2s; font-size: 12px; }',
            '.category-arrow.open { transform: rotate(90deg); }',
            '.category-content { display: none; border-top: 1px solid #334155; }',
            '.category-content.expanded { display: block; }',
            '.finding-item { display: flex; align-items: center; padding: 10px 16px; border-bottom: 1px solid #1e293b; font-size: 13px; gap: 10px; }',
            '.finding-item:last-child { border-bottom: none; }',
            '.finding-item:hover { background: rgba(51, 65, 85, 0.3); }',
            '.status-badge { font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 700; text-transform: uppercase; white-space: nowrap; letter-spacing: 0.3px; }',
            '.status-found { background: #166534; color: #86efac; }',
            '.status-missing { background: #334155; color: #64748b; }',
            '.status-critical { background: #991b1b; color: #fca5a5; }',
            '.status-warning { background: #92400e; color: #fcd34d; }',
            '.status-good { background: #166534; color: #86efac; }',
            '.finding-name { font-weight: 500; color: #e2e8f0; min-width: 160px; }',
            '.finding-desc { color: #94a3b8; flex: 1; }',
            '.finding-value { color: #cbd5e1; font-family: monospace; font-size: 12px; max-width: 350px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
            '.footer { text-align: center; padding: 20px 0; border-top: 1px solid #1e293b; margin-top: 24px; color: #475569; font-size: 12px; }',
            '@media (max-width: 600px) { body { padding: 12px; } .summary-grid { grid-template-columns: repeat(2, 1fr); } .finding-item { flex-wrap: wrap; } .finding-desc { display: none; } }'
        ].join('\n');
        popupDoc.head.appendChild(style);

        // ===================== SCAN FUNCTIONS =====================

        let abortScan = false;

        function makeRequest(url, timeout) {
            timeout = timeout || CONFIG.timeout;
            return new Promise(function(resolve, reject) {
                const xhr = new XMLHttpRequest();
                const timeoutId = setTimeout(function() {
                    xhr.abort();
                    reject(new Error('Timeout'));
                }, timeout);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        clearTimeout(timeoutId);
                        const headers = {};
                        try {
                            const raw = xhr.getAllResponseHeaders();
                            if (raw) {
                                raw.trim().split(/[\r\n]+/).forEach(function(line) {
                                    const parts = line.split(': ');
                                    const key = parts.shift();
                                    headers[key.toLowerCase()] = parts.join(': ');
                                });
                            }
                        } catch(e) {}
                        resolve({ status: xhr.status, responseText: xhr.responseText, headers: headers });
                    }
                };
                xhr.onerror = function() {
                    clearTimeout(timeoutId);
                    reject(new Error('Network error'));
                };
                try {
                    xhr.open('GET', url, true);
                    xhr.send();
                } catch(e) {
                    clearTimeout(timeoutId);
                    reject(e);
                }
            });
        }

        function updateProgress(percentage, message) {
            const bar = popupDoc.querySelector('.progress-bar-fill');
            const text = popupDoc.querySelector('.progress-text');
            if (bar) bar.style.width = percentage + '%';
            if (text) text.textContent = message;
        }

        async function scanFiles(files, progressStart, progressEnd, category) {
            const results = [];
            let found = 0;
            for (let i = 0; i < files.length; i++) {
                if (abortScan) break;
                const file = files[i];
                const progress = progressStart + ((i / files.length) * (progressEnd - progressStart));
                updateProgress(progress, 'Checking ' + file.name + '...');
                try {
                    const response = await makeRequest(currentOrigin + file.path);
                    const isFound = response.status >= 200 && response.status < 400;
                    if (isFound) found++;
                    results.push({
                        name: file.name,
                        path: file.path,
                        description: file.description,
                        found: isFound,
                        status: response.status,
                        size: response.responseText ? response.responseText.length : 0,
                        headers: response.headers || {}
                    });
                } catch(error) {
                    results.push({
                        name: file.name,
                        path: file.path,
                        description: file.description,
                        found: false,
                        status: 'Error',
                        size: 0,
                        headers: {}
                    });
                }
                await new Promise(function(resolve) { setTimeout(resolve, CONFIG.scanDelay); });
            }
            scanResults[category] = results;
            scanResults.summary[category + 'Found'] = found;
            scanResults.summary[category + 'Total'] = files.length;
            return results;
        }

        function analyzeSecurityHeaders() {
            updateProgress(85, 'Analyzing security headers...');
            const results = [];
            const sampleHeaders = {};
            var allScanned = [].concat(
                scanResults.discoveryFiles || [],
                scanResults.wellKnown || []
            );
            allScanned.forEach(function(item) {
                if (item.headers) {
                    Object.keys(item.headers).forEach(function(k) {
                        if (!sampleHeaders[k]) sampleHeaders[k] = item.headers[k];
                    });
                }
            });

            securityHeadersList.forEach(function(header) {
                const key = header.name.toLowerCase();
                const value = sampleHeaders[key] || null;
                results.push({
                    name: header.name,
                    description: header.description,
                    found: !!value,
                    value: value || 'Not set',
                    critical: header.critical
                });
            });

            if (sampleHeaders['server']) {
                results.push({ name: 'Server', description: 'Server software disclosure', found: true, value: sampleHeaders['server'], critical: false });
            }
            if (sampleHeaders['x-powered-by']) {
                results.push({ name: 'X-Powered-By', description: 'Technology disclosure', found: true, value: sampleHeaders['x-powered-by'], critical: false });
            }

            scanResults.securityHeaders = results;
            scanResults.summary.securityHeadersSet = results.filter(function(r) { return r.found; }).length;
            scanResults.summary.securityHeadersMissing = results.filter(function(r) { return !r.found; }).length;
            scanResults.summary.securityHeadersCritical = results.filter(function(r) { return r.critical && !r.found; }).length;
            return results;
        }

        function extractMetaInfo() {
            updateProgress(88, 'Extracting meta information...');
            const results = [];
            results.push({ name: 'Page Title', value: parentDoc.title || 'Not found', found: !!parentDoc.title });

            var metaTags = parentDoc.querySelectorAll('meta');
            metaTags.forEach(function(tag) {
                const name = tag.getAttribute('name') || tag.getAttribute('property') || tag.getAttribute('http-equiv');
                const content = tag.getAttribute('content');
                if (name && content) {
                    results.push({ name: name, value: content, found: true });
                }
            });

            var canonical = parentDoc.querySelector('link[rel="canonical"]');
            if (canonical) results.push({ name: 'Canonical URL', value: canonical.href, found: true });

            var lang = parentDoc.documentElement.lang;
            if (lang) results.push({ name: 'Language', value: lang, found: true });

            var favicon = parentDoc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
            if (favicon) results.push({ name: 'Favicon', value: favicon.href, found: true });

            scanResults.metaInfo = results;
            scanResults.summary.metaInfoFound = results.filter(function(r) { return r.found; }).length;
            return results;
        }

        function extractTechnologies() {
            updateProgress(90, 'Detecting technologies...');
            const results = [];
            const detected = {};

            parentDoc.querySelectorAll('script[src]').forEach(function(script) {
                var src = script.src || '';
                techPatterns.forEach(function(tech) {
                    if (tech.pattern.test(src) && !detected[tech.name]) {
                        detected[tech.name] = true;
                        results.push({ name: tech.name, type: tech.type, found: true, source: src });
                    }
                });
            });

            parentDoc.querySelectorAll('script:not([src])').forEach(function(script) {
                var text = script.textContent || '';
                techPatterns.forEach(function(tech) {
                    if (tech.pattern.test(text) && !detected[tech.name]) {
                        detected[tech.name] = true;
                        results.push({ name: tech.name, type: tech.type, found: true, source: 'inline script' });
                    }
                });
            });

            parentDoc.querySelectorAll('link[href]').forEach(function(link) {
                var href = link.href || '';
                techPatterns.forEach(function(tech) {
                    if (tech.pattern.test(href) && !detected[tech.name]) {
                        detected[tech.name] = true;
                        results.push({ name: tech.name, type: tech.type, found: true, source: href });
                    }
                });
            });

            var generator = parentDoc.querySelector('meta[name="generator"]');
            if (generator) {
                var content = generator.getAttribute('content') || '';
                results.push({ name: content, type: 'Generator', found: true, source: 'meta generator' });
            }

            var html = parentDoc.documentElement.outerHTML.substring(0, 5000);
            techPatterns.forEach(function(tech) {
                if (tech.pattern.test(html) && !detected[tech.name]) {
                    detected[tech.name] = true;
                    results.push({ name: tech.name, type: tech.type, found: true, source: 'HTML content' });
                }
            });

            scanResults.technologies = results;
            scanResults.summary.technologiesFound = results.length;
            return results;
        }

        function extractCookies() {
            updateProgress(92, 'Analyzing cookies...');
            const results = [];
            if (parentCookies) {
                parentCookies.split(';').forEach(function(pair) {
                    var parts = pair.trim().split('=');
                    var name = parts[0];
                    var value = parts.slice(1).join('=');
                    if (name) {
                        results.push({
                            name: name.trim(),
                            value: value ? (value.length > 60 ? value.substring(0, 60) + '...' : value) : '(empty)',
                            found: true
                        });
                    }
                });
            }
            scanResults.cookies = results;
            scanResults.summary.cookiesFound = results.length;
            return results;
        }

        function extractSocialMedia() {
            updateProgress(94, 'Finding social media links...');
            const results = [];
            const found = {};
            parentDoc.querySelectorAll('a[href]').forEach(function(a) {
                var href = a.href || '';
                socialPlatforms.forEach(function(platform) {
                    if (platform.pattern.test(href) && !found[platform.name + ':' + href]) {
                        found[platform.name + ':' + href] = true;
                        results.push({ name: platform.name, value: href, found: true });
                    }
                });
            });
            scanResults.socialMedia = results;
            scanResults.summary.socialMediaFound = Object.keys(
                results.reduce(function(acc, r) { acc[r.name] = true; return acc; }, {})
            ).length;
            return results;
        }

        function extractContacts() {
            updateProgress(95, 'Finding contact information...');
            const results = [];
            var pageText = parentDoc.body ? (parentDoc.body.textContent || '') : '';

            var emailPattern = /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g;
            var emails = [];
            var emailMatches = pageText.match(emailPattern);
            if (emailMatches) {
                emailMatches.forEach(function(e) { if (emails.indexOf(e) === -1) emails.push(e); });
            }
            parentDoc.querySelectorAll('a[href^="mailto:"]').forEach(function(a) {
                var email = a.href.replace('mailto:', '').split('?')[0];
                if (emails.indexOf(email) === -1) emails.push(email);
            });
            emails.slice(0, 15).forEach(function(email) {
                results.push({ name: 'Email', value: email, found: true });
            });

            parentDoc.querySelectorAll('a[href^="tel:"]').forEach(function(a) {
                results.push({ name: 'Phone', value: a.href.replace('tel:', ''), found: true });
            });

            scanResults.contacts = results;
            scanResults.summary.contactsFound = results.length;
            return results;
        }

        function extractExternalResources() {
            updateProgress(97, 'Analyzing external resources...');
            const results = [];
            const seen = {};
            var currentHost = '';
            try { currentHost = new URL(currentTarget).hostname; } catch(e) {}

            function addResource(url, type) {
                try {
                    var parsed = new URL(url);
                    if (parsed.hostname && parsed.hostname !== currentHost && !seen[parsed.hostname]) {
                        seen[parsed.hostname] = true;
                        results.push({ name: parsed.hostname, value: url, type: type, found: true });
                    }
                } catch(e) {}
            }

            parentDoc.querySelectorAll('script[src]').forEach(function(el) { addResource(el.src, 'Script'); });
            parentDoc.querySelectorAll('link[href]').forEach(function(el) { addResource(el.href, 'Stylesheet'); });
            parentDoc.querySelectorAll('img[src]').forEach(function(el) { addResource(el.src, 'Image'); });
            parentDoc.querySelectorAll('iframe[src]').forEach(function(el) { addResource(el.src, 'iFrame'); });

            scanResults.externalResources = results;
            scanResults.summary.externalResourcesFound = results.length;
            return results;
        }

        // ===================== UI RENDERING =====================

        function escapeAttr(str) {
            return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        function escapeText(str) {
            return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        function renderResults() {
            var resultsArea = popupDoc.getElementById('resultsArea');
            if (!resultsArea) return;
            // Clear existing results
            while (resultsArea.firstChild) resultsArea.removeChild(resultsArea.firstChild);

            var categories = [
                { id: 'securityFiles', name: 'Sensitive Files & Exposure', icon: '\uD83D\uDEA8', data: scanResults.securityFiles || [], isCritical: true },
                { id: 'securityHeaders', name: 'Security Headers', icon: '\uD83D\uDEE1', data: scanResults.securityHeaders || [], isHeaders: true },
                { id: 'discoveryFiles', name: 'Discovery Files', icon: '\uD83D\uDCC4', data: scanResults.discoveryFiles || [] },
                { id: 'wellKnown', name: 'Well-Known URIs', icon: '\uD83D\uDD17', data: scanResults.wellKnown || [] },
                { id: 'apiEndpoints', name: 'API Endpoints & Admin Panels', icon: '\uD83D\uDD0C', data: scanResults.apiEndpoints || [] },
                { id: 'developmentFiles', name: 'Development Files', icon: '\uD83D\uDD27', data: scanResults.developmentFiles || [] },
                { id: 'technologies', name: 'Technologies Detected', icon: '\u2699', data: scanResults.technologies || [], isTech: true },
                { id: 'metaInfo', name: 'Meta Information', icon: '\uD83D\uDCCB', data: scanResults.metaInfo || [], isMeta: true },
                { id: 'cookies', name: 'Cookies', icon: '\uD83C\uDF6A', data: scanResults.cookies || [], isMeta: true },
                { id: 'socialMedia', name: 'Social Media Links', icon: '\uD83C\uDF10', data: scanResults.socialMedia || [], isMeta: true },
                { id: 'contacts', name: 'Contact Information', icon: '\uD83D\uDCE7', data: scanResults.contacts || [], isMeta: true },
                { id: 'externalResources', name: 'External Resources', icon: '\uD83D\uDD17', data: scanResults.externalResources || [], isExternal: true }
            ];

            categories.forEach(function(cat) {
                if (cat.data.length === 0) return;

                var section = popupDoc.createElement('div');
                section.className = 'category-section';

                var foundCount = cat.data.filter(function(i) { return i.found; }).length;
                var badgeClass = 'badge-none';
                var badgeText = '0 found';
                if (cat.isCritical && foundCount > 0) {
                    badgeClass = 'badge-critical';
                    badgeText = foundCount + ' EXPOSED';
                } else if (cat.isHeaders) {
                    var setCount = cat.data.filter(function(i) { return i.found; }).length;
                    badgeClass = 'badge-found';
                    badgeText = setCount + '/' + cat.data.length + ' set';
                } else if (foundCount > 0) {
                    badgeClass = 'badge-found';
                    badgeText = foundCount + ' found';
                }

                // Build header using DOM
                var header = popupDoc.createElement('div');
                header.className = 'category-header';

                var leftDiv = popupDoc.createElement('div');
                leftDiv.className = 'category-left';
                var iconSpan = popupDoc.createElement('span');
                iconSpan.className = 'category-icon';
                iconSpan.textContent = cat.icon;
                var nameSpan = popupDoc.createElement('span');
                nameSpan.className = 'category-name';
                nameSpan.textContent = cat.name;
                var badgeSpan = popupDoc.createElement('span');
                badgeSpan.className = 'category-badge ' + badgeClass;
                badgeSpan.textContent = badgeText;
                leftDiv.appendChild(iconSpan);
                leftDiv.appendChild(nameSpan);
                leftDiv.appendChild(badgeSpan);

                var arrow = popupDoc.createElement('span');
                arrow.className = 'category-arrow';
                arrow.textContent = '\u25B6';

                header.appendChild(leftDiv);
                header.appendChild(arrow);
                section.appendChild(header);

                var content = popupDoc.createElement('div');
                content.className = 'category-content';

                cat.data.forEach(function(item) {
                    var row = popupDoc.createElement('div');
                    row.className = 'finding-item';

                    var statusClass = 'status-missing';
                    var statusText = 'NOT FOUND';

                    if (cat.isHeaders) {
                        if (item.found) { statusClass = 'status-good'; statusText = 'SET'; }
                        else if (item.critical) { statusClass = 'status-critical'; statusText = 'MISSING'; }
                        else { statusClass = 'status-warning'; statusText = 'MISSING'; }
                    } else if (cat.isCritical && item.found) {
                        statusClass = 'status-critical'; statusText = 'EXPOSED';
                    } else if (item.found) {
                        statusClass = 'status-found'; statusText = 'FOUND';
                    }
                    if (cat.isMeta || cat.isExternal || cat.isTech) {
                        statusClass = 'status-found'; statusText = item.type || 'FOUND';
                    }

                    var badge = popupDoc.createElement('span');
                    badge.className = 'status-badge ' + statusClass;
                    badge.textContent = statusText;

                    var nameEl = popupDoc.createElement('span');
                    nameEl.className = 'finding-name';
                    nameEl.textContent = item.name || '';

                    var descEl = popupDoc.createElement('span');
                    descEl.className = 'finding-desc';
                    descEl.textContent = item.description || '';

                    row.appendChild(badge);
                    row.appendChild(nameEl);
                    row.appendChild(descEl);

                    if (item.value) {
                        var valEl = popupDoc.createElement('span');
                        valEl.className = 'finding-value';
                        valEl.title = String(item.value);
                        valEl.textContent = String(item.value).substring(0, 80);
                        row.appendChild(valEl);
                    }

                    content.appendChild(row);
                });

                section.appendChild(content);
                resultsArea.appendChild(section);

                header.addEventListener('click', function() {
                    content.classList.toggle('expanded');
                    arrow.classList.toggle('open');
                });
            });

            updateSummary();
        }

        function updateSummary() {
            var s = scanResults.summary;
            var totalFiles = (s.discoveryFilesFound || 0) + (s.developmentFilesFound || 0) + (s.wellKnownFound || 0) + (s.apiEndpointsFound || 0);
            var sensitiveExposed = s.securityFilesFound || 0;
            var headersMissing = s.securityHeadersMissing || 0;
            var techCount = s.technologiesFound || 0;
            var contactCount = s.contactsFound || 0;
            var externalCount = s.externalResourcesFound || 0;

            var cards = popupDoc.querySelectorAll('.summary-card');
            if (cards.length >= 6) {
                cards[0].querySelector('.summary-number').textContent = totalFiles;
                cards[0].className = 'summary-card' + (totalFiles > 5 ? ' good' : '');
                cards[1].querySelector('.summary-number').textContent = sensitiveExposed;
                cards[1].className = 'summary-card' + (sensitiveExposed > 0 ? ' critical' : ' good');
                cards[2].querySelector('.summary-number').textContent = headersMissing;
                cards[2].className = 'summary-card' + (headersMissing > 3 ? ' critical' : (headersMissing > 0 ? ' warning' : ' good'));
                cards[3].querySelector('.summary-number').textContent = techCount;
                cards[4].querySelector('.summary-number').textContent = contactCount;
                cards[5].querySelector('.summary-number').textContent = externalCount;
            }
        }

        // ===================== EXPORT FUNCTIONS =====================

        function getHostname() {
            try { return new URL(currentTarget).hostname.replace(/\./g, '-'); } catch(e) { return 'unknown'; }
        }

        function getDateStamp() {
            return new Date().toISOString().split('T')[0];
        }

        function downloadFile(content, filename, mimeType) {
            var blob = new Blob([content], { type: mimeType });
            var url = URL.createObjectURL(blob);
            var a = popupDoc.createElement('a');
            a.href = url;
            a.download = filename;
            popupDoc.body.appendChild(a);
            a.click();
            popupDoc.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function exportTXT() {
            var s = scanResults.summary;
            var lines = [
                '='.repeat(60),
                'WEBSITE RECONNAISSANCE REPORT',
                '='.repeat(60),
                '',
                'Target: ' + currentTarget,
                'Date: ' + new Date().toISOString(),
                'Scanner: Website Recon Scanner v' + CONFIG.version,
                '',
                '-'.repeat(40),
                'SUMMARY',
                '-'.repeat(40),
                'Files discovered: ' + ((s.discoveryFilesFound||0) + (s.developmentFilesFound||0) + (s.wellKnownFound||0) + (s.apiEndpointsFound||0)),
                'Sensitive files exposed: ' + (s.securityFilesFound||0),
                'Security headers missing: ' + (s.securityHeadersMissing||0),
                'Technologies detected: ' + (s.technologiesFound||0),
                'Contacts found: ' + (s.contactsFound||0),
                'External resources: ' + (s.externalResourcesFound||0),
                'Cookies: ' + (s.cookiesFound||0),
                'Social media: ' + (s.socialMediaFound||0) + ' platforms',
                ''
            ];

            var sections = [
                { title: 'SENSITIVE FILES (CRITICAL)', data: scanResults.securityFiles, showAll: true },
                { title: 'SECURITY HEADERS', data: scanResults.securityHeaders, showAll: true },
                { title: 'DISCOVERY FILES', data: scanResults.discoveryFiles, showAll: false },
                { title: 'WELL-KNOWN URIS', data: scanResults.wellKnown, showAll: false },
                { title: 'API ENDPOINTS', data: scanResults.apiEndpoints, showAll: false },
                { title: 'DEVELOPMENT FILES', data: scanResults.developmentFiles, showAll: false },
                { title: 'TECHNOLOGIES', data: scanResults.technologies, showAll: false },
                { title: 'META INFORMATION', data: scanResults.metaInfo, showAll: false },
                { title: 'COOKIES', data: scanResults.cookies, showAll: false },
                { title: 'SOCIAL MEDIA', data: scanResults.socialMedia, showAll: false },
                { title: 'CONTACTS', data: scanResults.contacts, showAll: false },
                { title: 'EXTERNAL RESOURCES', data: scanResults.externalResources, showAll: false }
            ];

            sections.forEach(function(section) {
                if (!section.data || section.data.length === 0) return;
                var items = section.showAll ? section.data : section.data.filter(function(i) { return i.found; });
                if (items.length === 0) return;
                lines.push('-'.repeat(40));
                lines.push(section.title);
                lines.push('-'.repeat(40));
                items.forEach(function(item) {
                    var status = item.found ? '[FOUND]' : '[MISSING]';
                    lines.push(status + ' ' + item.name + (item.value ? ' = ' + item.value : '') + (item.description ? '  (' + item.description + ')' : ''));
                });
                lines.push('');
            });

            lines.push('='.repeat(60));
            lines.push('End of Report');
            downloadFile(lines.join('\n'), 'website-recon-' + getHostname() + '-' + getDateStamp() + '.txt', 'text/plain');
        }

        function exportJSON() {
            var data = {
                metadata: { tool: CONFIG.name, version: CONFIG.version, target: currentTarget, timestamp: new Date().toISOString() },
                summary: scanResults.summary,
                results: {
                    securityFiles: scanResults.securityFiles.filter(function(i) { return i.found; }),
                    securityHeaders: scanResults.securityHeaders,
                    discoveryFiles: scanResults.discoveryFiles.filter(function(i) { return i.found; }),
                    wellKnown: scanResults.wellKnown.filter(function(i) { return i.found; }),
                    apiEndpoints: scanResults.apiEndpoints.filter(function(i) { return i.found; }),
                    developmentFiles: scanResults.developmentFiles.filter(function(i) { return i.found; }),
                    technologies: scanResults.technologies,
                    metaInfo: scanResults.metaInfo,
                    cookies: scanResults.cookies,
                    socialMedia: scanResults.socialMedia,
                    contacts: scanResults.contacts,
                    externalResources: scanResults.externalResources
                }
            };
            downloadFile(JSON.stringify(data, null, 2), 'website-recon-' + getHostname() + '-' + getDateStamp() + '.json', 'application/json');
        }

        function exportHTML() {
            var s = scanResults.summary;
            var parts = [];
            parts.push('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Recon Report - ' + escapeText(currentTarget) + '</title>');
            parts.push('<style>body{font-family:sans-serif;max-width:900px;margin:40px auto;padding:20px;color:#1e293b;line-height:1.6}h1{border-bottom:2px solid #3b82f6;padding-bottom:8px}h2{color:#334155;margin-top:30px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{text-align:left;padding:8px 12px;border:1px solid #e2e8f0}th{background:#f1f5f9;font-weight:600}.found{color:#16a34a}.missing{color:#dc2626}.critical{background:#fef2f2;color:#991b1b;font-weight:700}.summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0}.summary-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;text-align:center}.summary-number{font-size:28px;font-weight:700}.meta{color:#64748b;font-size:14px;margin:4px 0}</style></head><body>');
            parts.push('<h1>Website Reconnaissance Report</h1>');
            parts.push('<p class="meta">Target: <strong>' + escapeText(currentTarget) + '</strong></p>');
            parts.push('<p class="meta">Date: ' + escapeText(new Date().toLocaleString()) + '</p>');
            parts.push('<p class="meta">Scanner: Website Recon Scanner v' + CONFIG.version + '</p>');
            parts.push('<div class="summary-grid">');
            parts.push('<div class="summary-card"><div class="summary-number">' + ((s.discoveryFilesFound||0)+(s.developmentFilesFound||0)+(s.wellKnownFound||0)+(s.apiEndpointsFound||0)) + '</div><div>Files Found</div></div>');
            parts.push('<div class="summary-card"><div class="summary-number" style="color:#dc2626">' + (s.securityFilesFound||0) + '</div><div>Sensitive Exposed</div></div>');
            parts.push('<div class="summary-card"><div class="summary-number">' + (s.technologiesFound||0) + '</div><div>Technologies</div></div>');
            parts.push('</div>');

            function renderTable(title, data, showAll) {
                if (!data || data.length === 0) return '';
                var items = showAll ? data : data.filter(function(i) { return i.found; });
                if (items.length === 0) return '';
                var t = '<h2>' + escapeText(title) + '</h2><table><tr><th>Status</th><th>Name</th><th>Details</th></tr>';
                items.forEach(function(item) {
                    var cls = item.found ? 'found' : (item.critical ? 'critical' : 'missing');
                    var status = item.found ? 'Found' : 'Missing';
                    var isSensitive = title.indexOf('Sensitive') >= 0 && item.found;
                    t += '<tr class="' + (isSensitive ? 'critical' : '') + '"><td class="' + cls + '">' + status + '</td><td>' + escapeText(item.name) + '</td><td>' + escapeText(item.value || item.description || '') + '</td></tr>';
                });
                return t + '</table>';
            }

            parts.push(renderTable('Sensitive Files', scanResults.securityFiles, true));
            parts.push(renderTable('Security Headers', scanResults.securityHeaders, true));
            parts.push(renderTable('Discovery Files', scanResults.discoveryFiles, false));
            parts.push(renderTable('Technologies', scanResults.technologies, false));
            parts.push(renderTable('Meta Information', scanResults.metaInfo, false));
            parts.push(renderTable('Contacts', scanResults.contacts, false));
            parts.push(renderTable('Social Media', scanResults.socialMedia, false));
            parts.push(renderTable('External Resources', scanResults.externalResources, false));
            parts.push('<hr><p class="meta" style="text-align:center">Generated by Website Recon Scanner v' + CONFIG.version + '</p></body></html>');

            downloadFile(parts.join(''), 'website-recon-' + getHostname() + '-' + getDateStamp() + '.html', 'text/html');
        }

        // ===================== MAIN SCAN =====================

        async function startScan() {
            abortScan = false;
            var scanBtn = popupDoc.getElementById('startScanBtn');
            var stopBtn = popupDoc.getElementById('stopScanBtn');
            var progressSection = popupDoc.querySelector('.progress-section');

            if (scanBtn) scanBtn.disabled = true;
            if (stopBtn) stopBtn.style.display = 'inline-block';
            if (progressSection) progressSection.style.display = 'block';

            scanResults = {
                discoveryFiles: [], developmentFiles: [], wellKnown: [],
                apiEndpoints: [], securityFiles: [], metaInfo: [],
                technologies: [], securityHeaders: [], cookies: [],
                socialMedia: [], externalResources: [], contacts: [],
                summary: {}
            };

            try {
                updateProgress(0, 'Starting reconnaissance...');
                await scanFiles(securityFiles, 0, 20, 'securityFiles');
                if (!abortScan) await scanFiles(discoveryFiles, 20, 40, 'discoveryFiles');
                if (!abortScan) await scanFiles(wellKnownFiles, 40, 55, 'wellKnown');
                if (!abortScan) await scanFiles(apiEndpoints, 55, 72, 'apiEndpoints');
                if (!abortScan) await scanFiles(developmentFiles, 72, 84, 'developmentFiles');
                if (!abortScan) analyzeSecurityHeaders();
                if (!abortScan) extractMetaInfo();
                if (!abortScan) extractTechnologies();
                if (!abortScan) extractCookies();
                if (!abortScan) extractSocialMedia();
                if (!abortScan) extractContacts();
                if (!abortScan) extractExternalResources();
                updateProgress(100, abortScan ? 'Scan stopped.' : 'Scan complete!');
                renderResults();
                popupDoc.querySelectorAll('.btn-export').forEach(function(btn) { btn.disabled = false; });
            } catch(error) {
                updateProgress(100, 'Scan error: ' + error.message);
            } finally {
                if (scanBtn) scanBtn.disabled = false;
                if (stopBtn) stopBtn.style.display = 'none';
            }
        }

        // ===================== BUILD UI =====================

        var container = popupDoc.createElement('div');
        container.className = 'container';

        var headerDiv = popupDoc.createElement('div');
        headerDiv.className = 'header';
        var h1 = popupDoc.createElement('h1');
        h1.textContent = 'Website Recon Scanner v' + CONFIG.version;
        var targetDiv = popupDoc.createElement('div');
        targetDiv.className = 'target';
        targetDiv.textContent = 'Target: ';
        var targetLink = popupDoc.createElement('a');
        targetLink.href = currentTarget;
        targetLink.target = '_blank';
        targetLink.textContent = currentTarget;
        targetDiv.appendChild(targetLink);
        headerDiv.appendChild(h1);
        headerDiv.appendChild(targetDiv);
        container.appendChild(headerDiv);

        // Summary grid
        var summaryGrid = popupDoc.createElement('div');
        summaryGrid.className = 'summary-grid';
        var summaryLabels = ['Files Found', 'Sensitive Exposed', 'Headers Missing', 'Technologies', 'Contacts', 'External Resources'];
        summaryLabels.forEach(function(label) {
            var card = popupDoc.createElement('div');
            card.className = 'summary-card';
            var num = popupDoc.createElement('div');
            num.className = 'summary-number';
            num.textContent = '-';
            var lbl = popupDoc.createElement('div');
            lbl.className = 'summary-label';
            lbl.textContent = label;
            card.appendChild(num);
            card.appendChild(lbl);
            summaryGrid.appendChild(card);
        });
        container.appendChild(summaryGrid);

        // Controls
        var controls = popupDoc.createElement('div');
        controls.className = 'controls';

        var scanBtn = popupDoc.createElement('button');
        scanBtn.className = 'btn btn-scan';
        scanBtn.id = 'startScanBtn';
        scanBtn.textContent = 'Start Scan';
        controls.appendChild(scanBtn);

        var stopBtn = popupDoc.createElement('button');
        stopBtn.className = 'btn btn-stop';
        stopBtn.id = 'stopScanBtn';
        stopBtn.style.display = 'none';
        stopBtn.textContent = 'Stop';
        controls.appendChild(stopBtn);

        ['TXT', 'JSON', 'HTML'].forEach(function(fmt) {
            var btn = popupDoc.createElement('button');
            btn.className = 'btn btn-export';
            btn.setAttribute('data-format', fmt.toLowerCase());
            btn.disabled = true;
            btn.textContent = 'Export ' + fmt;
            controls.appendChild(btn);
        });
        container.appendChild(controls);

        // Progress
        var progressSection = popupDoc.createElement('div');
        progressSection.className = 'progress-section';
        var progressText = popupDoc.createElement('div');
        progressText.className = 'progress-text';
        progressText.textContent = 'Ready to scan...';
        var progressBarBg = popupDoc.createElement('div');
        progressBarBg.className = 'progress-bar-bg';
        var progressBarFill = popupDoc.createElement('div');
        progressBarFill.className = 'progress-bar-fill';
        progressBarBg.appendChild(progressBarFill);
        progressSection.appendChild(progressText);
        progressSection.appendChild(progressBarBg);
        container.appendChild(progressSection);

        // Results area
        var resultsArea = popupDoc.createElement('div');
        resultsArea.id = 'resultsArea';
        container.appendChild(resultsArea);

        // Footer
        var footer = popupDoc.createElement('div');
        footer.className = 'footer';
        footer.textContent = 'Website Recon Scanner v' + CONFIG.version + ' | Local Processing Only | No External Calls';
        container.appendChild(footer);

        popupDoc.body.appendChild(container);

        // Event listeners
        scanBtn.addEventListener('click', startScan);
        stopBtn.addEventListener('click', function() { abortScan = true; });

        popupDoc.querySelectorAll('.btn-export').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var format = this.getAttribute('data-format');
                if (format === 'txt') exportTXT();
                else if (format === 'json') exportJSON();
                else if (format === 'html') exportHTML();
            });
        });

        window.websiteReconScanner.focus();

    } catch(error) {
        console.error('Website Recon Scanner Error:', error);
        alert('Error: ' + error.message);
        if (window.websiteReconScanner) {
            try { window.websiteReconScanner.close(); } catch(e) {}
            window.websiteReconScanner = null;
        }
    }
})();
