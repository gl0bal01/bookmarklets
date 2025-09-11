/*!
 * Bookmarklet: Vessel Tracker Links Generator
 * Description: Generate tracking links for vessels using IMO, MMSI, or vessel name across multiple maritime platforms
 * Version: 1.2.0
 * Author: gl0bal01
 * Tags: osint, maritime, vessel, tracking, investigation
 * Compatibility: all-browsers
 * Last Updated: 2024-09-11
 * 
 * Use Cases:
 * - Maritime OSINT investigations
 * - Vessel tracking and monitoring
 * - Maritime security research
 * - Fleet management verification
 * 
 * Usage Instructions:
 * 1. Click the bookmarklet on any webpage
 * 2. Enter IMO number (7 digits), MMSI (9 digits), or vessel name
 * 3. For problematic IMO numbers, use "Force Search" option
 * 4. Click "Open All" to open links in new tabs
 * 5. Use "Copy Links" to copy URLs to clipboard
 * 6. Use "Download CSV" to export data
 */

javascript:(function(){
    'use strict';
    
    // Configuration object
    const CONFIG = {
        version: '1.2.0',
        name: 'Vessel Tracker',
        windowFeatures: 'width=950,height=750,resizable,scrollbars',
        debug: false
    };
    
    // Prevent multiple instances
    if (window.vesselTrackerRunning) {
        alert('Vessel Tracker is already running!');
        return;
    }
    window.vesselTrackerRunning = true;
    
    try {
        /* ----------------------------- Enhanced Validators ----------------------------- */
        function checksumOK(imo) {
            const m = String(imo).replace(/[^0-9]/g, '');
            if (m.length !== 7) return false;
            
            const digits = [];
            for (let i = 0; i < 7; i++) {
                digits[i] = parseInt(m.charAt(i), 10);
            }
            
            const weights = [7, 6, 5, 4, 3, 2];
            let sum = 0;
            
            // Calculate weighted sum explicitly
            sum = sum + (digits[0] * weights[0]);
            sum = sum + (digits[1] * weights[1]);
            sum = sum + (digits[2] * weights[2]);
            sum = sum + (digits[3] * weights[3]);
            sum = sum + (digits[4] * weights[4]);
            sum = sum + (digits[5] * weights[5]);
            
            // Calculate modulo explicitly
            const remainder = sum - (Math.floor(sum / 10) * 10);
            const actualCheckDigit = digits[6];
            
            // Debug logging if enabled
            if (CONFIG.debug) {
                console.log('IMO Checksum Debug:', {
                    imo: m,
                    digits: digits,
                    sum: sum,
                    remainder: remainder,
                    actualCheckDigit: actualCheckDigit,
                    valid: remainder === actualCheckDigit
                });
            }
            
            return remainder === actualCheckDigit;
        }

        function validateIMO(value, allowBypass) {
            const clean = String(value || '').replace(/[^0-9]/g, '');
            
            // Basic format check
            if (clean.length !== 7) {
                return { valid: false, reason: 'Must be exactly 7 digits', canBypass: false };
            }
            
            // Checksum validation
            const checksumValid = checksumOK(clean);
            if (checksumValid) {
                return { valid: true, reason: 'Valid IMO with correct checksum' };
            }
            
            // If checksum fails but bypass is allowed
            if (allowBypass) {
                return { valid: true, reason: 'Format valid (checksum bypassed)', bypassed: true };
            }
            
            return { 
                valid: false, 
                reason: 'Invalid checksum (click Force Search to bypass)', 
                canBypass: true 
            };
        }

        function validateMMSI(v) {
            const clean = String(v || '').replace(/[^0-9]/g, '');
            return clean.length === 9;
        }

        /* ----------------------------- Link builders -------------------------- */
        function linksForIMO(imo) {
            const id = String(imo).replace(/[^0-9]/g, '');
            return {
                MarineTraffic: 'https://www.marinevesseltraffic.com/vessels?page=1&vessel=' + id,
                VesselFinder: 'https://www.vesselfinder.com/vessels/details/' + id,
                MyShipTracking: 'https://www.myshiptracking.com/vessels/details/' + id,
                BalticShipping: 'https://www.balticshipping.com/vessel/imo/' + id,
                VesselTracker: 'https://www.vesseltracker.com/en/Ships/' + id + '.html',
            };
        }

        function linksForMMSI(mmsi) {
            const id = String(mmsi).replace(/[^0-9]/g, '');
            return {
                MarineTraffic: 'https://www.marinevesseltraffic.com/vessels?page=1&vessel=' + id,
                VesselFinder: 'https://www.vesselfinder.com/vessels?name=' + id,
                MyShipTracking: 'https://www.myshiptracking.com/?search=' + id,
                MarineVesselTraffic: 'https://www.marinevesseltraffic.com/vessels?mmsi=' + id,
            };
        }

        function linksForName(name) {
            const q = encodeURIComponent(name);
            return {
                VesselFinder: 'https://www.vesselfinder.com/vessels?name=' + q,
                MarineTraffic: 'https://www.marinetraffic.com/en/ais/index/search/all/keyword:' + q,
                MyShipTracking: 'https://www.myshiptracking.com/?search=' + q,
            };
        }

        /* ----------------------------- Helper functions ---------------------- */
        function openAll(linksObj) {
            const urls = Object.values(linksObj);
            let openedCount = 0;
            
            urls.forEach(function(url, index) {
                setTimeout(function() {
                    try {
                        window.open(url, '_blank');
                        openedCount = openedCount + 1;
                    } catch (error) {
                        console.warn('Failed to open:', url);
                    }
                }, index * 100);
            });
            
            setTimeout(function() {
                alert('Opened ' + openedCount + ' of ' + urls.length + ' links');
            }, urls.length * 100 + 500);
        }

        function copyToClipboard(text) {
            return new Promise(function(resolve, reject) {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text)
                        .then(resolve)
                        .catch(reject);
                } else {
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        const successful = document.execCommand('copy');
                        document.body.removeChild(textArea);
                        if (successful) {
                            resolve();
                        } else {
                            reject(new Error('Copy command failed'));
                        }
                    } catch (err) {
                        document.body.removeChild(textArea);
                        reject(err);
                    }
                }
            });
        }

        /* ----------------------------- CSV helpers ---------------------------- */
        function toCSV(rows) {
            function escapeCSV(value) {
                if (value == null) value = '';
                value = String(value);
                if (value.indexOf(',') !== -1 || value.indexOf('"') !== -1 || value.indexOf('\n') !== -1) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            }
            
            const header = 'Query Type,Query Value,Provider,URL\n';
            const csvRows = rows.map(function(row) {
                return [row.query_type, row.query_value, row.provider, row.url]
                    .map(escapeCSV)
                    .join(',');
            }).join('\n');
            
            return header + csvRows;
        }

        function rowsFromLinks(kind, value, linksObj) {
            const rows = [];
            for (const provider in linksObj) {
                if (linksObj.hasOwnProperty(provider)) {
                    rows.push({
                        query_type: kind,
                        query_value: value,
                        provider: provider,
                        url: linksObj[provider]
                    });
                }
            }
            return rows;
        }

        function downloadCSV(filename, csvContent) {
            try {
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('CSV download failed:', error);
                alert('CSV download failed. Check console for details.');
            }
        }

        /* ----------------------------- UI Creation ---------------------------- */
        const popup = window.open('', 'vessel_tracker_popup', CONFIG.windowFeatures);
        
        if (!popup) {
            alert('Popup blocked. Please allow popups for this site and try again.');
            return;
        }

        popup.document.title = 'Vessel Tracker';
        
        const head = popup.document.createElement('head');
        const style = popup.document.createElement('style');
        style.textContent = 'body{font-family:system-ui,sans-serif;background:#0f172a;color:#e5e7eb;margin:0;padding:16px;line-height:1.5}h2{margin-top:0;color:#60a5fa}h3{color:#93c5fd;margin-bottom:8px}input{padding:8px 12px;border-radius:6px;border:1px solid #334155;background:#111827;color:#e5e7eb;width:100%;box-sizing:border-box;margin-bottom:8px}input:focus{outline:none;border-color:#60a5fa;box-shadow:0 0 0 2px rgba(96,165,250,0.2)}.section{margin-bottom:20px;padding:16px;border:1px solid #334155;border-radius:8px;background:#1e293b}.buttons{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px}button{padding:8px 16px;border-radius:6px;border:1px solid #334155;background:#374151;color:#e5e7eb;cursor:pointer;font-size:14px;transition:background-color 0.2s}button:hover{background:#4b5563}button.primary{background:#1d4ed8;border-color:#1d4ed8}button.primary:hover{background:#1e40af}button.force{background:#dc2626;border-color:#dc2626}button.force:hover{background:#b91c1c}.links{margin-top:12px;max-height:200px;overflow-y:auto}.links a{color:#93c5fd;display:block;word-break:break-all;margin:4px 0;padding:4px 8px;border-radius:4px;background:#0f172a;text-decoration:none}.links a:hover{background:#1e293b;color:#bfdbfe}.validation-msg{font-size:12px;color:#ef4444;margin-top:4px}.validation-msg.valid{color:#10b981}.validation-msg.warning{color:#f59e0b}.debug-info{font-size:11px;color:#6b7280;margin-top:8px;padding:8px;background:#111827;border-radius:4px;font-family:monospace}';
        head.appendChild(style);
        popup.document.head.appendChild(head);

        const body = popup.document.createElement('body');
        
        const title = popup.document.createElement('h2');
        title.textContent = 'Vessel Tracker';
        body.appendChild(title);

        const imoSection = popup.document.createElement('div');
        imoSection.className = 'section';
        imoSection.innerHTML = '<h3>Search by IMO Number</h3><input id="imoInput" type="text" placeholder="Enter IMO number (7 digits)" maxlength="10" /><div id="imoValidation" class="validation-msg"></div><div class="buttons"><button id="imoOpen" class="primary">Open All Links</button><button id="imoForce" class="force" style="display:none">Force Search</button><button id="imoCopy">Copy All Links</button><button id="imoCSV">Download CSV</button><button id="debugToggle" style="font-size:11px">Debug Mode</button></div><div id="debugInfo" class="debug-info" style="display:none"></div><div id="imoLinks" class="links"></div>';
        body.appendChild(imoSection);

        const mmsiSection = popup.document.createElement('div');
        mmsiSection.className = 'section';
        mmsiSection.innerHTML = '<h3>Search by MMSI Number</h3><input id="mmsiInput" type="text" placeholder="Enter MMSI number (9 digits)" maxlength="12" /><div id="mmsiValidation" class="validation-msg"></div><div class="buttons"><button id="mmsiOpen" class="primary">Open All Links</button><button id="mmsiCopy">Copy All Links</button><button id="mmsiCSV">Download CSV</button></div><div id="mmsiLinks" class="links"></div>';
        body.appendChild(mmsiSection);

        const nameSection = popup.document.createElement('div');
        nameSection.className = 'section';
        nameSection.innerHTML = '<h3>Search by Vessel Name</h3><input id="nameInput" type="text" placeholder="Enter vessel name (minimum 3 characters)" /><div id="nameValidation" class="validation-msg"></div><div class="buttons"><button id="nameOpen" class="primary">Open All Links</button><button id="nameCopy">Copy All Links</button><button id="nameCSV">Download CSV</button></div><div id="nameLinks" class="links"></div>';
        body.appendChild(nameSection);

        popup.document.body.appendChild(body);

        const d = popup.document;

        function renderIMO(forceBypass) {
            const input = d.getElementById('imoInput');
            const validation = d.getElementById('imoValidation');
            const linksDiv = d.getElementById('imoLinks');
            const forceBtn = d.getElementById('imoForce');
            const debugDiv = d.getElementById('debugInfo');
            const value = input.value.trim();
            
            linksDiv.innerHTML = '';
            forceBtn.style.display = 'none';
            
            if (!value) {
                validation.textContent = '';
                if (CONFIG.debug) debugDiv.innerHTML = '';
                return;
            }
            
            const result = validateIMO(value, forceBypass);
            
            if (!result.valid) {
                validation.textContent = result.reason;
                validation.className = 'validation-msg';
                
                if (result.canBypass) {
                    forceBtn.style.display = 'inline-block';
                }
                
                if (CONFIG.debug) {
                    const clean = value.replace(/[^0-9]/g, '');
                    if (clean.length === 7) {
                        checksumOK(clean);
                        debugDiv.innerHTML = 'Check browser console for detailed checksum calculation';
                    }
                }
                return;
            }
            
            let validationText = result.reason;
            if (result.bypassed) {
                validation.className = 'validation-msg warning';
                validationText = validationText + ' ⚠️';
            } else {
                validation.className = 'validation-msg valid';
                validationText = validationText + ' ✓';
            }
            validation.textContent = validationText;
            
            const links = linksForIMO(value);
            for (const provider in links) {
                const link = d.createElement('a');
                link.href = links[provider];
                link.target = '_blank';
                link.textContent = provider + ': ' + links[provider];
                linksDiv.appendChild(link);
            }
        }

        function renderMMSI() {
            const input = d.getElementById('mmsiInput');
            const validation = d.getElementById('mmsiValidation');
            const linksDiv = d.getElementById('mmsiLinks');
            const value = input.value.trim();
            
            linksDiv.innerHTML = '';
            
            if (!value) {
                validation.textContent = '';
                return;
            }
            
            if (!validateMMSI(value)) {
                validation.textContent = 'Invalid MMSI number (must be exactly 9 digits)';
                validation.className = 'validation-msg';
                return;
            }
            
            validation.textContent = 'Valid MMSI number ✓';
            validation.className = 'validation-msg valid';
            
            const links = linksForMMSI(value);
            for (const provider in links) {
                const link = d.createElement('a');
                link.href = links[provider];
                link.target = '_blank';
                link.textContent = provider + ': ' + links[provider];
                linksDiv.appendChild(link);
            }
        }

        function renderName() {
            const input = d.getElementById('nameInput');
            const validation = d.getElementById('nameValidation');
            const linksDiv = d.getElementById('nameLinks');
            const value = input.value.trim();
            
            linksDiv.innerHTML = '';
            
            if (!value) {
                validation.textContent = '';
                return;
            }
            
            if (value.length < 3) {
                validation.textContent = 'Vessel name must be at least 3 characters';
                validation.className = 'validation-msg';
                return;
            }
            
            validation.textContent = 'Ready to search ✓';
            validation.className = 'validation-msg valid';
            
            const links = linksForName(value);
            for (const provider in links) {
                const link = d.createElement('a');
                link.href = links[provider];
                link.target = '_blank';
                link.textContent = provider + ': ' + links[provider];
                linksDiv.appendChild(link);
            }
        }

        function isValidForSearch(value, forceMode) {
            const result = validateIMO(value, forceMode);
            return result.valid;
        }

        d.getElementById('imoInput').addEventListener('input', function() { renderIMO(); });
        d.getElementById('mmsiInput').addEventListener('input', renderMMSI);
        d.getElementById('nameInput').addEventListener('input', renderName);

        // Debug toggle
        d.getElementById('debugToggle').addEventListener('click', function() {
            CONFIG.debug = !CONFIG.debug;
            const debugDiv = d.getElementById('debugInfo');
            debugDiv.style.display = CONFIG.debug ? 'block' : 'none';
            this.textContent = CONFIG.debug ? 'Debug: ON' : 'Debug Mode';
            renderIMO();
        });

        // Force button
        d.getElementById('imoForce').addEventListener('click', function() {
            renderIMO(true);
        });

        d.getElementById('imoOpen').addEventListener('click', function() {
            const value = d.getElementById('imoInput').value.trim();
            if (!isValidForSearch(value, true)) {
                alert('Please enter a valid IMO number first');
                return;
            }
            openAll(linksForIMO(value));
        });

        d.getElementById('imoCopy').addEventListener('click', function() {
            const value = d.getElementById('imoInput').value.trim();
            if (!isValidForSearch(value, true)) {
                alert('Please enter a valid IMO number first');
                return;
            }
            const links = Object.values(linksForIMO(value)).join('\n');
            copyToClipboard(links)
                .then(function() { alert('Links copied to clipboard!'); })
                .catch(function() {
                    prompt('Copy these links:', links);
                });
        });

        d.getElementById('imoCSV').addEventListener('click', function() {
            const value = d.getElementById('imoInput').value.trim();
            if (!isValidForSearch(value, true)) {
                alert('Please enter a valid IMO number first');
                return;
            }
            const rows = rowsFromLinks('IMO', value, linksForIMO(value));
            const csv = toCSV(rows);
            downloadCSV('vessel_imo_' + value + '_links.csv', csv);
        });

        d.getElementById('mmsiOpen').addEventListener('click', function() {
            const value = d.getElementById('mmsiInput').value.trim();
            if (!validateMMSI(value)) {
                alert('Please enter a valid MMSI number first');
                return;
            }
            openAll(linksForMMSI(value));
        });

        d.getElementById('mmsiCopy').addEventListener('click', function() {
            const value = d.getElementById('mmsiInput').value.trim();
            if (!validateMMSI(value)) {
                alert('Please enter a valid MMSI number first');
                return;
            }
            const links = Object.values(linksForMMSI(value)).join('\n');
            copyToClipboard(links)
                .then(function() { alert('Links copied to clipboard!'); })
                .catch(function() {
                    prompt('Copy these links:', links);
                });
        });

        d.getElementById('mmsiCSV').addEventListener('click', function() {
            const value = d.getElementById('mmsiInput').value.trim();
            if (!validateMMSI(value)) {
                alert('Please enter a valid MMSI number first');
                return;
            }
            const rows = rowsFromLinks('MMSI', value, linksForMMSI(value));
            const csv = toCSV(rows);
            downloadCSV('vessel_mmsi_' + value + '_links.csv', csv);
        });

        d.getElementById('nameOpen').addEventListener('click', function() {
            const value = d.getElementById('nameInput').value.trim();
            if (value.length < 3) {
                alert('Please enter a vessel name with at least 3 characters');
                return;
            }
            openAll(linksForName(value));
        });

        d.getElementById('nameCopy').addEventListener('click', function() {
            const value = d.getElementById('nameInput').value.trim();
            if (value.length < 3) {
                alert('Please enter a vessel name with at least 3 characters');
                return;
            }
            const links = Object.values(linksForName(value)).join('\n');
            copyToClipboard(links)
                .then(function() { alert('Links copied to clipboard!'); })
                .catch(function() {
                    prompt('Copy these links:', links);
                });
        });

        d.getElementById('nameCSV').addEventListener('click', function() {
            const value = d.getElementById('nameInput').value.trim();
            if (value.length < 3) {
                alert('Please enter a vessel name with at least 3 characters');
                return;
            }
            const rows = rowsFromLinks('NAME', value, linksForName(value));
            const csv = toCSV(rows);
            downloadCSV('vessel_name_' + value.replace(/[^a-zA-Z0-9]/g, '_') + '_links.csv', csv);
        });

        popup.addEventListener('beforeunload', function() {
            delete window.vesselTrackerRunning;
        });

        d.getElementById('imoInput').focus();

        alert('Vessel Tracker loaded successfully! Debug mode available for troubleshooting.');
        
    } catch (error) {
        console.error('Vessel Tracker Error:', error);
        alert('An error occurred: ' + error.message);
    } finally {
        if (!window.vesselTrackerPopupOpen) {
            setTimeout(function() {
                delete window.vesselTrackerRunning;
            }, 1000);
        }
    }
})();

