/*!
 * Bookmarklet: TripAdvisor Review Extractor
 * Description: Extract TripAdvisor reviews (reviewer, location, contributions, rating, visit + review dates, language) across all languages via same-origin paginated fetch, dedup, and export a searchable/sortable HTML report
 * Version: 1.0.0
 * Author: gl0bal01
 * Tags: osint, tripadvisor, reviews, scraping, export
 * Compatibility: all-browsers
 * Last Updated: 2026-06-05
 *
 * Use Cases:
 * - OSINT on venues/businesses (reviewer activity, locations, timelines)
 * - Reputation and review-pattern analysis across languages
 * - Archiving reviews before they change or disappear
 *
 * How it works:
 * - Rewrites the current TripAdvisor review URL to paginate (-Reviews-or10-, -or20-, ...)
 *   and forces filterLang=ALL so reviews in every language are returned
 * - Fetches each page same-origin (credentials included) and parses it with DOMParser
 * - Reads each reviewCard: reviewer, profile, location, contributions, rating,
 *   title, visit date, written/review date, language, and body text
 * - Deduplicates (by review URL, else a normalized key), keeping the longest body
 * - Exports a self-contained HTML report (sort by date/rating/name, live text filter)
 *
 * Privacy: same-origin only. It fetches TripAdvisor's own review pages (the site you are
 * on) and writes the result locally via a Blob download. No third-party calls.
 *
 * Usage Instructions:
 * 1. Open a TripAdvisor listing on its Reviews page
 * 2. Click the bookmarklet, enter how many reviews to export
 * 3. Wait while it paginates; an HTML report downloads automatically
 */

