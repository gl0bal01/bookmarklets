/*!
 * Bookmarklet: Google Maps Review Extractor
 * Description: Extract Google Maps reviews (reviewer, rating, relative + exact network timestamps) with auto-scroll, dedup, and a searchable/sortable HTML export
 * Version: 1.0.0
 * Author: gl0bal01
 * Tags: osint, google-maps, reviews, scraping, timestamps, export
 * Compatibility: all-browsers
 * Last Updated: 2026-06-05
 *
 * Use Cases:
 * - OSINT on businesses and places (reviewer activity, timelines)
 * - Reputation and review-pattern analysis
 * - Archiving reviews before they change or disappear
 *
 * How it works:
 * - Auto-scrolls the open Reviews panel and clicks "more" to expand truncated text
 * - Reads each review card's DOM (reviewer, rating, relative date, body)
 * - Passively wraps the page's own fetch/XHR to read Google's responses and
 *   recover the microsecond timestamps embedded in them, then matches each
 *   timestamp to a review by its relative date ("il y a 2 mois" / "2 months ago")
 * - Deduplicates (keeps the longest body) and exports a self-contained HTML file
 *
 * Privacy: makes no external calls of its own. It only reads responses the page
 * is already fetching and writes the result locally via a Blob download.
 *
 * Usage Instructions:
 * 1. Open a Google Maps place and click into its Reviews panel
 * 2. Click the bookmarklet, enter how many reviews to export
 * 3. Wait for auto-scroll to finish; an HTML report downloads automatically
 */