/*
BOOKMARKLET CODE (copy this entire line for bookmark URL):
javascript:!function(){"use strict";const e={version:"1.2.0",name:"Vessel Tracker",windowFeatures:"width=950,height=750,resizable,scrollbars",debug:!1};if(window.vesselTrackerRunning)alert("Vessel Tracker is already running!");else{window.vesselTrackerRunning=!0;try{function t(t){const n=String(t).replace(/[^0-9]/g,"");if(7!==n.length)return!1;const i=[];for(let e=0;e<7;e++)i[e]=parseInt(n.charAt(e),10);const o=[7,6,5,4,3,2];let a=0;a+=i[0]*o[0],a+=i[1]*o[1],a+=i[2]*o[2],a+=i[3]*o[3],a+=i[4]*o[4],a+=i[5]*o[5];const r=a-10*Math.floor(a/10),s=i[6];return e.debug&&console.log("IMO Checksum Debug:",{imo:n,digits:i,sum:a,remainder:r,actualCheckDigit:s,valid:r===s}),r===s}function n(e,n){const i=String(e||"").replace(/[^0-9]/g,"");if(7!==i.length)return{valid:!1,reason:"Must be exactly 7 digits",canBypass:!1};return t(i)?{valid:!0,reason:"Valid IMO with correct checksum"}:n?{valid:!0,reason:"Format valid (checksum bypassed)",bypassed:!0}:{valid:!1,reason:"Invalid checksum (click Force Search to bypass)",canBypass:!0}}function i(e){return 9===String(e||"").replace(/[^0-9]/g,"").length}function o(e){const t=String(e).replace(/[^0-9]/g,"");return{MarineTraffic:"https://www.marinevesseltraffic.com/vessels?page=1&vessel="+t,VesselFinder:"https://www.vesselfinder.com/vessels/details/"+t,MyShipTracking:"https://www.myshiptracking.com/vessels/details/"+t,BalticShipping:"https://www.balticshipping.com/vessel/imo/"+t,VesselTracker:"https://www.vesseltracker.com/en/Ships/"+t+".html"}}function a(e){const t=String(e).replace(/[^0-9]/g,"");return{MarineTraffic:"https://www.marinevesseltraffic.com/vessels?page=1&vessel="+t,VesselFinder:"https://www.vesselfinder.com/vessels?name="+t,MyShipTracking:"https://www.myshiptracking.com/?search="+t,MarineVesselTraffic:"https://www.marinevesseltraffic.com/vessels?mmsi="+t}}function r(e){const t=encodeURIComponent(e);return{MarineTraffic:"https://www.marinetraffic.com/en/ais/index/search/all/keyword:"+t,VesselFinder:"https://www.vesselfinder.com/vessels?name="+t,MyShipTracking:"https://www.myshiptracking.com/?search="+t}}function s(e){const t=Object.values(e);let n=0;t.forEach((function(e,t){setTimeout((function(){try{window.open(e,"_blank"),n+=1}catch(t){console.warn("Failed to open:",e)}}),100*t)})),setTimeout((function(){alert("Opened "+n+" of "+t.length+" links")}),100*t.length+500)}function l(e){return new Promise((function(t,n){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(e).then(t).catch(n);else{const i=document.createElement("textarea");i.value=e,i.style.position="fixed",i.style.opacity="0",document.body.appendChild(i),i.select();try{const e=document.execCommand("copy");document.body.removeChild(i),e?t():n(new Error("Copy command failed"))}catch(e){document.body.removeChild(i),n(e)}}}))}function d(e){function t(e){return null==e&&(e=""),-1===(e=String(e)).indexOf(",")&&-1===e.indexOf('"')&&-1===e.indexOf("\n")||(e='"'+e.replace(/"/g,'""')+'"'),e}return"Query Type,Query Value,Provider,URL\n"+e.map((function(e){return[e.query_type,e.query_value,e.provider,e.url].map(t).join(",")})).join("\n")}function c(e,t,n){const i=[];for(const o in n)n.hasOwnProperty(o)&&i.push({query_type:e,query_value:t,provider:o,url:n[o]});return i}function m(e,t){try{const n=new Blob([t],{type:"text/csv;charset=utf-8;"}),i=document.createElement("a"),o=URL.createObjectURL(n);i.setAttribute("href",o),i.setAttribute("download",e),i.style.visibility="hidden",document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(o)}catch(e){console.error("CSV download failed:",e),alert("CSV download failed. Check console for details.")}}const u=window.open("","vessel_tracker_popup",e.windowFeatures);if(!u)return void alert("Popup blocked. Please allow popups for this site and try again.");u.document.title="Vessel Tracker";const p=u.document.createElement("head"),g=u.document.createElement("style");g.textContent="body{font-family:system-ui,sans-serif;background:#0f172a;color:#e5e7eb;margin:0;padding:16px;line-height:1.5}h2{margin-top:0;color:#60a5fa}h3{color:#93c5fd;margin-bottom:8px}input{padding:8px 12px;border-radius:6px;border:1px solid #334155;background:#111827;color:#e5e7eb;width:100%;box-sizing:border-box;margin-bottom:8px}input:focus{outline:none;border-color:#60a5fa;box-shadow:0 0 0 2px rgba(96,165,250,0.2)}.section{margin-bottom:20px;padding:16px;border:1px solid #334155;border-radius:8px;background:#1e293b}.buttons{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px}button{padding:8px 16px;border-radius:6px;border:1px solid #334155;background:#374151;color:#e5e7eb;cursor:pointer;font-size:14px;transition:background-color 0.2s}button:hover{background:#4b5563}button.primary{background:#1d4ed8;border-color:#1d4ed8}button.primary:hover{background:#1e40af}button.force{background:#dc2626;border-color:#dc2626}button.force:hover{background:#b91c1c}.links{margin-top:12px;max-height:200px;overflow-y:auto}.links a{color:#93c5fd;display:block;word-break:break-all;margin:4px 0;padding:4px 8px;border-radius:4px;background:#0f172a;text-decoration:none}.links a:hover{background:#1e293b;color:#bfdbfe}.validation-msg{font-size:12px;color:#ef4444;margin-top:4px}.validation-msg.valid{color:#10b981}.validation-msg.warning{color:#f59e0b}.debug-info{font-size:11px;color:#6b7280;margin-top:8px;padding:8px;background:#111827;border-radius:4px;font-family:monospace}",p.appendChild(g),u.document.head.appendChild(p);const b=u.document.createElement("body"),v=u.document.createElement("h2");v.textContent="Vessel Tracker",b.appendChild(v);const f=u.document.createElement("div");f.className="section",f.innerHTML='<h3>Search by IMO Number</h3><input id="imoInput" type="text" placeholder="Enter IMO number (7 digits)" maxlength="10" /><div id="imoValidation" class="validation-msg"></div><div class="buttons"><button id="imoOpen" class="primary">Open All Links</button><button id="imoForce" class="force" style="display:none">Force Search</button><button id="imoCopy">Copy All Links</button><button id="imoCSV">Download CSV</button><button id="debugToggle" style="font-size:11px">Debug Mode</button></div><div id="debugInfo" class="debug-info" style="display:none"></div><div id="imoLinks" class="links"></div>',b.appendChild(f);const h=u.document.createElement("div");h.className="section",h.innerHTML='<h3>Search by MMSI Number</h3><input id="mmsiInput" type="text" placeholder="Enter MMSI number (9 digits)" maxlength="12" /><div id="mmsiValidation" class="validation-msg"></div><div class="buttons"><button id="mmsiOpen" class="primary">Open All Links</button><button id="mmsiCopy">Copy All Links</button><button id="mmsiCSV">Download CSV</button></div><div id="mmsiLinks" class="links"></div>',b.appendChild(h);const y=u.document.createElement("div");y.className="section",y.innerHTML='<h3>Search by Vessel Name</h3><input id="nameInput" type="text" placeholder="Enter vessel name (minimum 3 characters)" /><div id="nameValidation" class="validation-msg"></div><div class="buttons"><button id="nameOpen" class="primary">Open All Links</button><button id="nameCopy">Copy All Links</button><button id="nameCSV">Download CSV</button></div><div id="nameLinks" class="links"></div>',b.appendChild(y),u.document.body.appendChild(b);const k=u.document;function w(i){const a=k.getElementById("imoInput"),r=k.getElementById("imoValidation"),s=k.getElementById("imoLinks"),l=k.getElementById("imoForce"),d=k.getElementById("debugInfo"),c=a.value.trim();if(s.innerHTML="",l.style.display="none",!c)return r.textContent="",void(e.debug&&(d.innerHTML=""));const m=n(c,i);if(!m.valid){if(r.textContent=m.reason,r.className="validation-msg",m.canBypass&&(l.style.display="inline-block"),e.debug){const e=c.replace(/[^0-9]/g,"");7===e.length&&(t(e),d.innerHTML="Check browser console for detailed checksum calculation")}return}let u=m.reason;m.bypassed?(r.className="validation-msg warning",u+=" ⚠️"):(r.className="validation-msg valid",u+=" ✓"),r.textContent=u;const p=o(c);for(const e in p){const t=k.createElement("a");t.href=p[e],t.target="_blank",t.textContent=e+": "+p[e],s.appendChild(t)}}function I(){const e=k.getElementById("mmsiInput"),t=k.getElementById("mmsiValidation"),n=k.getElementById("mmsiLinks"),o=e.value.trim();if(n.innerHTML="",!o)return void(t.textContent="");if(!i(o))return t.textContent="Invalid MMSI number (must be exactly 9 digits)",void(t.className="validation-msg");t.textContent="Valid MMSI number ✓",t.className="validation-msg valid";const r=a(o);for(const e in r){const t=k.createElement("a");t.href=r[e],t.target="_blank",t.textContent=e+": "+r[e],n.appendChild(t)}}function x(){const e=k.getElementById("nameInput"),t=k.getElementById("nameValidation"),n=k.getElementById("nameLinks"),i=e.value.trim();if(n.innerHTML="",!i)return void(t.textContent="");if(i.length<3)return t.textContent="Vessel name must be at least 3 characters",void(t.className="validation-msg");t.textContent="Ready to search ✓",t.className="validation-msg valid";const o=r(i);for(const e in o){const t=k.createElement("a");t.href=o[e],t.target="_blank",t.textContent=e+": "+o[e],n.appendChild(t)}}function E(e,t){return n(e,t).valid}k.getElementById("imoInput").addEventListener("input",(function(){w()})),k.getElementById("mmsiInput").addEventListener("input",I),k.getElementById("nameInput").addEventListener("input",x),k.getElementById("debugToggle").addEventListener("click",(function(){e.debug=!e.debug;k.getElementById("debugInfo").style.display=e.debug?"block":"none",this.textContent=e.debug?"Debug: ON":"Debug Mode",w()})),k.getElementById("imoForce").addEventListener("click",(function(){w(!0)})),k.getElementById("imoOpen").addEventListener("click",(function(){const e=k.getElementById("imoInput").value.trim();E(e,!0)?s(o(e)):alert("Please enter a valid IMO number first")})),k.getElementById("imoCopy").addEventListener("click",(function(){const e=k.getElementById("imoInput").value.trim();if(!E(e,!0))return void alert("Please enter a valid IMO number first");const t=Object.values(o(e)).join("\n");l(t).then((function(){alert("Links copied to clipboard!")})).catch((function(){prompt("Copy these links:",t)}))})),k.getElementById("imoCSV").addEventListener("click",(function(){const e=k.getElementById("imoInput").value.trim();if(!E(e,!0))return void alert("Please enter a valid IMO number first");m("vessel_imo_"+e+"_links.csv",d(c("IMO",e,o(e))))})),k.getElementById("mmsiOpen").addEventListener("click",(function(){const e=k.getElementById("mmsiInput").value.trim();i(e)?s(a(e)):alert("Please enter a valid MMSI number first")})),k.getElementById("mmsiCopy").addEventListener("click",(function(){const e=k.getElementById("mmsiInput").value.trim();if(!i(e))return void alert("Please enter a valid MMSI number first");const t=Object.values(a(e)).join("\n");l(t).then((function(){alert("Links copied to clipboard!")})).catch((function(){prompt("Copy these links:",t)}))})),k.getElementById("mmsiCSV").addEventListener("click",(function(){const e=k.getElementById("mmsiInput").value.trim();if(!i(e))return void alert("Please enter a valid MMSI number first");m("vessel_mmsi_"+e+"_links.csv",d(c("MMSI",e,a(e))))})),k.getElementById("nameOpen").addEventListener("click",(function(){const e=k.getElementById("nameInput").value.trim();e.length<3?alert("Please enter a vessel name with at least 3 characters"):s(r(e))})),k.getElementById("nameCopy").addEventListener("click",(function(){const e=k.getElementById("nameInput").value.trim();if(e.length<3)return void alert("Please enter a vessel name with at least 3 characters");const t=Object.values(r(e)).join("\n");l(t).then((function(){alert("Links copied to clipboard!")})).catch((function(){prompt("Copy these links:",t)}))})),k.getElementById("nameCSV").addEventListener("click",(function(){const e=k.getElementById("nameInput").value.trim();if(e.length<3)return void alert("Please enter a vessel name with at least 3 characters");const t=d(c("NAME",e,r(e)));m("vessel_name_"+e.replace(/[^a-zA-Z0-9]/g,"_")+"_links.csv",t)})),u.addEventListener("beforeunload",(function(){delete window.vesselTrackerRunning})),k.getElementById("imoInput").focus(),alert("Vessel Tracker (Fixed Modulo) loaded successfully! Debug mode available for troubleshooting.")}catch(C){console.error("Vessel Tracker Error:",C),alert("An error occurred: "+C.message)}finally{window.vesselTrackerPopupOpen||setTimeout((function(){delete window.vesselTrackerRunning}),1e3)}}}();
*/