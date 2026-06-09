/*!
 * Bookmarklet: Domain TLD Scanner
 * Description: Expand a base name across hundreds of TLDs and resolve each via public DoH to show which are registered, with recheck links
 * Version: 1.0.0
 * Author: gl0bal01
 * Tags: osint, investigation, reconnaissance, domain, tld, dns, enumeration, security
 * Compatibility: all-browsers
 * Last Updated: 2026-06-09
 * Network: Unlike the other tools here, this one DOES make external calls — it
 *          sends each candidate domain name to a public DoH resolver
 *          (Cloudflare or Google) to check DNS. Nothing else leaves the browser.
 */

javascript:(function(){
    'use strict';

    // Configuration
    const CONFIG = {
        version: '1.0.0',
        name: 'Domain TLD Scanner',
        popupId: 'osint-domain-tld-scan-' + Date.now()
    };

    // Prevent multiple instances
    if(window.__DomainTLDScan__){
        try{
            window.__DomainTLDScan__.focus();
            return;
        }catch(e){
            // Popup was closed, continue
        }
    }

    // Embedded TLD snapshot (static — no IANA fetch). Custom box covers anything missing.
    const TLD_GTLD = ['com','net','org','info','biz','co','io','ai','app','dev','xyz','online','site','tech','store','shop','blog','me','tv','cc','name','pro','mobi','club','live','life','world','today','news','media','cloud','digital','email','link','fun','space','website','host','press','wiki','zone','agency','studio','design','art','vip','top','icu','cyou','gg','sh','ws','to'];
    const TLD_CCTLD = ['ac','ad','ae','af','ag','ai','al','am','ao','aq','ar','as','at','au','aw','ax','az','ba','bb','bd','be','bf','bg','bh','bi','bj','bm','bn','bo','br','bs','bt','bw','by','bz','ca','cc','cd','cf','cg','ch','ci','ck','cl','cm','cn','co','cr','cu','cv','cw','cx','cy','cz','de','dj','dk','dm','do','dz','ec','ee','eg','er','es','et','eu','fi','fj','fk','fm','fo','fr','ga','gb','gd','ge','gf','gg','gh','gi','gl','gm','gn','gp','gq','gr','gs','gt','gu','gw','gy','hk','hm','hn','hr','ht','hu','id','ie','il','im','in','io','iq','ir','is','it','je','jm','jo','jp','ke','kg','kh','ki','km','kn','kp','kr','kw','ky','kz','la','lb','lc','li','lk','lr','ls','lt','lu','lv','ly','ma','mc','md','me','mg','mh','mk','ml','mm','mn','mo','mp','mq','mr','ms','mt','mu','mv','mw','mx','my','mz','na','nc','ne','nf','ng','ni','nl','no','np','nr','nu','nz','om','pa','pe','pf','pg','ph','pk','pl','pm','pn','pr','ps','pt','pw','py','qa','re','ro','rs','ru','rw','sa','sb','sc','sd','se','sg','sh','si','sk','sl','sm','sn','so','sr','ss','st','su','sv','sx','sy','sz','tc','td','tf','tg','th','tj','tk','tl','tm','tn','to','tr','tt','tv','tw','tz','ua','ug','uk','us','uy','uz','va','vc','ve','vg','vi','vn','vu','wf','ws','ye','yt','za','zm','zw'];

    // Best-effort base name from the current site (seeds the input only)
    function baseFromHost(){
        try{
            const parts = String(location.hostname || '').split('.').filter(Boolean);
            if(parts.length >= 2){
                return parts[parts.length - 2].toLowerCase().replace(/[^a-z0-9-]/g, '');
            }
        }catch(e){}
        return '';
    }

    const popup = window.open(
        'about:blank',
        CONFIG.popupId,
        'width=900,height=760,resizable=yes,scrollbars=yes,location=no,menubar=no,toolbar=no,status=no'
    );

    if(!popup){
        alert('Popup blocked! Please allow popups for this site and try again.');
        return;
    }

    // Static shell (no untrusted data) — runs in the popup, which is free of the host page CSP.
    const SHELL =
'<!DOCTYPE html><html><head><title>' + CONFIG.name + '</title>' +
'<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'<style>' +
'*{box-sizing:border-box;margin:0;padding:0}' +
'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:20px;min-height:100vh}' +
'.container{max-width:840px;margin:0 auto;background:#1e293b;border-radius:12px;border:1px solid #334155;overflow:hidden}' +
'.header{background:#0f172a;padding:16px 20px;border-bottom:1px solid #334155;display:flex;justify-content:space-between;align-items:center}' +
'.title{font-size:18px;font-weight:600;color:#f1f5f9}' +
'.version{font-size:12px;color:#64748b;background:#374151;padding:2px 8px;border-radius:4px}' +
'.content{padding:24px}' +
'label{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500;color:#cbd5e1;margin-bottom:16px}' +
'input,select{padding:10px 12px;background:#0f172a;border:1px solid #475569;border-radius:8px;color:#f1f5f9;font-size:13px;font-family:inherit}' +
'input:focus,select:focus{outline:none;border-color:#0ea5e9;box-shadow:0 0 0 3px rgba(14,165,233,0.1)}' +
'.row-inline{display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end}' +
'.row-inline label{flex:1;min-width:180px}' +
'.checkbox-group{display:flex;gap:18px;flex-wrap:wrap;margin:4px 0 16px;align-items:center}' +
'.checkbox-item{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:#cbd5e1}' +
'input[type="checkbox"]{width:16px;height:16px;cursor:pointer}' +
'.help-text{font-size:11px;color:#64748b;margin-top:4px}' +
'.button-group{display:flex;gap:12px;margin:16px 0;align-items:center;flex-wrap:wrap}' +
'button{padding:10px 16px;border:none;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:all 0.2s}' +
'.btn-primary{background:#0ea5e9;color:white}.btn-primary:hover{background:#0284c7}' +
'.btn-secondary{background:#475569;color:white}.btn-secondary:hover{background:#64748b}' +
'.btn-secondary:disabled,.btn-primary:disabled{background:#334155;color:#64748b;cursor:not-allowed}' +
'.status{margin-left:auto;font-size:12px;color:#64748b}' +
'.progress{height:6px;background:#0f172a;border-radius:3px;overflow:hidden;margin:8px 0 4px}' +
'.progress-bar{height:100%;width:0;background:#0ea5e9;transition:width 0.2s}' +
'.summary{display:flex;gap:18px;font-size:12px;color:#94a3b8;margin:8px 0 16px;flex-wrap:wrap}' +
'.summary b{color:#f1f5f9}' +
'.results{margin-top:8px}' +
'.section-title{font-size:13px;font-weight:600;color:#cbd5e1;margin:16px 0 8px;display:flex;align-items:center;gap:8px}' +
'.list{border:1px solid #334155;border-radius:8px;background:#0f172a;padding:6px;max-height:240px;overflow-y:auto}' +
'.dom-row{display:flex;align-items:center;gap:10px;padding:5px 8px;border-bottom:1px solid #1e293b;font-size:12px}' +
'.dom-row:last-child{border-bottom:none}' +
'.dom-row .dn{font-family:ui-monospace,"Cascadia Code",Consolas,monospace;color:#e2e8f0;text-decoration:none;flex:1}' +
'.dom-row .dn:hover{color:#7dd3fc}' +
'.badge{font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;letter-spacing:.04em}' +
'.badge.exists{background:#064e3b;color:#6ee7b7}' +
'.badge.available{background:#334155;color:#94a3b8}' +
'.badge.unknown{background:#3f2d12;color:#fbbf24}' +
'.recheck{display:flex;gap:6px}' +
'.recheck a{color:#64748b;text-decoration:none;font-size:11px;border:1px solid #334155;border-radius:4px;padding:1px 6px}' +
'.recheck a:hover{color:#38bdf8;border-color:#0ea5e9}' +
'.empty{color:#64748b;font-size:12px;padding:10px;text-align:center}' +
'.note{font-size:11px;color:#64748b;margin-top:18px;line-height:1.5;border-top:1px solid #334155;padding-top:12px}' +
'.note b{color:#fbbf24}' +
'</style></head><body>' +
'<div class="container">' +
'<div class="header"><div class="title">' + CONFIG.name + '</div><div class="version">v' + CONFIG.version + '</div></div>' +
'<div class="content">' +
'<label>Base name (without extension)' +
'<input type="text" id="baseName" placeholder="example">' +
'<div class="help-text">Second-level label to expand, e.g. "acme" &rarr; acme.com, acme.io, acme.fr ...</div></label>' +
'<div class="checkbox-group">' +
'<label class="checkbox-item"><input type="checkbox" id="useGtld" checked> Popular &amp; new gTLDs</label>' +
'<label class="checkbox-item"><input type="checkbox" id="useCctld" checked> Country codes (ccTLD)</label>' +
'<label class="checkbox-item"><input type="checkbox" id="onlyFound"> Show registered only</label>' +
'</div>' +
'<div class="row-inline">' +
'<label>Custom TLDs (optional)<input type="text" id="customTlds" placeholder="gov.uk, com.au, app"></label>' +
'<label style="flex:0 0 200px">DoH resolver<select id="provider"><option value="cloudflare">Cloudflare</option><option value="google">Google</option></select></label>' +
'</div>' +
'<div class="button-group">' +
'<button class="btn-primary" id="scanBtn">Scan</button>' +
'<button class="btn-secondary" id="stopBtn" disabled>Stop</button>' +
'<button class="btn-secondary" id="copyBtn" disabled>Copy Registered</button>' +
'<button class="btn-secondary" id="downloadBtn" disabled>Download .txt</button>' +
'<div class="status" id="status">Ready</div>' +
'</div>' +
'<div class="progress"><div class="progress-bar" id="progressBar"></div></div>' +
'<div class="summary" id="summary"></div>' +
'<div class="results" id="results"></div>' +
'<div class="note"><b>Heads up:</b> this tool sends each candidate domain to your chosen public DoH resolver (Cloudflare or Google) to check DNS &mdash; it is the one tool in this set that makes external calls. Results show DNS presence, not registration: <b>AVAILABLE</b> = no DNS record (likely unregistered), <b>REGISTERED</b> = resolves in DNS. A registered domain with no nameservers can still read as AVAILABLE, so always use the recheck links (whois / crt.sh / DNS) before acting.</div>' +
'</div></div></body></html>';

    const doc = popup.document;
    doc.open();
    doc.write(SHELL);
    doc.close();

    // Runs INSIDE the popup (CSP-free context). Authored as a real function so
    // .toString() preserves the source verbatim — no manual escaping needed.
    function popupMain(data){
        var PROVIDERS = {
            cloudflare: 'https://cloudflare-dns.com/dns-query',
            google: 'https://dns.google/resolve'
        };
        var POOL = 16;
        var stopFlag = false;
        var registered = [];

        function $(id){ return document.getElementById(id); }
        var el = {
            baseName: $('baseName'), useGtld: $('useGtld'), useCctld: $('useCctld'),
            onlyFound: $('onlyFound'), customTlds: $('customTlds'), provider: $('provider'),
            scanBtn: $('scanBtn'), stopBtn: $('stopBtn'), copyBtn: $('copyBtn'),
            downloadBtn: $('downloadBtn'), status: $('status'), progressBar: $('progressBar'),
            summary: $('summary'), results: $('results')
        };

        function sanitizeBase(str){
            return (typeof str === 'string' ? str : '').trim().toLowerCase()
                .replace(/^https?:\/\//, '').replace(/^www\./, '')
                .replace(/\..*$/, '').replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
        }
        function cleanTld(t){
            return (t || '').trim().toLowerCase().replace(/^\.+/, '').replace(/[^a-z0-9.-]/g, '');
        }
        function mkLink(href, text){
            var a = document.createElement('a');
            a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = text;
            return a;
        }

        function buildDomains(){
            var base = sanitizeBase(el.baseName.value);
            if(!base) return null;
            el.baseName.value = base;
            var tlds = [];
            if(el.useGtld.checked) tlds = tlds.concat(data.gtld);
            if(el.useCctld.checked) tlds = tlds.concat(data.cctld);
            (el.customTlds.value || '').split(/[\s,]+/).forEach(function(t){
                var c = cleanTld(t); if(c) tlds.push(c);
            });
            var seen = {}, domains = [];
            tlds.forEach(function(t){
                if(!t) return;
                var d = base + '.' + t;
                if(!seen[d]){ seen[d] = 1; domains.push(d); }
            });
            return domains.sort();
        }

        async function checkDomain(d, providerUrl){
            try{
                var u = providerUrl + '?name=' + encodeURIComponent(d) + '&type=NS';
                var r = await fetch(u, { headers: { accept: 'application/dns-json' } });
                if(!r.ok) return 'unknown';
                var j = await r.json();
                if(j.Status === 3) return 'available';            // NXDOMAIN
                if(j.Status === 0) return 'exists';               // NOERROR
                return 'unknown';
            }catch(e){
                return 'unknown';
            }
        }

        function addRow(d, status){
            if(el.onlyFound.checked && status !== 'exists') return;
            var row = document.createElement('div');
            row.className = 'dom-row';

            var name = mkLink('https://' + d, d);
            name.className = 'dn';

            var badge = document.createElement('span');
            badge.className = 'badge ' + status;
            badge.textContent = status === 'exists' ? 'REGISTERED' : (status === 'available' ? 'AVAILABLE' : 'UNKNOWN');

            var recheck = document.createElement('div');
            recheck.className = 'recheck';
            recheck.appendChild(mkLink('https://who.is/whois/' + d, 'whois'));
            recheck.appendChild(mkLink('https://crt.sh/?q=' + encodeURIComponent(d), 'crt'));
            recheck.appendChild(mkLink('https://dns.google/query?name=' + encodeURIComponent(d), 'dns'));

            row.appendChild(name);
            row.appendChild(badge);
            row.appendChild(recheck);
            el.results.appendChild(row);
            row.scrollIntoView({ block: 'nearest' });
        }

        function updateSummary(done, total, found, avail, unknown){
            el.progressBar.style.width = (total ? (done / total * 100) : 0) + '%';
            el.summary.innerHTML = '';
            [['Checked', done + ' / ' + total], ['Registered', found], ['Available', avail], ['Unknown', unknown]]
                .forEach(function(pair){
                    var s = document.createElement('span');
                    var b = document.createElement('b');
                    b.textContent = pair[1];
                    s.appendChild(document.createTextNode(pair[0] + ': '));
                    s.appendChild(b);
                    el.summary.appendChild(s);
                });
        }

        async function scan(){
            var domains = buildDomains();
            if(domains === null){ el.status.textContent = 'Input required'; el.summary.textContent = 'Enter a valid base name (letters, digits, hyphen).'; return; }
            if(!domains.length){ el.status.textContent = 'No TLDs'; el.summary.textContent = 'Select a TLD set or add a custom TLD.'; return; }

            var providerUrl = PROVIDERS[el.provider.value] || PROVIDERS.cloudflare;
            stopFlag = false;
            registered = [];
            el.results.innerHTML = '';
            el.scanBtn.disabled = true; el.stopBtn.disabled = false;
            el.copyBtn.disabled = true; el.downloadBtn.disabled = true;
            el.status.textContent = 'Scanning...';

            var i = 0, done = 0, found = 0, avail = 0, unknown = 0;
            var report = [];

            async function worker(){
                while(i < domains.length && !stopFlag){
                    var d = domains[i++];
                    var status = await checkDomain(d, providerUrl);
                    done++;
                    if(status === 'exists'){ found++; registered.push(d); }
                    else if(status === 'available'){ avail++; }
                    else { unknown++; }
                    report.push(status.toUpperCase().padEnd(10) + d);
                    addRow(d, status);
                    updateSummary(done, domains.length, found, avail, unknown);
                }
            }

            var workers = [];
            for(var w = 0; w < POOL; w++) workers.push(worker());
            await Promise.all(workers);

            el.lastReport = report;
            el.scanBtn.disabled = false; el.stopBtn.disabled = true;
            el.copyBtn.disabled = registered.length === 0;
            el.downloadBtn.disabled = done === 0;
            el.status.textContent = stopFlag ? ('Stopped (' + done + '/' + domains.length + ')') : ('Done — ' + found + ' registered');
            if(!el.results.children.length){
                var empty = document.createElement('div');
                empty.className = 'empty';
                empty.textContent = el.onlyFound.checked ? 'No registered domains found.' : 'No results.';
                el.results.appendChild(empty);
            }
        }

        el.scanBtn.onclick = scan;
        el.stopBtn.onclick = function(){ stopFlag = true; el.status.textContent = 'Stopping...'; };
        el.baseName.addEventListener('keydown', function(e){ if(e.key === 'Enter' && !el.scanBtn.disabled) scan(); });
        el.copyBtn.onclick = function(){
            var ta = document.createElement('textarea');
            ta.value = registered.join('\n');
            document.body.appendChild(ta);
            ta.select(); ta.setSelectionRange(0, 999999);
            try{ document.execCommand('copy'); el.status.textContent = 'Copied ' + registered.length + ' registered'; }
            catch(err){ el.status.textContent = 'Copy failed'; }
            ta.remove();
        };
        el.downloadBtn.onclick = function(){
            var base = sanitizeBase(el.baseName.value);
            var header = '# Domain TLD scan for: ' + base + '\n# Generated: ' + new Date().toISOString() +
                '\n# Resolver: ' + el.provider.value + ' (DoH)\n# Tool: ' + data.name + ' v' + data.version +
                '\n# Status reflects DNS presence, not registration — verify with whois/crt.sh\n\n';
            var body = (el.lastReport || []).join('\n');
            var blob = new Blob([header + body + '\n'], { type: 'text/plain' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url; a.download = 'domain-scan-' + base + '-' + Date.now() + '.txt';
            document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(url);
            el.status.textContent = 'Downloaded';
        };

        if(data.seed){ el.baseName.value = data.seed; }
        el.baseName.focus();
    }

    // Inject the scanner into the popup; it executes in the popup's CSP-free context.
    const script = doc.createElement('script');
    script.textContent = '(' + popupMain.toString() + ')(' + JSON.stringify({
        gtld: TLD_GTLD,
        cctld: TLD_CCTLD,
        version: CONFIG.version,
        name: CONFIG.name,
        seed: baseFromHost()
    }) + ');';
    doc.body.appendChild(script);

    // Store reference to popup
    window.__DomainTLDScan__ = popup;

    // Clean up reference when popup is closed
    const checkClosed = setInterval(() => {
        if(popup.closed){
            clearInterval(checkClosed);
            delete window.__DomainTLDScan__;
        }
    }, 1000);

})();

/*
BOOKMARKLET CODE (copy this entire line for bookmark URL):
javascript:!function(){"use strict";const e={version:"1.0.0",name:"Domain TLD Scanner",popupId:"osint-domain-tld-scan-"+Date.now()};if(window.__DomainTLDScan__)try{return void window.__DomainTLDScan__.focus()}catch(e){}const t=window.open("about:blank",e.popupId,"width=900,height=760,resizable=yes,scrollbars=yes,location=no,menubar=no,toolbar=no,status=no");if(!t)return void alert("Popup blocked! Please allow popups for this site and try again.");const o="<!DOCTYPE html><html><head><title>"+e.name+'</title><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:20px;min-height:100vh}.container{max-width:840px;margin:0 auto;background:#1e293b;border-radius:12px;border:1px solid #334155;overflow:hidden}.header{background:#0f172a;padding:16px 20px;border-bottom:1px solid #334155;display:flex;justify-content:space-between;align-items:center}.title{font-size:18px;font-weight:600;color:#f1f5f9}.version{font-size:12px;color:#64748b;background:#374151;padding:2px 8px;border-radius:4px}.content{padding:24px}label{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500;color:#cbd5e1;margin-bottom:16px}input,select{padding:10px 12px;background:#0f172a;border:1px solid #475569;border-radius:8px;color:#f1f5f9;font-size:13px;font-family:inherit}input:focus,select:focus{outline:none;border-color:#0ea5e9;box-shadow:0 0 0 3px rgba(14,165,233,0.1)}.row-inline{display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end}.row-inline label{flex:1;min-width:180px}.checkbox-group{display:flex;gap:18px;flex-wrap:wrap;margin:4px 0 16px;align-items:center}.checkbox-item{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:#cbd5e1}input[type="checkbox"]{width:16px;height:16px;cursor:pointer}.help-text{font-size:11px;color:#64748b;margin-top:4px}.button-group{display:flex;gap:12px;margin:16px 0;align-items:center;flex-wrap:wrap}button{padding:10px 16px;border:none;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:all 0.2s}.btn-primary{background:#0ea5e9;color:white}.btn-primary:hover{background:#0284c7}.btn-secondary{background:#475569;color:white}.btn-secondary:hover{background:#64748b}.btn-secondary:disabled,.btn-primary:disabled{background:#334155;color:#64748b;cursor:not-allowed}.status{margin-left:auto;font-size:12px;color:#64748b}.progress{height:6px;background:#0f172a;border-radius:3px;overflow:hidden;margin:8px 0 4px}.progress-bar{height:100%;width:0;background:#0ea5e9;transition:width 0.2s}.summary{display:flex;gap:18px;font-size:12px;color:#94a3b8;margin:8px 0 16px;flex-wrap:wrap}.summary b{color:#f1f5f9}.results{margin-top:8px}.section-title{font-size:13px;font-weight:600;color:#cbd5e1;margin:16px 0 8px;display:flex;align-items:center;gap:8px}.list{border:1px solid #334155;border-radius:8px;background:#0f172a;padding:6px;max-height:240px;overflow-y:auto}.dom-row{display:flex;align-items:center;gap:10px;padding:5px 8px;border-bottom:1px solid #1e293b;font-size:12px}.dom-row:last-child{border-bottom:none}.dom-row .dn{font-family:ui-monospace,"Cascadia Code",Consolas,monospace;color:#e2e8f0;text-decoration:none;flex:1}.dom-row .dn:hover{color:#7dd3fc}.badge{font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;letter-spacing:.04em}.badge.exists{background:#064e3b;color:#6ee7b7}.badge.available{background:#334155;color:#94a3b8}.badge.unknown{background:#3f2d12;color:#fbbf24}.recheck{display:flex;gap:6px}.recheck a{color:#64748b;text-decoration:none;font-size:11px;border:1px solid #334155;border-radius:4px;padding:1px 6px}.recheck a:hover{color:#38bdf8;border-color:#0ea5e9}.empty{color:#64748b;font-size:12px;padding:10px;text-align:center}.note{font-size:11px;color:#64748b;margin-top:18px;line-height:1.5;border-top:1px solid #334155;padding-top:12px}.note b{color:#fbbf24}</style></head><body><div class="container"><div class="header"><div class="title">'+e.name+'</div><div class="version">v'+e.version+'</div></div><div class="content"><label>Base name (without extension)<input type="text" id="baseName" placeholder="example"><div class="help-text">Second-level label to expand, e.g. "acme" &rarr; acme.com, acme.io, acme.fr ...</div></label><div class="checkbox-group"><label class="checkbox-item"><input type="checkbox" id="useGtld" checked> Popular &amp; new gTLDs</label><label class="checkbox-item"><input type="checkbox" id="useCctld" checked> Country codes (ccTLD)</label><label class="checkbox-item"><input type="checkbox" id="onlyFound"> Show registered only</label></div><div class="row-inline"><label>Custom TLDs (optional)<input type="text" id="customTlds" placeholder="gov.uk, com.au, app"></label><label style="flex:0 0 200px">DoH resolver<select id="provider"><option value="cloudflare">Cloudflare</option><option value="google">Google</option></select></label></div><div class="button-group"><button class="btn-primary" id="scanBtn">Scan</button><button class="btn-secondary" id="stopBtn" disabled>Stop</button><button class="btn-secondary" id="copyBtn" disabled>Copy Registered</button><button class="btn-secondary" id="downloadBtn" disabled>Download .txt</button><div class="status" id="status">Ready</div></div><div class="progress"><div class="progress-bar" id="progressBar"></div></div><div class="summary" id="summary"></div><div class="results" id="results"></div><div class="note"><b>Heads up:</b> this tool sends each candidate domain to your chosen public DoH resolver (Cloudflare or Google) to check DNS &mdash; it is the one tool in this set that makes external calls. Results show DNS presence, not registration: <b>AVAILABLE</b> = no DNS record (likely unregistered), <b>REGISTERED</b> = resolves in DNS. A registered domain with no nameservers can still read as AVAILABLE, so always use the recheck links (whois / crt.sh / DNS) before acting.</div></div></div></body></html>',n=t.document;n.open(),n.write(o),n.close();const a=n.createElement("script");a.textContent="("+function(e){var t={cloudflare:"https://cloudflare-dns.com/dns-query",google:"https://dns.google/resolve"},o=!1,n=[];function a(e){return document.getElementById(e)}var s={baseName:a("baseName"),useGtld:a("useGtld"),useCctld:a("useCctld"),onlyFound:a("onlyFound"),customTlds:a("customTlds"),provider:a("provider"),scanBtn:a("scanBtn"),stopBtn:a("stopBtn"),copyBtn:a("copyBtn"),downloadBtn:a("downloadBtn"),status:a("status"),progressBar:a("progressBar"),summary:a("summary"),results:a("results")};function r(e){return("string"==typeof e?e:"").trim().toLowerCase().replace(/^https?:\/\//,"").replace(/^www\./,"").replace(/\..*$/,"").replace(/[^a-z0-9-]/g,"").replace(/^-+|-+$/g,"")}function i(e,t){var o=document.createElement("a");return o.href=e,o.target="_blank",o.rel="noopener noreferrer",o.textContent=t,o}async function l(e,t){try{var o=t+"?name="+encodeURIComponent(e)+"&type=NS",n=await fetch(o,{headers:{accept:"application/dns-json"}});if(!n.ok)return"unknown";var a=await n.json();return 3===a.Status?"available":0===a.Status?"exists":"unknown"}catch(e){return"unknown"}}function d(e,t){if(!s.onlyFound.checked||"exists"===t){var o=document.createElement("div");o.className="dom-row";var n=i("https://"+e,e);n.className="dn";var a=document.createElement("span");a.className="badge "+t,a.textContent="exists"===t?"REGISTERED":"available"===t?"AVAILABLE":"UNKNOWN";var r=document.createElement("div");r.className="recheck",r.appendChild(i("https://who.is/whois/"+e,"whois")),r.appendChild(i("https://crt.sh/?q="+encodeURIComponent(e),"crt")),r.appendChild(i("https://dns.google/query?name="+encodeURIComponent(e),"dns")),o.appendChild(n),o.appendChild(a),o.appendChild(r),s.results.appendChild(o),o.scrollIntoView({block:"nearest"})}}function c(e,t,o,n,a){s.progressBar.style.width=(t?e/t*100:0)+"%",s.summary.innerHTML="",[["Checked",e+" / "+t],["Registered",o],["Available",n],["Unknown",a]].forEach(function(e){var t=document.createElement("span"),o=document.createElement("b");o.textContent=e[1],t.appendChild(document.createTextNode(e[0]+": ")),t.appendChild(o),s.summary.appendChild(t)})}async function p(){var a=function(){var t=r(s.baseName.value);if(!t)return null;s.baseName.value=t;var o=[];s.useGtld.checked&&(o=o.concat(e.gtld)),s.useCctld.checked&&(o=o.concat(e.cctld)),(s.customTlds.value||"").split(/[\s,]+/).forEach(function(e){var t=function(e){return(e||"").trim().toLowerCase().replace(/^\.+/,"").replace(/[^a-z0-9.-]/g,"")}(e);t&&o.push(t)});var n={},a=[];return o.forEach(function(e){if(e){var o=t+"."+e;n[o]||(n[o]=1,a.push(o))}}),a.sort()}();if(null===a)return s.status.textContent="Input required",void(s.summary.textContent="Enter a valid base name (letters, digits, hyphen).");if(!a.length)return s.status.textContent="No TLDs",void(s.summary.textContent="Select a TLD set or add a custom TLD.");var i=t[s.provider.value]||t.cloudflare;o=!1,n=[],s.results.innerHTML="",s.scanBtn.disabled=!0,s.stopBtn.disabled=!1,s.copyBtn.disabled=!0,s.downloadBtn.disabled=!0,s.status.textContent="Scanning...";var p=0,u=0,m=0,b=0,g=0,h=[];async function x(){for(;p<a.length&&!o;){var e=a[p++],t=await l(e,i);u++,"exists"===t?(m++,n.push(e)):"available"===t?b++:g++,h.push(t.toUpperCase().padEnd(10)+e),d(e,t),c(u,a.length,m,b,g)}}for(var f=[],v=0;v<16;v++)f.push(x());if(await Promise.all(f),s.lastReport=h,s.scanBtn.disabled=!1,s.stopBtn.disabled=!0,s.copyBtn.disabled=0===n.length,s.downloadBtn.disabled=0===u,s.status.textContent=o?"Stopped ("+u+"/"+a.length+")":"Done — "+m+" registered",!s.results.children.length){var y=document.createElement("div");y.className="empty",y.textContent=s.onlyFound.checked?"No registered domains found.":"No results.",s.results.appendChild(y)}}s.scanBtn.onclick=p,s.stopBtn.onclick=function(){o=!0,s.status.textContent="Stopping..."},s.baseName.addEventListener("keydown",function(e){"Enter"!==e.key||s.scanBtn.disabled||p()}),s.copyBtn.onclick=function(){var e=document.createElement("textarea");e.value=n.join("\n"),document.body.appendChild(e),e.select(),e.setSelectionRange(0,999999);try{document.execCommand("copy"),s.status.textContent="Copied "+n.length+" registered"}catch(e){s.status.textContent="Copy failed"}e.remove()},s.downloadBtn.onclick=function(){var t=r(s.baseName.value),o="# Domain TLD scan for: "+t+"\n# Generated: "+(new Date).toISOString()+"\n# Resolver: "+s.provider.value+" (DoH)\n# Tool: "+e.name+" v"+e.version+"\n# Status reflects DNS presence, not registration — verify with whois/crt.sh\n\n",n=(s.lastReport||[]).join("\n"),a=new Blob([o+n+"\n"],{type:"text/plain"}),i=URL.createObjectURL(a),l=document.createElement("a");l.href=i,l.download="domain-scan-"+t+"-"+Date.now()+".txt",document.body.appendChild(l),l.click(),l.remove(),URL.revokeObjectURL(i),s.status.textContent="Downloaded"},e.seed&&(s.baseName.value=e.seed),s.baseName.focus()}.toString()+")("+JSON.stringify({gtld:["com","net","org","info","biz","co","io","ai","app","dev","xyz","online","site","tech","store","shop","blog","me","tv","cc","name","pro","mobi","club","live","life","world","today","news","media","cloud","digital","email","link","fun","space","website","host","press","wiki","zone","agency","studio","design","art","vip","top","icu","cyou","gg","sh","ws","to"],cctld:["ac","ad","ae","af","ag","ai","al","am","ao","aq","ar","as","at","au","aw","ax","az","ba","bb","bd","be","bf","bg","bh","bi","bj","bm","bn","bo","br","bs","bt","bw","by","bz","ca","cc","cd","cf","cg","ch","ci","ck","cl","cm","cn","co","cr","cu","cv","cw","cx","cy","cz","de","dj","dk","dm","do","dz","ec","ee","eg","er","es","et","eu","fi","fj","fk","fm","fo","fr","ga","gb","gd","ge","gf","gg","gh","gi","gl","gm","gn","gp","gq","gr","gs","gt","gu","gw","gy","hk","hm","hn","hr","ht","hu","id","ie","il","im","in","io","iq","ir","is","it","je","jm","jo","jp","ke","kg","kh","ki","km","kn","kp","kr","kw","ky","kz","la","lb","lc","li","lk","lr","ls","lt","lu","lv","ly","ma","mc","md","me","mg","mh","mk","ml","mm","mn","mo","mp","mq","mr","ms","mt","mu","mv","mw","mx","my","mz","na","nc","ne","nf","ng","ni","nl","no","np","nr","nu","nz","om","pa","pe","pf","pg","ph","pk","pl","pm","pn","pr","ps","pt","pw","py","qa","re","ro","rs","ru","rw","sa","sb","sc","sd","se","sg","sh","si","sk","sl","sm","sn","so","sr","ss","st","su","sv","sx","sy","sz","tc","td","tf","tg","th","tj","tk","tl","tm","tn","to","tr","tt","tv","tw","tz","ua","ug","uk","us","uy","uz","va","vc","ve","vg","vi","vn","vu","wf","ws","ye","yt","za","zm","zw"],version:e.version,name:e.name,seed:function(){try{const e=String(location.hostname||"").split(".").filter(Boolean);if(e.length>=2)return e[e.length-2].toLowerCase().replace(/[^a-z0-9-]/g,"")}catch(e){}return""}()})+");",n.body.appendChild(a),window.__DomainTLDScan__=t;const s=setInterval(()=>{t.closed&&(clearInterval(s),delete window.__DomainTLDScan__)},1e3)}();
*/
