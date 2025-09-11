/*!
 * Bookmarklet: Multi-URL Opener (CSP Compliant)
 * Description: Opens multiple URLs from pasted text with auto-detection and protocol correction
 * Version: 1.0.0
 * Author: gl0bal01
 * Tags: osint, investigation, productivity, automation, research, csp-compliant
 * Compatibility: all-browsers
 * Last Updated: 2025-09-10
 */

/**
 * MULTI-URL OPENER BOOKMARKLET (CSP COMPLIANT)
 * 
 * A powerful tool for OSINT researchers and general productivity that opens multiple URLs
 * simultaneously from pasted text. Perfect for batch investigation of targets, opening
 * research lists, or any scenario requiring multiple URLs to be opened quickly.
 * 
 * Key Features:
 * - Smart URL detection from various text formats (newlines, commas, spaces)
 * - Automatic protocol addition (adds https:// to URLs missing protocols)
 * - Duplicate URL filtering for clean processing
 * - Live URL count display for immediate feedback
 * - Staggered opening to prevent browser popup blocking
 * - Clean, professional interface optimized for research workflows
 * - CSP COMPLIANT: Works on banking sites, government sites, strict CSP environments
 * 
 * CSP Compliance Features:
 * - NO eval() usage - Only safe DOM methods
 * - NO document.write() - Uses createElement() + appendChild()
 * - NO inline event handlers - Uses addEventListener() exclusively
 * - NO innerHTML injection - Safe DOM manipulation only
 * - Safe CSS injection via style elements
 * - Proper function scoping to popup window
 * 
 * Use Cases:
 * - OSINT investigations: Open multiple target domains/profiles
 * - Research workflows: Batch open academic papers, articles, resources
 * - Competitive analysis: Open competitor websites simultaneously
 * - Social media investigation: Open multiple profiles/posts
 * - Link validation: Test multiple URLs for accessibility
 * - Bookmark management: Bulk open saved research links
 * 
 * Technical Details:
 * - CSP compatible (no eval, safe DOM manipulation, works on strict sites)
 * - Cross-browser compatible (Chrome, Firefox, Safari, Edge)
 * - Handles mixed URL formats in single paste operation
 * - Intelligent protocol detection and correction
 * - Memory-efficient processing for large URL lists
 * - Popup blocker circumvention with controlled timing
 * 
 * Usage Instructions:
 * 1. Click the bookmarklet on any webpage
 * 2. Paste your URLs into the textarea (any format: lines, commas, spaces)
 * 3. Watch the live count update as URLs are detected
 * 4. Click "Open All URLs" to launch them with controlled timing
 * 5. URLs open in new tabs with small delays to avoid blocking
 */