javascript:(async () => {
    const TARGET = parseInt(prompt('How many reviews to export?', '200') || '200', 10);
    const WAIT = 1300;
    const TZ = 'Europe/Paris';

    // --- helpers ---
    const clean = s => (s || '').replace(/\s+/g, ' ').trim();
    const norm = s => clean(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N} ]/gu, '').trim();
    const html = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    const abs = u => { try { return new URL(u, location.href).href } catch (e) { return u || '' } };
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const day = 86400000;

    // --- on-page status indicator ---
    const status = document.createElement('div');
    status.style.cssText = 'position:fixed;z-index:999999;right:15px;bottom:15px;background:#111;color:#fff;padding:10px 12px;border-radius:8px;font:13px Arial;max-width:320px;box-shadow:0 4px 20px #0005';
    document.body.appendChild(status);
    const setStatus = t => status.textContent = t;

    // --- timestamp capture from network responses ---
    window.__gmapsReviewTs = [];
    const humanTs = ts => { try { return new Date(Number(ts) / 1000).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'medium', timeZone: TZ }) } catch (e) { return '' } };
    const isPlausible = ts => {
        const n = Number(ts);
        const min = new Date('2005-01-01T00:00:00Z').getTime() * 1000;
        const max = (Date.now() + day) * 1000;
        return Number.isFinite(n) && n >= min && n <= max;
    };
    const addTs = txt => {
        try {
            const found = [...String(txt).matchAll(/\b1[0-9]{15}\b/g)].map(m => m[0]).filter(isPlausible);
            for (const ts of found) {
                if (!window.__gmapsReviewTs.includes(ts)) window.__gmapsReviewTs.push(ts);
            }
        } catch (e) {}
    };

    // Wrap fetch/XHR once to passively read Google's responses (no new requests, nothing sent out)
    if (!window.__gmapsTsHooked) {
        window.__gmapsTsHooked = true;
        const oldFetch = window.fetch;
        window.fetch = async function (...args) {
            const res = await oldFetch.apply(this, args);
            try {
                const url = String(args[0]?.url || args[0] || '');
                if (/google|maps|preview|pc/i.test(url)) res.clone().text().then(addTs).catch(() => {});
            } catch (e) {}
            return res;
        };
        const oldOpen = XMLHttpRequest.prototype.open;
        const oldSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function (method, url, ...rest) { this.__gmapsUrl = url; return oldOpen.call(this, method, url, ...rest) };
        XMLHttpRequest.prototype.send = function (...args) {
            this.addEventListener('load', function () {
                try { if (/google|maps|preview|pc/i.test(String(this.__gmapsUrl || ''))) addTs(this.responseText) } catch (e) {}
            });
            return oldSend.apply(this, args);
        };
    }

    // --- DOM extraction ---
    const getCards = () => [...document.querySelectorAll('[data-review-id],.jftiEf,div[role="article"]')].filter(el => clean(el.innerText).length > 25);

    const findScroller = () => {
        const cards = getCards();
        let best = null, bestScore = 0;
        for (const el of [...document.querySelectorAll('div')]) {
            if (el.scrollHeight > el.clientHeight + 200) {
                const score = cards.filter(c => el.contains(c)).length * 1000 + el.scrollHeight;
                if (score > bestScore) { best = el; bestScore = score }
            }
        }
        return best || document.scrollingElement;
    };

    const clickMore = () => {
        [...document.querySelectorAll('button')].forEach(b => {
            const t = clean(b.innerText || b.getAttribute('aria-label'));
            if (/lire la suite|read more|voir plus|afficher plus/i.test(t)) { try { b.click() } catch (e) {} }
        });
    };

    const getProfileUrl = el => {
        const a = el.querySelector('a[href*="/maps/contrib/"],a[href*="contrib"]');
        if (a?.href) return abs(a.href);
        const d = el.querySelector('[data-href*="/maps/contrib/"],[data-href*="contrib"]');
        if (d?.getAttribute('data-href')) return abs(d.getAttribute('data-href'));
        return '';
    };

    const cleanReviewer = (reviewer, all) => {
        let r = clean(reviewer || '');
        if (!r) { const lines = all.split(/\n/).map(clean).filter(Boolean); r = lines[0] || '' }
        r = r.split(/\s+Local Guide\b/i)[0];
        r = r.replace(/\s*·?\s*[\d\s.,]+\s*(avis|reviews?)\b.*$/i, '');
        r = r.replace(/\s*·?\s*[\d\s.,]+\s*photos?\b.*$/i, '');
        return clean(r);
    };

    const getRating = el => {
        const normalizeRating = v => {
            v = String(v || '').replace(/\u00a0/g, ' ').replace(',', '.').trim();
            let m = v.match(/\b([1-5](?:\.\d)?)\s*\/\s*5\b/); if (m) return m[1];
            m = v.match(/\b([1-5](?:\.\d)?)\s*(?:étoiles?|etoiles?|stars?)\b/i); if (m) return m[1];
            m = v.match(/\b(?:rated|note|rating)\s*([1-5](?:\.\d)?)/i); if (m) return m[1];
            return '';
        };
        const badAggregate = s => /(avis|reviews?|review count|nombre d.?avis|\(\s*\d+\s*\))/i.test(s);
        const explicit = [...el.querySelectorAll('span,div')].map(n => clean(n.innerText)).filter(Boolean);
        for (const t of explicit) { if (/^[1-5](?:[,.]\d)?\s*\/\s*5$/.test(t)) return normalizeRating(t) }
        const labels = [...el.querySelectorAll('[aria-label],img[alt],span[role="img"]')].map(n => clean(n.getAttribute('aria-label') || n.getAttribute('alt') || '')).filter(Boolean);
        for (const label of labels) {
            const s = label.replace(/\u00a0/g, ' ');
            if (badAggregate(s)) continue;
            const r = normalizeRating(s);
            if (r) return r;
        }
        const lines = clean(el.innerText).split(/\n/).map(clean).filter(Boolean);
        for (const line of lines) {
            if (/^[1-5](?:[,.]\d)?\s*\/\s*5$/.test(line)) return normalizeRating(line);
            if (/^[1-5]\s*(?:étoiles?|etoiles?|stars?)$/i.test(line)) return normalizeRating(line);
        }
        return '';
    };

    const toNum = v => /^(un|une|one|a|an)$/i.test(v) ? 1 : parseInt(v, 10);

    const estimateRel = rel => {
        rel = clean(rel).toLowerCase().replace(/\s+sur google$/i, '');
        const now = new Date();
        if (/aujourd|today/.test(rel)) return { ms: now.getTime(), tol: day };
        if (/hier|yesterday/.test(rel)) return { ms: now.getTime() - day, tol: 2 * day };
        const m = rel.match(/(?:il y a|about|over|almost)?\s*(\d+|un|une|one|a|an)\s*(minute|minutes|heure|heures|hour|hours|jour|jours|day|days|semaine|semaines|week|weeks|mois|month|months|an|ans|année|années|year|years)/i);
        if (!m) return null;
        const n = toNum(m[1]);
        const u = m[2];
        let d = new Date(now), tol = 30 * day;
        if (/minute/.test(u)) { d.setMinutes(d.getMinutes() - n); tol = 2 * 60 * 60 * 1000 }
        else if (/heure|hour/.test(u)) { d.setHours(d.getHours() - n); tol = day }
        else if (/jour|day/.test(u)) { d.setDate(d.getDate() - n); tol = 2 * day }
        else if (/semaine|week/.test(u)) { d.setDate(d.getDate() - 7 * n); tol = 8 * day }
        else if (/mois|month/.test(u)) { d.setMonth(d.getMonth() - n); tol = 45 * day }
        else if (/an|année|year/.test(u)) { d.setFullYear(d.getFullYear() - n); tol = 220 * day }
        return { ms: d.getTime(), tol };
    };

    const getDateInfo = el => {
        const node = el.querySelector('.rsqaWe,.xRkPPb,.PuaHbe');
        return { relative: clean(node?.innerText || '') };
    };

    const allRows = new Map();
    const dedupeKey = r => [norm(r.reviewer), norm(r.rating), norm(r.date_relative), norm(r.review).slice(0, 90)].join('|');

    const parseVisible = () => {
        const cards = getCards();
        for (const el of cards) {
            const all = clean(el.innerText);
            const reviewerRaw = clean(el.querySelector('.d4r55,.WNxzHc,.TSUbDb')?.innerText || '');
            const reviewer = cleanReviewer(reviewerRaw, all);
            let meta = clean(el.querySelector('.RfnDt,.RfnDt span,.rsqaWe+span')?.innerText || '');
            if (!meta) { const lines = all.split(/\n/).map(clean).filter(Boolean); meta = lines.find(l => /Local Guide|avis|reviews|photos/i.test(l)) || '' }
            const localGuide = /Local Guide/i.test(meta) || /Local Guide/i.test(all);
            const reviewCount = (meta.match(/([\d\s.,]+)\s*(avis|reviews?)/i) || all.match(/([\d\s.,]+)\s*(avis|reviews?)/i) || [])[1] || '';
            const photoCount = (meta.match(/([\d\s.,]+)\s*photos?/i) || all.match(/([\d\s.,]+)\s*photos?/i) || [])[1] || '';
            let review = clean(el.querySelector('.wiI7pd,.MyEned span,[data-expandable-section] span')?.innerText || '');
            review = review.replace(/\s*…$/, '').trim();
            if (!review || review.length < 3) continue;
            const rating = getRating(el);
            const d = getDateInfo(el);
            const reviewer_profile_url = getProfileUrl(el);
            const place_url = location.href.split('&')[0];
            const row = { reviewer, reviewer_profile_url, local_guide: localGuide ? 'yes' : 'no', review_count: clean(reviewCount), photo_count: clean(photoCount), rating, date_relative: d.relative, review, place_url };
            const key = dedupeKey(row);
            const prev = allRows.get(key);
            if (!prev || row.review.length > prev.review.length) allRows.set(key, row);
        }
        return [...allRows.values()];
    };

    const assignTs = rows => {
        const cands = window.__gmapsReviewTs.map(ts => ({ ts, ms: Number(ts) / 1000 })).sort((a, b) => b.ms - a.ms);
        const used = new Set();
        for (const r of rows) {
            let best = -1, bestDiff = Infinity, info = estimateRel(r.date_relative);
            if (info) {
                for (let i = 0; i < cands.length; i++) {
                    if (used.has(i)) continue;
                    const diff = Math.abs(cands[i].ms - info.ms);
                    if (diff < bestDiff && diff <= info.tol) { best = i; bestDiff = diff }
                }
            }
            if (best >= 0) {
                used.add(best);
                r.timestamp_microseconds = cands[best].ts;
                r.timestamp_ms = String(cands[best].ms);
                r.date_exact_network = humanTs(cands[best].ts);
                r.timestamp_confidence = 'matched_with_relative_date';
            } else {
                r.timestamp_microseconds = '';
                r.timestamp_ms = '0';
                r.date_exact_network = '';
                r.timestamp_confidence = 'not_found';
            }
        }
        return rows;
    };

    // --- scroll-and-collect loop ---
    setStatus('Interceptor active. Loading reviews...');
    let scroller = findScroller(), last = 0, stuck = 0;
    while (true) {
        clickMore();
        let rows = parseVisible();
        setStatus('Loaded unique reviews: ' + rows.length + ' / ' + TARGET + ' | timestamps seen: ' + window.__gmapsReviewTs.length);
        if (rows.length >= TARGET) break;
        if (rows.length === last) stuck++; else { stuck = 0; last = rows.length }
        if (stuck >= 10) break;
        scroller = findScroller();
        scroller.scrollTop = scroller.scrollHeight;
        scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
        await sleep(WAIT);
    }
    await sleep(1500);

    let rows = assignTs(parseVisible().slice(0, TARGET));
    status.remove();
    if (!rows.length) { alert('No reviews found. Open the Reviews panel first.'); return }

    // --- build the exported HTML report ---
    const cols = ['reviewer', 'local_guide', 'review_count', 'photo_count', 'rating', 'date_relative', 'date_exact_network', 'timestamp_confidence', 'timestamp_microseconds', 'review', 'place'];
    const table = '<div class="controls"><input id="nameFilter" placeholder="Filtrer par nom..." autocomplete="off"><select id="sortSelect"><option value="date_desc">Date exacte réseau : plus récent</option><option value="date_asc">Date exacte réseau : plus ancien</option><option value="name_asc">Nom : A → Z</option><option value="name_desc">Nom : Z → A</option></select><span id="count"></span></div><table id="reviewsTable"><thead><tr>' + cols.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' + rows.map(r => '<tr data-name="' + html((r.reviewer || '').toLowerCase()) + '" data-ts="' + html(r.timestamp_ms || '0') + '"><td>' + (r.reviewer_profile_url ? '<a href="' + html(r.reviewer_profile_url) + '" target="_blank">' + html(r.reviewer) + '</a>' : html(r.reviewer)) + '</td><td>' + html(r.local_guide) + '</td><td>' + html(r.review_count) + '</td><td>' + html(r.photo_count) + '</td><td>' + html(r.rating) + '</td><td>' + html(r.date_relative) + '</td><td>' + html(r.date_exact_network) + '</td><td>' + html(r.timestamp_confidence) + '</td><td>' + html(r.timestamp_microseconds) + '</td><td>' + html(r.review) + '</td><td><a href="' + html(r.place_url) + '" target="_blank">Open place</a></td></tr>').join('') + '</tbody></table>';
    const doc = '<!doctype html><html><head><meta charset="utf-8"><title>Google Maps Reviews</title><style>body{font-family:Arial,sans-serif;margin:20px}table{border-collapse:collapse;width:100%;font-size:14px}th,td{border:1px solid #ddd;padding:8px;vertical-align:top}th{background:#f5f5f5;position:sticky;top:0}td{max-width:430px}a{color:#0645ad;text-decoration:none}a:hover{text-decoration:underline}.note{background:#fff8d6;border:1px solid #eadf9c;padding:10px;margin:12px 0}.controls{display:flex;gap:10px;align-items:center;margin:14px 0;position:sticky;top:0;background:#fff;padding:10px 0;z-index:10}.controls input,.controls select{font-size:14px;padding:8px;border:1px solid #ccc;border-radius:6px}.controls input{width:260px}</style></head><body><h1>Google Maps Reviews</h1><p>Exported ' + rows.length + ' unique reviews from <a href="' + html(location.href) + '" target="_blank">Google Maps page</a>.</p><div class="note">Cette version supprime les avis vides, garde la version la plus longue en cas de doublon, et récupère les notes via <code>4/5</code>, <code>5 étoiles</code>, <code>5 stars</code>, etc.</div>' + table + '<script>const tbody=document.querySelector("#reviewsTable tbody");const input=document.querySelector("#nameFilter");const select=document.querySelector("#sortSelect");const count=document.querySelector("#count");function missingLast(a,b,dir){const ta=Number(a.dataset.ts||0),tb=Number(b.dataset.ts||0);if(!ta&&!tb)return 0;if(!ta)return 1;if(!tb)return -1;return dir==="asc"?ta-tb:tb-ta}function apply(){let rows=[...tbody.querySelectorAll("tr")];const q=(input.value||"").toLowerCase().trim();const mode=select.value;rows.sort((a,b)=>{if(mode==="name_asc")return a.dataset.name.localeCompare(b.dataset.name,"fr");if(mode==="name_desc")return b.dataset.name.localeCompare(a.dataset.name,"fr");if(mode==="date_asc")return missingLast(a,b,"asc");return missingLast(a,b,"desc")});rows.forEach(r=>{const show=!q||r.dataset.name.includes(q);r.style.display=show?"":"none";tbody.appendChild(r)});count.textContent=[...rows].filter(r=>r.style.display!=="none").length+" avis visibles"}input.addEventListener("input",apply);select.addEventListener("change",apply);apply();<\/script></body></html>';

    const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'google_maps_reviews_' + rows.length + '_deduped_timestamps_' + new Date().toISOString().slice(0, 10) + '.html';
    a.click();
    URL.revokeObjectURL(a.href);
    alert(rows.length + ' unique reviews exported. Timestamps captured: ' + window.__gmapsReviewTs.length);
})();