javascript:void(async () => {
    const TARGET = parseInt(prompt('How many TripAdvisor reviews to export?', '200') || '200', 10), STEP = 10, WAIT = 900;

    // --- helpers ---
    const clean = s => (s || '').replace(/\s+/g, ' ').trim(),
        txt = n => clean(n?.innerText || n?.textContent || ''),
        esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])),
        abs = u => { try { return new URL(u, location.href).href } catch (e) { return u || '' } },
        sleep = ms => new Promise(r => setTimeout(r, ms)),
        norm = s => clean(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N} ]/gu, '').trim();

    // --- on-page status indicator ---
    const status = document.createElement('div');
    status.style.cssText = 'position:fixed;z-index:999999;right:15px;bottom:15px;background:#111;color:#fff;padding:10px 12px;border-radius:8px;font:13px Arial;box-shadow:0 4px 20px #0005';
    document.body.appendChild(status);
    const setStatus = t => status.textContent = t;

    // --- build a paginated, all-languages review URL for a given offset ---
    const makeUrl = offset => {
        const u = new URL(location.href);
        u.searchParams.set('filterLang', 'ALL');
        let p = u.pathname;
        if (/-Reviews-or\d+-/.test(p)) p = p.replace(/-Reviews-or\d+-/, offset ? '-Reviews-or' + offset + '-' : '-Reviews-');
        else p = p.replace(/-Reviews-/, offset ? '-Reviews-or' + offset + '-' : '-Reviews-');
        u.pathname = p;
        return u.href;
    };

    // --- month name -> number (French + English, abbreviations) ---
    const months = {
        janvier: '01', février: '02', fevrier: '02', mars: '03', avril: '04', mai: '05', juin: '06', juillet: '07', août: '08', aout: '08', septembre: '09', sept: '09', octobre: '10', novembre: '11', décembre: '12', decembre: '12',
        january: '01', february: '02', march: '03', april: '04', may: '05', june: '06', july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
        jan: '01', feb: '02', mar: '03', apr: '04', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };

    const parseDate = s => {
        s = clean(s).toLowerCase().replace(/\u00a0/g, ' ').replace(/\./g, '');
        let m = s.match(/\b(\d{1,2})\s+([a-zéûôîïàèç]+)\s+(\d{4})\b/i);
        if (m && months[m[2]]) return `${m[3]}-${months[m[2]]}-${String(m[1]).padStart(2, '0')}`;
        m = s.match(/\b([a-zéûôîïàèç]+)\s+(\d{1,2}),?\s+(\d{4})\b/i);
        if (m && months[m[1]]) return `${m[3]}-${months[m[1]]}-${String(m[2]).padStart(2, '0')}`;
        m = s.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
        return m ? m[0] : '';
    };

    const parseMonth = s => {
        s = clean(s).toLowerCase().replace(/\u00a0/g, ' ').replace(/\./g, '');
        let m = s.match(/\b([a-zéûôîïàèç]+)\s+(\d{4})\b/i);
        if (m && months[m[1]]) return `${m[2]}-${months[m[1]]}`;
        m = s.match(/\b(\d{4})-(\d{2})\b/);
        return m ? m[0] : '';
    };

    const getRating = card => {
        const t = txt(card.querySelector('svg[data-automation="bubbleRatingImage"] title'));
        let m = t.replace(',', '.').match(/\b([1-5](?:\.\d)?)\s*(?:sur|\/|out of)\s*5\b/i);
        if (m) return m[1];
        m = t.replace(',', '.').match(/\b([1-5](?:\.\d)?)\s*(?:bulles?|bubbles?|étoiles?|etoiles?|stars?)\b/i);
        if (m) return m[1];
        const cls = [...card.querySelectorAll('[class*="bubble_"]')].map(x => x.className).join(' ');
        m = cls.match(/bubble_(\d+)/i);
        if (m) return String(Number(m[1]) / 10);
        return '';
    };

    const unique = a => [...new Set(a.filter(Boolean))];

    const parseCards = doc => {
        const cards = [...doc.querySelectorAll('[data-automation="reviewCard"]')];
        const out = [];
        for (const card of cards) {
            const prof = [...card.querySelectorAll('a[href*="/Profile/"]')].find(a => txt(a));
            const reviewer = txt(prof);
            const profile = prof ? abs(prof.getAttribute('href')) : '';
            const box = prof?.closest('.QIHsu') || prof?.parentElement;
            const bits = unique([...box?.querySelectorAll('span,div') || []].map(txt));
            const contributions = (txt(card).match(/([\d\s.,]+)\s+contributions?/i) || [])[1] || '';
            const location = bits.find(x => x && x !== reviewer && !/contributions?/i.test(x) && !/^\d+$/.test(x)) || '';
            const titleA = card.querySelector('h3[data-test-target="review-title"] a') || card.querySelector('h3 a');
            const title = txt(titleA || card.querySelector('h3[data-test-target="review-title"]') || card.querySelector('h3'));
            const review_url = titleA ? abs(titleA.getAttribute('href')) : '';
            const rating = getRating(card);
            const visitNode = card.querySelector('h3[data-test-target="review-title"] + div');
            const visit_date_raw = txt(visitNode);
            const visit_date_iso = parseMonth(visit_date_raw);
            const body = card.querySelector('[data-test-target="review-body"]');
            const langNode = body?.querySelector('[lang]');
            const lang = langNode?.getAttribute('lang') || '';
            let review = txt(langNode || body).replace(/\s*(Plus|Read more|Lire la suite)\s*$/i, '').trim();
            const all = txt(card).replace(/\u00a0/g, ' ');
            const written = (all.match(/(?:Rédigé le|Écrit le|Avis écrit le|Written|Reviewed)\s+(.+?)(?:Cet avis|This review|Avis recueilli|$)/i) || [])[1] || '';
            const review_date_raw = clean(written);
            const review_date_iso = parseDate(review_date_raw);
            if (!reviewer && !review) continue;
            out.push({ reviewer, profile, location, contributions: clean(contributions), rating, title, review_url, visit_date_raw, visit_date_iso, review_date_raw, review_date_iso, lang, review });
        }
        return out;
    };

    // --- dedup store (by review URL, else a normalized key); keep longest body ---
    const seen = new Map();
    const addRows = rows => {
        let added = 0;
        for (const r of rows) {
            if (!r.review || r.review.length < 3) continue;
            const key = r.review_url || [norm(r.reviewer), norm(r.title), norm(r.review_date_raw || r.visit_date_raw), norm(r.review).slice(0, 120)].join('|');
            const prev = seen.get(key);
            if (!prev || r.review.length > prev.review.length) { seen.set(key, r); added++ }
        }
        return added;
    };

    // --- paginate until we hit TARGET or 3 empty pages in a row ---
    for (let off = 0, stuck = 0; seen.size < TARGET && stuck < 3; off += STEP) {
        const url = makeUrl(off);
        setStatus('TripAdvisor: loading offset ' + off + ' | reviews: ' + seen.size);
        let page = '';
        try { const res = await fetch(url, { credentials: 'include' }); page = await res.text() }
        catch (e) { if (off === 0) alert('Fetch failed. Open the TripAdvisor page first, then run the bookmarklet again.'); break }
        const doc = new DOMParser().parseFromString(page, 'text/html');
        const added = addRows(parseCards(doc));
        if (!added) stuck++; else stuck = 0;
        await sleep(WAIT);
    }
    status.remove();

    let rows = [...seen.values()].slice(0, TARGET);
    if (!rows.length) { alert('No TripAdvisor reviews found. Make sure you are on a TripAdvisor review page.'); return }

    // --- build the exported HTML report ---
    const table = '<div class="controls"><input id="q" placeholder="Filter name/text/lang..." autocomplete="off"><select id="sort"><option value="date_desc">Review date: newest</option><option value="date_asc">Review date: oldest</option><option value="rating_desc">Rating: high to low</option><option value="rating_asc">Rating: low to high</option><option value="name_asc">Name A → Z</option><option value="name_desc">Name Z → A</option></select><span id="count"></span></div><table id="t"><thead><tr><th>reviewer</th><th>location</th><th>contributions</th><th>rating</th><th>title</th><th>visit_date_raw</th><th>visit_date_iso</th><th>review_date_raw</th><th>review_date_iso</th><th>lang</th><th>review</th></tr></thead><tbody>' + rows.map(r => '<tr data-name="' + esc((r.reviewer || '').toLowerCase()) + '" data-text="' + esc(((r.reviewer || '') + ' ' + (r.location || '') + ' ' + (r.title || '') + ' ' + (r.lang || '') + ' ' + (r.review || '')).toLowerCase()) + '" data-date="' + esc(r.review_date_iso || '0000-00-00') + '" data-rating="' + esc(r.rating || '0') + '"><td>' + (r.profile ? '<a target="_blank" href="' + esc(r.profile) + '">' + esc(r.reviewer) + '</a>' : esc(r.reviewer)) + '</td><td>' + esc(r.location) + '</td><td>' + esc(r.contributions) + '</td><td>' + esc(r.rating) + '</td><td>' + (r.review_url ? '<a target="_blank" href="' + esc(r.review_url) + '">' + esc(r.title) + '</a>' : esc(r.title)) + '</td><td>' + esc(r.visit_date_raw) + '</td><td>' + esc(r.visit_date_iso) + '</td><td>' + esc(r.review_date_raw) + '</td><td>' + esc(r.review_date_iso) + '</td><td>' + esc(r.lang) + '</td><td>' + esc(r.review) + '</td></tr>').join('') + '</tbody></table>';
    const out = '<!doctype html><html><head><meta charset="utf-8"><title>TripAdvisor Reviews</title><style>body{font-family:Arial,sans-serif;margin:20px}table{border-collapse:collapse;width:100%;font-size:14px}th,td{border:1px solid #ddd;padding:8px;vertical-align:top}th{background:#f5f5f5;position:sticky;top:0}td{max-width:520px}.controls{display:flex;gap:10px;align-items:center;position:sticky;top:0;background:#fff;padding:10px 0;z-index:10}input,select{font-size:14px;padding:8px;border:1px solid #ccc;border-radius:6px}input{width:300px}a{color:#0645ad;text-decoration:none}a:hover{text-decoration:underline}.note{background:#fff8d6;border:1px solid #eadf9c;padding:10px;margin:12px 0}</style></head><body><h1>TripAdvisor Reviews</h1><p>Exported ' + rows.length + ' reviews from <a target="_blank" href="' + esc(location.href) + '">TripAdvisor page</a>.</p><div class="note">This version targets <code>data-automation="reviewCard"</code> and requests pages with <code>filterLang=ALL</code>. If TripAdvisor displays translated text, the <code>lang</code> column may show values like <code>fr-x-mtfrom-en</code>.</div>' + table + '<script>const tb=document.querySelector("#t tbody"),q=document.querySelector("#q"),s=document.querySelector("#sort"),c=document.querySelector("#count");function rate(r){return parseFloat((r.dataset.rating||"0").replace(",","."))||0}function apply(){let rows=[...tb.querySelectorAll("tr")],qq=(q.value||"").toLowerCase().trim(),mode=s.value;rows.sort((a,b)=>{if(mode==="name_asc")return a.dataset.name.localeCompare(b.dataset.name,"fr");if(mode==="name_desc")return b.dataset.name.localeCompare(a.dataset.name,"fr");if(mode==="rating_asc")return rate(a)-rate(b);if(mode==="rating_desc")return rate(b)-rate(a);if(mode==="date_asc")return a.dataset.date.localeCompare(b.dataset.date);return b.dataset.date.localeCompare(a.dataset.date)});rows.forEach(r=>{r.style.display=!qq||r.dataset.text.includes(qq)?"":"none";tb.appendChild(r)});c.textContent=rows.filter(r=>r.style.display!=="none").length+" visible"}q.addEventListener("input",apply);s.addEventListener("change",apply);apply();<\/script></body></html>';

    const blob = new Blob([out], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tripadvisor_reviews_' + rows.length + '_all_languages_' + new Date().toISOString().slice(0, 10) + '.html';
    a.click();
    URL.revokeObjectURL(a.href);
    alert(rows.length + ' TripAdvisor reviews exported with filterLang=ALL.');
})();

