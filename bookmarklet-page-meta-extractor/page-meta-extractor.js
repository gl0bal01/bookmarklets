/*!
 * Bookmarklet: Page Metadata Extractor
 * Description: Dump a page's metadata — SEO, Open Graph, Twitter Card, Dublin Core, JSON-LD, link rels, icons, and third-party script hosts — into a readable report with copy/download
 * Version: 1.0.0
 * Author: gl0bal01
 * Tags: osint, investigation, seo, metadata, opengraph, json-ld, reconnaissance
 * Compatibility: all-browsers
 * Last Updated: 2026-06-09
 */

javascript:(function(){
    'use strict';

    const CONFIG = { version: '1.0.0', name: 'Page Metadata Extractor', popupId: 'osint-page-meta-' + Date.now() };

    if(window.__PageMetaExtractor__){
        try{ window.__PageMetaExtractor__.focus(); return; }catch(e){}
    }

    let data;
    try{
        const d = document;
        const attr = (el, a) => (el && el.getAttribute(a)) || '';
        const get = (sel, a) => { const e = d.querySelector(sel); return e ? (e.getAttribute(a) || e[a] || '') : ''; };
        const host = (u) => { try{ return new URL(u, location.href).hostname; }catch(e){ return ''; } };

        const metas = [].slice.call(d.querySelectorAll('meta')).map(m => ({
            name: m.getAttribute('name') || m.getAttribute('property') || m.getAttribute('http-equiv') || m.getAttribute('itemprop') || '',
            content: m.getAttribute('content') || m.getAttribute('charset') || ''
        })).filter(x => x.name || x.content);

        // bucket metas whose name starts with a given prefix (og:, twitter:, dc.)
        const bucket = (prefix) => {
            const o = {};
            metas.forEach(m => { if(m.name.toLowerCase().indexOf(prefix) === 0) o[m.name] = m.content; });
            return o;
        };

        const links = [].slice.call(d.querySelectorAll('link')).map(l => ({
            rel: l.getAttribute('rel') || '', href: l.href || '', type: l.getAttribute('type') || '', hreflang: l.getAttribute('hreflang') || ''
        })).filter(x => x.rel || x.href);

        // third-party script hosts = quick tech/tracker fingerprint
        const hosts = {};
        [].slice.call(d.scripts).forEach(s => { if(s.src){ const h = host(s.src); if(h && h !== location.hostname) hosts[h] = (hosts[h] || 0) + 1; } });
        const thirdParty = Object.keys(hosts).sort().map(h => h + ' (' + hosts[h] + ')');

        const jsonLd = [].slice.call(d.querySelectorAll('script[type="application/ld+json"]')).map(s => {
            try{ return JSON.parse(s.textContent); }
            catch(e){ return { parseError: String(e), raw: (s.textContent || '').slice(0, 300) }; }
        });

        const icons = links.filter(l => /icon/i.test(l.rel)).map(l => l.href);
        const alternates = links.filter(l => /alternate/i.test(l.rel)).map(l => (l.hreflang || l.type || 'alternate') + ': ' + l.href);
        const hints = links.filter(l => /preconnect|dns-prefetch|preload|prefetch/i.test(l.rel)).map(l => l.rel + ': ' + l.href);

        data = {
            page: { url: location.href, host: location.hostname, title: d.title, lang: attr(d.documentElement, 'lang'), charset: d.characterSet, viewport: get('meta[name="viewport"]', 'content') },
            seo: {
                description: get('meta[name="description"]', 'content'),
                keywords: get('meta[name="keywords"]', 'content'),
                author: get('meta[name="author"]', 'content'),
                robots: get('meta[name="robots"]', 'content'),
                generator: get('meta[name="generator"]', 'content'),
                themeColor: get('meta[name="theme-color"]', 'content'),
                canonical: get('link[rel="canonical"]', 'href'),
                favicon: get('link[rel="icon"]', 'href') || get('link[rel="shortcut icon"]', 'href')
            },
            openGraph: bucket('og:'),
            twitter: bucket('twitter:'),
            dublinCore: bucket('dc.'),
            icons: icons,
            alternates: alternates,
            resourceHints: hints,
            thirdPartyScriptHosts: thirdParty,
            jsonLd: jsonLd,
            allMeta: metas,
            allLinks: links
        };
    }catch(err){
        alert('Page Metadata Extractor failed: ' + (err && err.message ? err.message : err));
        return;
    }

    const popup = window.open('about:blank', CONFIG.popupId, 'width=920,height=780,resizable=yes,scrollbars=yes,location=no,menubar=no,toolbar=no,status=no');
    if(!popup){ alert('Popup blocked! Please allow popups for this site and try again.'); return; }

    const SHELL =
'<!DOCTYPE html><html><head><title>' + CONFIG.name + '</title>' +
'<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'<style>' +
'*{box-sizing:border-box;margin:0;padding:0}' +
'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:20px;min-height:100vh}' +
'.container{max-width:860px;margin:0 auto;background:#1e293b;border-radius:12px;border:1px solid #334155;overflow:hidden}' +
'.header{background:#0f172a;padding:16px 20px;border-bottom:1px solid #334155;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:5}' +
'.title{font-size:18px;font-weight:600;color:#f1f5f9}' +
'.version{font-size:12px;color:#64748b;background:#374151;padding:2px 8px;border-radius:4px}' +
'.content{padding:24px}' +
'.button-group{display:flex;gap:12px;margin-bottom:18px;align-items:center;flex-wrap:wrap}' +
'button{padding:10px 16px;border:none;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:all 0.2s;background:#475569;color:white}' +
'button:hover{background:#64748b}' +
'button.primary{background:#0ea5e9}button.primary:hover{background:#0284c7}' +
'.status{margin-left:auto;font-size:12px;color:#64748b}' +
'.section{margin-bottom:18px;border:1px solid #334155;border-radius:8px;background:#0f172a;overflow:hidden}' +
'.section h2{font-size:13px;font-weight:600;color:#cbd5e1;padding:10px 14px;background:#1e293b;border-bottom:1px solid #334155;display:flex;justify-content:space-between}' +
'.section h2 .count{color:#64748b;font-weight:400}' +
'.kv{display:grid;grid-template-columns:200px 1fr;gap:2px 14px;padding:10px 14px;font-size:12px}' +
'.kv .k{color:#64748b;font-family:ui-monospace,Consolas,monospace;word-break:break-all}' +
'.kv .v{color:#e2e8f0;word-break:break-word;white-space:pre-wrap}' +
'.list{padding:10px 14px;font-size:12px}' +
'.list a,.list div{display:block;color:#38bdf8;text-decoration:none;font-family:ui-monospace,Consolas,monospace;padding:2px 0;word-break:break-all}' +
'.list a:hover{color:#7dd3fc}' +
'.list .plain{color:#cbd5e1}' +
'pre{padding:12px 14px;font-size:11px;line-height:1.45;color:#a5f3fc;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,Consolas,monospace;max-height:320px;overflow:auto}' +
'.empty{padding:10px 14px;color:#64748b;font-size:12px}' +
'</style></head><body>' +
'<div class="container">' +
'<div class="header"><div class="title">' + CONFIG.name + '</div><div class="version">v' + CONFIG.version + '</div></div>' +
'<div class="content">' +
'<div class="button-group">' +
'<button class="primary" id="copyBtn">Copy JSON</button>' +
'<button id="downloadBtn">Download .json</button>' +
'<button id="toggleRaw">Toggle raw JSON</button>' +
'<div class="status" id="status">Ready</div>' +
'</div>' +
'<div id="report"></div>' +
'<div class="section" id="rawWrap" style="display:none"><h2>Raw JSON</h2><pre id="raw"></pre></div>' +
'</div></div></body></html>';

    const doc = popup.document;
    doc.open(); doc.write(SHELL); doc.close();

    // Renders inside the popup. Authored as a real function so .toString() ships it verbatim.
    function popupMain(data){
        var report = document.getElementById('report');
        var status = document.getElementById('status');

        function section(title, count){
            var s = document.createElement('div'); s.className = 'section';
            var h = document.createElement('h2');
            h.appendChild(document.createTextNode(title));
            if(count !== undefined){ var c = document.createElement('span'); c.className = 'count'; c.textContent = count; h.appendChild(c); }
            s.appendChild(h);
            report.appendChild(s);
            return s;
        }
        function emptyNote(s){ var e = document.createElement('div'); e.className = 'empty'; e.textContent = '(none)'; s.appendChild(e); }
        function isUrl(v){ return /^https?:\/\//i.test(v) || /^\/\//.test(v); }

        function renderKV(title, obj){
            var keys = Object.keys(obj || {}).filter(function(k){ return obj[k] !== '' && obj[k] != null; });
            var s = section(title, keys.length || undefined);
            if(!keys.length){ emptyNote(s); return; }
            var grid = document.createElement('div'); grid.className = 'kv';
            keys.forEach(function(k){
                var kd = document.createElement('div'); kd.className = 'k'; kd.textContent = k;
                var vd = document.createElement('div'); vd.className = 'v';
                var val = String(obj[k]);
                if(isUrl(val)){ var a = document.createElement('a'); a.href = val; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.style.color = '#38bdf8'; a.style.textDecoration = 'none'; a.textContent = val; vd.appendChild(a); }
                else vd.textContent = val;
                grid.appendChild(kd); grid.appendChild(vd);
            });
            s.appendChild(grid);
        }

        function renderList(title, arr){
            arr = (arr || []).filter(Boolean);
            var s = section(title, arr.length || undefined);
            if(!arr.length){ emptyNote(s); return; }
            var wrap = document.createElement('div'); wrap.className = 'list';
            arr.forEach(function(item){
                var v = String(item);
                if(isUrl(v)){ var a = document.createElement('a'); a.href = v; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = v; wrap.appendChild(a); }
                else { var dv = document.createElement('div'); dv.className = 'plain'; dv.textContent = v; wrap.appendChild(dv); }
            });
            s.appendChild(wrap);
        }

        function renderMetaList(title, arr){
            arr = arr || [];
            var s = section(title, arr.length || undefined);
            if(!arr.length){ emptyNote(s); return; }
            var grid = document.createElement('div'); grid.className = 'kv';
            arr.forEach(function(m){
                var kd = document.createElement('div'); kd.className = 'k'; kd.textContent = m.name || m.rel || '';
                var vd = document.createElement('div'); vd.className = 'v'; vd.textContent = m.content || m.href || '';
                grid.appendChild(kd); grid.appendChild(vd);
            });
            s.appendChild(grid);
        }

        function renderJsonLd(title, arr){
            arr = arr || [];
            var s = section(title, arr.length || undefined);
            if(!arr.length){ emptyNote(s); return; }
            var pre = document.createElement('pre');
            pre.textContent = JSON.stringify(arr, null, 2);
            s.appendChild(pre);
        }

        renderKV('Page', data.page);
        renderKV('SEO', data.seo);
        renderKV('Open Graph', data.openGraph);
        renderKV('Twitter Card', data.twitter);
        renderKV('Dublin Core', data.dublinCore);
        renderJsonLd('JSON-LD (structured data)', data.jsonLd);
        renderList('Third-party script hosts', data.thirdPartyScriptHosts);
        renderList('Icons', data.icons);
        renderList('Alternate / hreflang', data.alternates);
        renderList('Resource hints', data.resourceHints);
        renderMetaList('All meta tags', data.allMeta);
        renderMetaList('All link tags', (data.allLinks || []).map(function(l){ return { name: l.rel, content: l.href }; }));

        var json = JSON.stringify(data, null, 2);
        document.getElementById('raw').textContent = json;

        document.getElementById('copyBtn').onclick = function(){
            var ta = document.createElement('textarea'); ta.value = json; document.body.appendChild(ta);
            ta.select(); ta.setSelectionRange(0, 999999);
            try{ document.execCommand('copy'); status.textContent = 'Copied JSON'; }
            catch(e){ status.textContent = 'Copy failed'; }
            ta.remove();
            setTimeout(function(){ status.textContent = 'Ready'; }, 2000);
        };
        document.getElementById('downloadBtn').onclick = function(){
            var blob = new Blob([json], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a'); a.href = url;
            a.download = 'page-meta-' + (data.page.host || 'page') + '-' + Date.now() + '.json';
            document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
            status.textContent = 'Downloaded';
            setTimeout(function(){ status.textContent = 'Ready'; }, 2000);
        };
        document.getElementById('toggleRaw').onclick = function(){
            var w = document.getElementById('rawWrap');
            w.style.display = w.style.display === 'none' ? 'block' : 'none';
        };
    }

    const script = doc.createElement('script');
    script.textContent = '(' + popupMain.toString() + ')(' + JSON.stringify(data) + ');';
    doc.body.appendChild(script);

    window.__PageMetaExtractor__ = popup;
    const checkClosed = setInterval(() => { if(popup.closed){ clearInterval(checkClosed); delete window.__PageMetaExtractor__; } }, 1000);

})();

/*
BOOKMARKLET CODE (copy this entire line for bookmark URL):
javascript:!function(){"use strict";const e={version:"1.0.0",name:"Page Metadata Extractor",popupId:"osint-page-meta-"+Date.now()};if(window.__PageMetaExtractor__)try{return void window.__PageMetaExtractor__.focus()}catch(e){}let t;try{const e=document,n=(e,t)=>e&&e.getAttribute(t)||"",o=(t,n)=>{const o=e.querySelector(t);return o&&(o.getAttribute(n)||o[n])||""},a=e=>{try{return new URL(e,location.href).hostname}catch(e){return""}},r=[].slice.call(e.querySelectorAll("meta")).map(e=>({name:e.getAttribute("name")||e.getAttribute("property")||e.getAttribute("http-equiv")||e.getAttribute("itemprop")||"",content:e.getAttribute("content")||e.getAttribute("charset")||""})).filter(e=>e.name||e.content),i=e=>{const t={};return r.forEach(n=>{0===n.name.toLowerCase().indexOf(e)&&(t[n.name]=n.content)}),t},l=[].slice.call(e.querySelectorAll("link")).map(e=>({rel:e.getAttribute("rel")||"",href:e.href||"",type:e.getAttribute("type")||"",hreflang:e.getAttribute("hreflang")||""})).filter(e=>e.rel||e.href),c={};[].slice.call(e.scripts).forEach(e=>{if(e.src){const t=a(e.src);t&&t!==location.hostname&&(c[t]=(c[t]||0)+1)}});const d=Object.keys(c).sort().map(e=>e+" ("+c[e]+")"),s=[].slice.call(e.querySelectorAll('script[type="application/ld+json"]')).map(e=>{try{return JSON.parse(e.textContent)}catch(t){return{parseError:String(t),raw:(e.textContent||"").slice(0,300)}}}),p=l.filter(e=>/icon/i.test(e.rel)).map(e=>e.href),m=l.filter(e=>/alternate/i.test(e.rel)).map(e=>(e.hreflang||e.type||"alternate")+": "+e.href),u=l.filter(e=>/preconnect|dns-prefetch|preload|prefetch/i.test(e.rel)).map(e=>e.rel+": "+e.href);t={page:{url:location.href,host:location.hostname,title:e.title,lang:n(e.documentElement,"lang"),charset:e.characterSet,viewport:o('meta[name="viewport"]',"content")},seo:{description:o('meta[name="description"]',"content"),keywords:o('meta[name="keywords"]',"content"),author:o('meta[name="author"]',"content"),robots:o('meta[name="robots"]',"content"),generator:o('meta[name="generator"]',"content"),themeColor:o('meta[name="theme-color"]',"content"),canonical:o('link[rel="canonical"]',"href"),favicon:o('link[rel="icon"]',"href")||o('link[rel="shortcut icon"]',"href")},openGraph:i("og:"),twitter:i("twitter:"),dublinCore:i("dc."),icons:p,alternates:m,resourceHints:u,thirdPartyScriptHosts:d,jsonLd:s,allMeta:r,allLinks:l}}catch(e){return void alert("Page Metadata Extractor failed: "+(e&&e.message?e.message:e))}const n=window.open("about:blank",e.popupId,"width=920,height=780,resizable=yes,scrollbars=yes,location=no,menubar=no,toolbar=no,status=no");if(!n)return void alert("Popup blocked! Please allow popups for this site and try again.");const o="<!DOCTYPE html><html><head><title>"+e.name+'</title><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:20px;min-height:100vh}.container{max-width:860px;margin:0 auto;background:#1e293b;border-radius:12px;border:1px solid #334155;overflow:hidden}.header{background:#0f172a;padding:16px 20px;border-bottom:1px solid #334155;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:5}.title{font-size:18px;font-weight:600;color:#f1f5f9}.version{font-size:12px;color:#64748b;background:#374151;padding:2px 8px;border-radius:4px}.content{padding:24px}.button-group{display:flex;gap:12px;margin-bottom:18px;align-items:center;flex-wrap:wrap}button{padding:10px 16px;border:none;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:all 0.2s;background:#475569;color:white}button:hover{background:#64748b}button.primary{background:#0ea5e9}button.primary:hover{background:#0284c7}.status{margin-left:auto;font-size:12px;color:#64748b}.section{margin-bottom:18px;border:1px solid #334155;border-radius:8px;background:#0f172a;overflow:hidden}.section h2{font-size:13px;font-weight:600;color:#cbd5e1;padding:10px 14px;background:#1e293b;border-bottom:1px solid #334155;display:flex;justify-content:space-between}.section h2 .count{color:#64748b;font-weight:400}.kv{display:grid;grid-template-columns:200px 1fr;gap:2px 14px;padding:10px 14px;font-size:12px}.kv .k{color:#64748b;font-family:ui-monospace,Consolas,monospace;word-break:break-all}.kv .v{color:#e2e8f0;word-break:break-word;white-space:pre-wrap}.list{padding:10px 14px;font-size:12px}.list a,.list div{display:block;color:#38bdf8;text-decoration:none;font-family:ui-monospace,Consolas,monospace;padding:2px 0;word-break:break-all}.list a:hover{color:#7dd3fc}.list .plain{color:#cbd5e1}pre{padding:12px 14px;font-size:11px;line-height:1.45;color:#a5f3fc;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,Consolas,monospace;max-height:320px;overflow:auto}.empty{padding:10px 14px;color:#64748b;font-size:12px}</style></head><body><div class="container"><div class="header"><div class="title">'+e.name+'</div><div class="version">v'+e.version+'</div></div><div class="content"><div class="button-group"><button class="primary" id="copyBtn">Copy JSON</button><button id="downloadBtn">Download .json</button><button id="toggleRaw">Toggle raw JSON</button><div class="status" id="status">Ready</div></div><div id="report"></div><div class="section" id="rawWrap" style="display:none"><h2>Raw JSON</h2><pre id="raw"></pre></div></div></div></body></html>',a=n.document;a.open(),a.write(o),a.close();const r=a.createElement("script");r.textContent="("+function(e){var t=document.getElementById("report"),n=document.getElementById("status");function o(e,n){var o=document.createElement("div");o.className="section";var a=document.createElement("h2");if(a.appendChild(document.createTextNode(e)),void 0!==n){var r=document.createElement("span");r.className="count",r.textContent=n,a.appendChild(r)}return o.appendChild(a),t.appendChild(o),o}function a(e){var t=document.createElement("div");t.className="empty",t.textContent="(none)",e.appendChild(t)}function r(e){return/^https?:\/\//i.test(e)||/^\/\//.test(e)}function i(e,t){var n=Object.keys(t||{}).filter(function(e){return""!==t[e]&&null!=t[e]}),i=o(e,n.length||void 0);if(n.length){var l=document.createElement("div");l.className="kv",n.forEach(function(e){var n=document.createElement("div");n.className="k",n.textContent=e;var o=document.createElement("div");o.className="v";var a=String(t[e]);if(r(a)){var i=document.createElement("a");i.href=a,i.target="_blank",i.rel="noopener noreferrer",i.style.color="#38bdf8",i.style.textDecoration="none",i.textContent=a,o.appendChild(i)}else o.textContent=a;l.appendChild(n),l.appendChild(o)}),i.appendChild(l)}else a(i)}function l(e,t){var n=o(e,(t=(t||[]).filter(Boolean)).length||void 0);if(t.length){var i=document.createElement("div");i.className="list",t.forEach(function(e){var t=String(e);if(r(t)){var n=document.createElement("a");n.href=t,n.target="_blank",n.rel="noopener noreferrer",n.textContent=t,i.appendChild(n)}else{var o=document.createElement("div");o.className="plain",o.textContent=t,i.appendChild(o)}}),n.appendChild(i)}else a(n)}function c(e,t){var n=o(e,(t=t||[]).length||void 0);if(t.length){var r=document.createElement("div");r.className="kv",t.forEach(function(e){var t=document.createElement("div");t.className="k",t.textContent=e.name||e.rel||"";var n=document.createElement("div");n.className="v",n.textContent=e.content||e.href||"",r.appendChild(t),r.appendChild(n)}),n.appendChild(r)}else a(n)}i("Page",e.page),i("SEO",e.seo),i("Open Graph",e.openGraph),i("Twitter Card",e.twitter),i("Dublin Core",e.dublinCore),function(e,t){var n=o(e,(t=t||[]).length||void 0);if(t.length){var r=document.createElement("pre");r.textContent=JSON.stringify(t,null,2),n.appendChild(r)}else a(n)}("JSON-LD (structured data)",e.jsonLd),l("Third-party script hosts",e.thirdPartyScriptHosts),l("Icons",e.icons),l("Alternate / hreflang",e.alternates),l("Resource hints",e.resourceHints),c("All meta tags",e.allMeta),c("All link tags",(e.allLinks||[]).map(function(e){return{name:e.rel,content:e.href}}));var d=JSON.stringify(e,null,2);document.getElementById("raw").textContent=d,document.getElementById("copyBtn").onclick=function(){var e=document.createElement("textarea");e.value=d,document.body.appendChild(e),e.select(),e.setSelectionRange(0,999999);try{document.execCommand("copy"),n.textContent="Copied JSON"}catch(e){n.textContent="Copy failed"}e.remove(),setTimeout(function(){n.textContent="Ready"},2e3)},document.getElementById("downloadBtn").onclick=function(){var t=new Blob([d],{type:"application/json"}),o=URL.createObjectURL(t),a=document.createElement("a");a.href=o,a.download="page-meta-"+(e.page.host||"page")+"-"+Date.now()+".json",document.body.appendChild(a),a.click(),a.remove(),URL.revokeObjectURL(o),n.textContent="Downloaded",setTimeout(function(){n.textContent="Ready"},2e3)},document.getElementById("toggleRaw").onclick=function(){var e=document.getElementById("rawWrap");e.style.display="none"===e.style.display?"block":"none"}}.toString()+")("+JSON.stringify(t)+");",a.body.appendChild(r),window.__PageMetaExtractor__=n;const i=setInterval(()=>{n.closed&&(clearInterval(i),delete window.__PageMetaExtractor__)},1e3)}();
*/