/*
BOOKMARKLET CODE (copy this entire line for bookmark URL):
javascript:(async()=>{const TARGET=parseInt(prompt('How many reviews to export?','200')||'200',10);const WAIT=1300;const TZ='Europe/Paris';const clean=s=>(s||'').replace(/\s+/g,' ').trim();const norm=s=>clean(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N} ]/gu,'').trim();const html=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));const abs=u=>{try{return new URL(u,location.href).href}catch(e){return u||''}};const sleep=ms=>new Promise(r=>setTimeout(r,ms));const day=86400000;const status=document.createElement('div');status.style.cssText='position:fixed;z-index:999999;right:15px;bottom:15px;background:#111;color:#fff;padding:10px 12px;border-radius:8px;font:13px Arial;max-width:320px;box-shadow:0 4px 20px #0005';document.body.appendChild(status);const setStatus=t=>status.textContent=t;window.__gmapsReviewTs=[];const humanTs=ts=>{try{return new Date(Number(ts)/1000).toLocaleString('fr-FR',{dateStyle:'full',timeStyle:'medium',timeZone:TZ})}catch(e){return''}};const isPlausible=ts=>{const n=Number(ts);const min=new Date('2005-01-01T00:00:00Z').getTime()*1000;const max=(Date.now()+day)*1000;return Number.isFinite(n)&&n>=min&&n<=max};const addTs=txt=>{try{const found=[...String(txt).matchAll(/\b1[0-9]{15}\b/g)].map(m=>m[0]).filter(isPlausible);for(const ts of found){if(!window.__gmapsReviewTs.includes(ts))window.__gmapsReviewTs.push(ts)}}catch(e){}};if(!window.__gmapsTsHooked){window.__gmapsTsHooked=true;const oldFetch=window.fetch;window.fetch=async function(...args){const res=await oldFetch.apply(this,args);try{const url=String(args[0]?.url||args[0]||'');if(/google|maps|preview|pc/i.test(url))res.clone().text().then(addTs).catch(()=>{})}catch(e){}return res};const oldOpen=XMLHttpRequest.prototype.open;const oldSend=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.open=function(method,url,...rest){this.__gmapsUrl=url;return oldOpen.call(this,method,url,...rest)};XMLHttpRequest.prototype.send=function(...args){this.addEventListener('load',function(){try{if(/google|maps|preview|pc/i.test(String(this.__gmapsUrl||'')))addTs(this.responseText)}catch(e){}});return oldSend.apply(this,args)}}const getCards=()=>[...document.querySelectorAll('[data-review-id],.jftiEf,div[role="article"]')].filter(el=>clean(el.innerText).length>25);const findScroller=()=>{const cards=getCards();let best=null,bestScore=0;for(const el of [...document.querySelectorAll('div')]){if(el.scrollHeight>el.clientHeight+200){const score=cards.filter(c=>el.contains(c)).length*1000+el.scrollHeight;if(score>bestScore){best=el;bestScore=score}}}return best||document.scrollingElement};const clickMore=()=>{[...document.querySelectorAll('button')].forEach(b=>{const t=clean(b.innerText||b.getAttribute('aria-label'));if(/lire la suite|read more|voir plus|afficher plus/i.test(t)){try{b.click()}catch(e){}}})};const getProfileUrl=el=>{const a=el.querySelector('a[href*="/maps/contrib/"],a[href*="contrib"]');if(a?.href)return abs(a.href);const d=el.querySelector('[data-href*="/maps/contrib/"],[data-href*="contrib"]');if(d?.getAttribute('data-href'))return abs(d.getAttribute('data-href'));return''};const cleanReviewer=(reviewer,all)=>{let r=clean(reviewer||'');if(!r){const lines=all.split(/\n/).map(clean).filter(Boolean);r=lines[0]||''}r=r.split(/\s+Local Guide\b/i)[0];r=r.replace(/\s*·?\s*[\d\s.,]+\s*(avis|reviews?)\b.*$/i,'');r=r.replace(/\s*·?\s*[\d\s.,]+\s*photos?\b.*$/i,'');return clean(r)};const getRating=el=>{const normalizeRating=v=>{v=String(v||'').replace(/\u00a0/g,' ').replace(',','.').trim();let m=v.match(/\b([1-5](?:\.\d)?)\s*\/\s*5\b/);if(m)return m[1];m=v.match(/\b([1-5](?:\.\d)?)\s*(?:étoiles?|etoiles?|stars?)\b/i);if(m)return m[1];m=v.match(/\b(?:rated|note|rating)\s*([1-5](?:\.\d)?)/i);if(m)return m[1];return''};const badAggregate=s=>/(avis|reviews?|review count|nombre d.?avis|\(\s*\d+\s*\))/i.test(s);const explicit=[...el.querySelectorAll('span,div')].map(n=>clean(n.innerText)).filter(Boolean);for(const t of explicit){if(/^[1-5](?:[,.]\d)?\s*\/\s*5$/.test(t))return normalizeRating(t)}const labels=[...el.querySelectorAll('[aria-label],img[alt],span[role="img"]')].map(n=>clean(n.getAttribute('aria-label')||n.getAttribute('alt')||'')).filter(Boolean);for(const label of labels){const s=label.replace(/\u00a0/g,' ');if(badAggregate(s))continue;const r=normalizeRating(s);if(r)return r}const lines=clean(el.innerText).split(/\n/).map(clean).filter(Boolean);for(const line of lines){if(/^[1-5](?:[,.]\d)?\s*\/\s*5$/.test(line))return normalizeRating(line);if(/^[1-5]\s*(?:étoiles?|etoiles?|stars?)$/i.test(line))return normalizeRating(line)}return''};const toNum=v=>/^(un|une|one|a|an)$/i.test(v)?1:parseInt(v,10);const estimateRel=rel=>{rel=clean(rel).toLowerCase().replace(/\s+sur google$/i,'');const now=new Date();if(/aujourd|today/.test(rel))return{ms:now.getTime(),tol:day};if(/hier|yesterday/.test(rel))return{ms:now.getTime()-day,tol:2*day};const m=rel.match(/(?:il y a|about|over|almost)?\s*(\d+|un|une|one|a|an)\s*(minute|minutes|heure|heures|hour|hours|jour|jours|day|days|semaine|semaines|week|weeks|mois|month|months|an|ans|année|années|year|years)/i);if(!m)return null;const n=toNum(m[1]);const u=m[2];let d=new Date(now),tol=30*day;if(/minute/.test(u)){d.setMinutes(d.getMinutes()-n);tol=2*60*60*1000}else if(/heure|hour/.test(u)){d.setHours(d.getHours()-n);tol=day}else if(/jour|day/.test(u)){d.setDate(d.getDate()-n);tol=2*day}else if(/semaine|week/.test(u)){d.setDate(d.getDate()-7*n);tol=8*day}else if(/mois|month/.test(u)){d.setMonth(d.getMonth()-n);tol=45*day}else if(/an|année|year/.test(u)){d.setFullYear(d.getFullYear()-n);tol=220*day}return{ms:d.getTime(),tol}};const getDateInfo=el=>{const node=el.querySelector('.rsqaWe,.xRkPPb,.PuaHbe');return{relative:clean(node?.innerText||'')}};const allRows=new Map();const dedupeKey=r=>[norm(r.reviewer),norm(r.rating),norm(r.date_relative),norm(r.review).slice(0,90)].join('|');const parseVisible=()=>{const cards=getCards();for(const el of cards){const all=clean(el.innerText);const reviewerRaw=clean(el.querySelector('.d4r55,.WNxzHc,.TSUbDb')?.innerText||'');const reviewer=cleanReviewer(reviewerRaw,all);let meta=clean(el.querySelector('.RfnDt,.RfnDt span,.rsqaWe+span')?.innerText||'');if(!meta){const lines=all.split(/\n/).map(clean).filter(Boolean);meta=lines.find(l=>/Local Guide|avis|reviews|photos/i.test(l))||''}const localGuide=/Local Guide/i.test(meta)||/Local Guide/i.test(all);const reviewCount=(meta.match(/([\d\s.,]+)\s*(avis|reviews?)/i)||all.match(/([\d\s.,]+)\s*(avis|reviews?)/i)||[])[1]||'';const photoCount=(meta.match(/([\d\s.,]+)\s*photos?/i)||all.match(/([\d\s.,]+)\s*photos?/i)||[])[1]||'';let review=clean(el.querySelector('.wiI7pd,.MyEned span,[data-expandable-section] span')?.innerText||'');review=review.replace(/\s*…$/,'').trim();if(!review||review.length<3)continue;const rating=getRating(el);const d=getDateInfo(el);const reviewer_profile_url=getProfileUrl(el);const place_url=location.href.split('&')[0];const row={reviewer,reviewer_profile_url,local_guide:localGuide?'yes':'no',review_count:clean(reviewCount),photo_count:clean(photoCount),rating,date_relative:d.relative,review,place_url};const key=dedupeKey(row);const prev=allRows.get(key);if(!prev||row.review.length>prev.review.length)allRows.set(key,row)}return[...allRows.values()]};const assignTs=rows=>{const cands=window.__gmapsReviewTs.map(ts=>({ts,ms:Number(ts)/1000})).sort((a,b)=>b.ms-a.ms);const used=new Set();for(const r of rows){let best=-1,bestDiff=Infinity,info=estimateRel(r.date_relative);if(info){for(let i=0;i<cands.length;i++){if(used.has(i))continue;const diff=Math.abs(cands[i].ms-info.ms);if(diff<bestDiff&&diff<=info.tol){best=i;bestDiff=diff}}}if(best>=0){used.add(best);r.timestamp_microseconds=cands[best].ts;r.timestamp_ms=String(cands[best].ms);r.date_exact_network=humanTs(cands[best].ts);r.timestamp_confidence='matched_with_relative_date'}else{r.timestamp_microseconds='';r.timestamp_ms='0';r.date_exact_network='';r.timestamp_confidence='not_found'}}return rows};setStatus('Interceptor active. Loading reviews...');let scroller=findScroller(),last=0,stuck=0;while(true){clickMore();let rows=parseVisible();setStatus('Loaded unique reviews: '+rows.length+' / '+TARGET+' | timestamps seen: '+window.__gmapsReviewTs.length);if(rows.length>=TARGET)break;if(rows.length===last)stuck++;else{stuck=0;last=rows.length}if(stuck>=10)break;scroller=findScroller();scroller.scrollTop=scroller.scrollHeight;scroller.dispatchEvent(new Event('scroll',{bubbles:true}));await sleep(WAIT)}await sleep(1500);let rows=assignTs(parseVisible().slice(0,TARGET));status.remove();if(!rows.length){alert('No reviews found. Open the Reviews panel first.');return}const cols=['reviewer','local_guide','review_count','photo_count','rating','date_relative','date_exact_network','timestamp_confidence','timestamp_microseconds','review','place'];const table='<div class="controls"><input id="nameFilter" placeholder="Filtrer par nom..." autocomplete="off"><select id="sortSelect"><option value="date_desc">Date exacte réseau : plus récent</option><option value="date_asc">Date exacte réseau : plus ancien</option><option value="name_asc">Nom : A → Z</option><option value="name_desc">Nom : Z → A</option></select><span id="count"></span></div><table id="reviewsTable"><thead><tr>'+cols.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr data-name="'+html((r.reviewer||'').toLowerCase())+'" data-ts="'+html(r.timestamp_ms||'0')+'"><td>'+(r.reviewer_profile_url?'<a href="'+html(r.reviewer_profile_url)+'" target="_blank">'+html(r.reviewer)+'</a>':html(r.reviewer))+'</td><td>'+html(r.local_guide)+'</td><td>'+html(r.review_count)+'</td><td>'+html(r.photo_count)+'</td><td>'+html(r.rating)+'</td><td>'+html(r.date_relative)+'</td><td>'+html(r.date_exact_network)+'</td><td>'+html(r.timestamp_confidence)+'</td><td>'+html(r.timestamp_microseconds)+'</td><td>'+html(r.review)+'</td><td><a href="'+html(r.place_url)+'" target="_blank">Open place</a></td></tr>').join('')+'</tbody></table>';const doc='<!doctype html><html><head><meta charset="utf-8"><title>Google Maps Reviews</title><style>body{font-family:Arial,sans-serif;margin:20px}table{border-collapse:collapse;width:100%;font-size:14px}th,td{border:1px solid #ddd;padding:8px;vertical-align:top}th{background:#f5f5f5;position:sticky;top:0}td{max-width:430px}a{color:#0645ad;text-decoration:none}a:hover{text-decoration:underline}.note{background:#fff8d6;border:1px solid #eadf9c;padding:10px;margin:12px 0}.controls{display:flex;gap:10px;align-items:center;margin:14px 0;position:sticky;top:0;background:#fff;padding:10px 0;z-index:10}.controls input,.controls select{font-size:14px;padding:8px;border:1px solid #ccc;border-radius:6px}.controls input{width:260px}</style></head><body><h1>Google Maps Reviews</h1><p>Exported '+rows.length+' unique reviews from <a href="'+html(location.href)+'" target="_blank">Google Maps page</a>.</p><div class="note">Cette version supprime les avis vides, garde la version la plus longue en cas de doublon, et récupère les notes via <code>4/5</code>, <code>5 étoiles</code>, <code>5 stars</code>, etc.</div>'+table+'<script>const tbody=document.querySelector("#reviewsTable tbody");const input=document.querySelector("#nameFilter");const select=document.querySelector("#sortSelect");const count=document.querySelector("#count");function missingLast(a,b,dir){const ta=Number(a.dataset.ts||0),tb=Number(b.dataset.ts||0);if(!ta&&!tb)return 0;if(!ta)return 1;if(!tb)return -1;return dir==="asc"?ta-tb:tb-ta}function apply(){let rows=[...tbody.querySelectorAll("tr")];const q=(input.value||"").toLowerCase().trim();const mode=select.value;rows.sort((a,b)=>{if(mode==="name_asc")return a.dataset.name.localeCompare(b.dataset.name,"fr");if(mode==="name_desc")return b.dataset.name.localeCompare(a.dataset.name,"fr");if(mode==="date_asc")return missingLast(a,b,"asc");return missingLast(a,b,"desc")});rows.forEach(r=>{const show=!q||r.dataset.name.includes(q);r.style.display=show?"":"none";tbody.appendChild(r)});count.textContent=[...rows].filter(r=>r.style.display!=="none").length+" avis visibles"}input.addEventListener("input",apply);select.addEventListener("change",apply);apply();<\/script></body></html>';const blob=new Blob([doc],{type:'text/html;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='google_maps_reviews_'+rows.length+'_deduped_timestamps_'+new Date().toISOString().slice(0,10)+'.html';a.click();URL.revokeObjectURL(a.href);alert(rows.length+' unique reviews exported. Timestamps captured: '+window.__gmapsReviewTs.length);})();
*/