/*
BOOKMARKLET CODE (copy this entire line for bookmark URL):
javascript:void(async()=>{const TARGET=parseInt(prompt('How many TripAdvisor reviews to export?','200')||'200',10),STEP=10,WAIT=900;const clean=s=>(s||'').replace(/\s+/g,' ').trim(),txt=n=>clean(n?.innerText||n?.textContent||''),esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])),abs=u=>{try{return new URL(u,location.href).href}catch(e){return u||''}},sleep=ms=>new Promise(r=>setTimeout(r,ms)),norm=s=>clean(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N} ]/gu,'').trim();const status=document.createElement('div');status.style.cssText='position:fixed;z-index:999999;right:15px;bottom:15px;background:#111;color:#fff;padding:10px 12px;border-radius:8px;font:13px Arial;box-shadow:0 4px 20px #0005';document.body.appendChild(status);const setStatus=t=>status.textContent=t;const makeUrl=offset=>{const u=new URL(location.href);u.searchParams.set('filterLang','ALL');let p=u.pathname;if(/-Reviews-or\d+-/.test(p))p=p.replace(/-Reviews-or\d+-/,offset?'-Reviews-or'+offset+'-':'-Reviews-');else p=p.replace(/-Reviews-/,offset?'-Reviews-or'+offset+'-':'-Reviews-');u.pathname=p;return u.href};const months={janvier:'01',février:'02',fevrier:'02',mars:'03',avril:'04',mai:'05',juin:'06',juillet:'07',août:'08',aout:'08',septembre:'09',sept:'09',octobre:'10',novembre:'11',décembre:'12',decembre:'12',january:'01',february:'02',march:'03',april:'04',may:'05',june:'06',july:'07',august:'08',september:'09',october:'10',november:'11',december:'12',jan:'01',feb:'02',mar:'03',apr:'04',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'};const parseDate=s=>{s=clean(s).toLowerCase().replace(/\u00a0/g,' ').replace(/\./g,'');let m=s.match(/\b(\d{1,2})\s+([a-zéûôîïàèç]+)\s+(\d{4})\b/i);if(m&&months[m[2]])return `${m[3]}-${months[m[2]]}-${String(m[1]).padStart(2,'0')}`;m=s.match(/\b([a-zéûôîïàèç]+)\s+(\d{1,2}),?\s+(\d{4})\b/i);if(m&&months[m[1]])return `${m[3]}-${months[m[1]]}-${String(m[2]).padStart(2,'0')}`;m=s.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);return m?m[0]:''};const parseMonth=s=>{s=clean(s).toLowerCase().replace(/\u00a0/g,' ').replace(/\./g,'');let m=s.match(/\b([a-zéûôîïàèç]+)\s+(\d{4})\b/i);if(m&&months[m[1]])return `${m[2]}-${months[m[1]]}`;m=s.match(/\b(\d{4})-(\d{2})\b/);return m?m[0]:''};const getRating=card=>{const t=txt(card.querySelector('svg[data-automation="bubbleRatingImage"] title'));let m=t.replace(',','.').match(/\b([1-5](?:\.\d)?)\s*(?:sur|\/|out of)\s*5\b/i);if(m)return m[1];m=t.replace(',','.').match(/\b([1-5](?:\.\d)?)\s*(?:bulles?|bubbles?|étoiles?|etoiles?|stars?)\b/i);if(m)return m[1];const cls=[...card.querySelectorAll('[class*="bubble_"]')].map(x=>x.className).join(' ');m=cls.match(/bubble_(\d+)/i);if(m)return String(Number(m[1])/10);return''};const unique=a=>[...new Set(a.filter(Boolean))];const parseCards=doc=>{const cards=[...doc.querySelectorAll('[data-automation="reviewCard"]')];const out=[];for(const card of cards){const prof=[...card.querySelectorAll('a[href*="/Profile/"]')].find(a=>txt(a));const reviewer=txt(prof);const profile=prof?abs(prof.getAttribute('href')):'';const box=prof?.closest('.QIHsu')||prof?.parentElement;const bits=unique([...box?.querySelectorAll('span,div')||[]].map(txt));const contributions=(txt(card).match(/([\d\s.,]+)\s+contributions?/i)||[])[1]||'';const location=bits.find(x=>x&&x!==reviewer&&!/contributions?/i.test(x)&&!/^\d+$/.test(x))||'';const titleA=card.querySelector('h3[data-test-target="review-title"] a')||card.querySelector('h3 a');const title=txt(titleA||card.querySelector('h3[data-test-target="review-title"]')||card.querySelector('h3'));const review_url=titleA?abs(titleA.getAttribute('href')):'';const rating=getRating(card);const visitNode=card.querySelector('h3[data-test-target="review-title"] + div');const visit_date_raw=txt(visitNode);const visit_date_iso=parseMonth(visit_date_raw);const body=card.querySelector('[data-test-target="review-body"]');const langNode=body?.querySelector('[lang]');const lang=langNode?.getAttribute('lang')||'';let review=txt(langNode||body).replace(/\s*(Plus|Read more|Lire la suite)\s*$/i,'').trim();const all=txt(card).replace(/\u00a0/g,' ');const written=(all.match(/(?:Rédigé le|Écrit le|Avis écrit le|Written|Reviewed)\s+(.+?)(?:Cet avis|This review|Avis recueilli|$)/i)||[])[1]||'';const review_date_raw=clean(written);const review_date_iso=parseDate(review_date_raw);if(!reviewer&&!review)continue;out.push({reviewer,profile,location,contributions:clean(contributions),rating,title,review_url,visit_date_raw,visit_date_iso,review_date_raw,review_date_iso,lang,review})}return out};const seen=new Map();const addRows=rows=>{let added=0;for(const r of rows){if(!r.review||r.review.length<3)continue;const key=r.review_url||[norm(r.reviewer),norm(r.title),norm(r.review_date_raw||r.visit_date_raw),norm(r.review).slice(0,120)].join('|');const prev=seen.get(key);if(!prev||r.review.length>prev.review.length){seen.set(key,r);added++}}return added};for(let off=0,stuck=0;seen.size<TARGET&&stuck<3;off+=STEP){const url=makeUrl(off);setStatus('TripAdvisor: loading offset '+off+' | reviews: '+seen.size);let page='';try{const res=await fetch(url,{credentials:'include'});page=await res.text()}catch(e){if(off===0)alert('Fetch failed. Open the TripAdvisor page first, then run the bookmarklet again.');break}const doc=new DOMParser().parseFromString(page,'text/html');const added=addRows(parseCards(doc));if(!added)stuck++;else stuck=0;await sleep(WAIT)}status.remove();let rows=[...seen.values()].slice(0,TARGET);if(!rows.length){alert('No TripAdvisor reviews found. Make sure you are on a TripAdvisor review page.');return}const table='<div class="controls"><input id="q" placeholder="Filter name/text/lang..." autocomplete="off"><select id="sort"><option value="date_desc">Review date: newest</option><option value="date_asc">Review date: oldest</option><option value="rating_desc">Rating: high to low</option><option value="rating_asc">Rating: low to high</option><option value="name_asc">Name A → Z</option><option value="name_desc">Name Z → A</option></select><span id="count"></span></div><table id="t"><thead><tr><th>reviewer</th><th>location</th><th>contributions</th><th>rating</th><th>title</th><th>visit_date_raw</th><th>visit_date_iso</th><th>review_date_raw</th><th>review_date_iso</th><th>lang</th><th>review</th></tr></thead><tbody>'+rows.map(r=>'<tr data-name="'+esc((r.reviewer||'').toLowerCase())+'" data-text="'+esc(((r.reviewer||'')+' '+(r.location||'')+' '+(r.title||'')+' '+(r.lang||'')+' '+(r.review||'')).toLowerCase())+'" data-date="'+esc(r.review_date_iso||'0000-00-00')+'" data-rating="'+esc(r.rating||'0')+'"><td>'+(r.profile?'<a target="_blank" href="'+esc(r.profile)+'">'+esc(r.reviewer)+'</a>':esc(r.reviewer))+'</td><td>'+esc(r.location)+'</td><td>'+esc(r.contributions)+'</td><td>'+esc(r.rating)+'</td><td>'+(r.review_url?'<a target="_blank" href="'+esc(r.review_url)+'">'+esc(r.title)+'</a>':esc(r.title))+'</td><td>'+esc(r.visit_date_raw)+'</td><td>'+esc(r.visit_date_iso)+'</td><td>'+esc(r.review_date_raw)+'</td><td>'+esc(r.review_date_iso)+'</td><td>'+esc(r.lang)+'</td><td>'+esc(r.review)+'</td></tr>').join('')+'</tbody></table>';const out='<!doctype html><html><head><meta charset="utf-8"><title>TripAdvisor Reviews</title><style>body{font-family:Arial,sans-serif;margin:20px}table{border-collapse:collapse;width:100%;font-size:14px}th,td{border:1px solid #ddd;padding:8px;vertical-align:top}th{background:#f5f5f5;position:sticky;top:0}td{max-width:520px}.controls{display:flex;gap:10px;align-items:center;position:sticky;top:0;background:#fff;padding:10px 0;z-index:10}input,select{font-size:14px;padding:8px;border:1px solid #ccc;border-radius:6px}input{width:300px}a{color:#0645ad;text-decoration:none}a:hover{text-decoration:underline}.note{background:#fff8d6;border:1px solid #eadf9c;padding:10px;margin:12px 0}</style></head><body><h1>TripAdvisor Reviews</h1><p>Exported '+rows.length+' reviews from <a target="_blank" href="'+esc(location.href)+'">TripAdvisor page</a>.</p><div class="note">This version targets <code>data-automation="reviewCard"</code> and requests pages with <code>filterLang=ALL</code>. If TripAdvisor displays translated text, the <code>lang</code> column may show values like <code>fr-x-mtfrom-en</code>.</div>'+table+'<script>const tb=document.querySelector("#t tbody"),q=document.querySelector("#q"),s=document.querySelector("#sort"),c=document.querySelector("#count");function rate(r){return parseFloat((r.dataset.rating||"0").replace(",","."))||0}function apply(){let rows=[...tb.querySelectorAll("tr")],qq=(q.value||"").toLowerCase().trim(),mode=s.value;rows.sort((a,b)=>{if(mode==="name_asc")return a.dataset.name.localeCompare(b.dataset.name,"fr");if(mode==="name_desc")return b.dataset.name.localeCompare(a.dataset.name,"fr");if(mode==="rating_asc")return rate(a)-rate(b);if(mode==="rating_desc")return rate(b)-rate(a);if(mode==="date_asc")return a.dataset.date.localeCompare(b.dataset.date);return b.dataset.date.localeCompare(a.dataset.date)});rows.forEach(r=>{r.style.display=!qq||r.dataset.text.includes(qq)?"":"none";tb.appendChild(r)});c.textContent=rows.filter(r=>r.style.display!=="none").length+" visible"}q.addEventListener("input",apply);s.addEventListener("change",apply);apply();<\/script></body></html>';const blob=new Blob([out],{type:'text/html;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='tripadvisor_reviews_'+rows.length+'_all_languages_'+new Date().toISOString().slice(0,10)+'.html';a.click();URL.revokeObjectURL(a.href);alert(rows.length+' TripAdvisor reviews exported with filterLang=ALL.');})();
*/