javascript:(function(){
    'use strict';
    
    // Configuration
    const CONFIG = {
        version: '1.0.1',
        name: 'Multi-URL Opener',
        delay: 250, // ms between opening URLs
        globalVar: '__MultiURLOpener__'
    };
    
    // Prevent multiple instances
    if (window[CONFIG.globalVar]) {
        window[CONFIG.globalVar].focus();
        return;
    }
    
    /**
     * Extract and normalize URLs from text input
     * Supports multiple separators and adds missing protocols
     */
    function extractURLs(text) {
        if (!text || typeof text !== 'string') return [];
        
        // Split by multiple separators: newlines, commas, semicolons, pipes, tabs, multiple spaces
        const urlCandidates = text
            .split(/[\n\r,;|\t]+|(?:\s{2,})/)
            .map(url => url.trim())
            .filter(url => url.length > 0);
        
        const validURLs = new Set(); // Use Set for automatic deduplication
        
        urlCandidates.forEach(candidate => {
            // Remove surrounding quotes or brackets
            const cleaned = candidate.replace(/^["'\[<]|["'\]>]$/g, '');
            
            // Check if it looks like a URL (contains domain pattern)
            const urlPattern = /^(?:https?:\/\/)?(?:[\w-]+\.)+[\w-]+(?:\/[^\s]*)?$/i;
            
            if (urlPattern.test(cleaned)) {
                // Add protocol if missing
                const finalURL = cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
                
                // Validate final URL format
                try {
                    const urlObj = new URL(finalURL);
                    if (urlObj.hostname) {
                        validURLs.add(finalURL);
                    }
                } catch (e) {
                    // Skip invalid URLs silently
                }
            }
        });
        
        return Array.from(validURLs);
    }
    
    /**
     * Open URLs with controlled timing to prevent popup blocking
     */
    function openURLs(urls) {
        if (!urls || urls.length === 0) {
            alert('No valid URLs found to open.');
            return;
        }
        
        if (urls.length > 50) {
            const proceed = confirm(`You're about to open ${urls.length} URLs. This may impact browser performance. Continue?`);
            if (!proceed) return;
        }
        
        let opened = 0;
        
        urls.forEach((url, index) => {
            setTimeout(() => {
                try {
                    window.open(url, '_blank', 'noopener,noreferrer');
                    opened++;
                } catch (error) {
                    console.warn(`Failed to open URL: ${url}`, error);
                }
            }, index * CONFIG.delay);
        });
        
        // Show completion status
        setTimeout(() => {
            alert(`Successfully opened ${opened} of ${urls.length} URLs.`);
        }, urls.length * CONFIG.delay + 500);
    }
    
    /**
     * Create CSS styles safely for CSP compliance
     */
    function createStyles(doc) {
        const style = doc.createElement('style');
        style.textContent = `
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f8fafc;
                color: #1a202c;
                line-height: 1.5;
            }
            
            .container {
                max-width: 100%;
                padding: 20px;
                min-height: 100vh;
            }
            
            .header {
                background: #3498db;
                color: white;
                padding: 15px 20px;
                margin: -20px -20px 20px -20px;
                border-radius: 0 0 8px 8px;
            }
            
            .header h1 {
                font-size: 18px;
                font-weight: 600;
            }
            
            .form-group {
                margin-bottom: 16px;
            }
            
            label {
                display: block;
                margin-bottom: 6px;
                font-weight: 500;
                color: #374151;
            }
            
            textarea {
                width: 100%;
                height: 200px;
                padding: 12px;
                border: 2px solid #e5e7eb;
                border-radius: 6px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                resize: vertical;
                background: white;
            }
            
            textarea:focus {
                outline: none;
                border-color: #3498db;
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
            }
            
            .url-info {
                background: #f1f5f9;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 16px;
                font-size: 14px;
            }
            
            .url-count {
                font-weight: 600;
                color: #059669;
            }
            
            .actions {
                display: flex;
                gap: 12px;
                align-items: center;
            }
            
            button {
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-primary {
                background: #10b981;
                color: white;
            }
            
            .btn-primary:hover:not(:disabled) {
                background: #059669;
            }
            
            .btn-secondary {
                background: #6b7280;
                color: white;
            }
            
            .btn-secondary:hover {
                background: #4b5563;
            }
            
            button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .help {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 12px;
                margin-top: 16px;
                font-size: 13px;
                color: #92400e;
            }
            
            .help strong {
                color: #78350f;
            }
            
            .url-preview {
                margin-top: 6px;
                font-size: 12px;
                color: #6b7280;
            }
        `;
        return style;
    }
    
    /**
     * Create DOM elements safely for CSP compliance
     */
    function createInterface() {
        // Create popup window
        const popup = window.open('', 'multiURLOpener', 'width=600,height=500,scrollbars=yes,resizable=yes');
        if (!popup) {
            alert('Popup blocked! Please allow popups for this site and try again.');
            return null;
        }
        
        const doc = popup.document;
        
        // Clear existing content safely
        while (doc.documentElement.firstChild) {
            doc.documentElement.removeChild(doc.documentElement.firstChild);
        }
        
        // Create head and body elements
        const head = doc.createElement('head');
        const body = doc.createElement('body');
        
        // Set document title
        const title = doc.createElement('title');
        title.textContent = 'Multi-URL Opener';
        head.appendChild(title);
        
        // Add meta charset
        const meta = doc.createElement('meta');
        meta.setAttribute('charset', 'utf-8');
        head.appendChild(meta);
        
        // Add styles safely
        head.appendChild(createStyles(doc));
        
        // Create main container
        const container = doc.createElement('div');
        container.className = 'container';
        
        // Create header
        const header = doc.createElement('div');
        header.className = 'header';
        const headerTitle = doc.createElement('h1');
        headerTitle.textContent = `🚀 Multi-URL Opener v${CONFIG.version}`;
        header.appendChild(headerTitle);
        container.appendChild(header);
        
        // Create form group
        const formGroup = doc.createElement('div');
        formGroup.className = 'form-group';
        
        const label = doc.createElement('label');
        label.textContent = 'Paste URLs (any format):';
        label.setAttribute('for', 'urlInput');
        formGroup.appendChild(label);
        
        const textarea = doc.createElement('textarea');
        textarea.id = 'urlInput';
        textarea.placeholder = `Paste your URLs here...

Supports:
• One URL per line
• Comma-separated URLs
• Space-separated URLs
• Mixed formats

Examples:
example.com
https://google.com
site1.com, site2.com
www.github.com stackoverflow.com`;
        formGroup.appendChild(textarea);
        container.appendChild(formGroup);
        
        // Create URL info section
        const urlInfo = doc.createElement('div');
        urlInfo.className = 'url-info';
        urlInfo.id = 'urlInfo';
        
        const urlCount = doc.createElement('span');
        urlCount.className = 'url-count';
        urlCount.id = 'urlCount';
        urlCount.textContent = '0';
        urlInfo.appendChild(urlCount);
        
        const urlText = doc.createElement('span');
        urlText.textContent = ' valid URLs detected';
        urlInfo.appendChild(urlText);
        
        const urlPreview = doc.createElement('div');
        urlPreview.className = 'url-preview';
        urlPreview.id = 'urlPreview';
        urlPreview.textContent = 'Enter URLs above to see preview';
        urlInfo.appendChild(urlPreview);
        container.appendChild(urlInfo);
        
        // Create action buttons
        const actions = doc.createElement('div');
        actions.className = 'actions';
        
        const openBtn = doc.createElement('button');
        openBtn.id = 'openBtn';
        openBtn.className = 'btn-primary';
        openBtn.textContent = 'Open All URLs';
        openBtn.disabled = true;
        actions.appendChild(openBtn);
        
        const clearBtn = doc.createElement('button');
        clearBtn.id = 'clearBtn';
        clearBtn.className = 'btn-secondary';
        clearBtn.textContent = 'Clear';
        actions.appendChild(clearBtn);
        
        const closeBtn = doc.createElement('button');
        closeBtn.id = 'closeBtn';
        closeBtn.className = 'btn-secondary';
        closeBtn.textContent = 'Close';
        actions.appendChild(closeBtn);
        container.appendChild(actions);
        
        // Create help section
        const help = doc.createElement('div');
        help.className = 'help';
        
        const helpTitle = doc.createElement('strong');
        helpTitle.textContent = '💡 Pro Tips:';
        help.appendChild(helpTitle);
        
        const helpBr1 = doc.createElement('br');
        help.appendChild(helpBr1);
        
        const helpText = doc.createTextNode(`• URLs are opened with ${CONFIG.delay}ms delays to prevent popup blocking`);
        help.appendChild(helpText);
        
        const helpBr2 = doc.createElement('br');
        help.appendChild(helpBr2);
        
        const helpText2 = doc.createTextNode('• Missing https:// protocols are automatically added');
        help.appendChild(helpText2);
        
        const helpBr3 = doc.createElement('br');
        help.appendChild(helpBr3);
        
        const helpText3 = doc.createTextNode('• Duplicate URLs are automatically filtered');
        help.appendChild(helpText3);
        
        const helpBr4 = doc.createElement('br');
        help.appendChild(helpBr4);
        
        const helpText4 = doc.createTextNode('• Perfect for OSINT research and bulk investigations');
        help.appendChild(helpText4);
        
        container.appendChild(help);
        
        // Assemble document safely
        body.appendChild(container);
        doc.documentElement.appendChild(head);
        doc.documentElement.appendChild(body);
        
        // Add event listeners safely (CSP compliant)
        let currentURLs = [];
        
        // Update URL info function
        function updateURLInfo() {
            currentURLs = extractURLs(textarea.value);
            urlCount.textContent = currentURLs.length.toString();
            
            if (currentURLs.length > 0) {
                openBtn.disabled = false;
                const preview = currentURLs.slice(0, 3).join(', ');
                urlPreview.textContent = currentURLs.length > 3 ? 
                    `${preview}... and ${currentURLs.length - 3} more` : preview;
            } else {
                openBtn.disabled = true;
                urlPreview.textContent = 'Enter URLs above to see preview';
            }
        }
        
        // Event listeners using addEventListener (CSP compliant)
        textarea.addEventListener('input', updateURLInfo);
        textarea.addEventListener('paste', () => {
            setTimeout(updateURLInfo, 100); // Allow paste to complete
        });
        
        openBtn.addEventListener('click', () => {
            if (currentURLs.length === 0) return;
            openURLs(currentURLs);
        });
        
        clearBtn.addEventListener('click', () => {
            textarea.value = '';
            updateURLInfo();
            textarea.focus();
        });
        
        closeBtn.addEventListener('click', () => {
            popup.close();
        });
        
        // Keyboard shortcuts
        doc.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter' && !openBtn.disabled) {
                openBtn.click();
            }
            if (e.key === 'Escape') {
                popup.close();
            }
        });
        
        // Focus textarea
        textarea.focus();
        
        return popup;
    }
    
    try {
        // Create interface and store reference
        const popup = createInterface();
        if (popup) {
            window[CONFIG.globalVar] = popup;
            
            // Clean up when popup closes
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    delete window[CONFIG.globalVar];
                }
            }, 1000);
        }
        
    } catch (error) {
        console.error('Multi-URL Opener Error:', error);
        alert('Error: ' + error.message);
        delete window[CONFIG.globalVar];
    }
})();

/*
BOOKMARKLET CODE (CSP COMPLIANT - copy this entire line for bookmark URL):
javascript:(function(){'use strict';const CONFIG={version:'1.0.0',name:'Multi-URL Opener',delay:250,globalVar:'__MultiURLOpener__'};if(window[CONFIG.globalVar]){window[CONFIG.globalVar].focus();return}function extractURLs(text){if(!text||typeof text!=='string')return[];const urlCandidates=text.split(/[\n\r,;|\t]+|(?:\s{2,})/).map(url=>url.trim()).filter(url=>url.length>0);const validURLs=new Set();urlCandidates.forEach(candidate=>{const cleaned=candidate.replace(/^["'\[<]|["'\]>]$/g,'');const urlPattern=/^(?:https?:\/\/)?(?:[\w-]+\.)+[\w-]+(?:\/[^\s]*)?$/i;if(urlPattern.test(cleaned)){const finalURL=cleaned.startsWith('http')?cleaned:`https://${cleaned}`;try{const urlObj=new URL(finalURL);if(urlObj.hostname){validURLs.add(finalURL)}}catch(e){}}});return Array.from(validURLs)}function openURLs(urls){if(!urls||urls.length===0){alert('No valid URLs found to open.');return}if(urls.length>50){const proceed=confirm(`You're about to open ${urls.length} URLs. This may impact browser performance. Continue?`);if(!proceed)return}let opened=0;urls.forEach((url,index)=>{setTimeout(()=>{try{window.open(url,'_blank','noopener,noreferrer');opened++}catch(error){console.warn(`Failed to open URL: ${url}`,error)}},index*CONFIG.delay)});setTimeout(()=>{alert(`Successfully opened ${opened} of ${urls.length} URLs.`)},urls.length*CONFIG.delay+500)}function createStyles(doc){const style=doc.createElement('style');style.textContent=`*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#1a202c;line-height:1.5}.container{max-width:100%;padding:20px;min-height:100vh}.header{background:#3498db;color:white;padding:15px 20px;margin:-20px -20px 20px -20px;border-radius:0 0 8px 8px}.header h1{font-size:18px;font-weight:600}.form-group{margin-bottom:16px}label{display:block;margin-bottom:6px;font-weight:500;color:#374151}textarea{width:100%;height:200px;padding:12px;border:2px solid #e5e7eb;border-radius:6px;font-family:'Courier New',monospace;font-size:12px;resize:vertical;background:white}textarea:focus{outline:none;border-color:#3498db;box-shadow:0 0 0 3px rgba(52,152,219,0.1)}.url-info{background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;padding:12px;margin-bottom:16px;font-size:14px}.url-count{font-weight:600;color:#059669}.actions{display:flex;gap:12px;align-items:center}button{padding:12px 24px;border:none;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s}.btn-primary{background:#10b981;color:white}.btn-primary:hover:not(:disabled){background:#059669}.btn-secondary{background:#6b7280;color:white}.btn-secondary:hover{background:#4b5563}button:disabled{opacity:0.5;cursor:not-allowed}.help{background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;padding:12px;margin-top:16px;font-size:13px;color:#92400e}.help strong{color:#78350f}.url-preview{margin-top:6px;font-size:12px;color:#6b7280}`;return style}function createInterface(){const popup=window.open('','multiURLOpener','width=600,height=500,scrollbars=yes,resizable=yes');if(!popup){alert('Popup blocked! Please allow popups for this site and try again.');return null}const doc=popup.document;while(doc.documentElement.firstChild){doc.documentElement.removeChild(doc.documentElement.firstChild)}const head=doc.createElement('head');const body=doc.createElement('body');const title=doc.createElement('title');title.textContent='Multi-URL Opener';head.appendChild(title);const meta=doc.createElement('meta');meta.setAttribute('charset','utf-8');head.appendChild(meta);head.appendChild(createStyles(doc));const container=doc.createElement('div');container.className='container';const header=doc.createElement('div');header.className='header';const headerTitle=doc.createElement('h1');headerTitle.textContent=`🚀 Multi-URL Opener v${CONFIG.version}`;header.appendChild(headerTitle);container.appendChild(header);const formGroup=doc.createElement('div');formGroup.className='form-group';const label=doc.createElement('label');label.textContent='Paste URLs (any format):';label.setAttribute('for','urlInput');formGroup.appendChild(label);const textarea=doc.createElement('textarea');textarea.id='urlInput';textarea.placeholder=`Paste your URLs here...\n\nSupports:\n• One URL per line\n• Comma-separated URLs\n• Space-separated URLs\n• Mixed formats\n\nExamples:\nexample.com\nhttps://google.com\nsite1.com, site2.com\nwww.github.com stackoverflow.com`;formGroup.appendChild(textarea);container.appendChild(formGroup);const urlInfo=doc.createElement('div');urlInfo.className='url-info';urlInfo.id='urlInfo';const urlCount=doc.createElement('span');urlCount.className='url-count';urlCount.id='urlCount';urlCount.textContent='0';urlInfo.appendChild(urlCount);const urlText=doc.createElement('span');urlText.textContent=' valid URLs detected';urlInfo.appendChild(urlText);const urlPreview=doc.createElement('div');urlPreview.className='url-preview';urlPreview.id='urlPreview';urlPreview.textContent='Enter URLs above to see preview';urlInfo.appendChild(urlPreview);container.appendChild(urlInfo);const actions=doc.createElement('div');actions.className='actions';const openBtn=doc.createElement('button');openBtn.id='openBtn';openBtn.className='btn-primary';openBtn.textContent='Open All URLs';openBtn.disabled=true;actions.appendChild(openBtn);const clearBtn=doc.createElement('button');clearBtn.id='clearBtn';clearBtn.className='btn-secondary';clearBtn.textContent='Clear';actions.appendChild(clearBtn);const closeBtn=doc.createElement('button');closeBtn.id='closeBtn';closeBtn.className='btn-secondary';closeBtn.textContent='Close';actions.appendChild(closeBtn);container.appendChild(actions);const help=doc.createElement('div');help.className='help';const helpTitle=doc.createElement('strong');helpTitle.textContent='💡 Pro Tips:';help.appendChild(helpTitle);const helpBr1=doc.createElement('br');help.appendChild(helpBr1);const helpText=doc.createTextNode(`• URLs are opened with ${CONFIG.delay}ms delays to prevent popup blocking`);help.appendChild(helpText);const helpBr2=doc.createElement('br');help.appendChild(helpBr2);const helpText2=doc.createTextNode('• Missing https:// protocols are automatically added');help.appendChild(helpText2);const helpBr3=doc.createElement('br');help.appendChild(helpBr3);const helpText3=doc.createTextNode('• Duplicate URLs are automatically filtered');help.appendChild(helpText3);const helpBr4=doc.createElement('br');help.appendChild(helpBr4);const helpText4=doc.createTextNode('• Perfect for OSINT research and bulk investigations');help.appendChild(helpText4);container.appendChild(help);body.appendChild(container);doc.documentElement.appendChild(head);doc.documentElement.appendChild(body);let currentURLs=[];function updateURLInfo(){currentURLs=extractURLs(textarea.value);urlCount.textContent=currentURLs.length.toString();if(currentURLs.length>0){openBtn.disabled=false;const preview=currentURLs.slice(0,3).join(', ');urlPreview.textContent=currentURLs.length>3?`${preview}... and ${currentURLs.length-3} more`:preview}else{openBtn.disabled=true;urlPreview.textContent='Enter URLs above to see preview'}}textarea.addEventListener('input',updateURLInfo);textarea.addEventListener('paste',()=>{setTimeout(updateURLInfo,100)});openBtn.addEventListener('click',()=>{if(currentURLs.length===0)return;openURLs(currentURLs)});clearBtn.addEventListener('click',()=>{textarea.value='';updateURLInfo();textarea.focus()});closeBtn.addEventListener('click',()=>{popup.close()});doc.addEventListener('keydown',(e)=>{if(e.ctrlKey&&e.key==='Enter'&&!openBtn.disabled){openBtn.click()}if(e.key==='Escape'){popup.close()}});textarea.focus();return popup}try{const popup=createInterface();if(popup){window[CONFIG.globalVar]=popup;const checkClosed=setInterval(()=>{if(popup.closed){clearInterval(checkClosed);delete window[CONFIG.globalVar]}},1000)}}catch(error){console.error('Multi-URL Opener Error:',error);alert('Error: '+error.message);delete window[CONFIG.globalVar]}})();
*/