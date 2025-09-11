/*!
 * Bookmarklet: Username Generator
 * Description: Generate comprehensive username variations with flexible input options
 * Version: 1.0.0
 * Author: gl0bal01
 * Tags: osint, enumeration, investigation, username, reconnaissance, security, social-media
 * Compatibility: all-browsers
 * Last Updated: 2025-09-11
 */

javascript:(function(){
    'use strict';
    
    // Configuration
    const CONFIG = {
        version: '1.0.0',
        name: 'Username Generator',
        popupId: 'osint-username-gen-' + Date.now()
    };
    
    // Prevent multiple instances
    if(window.__UsernameGenPopup__){
        try{
            window.__UsernameGenPopup__.focus();
            return;
        }catch(e){
            // Popup was closed, continue
        }
    }
    
    // Sanitization function
    function sanitize(str){
        return (typeof str === 'string' ? str : '').replace(/[^a-zA-Z0-9 _.\-]/g, '').trim();
    }
    
    // Capitalize function
    function capitalize(str){
        return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str;
    }
    
    // Parse existing username to extract potential first/last names
    function parseUsername(username){
        const clean = username.toLowerCase().replace(/[^a-z]/g, '');
        const parsed = {
            original: username,
            base: clean,
            possibleFirst: '',
            possibleLast: '',
            numbers: username.match(/\d+/g) || [],
            separators: username.match(/[._-]/g) || []
        };
        
        // Try to split on common separators
        const parts = username.split(/[._-]/);
        if(parts.length === 2){
            parsed.possibleFirst = sanitize(parts[0]);
            parsed.possibleLast = sanitize(parts[1]);
        } else if(clean.length >= 4){
            // Try to guess first/last split for longer usernames
            const mid = Math.floor(clean.length / 2);
            parsed.possibleFirst = clean.substring(0, mid);
            parsed.possibleLast = clean.substring(mid);
        }
        
        return parsed;
    }
    
    // Add variation to set with case options
    function addVariation(set, base, prefix, suffix, caseVariations){
        if(!base) return;
        const full = (prefix || '') + base + (suffix || '');
        if(full.length < 1 || full.length > 50) return; // Reasonable limits
        
        if(caseVariations){
            set.add(full.toLowerCase());
            set.add(full.toUpperCase());
            set.add(capitalize(full));
            if(full !== full.toLowerCase()) set.add(full); // Original case if different
        } else {
            set.add(full.toLowerCase());
        }
    }
    
    // Simple string replacement for prefix/suffix removal
    function removePrefix(str, prefix){
        if(!prefix) return str;
        if(str.toLowerCase().startsWith(prefix.toLowerCase())){
            return str.substring(prefix.length);
        }
        return str;
    }
    
    function removeSuffix(str, suffix){
        if(!suffix) return str;
        if(str.toLowerCase().endsWith(suffix.toLowerCase())){
            return str.substring(0, str.length - suffix.length);
        }
        return str;
    }
    
    // Main generation function
    function generateUsernames(opts){
        const {firstName, lastName, existingUsername, separators, suffix, prefix, includeNumbers, caseVariations} = opts;
        const usernames = new Set();
        
        let f = sanitize(firstName);
        let l = sanitize(lastName);
        let parsed = null;
        
        // Handle existing username input
        if(existingUsername && existingUsername.trim()){
            parsed = parseUsername(sanitize(existingUsername));
            // If no first/last provided, use parsed values
            if(!f && !l){
                f = parsed.possibleFirst;
                l = parsed.possibleLast;
            }
            // Add original username and base
            addVariation(usernames, parsed.original, prefix, suffix, caseVariations);
            addVariation(usernames, parsed.base, prefix, suffix, caseVariations);
        }
        
        // If we only have one name, treat it as flexible
        if(f && !l){
            l = ''; // Single name mode
        } else if(!f && l){
            f = l; // Use last as first
            l = '';
        }
        
        // Generate base combinations
        if(f){
            const fi = f.charAt(0);
            const f3 = f.substring(0, Math.min(3, f.length));
            const f4 = f.substring(0, Math.min(4, f.length));
            
            // Single name variations
            addVariation(usernames, f, prefix, suffix, caseVariations);
            addVariation(usernames, f3, prefix, suffix, caseVariations);
            addVariation(usernames, f4, prefix, suffix, caseVariations);
            addVariation(usernames, fi, prefix, suffix, caseVariations);
            
            if(l){
                const li = l.charAt(0);
                const l3 = l.substring(0, Math.min(3, l.length));
                const l4 = l.substring(0, Math.min(4, l.length));
                
                // Two-name combinations
                const combinations = [
                    f + l, l + f,
                    fi + l, l + fi,
                    f + li, li + f,
                    f3 + l3, l3 + f3,
                    f4 + l4, l4 + f4,
                    fi + li, li + fi,
                    l // Also add last name alone
                ];
                
                combinations.forEach(combo => addVariation(usernames, combo, prefix, suffix, caseVariations));
                
                // Combinations with separators
                const seps = separators.split(',').map(s => s.trim()).filter(Boolean);
                seps.forEach(sep => {
                    [
                        f + sep + l, l + sep + f,
                        f + sep + li, l + sep + fi,
                        fi + sep + l, li + sep + f,
                        f3 + sep + l3, l3 + sep + f3,
                        fi + sep + li, li + sep + fi
                    ].forEach(combo => addVariation(usernames, combo, prefix, suffix, caseVariations));
                });
            }
        }
        
        // Add number variations
        if(includeNumbers){
            const numbers = ['1', '01', '12', '123', '1234', '21', '2023', '2024', '2025'];
            if(parsed && parsed.numbers.length > 0){
                numbers.push(...parsed.numbers); // Include numbers from existing username
            }
            
            const currentUsernames = [...usernames];
            currentUsernames.forEach(username => {
                // Remove existing prefix/suffix to get base
                let base = username;
                base = removePrefix(base, prefix);
                base = removeSuffix(base, suffix);
                
                numbers.forEach(num => {
                    addVariation(usernames, base, prefix, (suffix || '') + num, caseVariations);
                    addVariation(usernames, base, (prefix || '') + num, suffix, caseVariations);
                });
            });
        }
        
        return [...usernames].filter(u => u.length > 0).sort();
    }
    
    // Create popup HTML - Using string concatenation to avoid template literal issues
    function createPopupHTML(){
        const html = '<!DOCTYPE html>' +
'<html>' +
'<head>' +
'    <title>' + CONFIG.name + '</title>' +
'    <meta charset="UTF-8">' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'    <style>' +
'        * { box-sizing: border-box; margin: 0; padding: 0; }' +
'        body {' +
'            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;' +
'            background: #0f172a;' +
'            color: #e2e8f0;' +
'            padding: 20px;' +
'            min-height: 100vh;' +
'        }' +
'        .container {' +
'            max-width: 800px;' +
'            margin: 0 auto;' +
'            background: #1e293b;' +
'            border-radius: 12px;' +
'            border: 1px solid #334155;' +
'            overflow: hidden;' +
'        }' +
'        .header {' +
'            background: #0f172a;' +
'            padding: 16px 20px;' +
'            border-bottom: 1px solid #334155;' +
'            display: flex;' +
'            justify-content: space-between;' +
'            align-items: center;' +
'        }' +
'        .title {' +
'            font-size: 18px;' +
'            font-weight: 600;' +
'            color: #f1f5f9;' +
'        }' +
'        .version {' +
'            font-size: 12px;' +
'            color: #64748b;' +
'            background: #374151;' +
'            padding: 2px 8px;' +
'            border-radius: 4px;' +
'        }' +
'        .content {' +
'            padding: 24px;' +
'        }' +
'        .input-group {' +
'            display: grid;' +
'            grid-template-columns: 1fr 1fr;' +
'            gap: 16px;' +
'            margin-bottom: 20px;' +
'        }' +
'        .input-full {' +
'            grid-column: 1 / -1;' +
'        }' +
'        .separator {' +
'            grid-column: 1 / -1;' +
'            text-align: center;' +
'            color: #64748b;' +
'            margin: 12px 0;' +
'            position: relative;' +
'        }' +
'        .separator::before {' +
'            content: "";' +
'            position: absolute;' +
'            top: 50%;' +
'            left: 0;' +
'            right: 0;' +
'            height: 1px;' +
'            background: #334155;' +
'        }' +
'        .separator span {' +
'            background: #1e293b;' +
'            padding: 0 12px;' +
'            font-size: 12px;' +
'            font-weight: 500;' +
'        }' +
'        label {' +
'            display: flex;' +
'            flex-direction: column;' +
'            gap: 6px;' +
'            font-size: 13px;' +
'            font-weight: 500;' +
'            color: #cbd5e1;' +
'        }' +
'        input, textarea {' +
'            padding: 10px 12px;' +
'            background: #0f172a;' +
'            border: 1px solid #475569;' +
'            border-radius: 8px;' +
'            color: #f1f5f9;' +
'            font-size: 13px;' +
'            font-family: inherit;' +
'        }' +
'        input:focus, textarea:focus {' +
'            outline: none;' +
'            border-color: #0ea5e9;' +
'            box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);' +
'        }' +
'        .checkbox-group {' +
'            display: flex;' +
'            gap: 20px;' +
'            margin: 16px 0;' +
'            align-items: center;' +
'        }' +
'        .checkbox-item {' +
'            display: flex;' +
'            align-items: center;' +
'            gap: 8px;' +
'            cursor: pointer;' +
'            font-size: 13px;' +
'        }' +
'        input[type="checkbox"] {' +
'            width: 16px;' +
'            height: 16px;' +
'            cursor: pointer;' +
'        }' +
'        .button-group {' +
'            display: flex;' +
'            gap: 12px;' +
'            margin: 20px 0;' +
'            align-items: center;' +
'        }' +
'        button {' +
'            padding: 10px 16px;' +
'            border: none;' +
'            border-radius: 8px;' +
'            font-size: 13px;' +
'            font-weight: 500;' +
'            cursor: pointer;' +
'            font-family: inherit;' +
'            transition: all 0.2s;' +
'        }' +
'        .btn-primary {' +
'            background: #0ea5e9;' +
'            color: white;' +
'        }' +
'        .btn-primary:hover {' +
'            background: #0284c7;' +
'        }' +
'        .btn-secondary {' +
'            background: #475569;' +
'            color: white;' +
'        }' +
'        .btn-secondary:hover {' +
'            background: #64748b;' +
'        }' +
'        .btn-secondary:disabled {' +
'            background: #334155;' +
'            color: #64748b;' +
'            cursor: not-allowed;' +
'        }' +
'        .status {' +
'            margin-left: auto;' +
'            font-size: 12px;' +
'            color: #64748b;' +
'        }' +
'        .output-section {' +
'            margin-top: 20px;' +
'            border-top: 1px solid #334155;' +
'            padding-top: 20px;' +
'        }' +
'        .meta {' +
'            font-size: 12px;' +
'            color: #64748b;' +
'            margin-bottom: 10px;' +
'        }' +
'        textarea {' +
'            width: 100%;' +
'            height: 200px;' +
'            resize: vertical;' +
'            font-family: ui-monospace, "Cascadia Code", Consolas, monospace;' +
'            line-height: 1.4;' +
'            white-space: pre;' +
'        }' +
'        .help-text {' +
'            font-size: 11px;' +
'            color: #64748b;' +
'            margin-top: 4px;' +
'        }' +
'    </style>' +
'</head>' +
'<body>' +
'    <div class="container">' +
'        <div class="header">' +
'            <div class="title">' + CONFIG.name + '</div>' +
'            <div class="version">v' + CONFIG.version + '</div>' +
'        </div>' +
'        <div class="content">' +
'            <div class="input-group">' +
'                <label>' +
'                    First name (optional)' +
'                    <input type="text" id="firstName" placeholder="John">' +
'                    <div class="help-text">Leave empty if unknown</div>' +
'                </label>' +
'                <label>' +
'                    Last name (optional)' +
'                    <input type="text" id="lastName" placeholder="Doe">' +
'                    <div class="help-text">Leave empty if unknown</div>' +
'                </label>' +
'                ' +
'                <div class="separator"><span>OR</span></div>' +
'                ' +
'                <label class="input-full">' +
'                    Existing username to expand' +
'                    <input type="text" id="existingUsername" placeholder="johndoe123, j.doe, john_d">' +
'                    <div class="help-text">Parse and generate variations from existing username</div>' +
'                </label>' +
'                ' +
'                <label>' +
'                    Separators (comma-separated)' +
'                    <input type="text" id="separators" value=".,_,-">' +
'                    <div class="help-text">Characters to use between name parts</div>' +
'                </label>' +
'                <label>' +
'                    Prefix (optional)' +
'                    <input type="text" id="prefix" placeholder="user, admin, etc.">' +
'                </label>' +
'                <label>' +
'                    Suffix (optional)' +
'                    <input type="text" id="suffix" placeholder="corp, dev, etc.">' +
'                </label>' +
'            </div>' +
'            ' +
'            <div class="checkbox-group">' +
'                <label class="checkbox-item">' +
'                    <input type="checkbox" id="includeNumbers">' +
'                    Include numbers (1, 123, 2024, etc.)' +
'                </label>' +
'                <label class="checkbox-item">' +
'                    <input type="checkbox" id="caseVariations" checked>' +
'                    Case variations (lower, UPPER, Title)' +
'                </label>' +
'            </div>' +
'            ' +
'            <div class="button-group">' +
'                <button class="btn-primary" id="generateBtn">Generate</button>' +
'                <button class="btn-secondary" id="copyBtn" disabled>Copy All</button>' +
'                <button class="btn-secondary" id="downloadBtn" disabled>Download .txt</button>' +
'                <div class="status" id="status">Ready</div>' +
'            </div>' +
'            ' +
'            <div class="output-section">' +
'                <div class="meta" id="meta">Enter information above and click Generate</div>' +
'                <textarea id="output" placeholder="Generated usernames will appear here..." readonly></textarea>' +
'            </div>' +
'        </div>' +
'    </div>' +
'    <script>' +
'        // All JavaScript functions defined above are available here' +
'        function sanitize(str) {' +
'            return (typeof str === "string" ? str : "").replace(/[^a-zA-Z0-9 _.-]/g, "").trim();' +
'        }' +
'        function capitalize(str) {' +
'            return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str;' +
'        }' +
'        function parseUsername(username) {' +
'            var clean = username.toLowerCase().replace(/[^a-z]/g, "");' +
'            var parsed = {' +
'                original: username,' +
'                base: clean,' +
'                possibleFirst: "",' +
'                possibleLast: "",' +
'                numbers: username.match(/\\d+/g) || [],' +
'                separators: username.match(/[._-]/g) || []' +
'            };' +
'            var parts = username.split(/[._-]/);' +
'            if (parts.length === 2) {' +
'                parsed.possibleFirst = sanitize(parts[0]);' +
'                parsed.possibleLast = sanitize(parts[1]);' +
'            } else if (clean.length >= 4) {' +
'                var mid = Math.floor(clean.length / 2);' +
'                parsed.possibleFirst = clean.substring(0, mid);' +
'                parsed.possibleLast = clean.substring(mid);' +
'            }' +
'            return parsed;' +
'        }' +
'        function addVariation(set, base, prefix, suffix, caseVariations) {' +
'            if (!base) return;' +
'            var full = (prefix || "") + base + (suffix || "");' +
'            if (full.length < 1 || full.length > 50) return;' +
'            if (caseVariations) {' +
'                set.add(full.toLowerCase());' +
'                set.add(full.toUpperCase());' +
'                set.add(capitalize(full));' +
'                if (full !== full.toLowerCase()) set.add(full);' +
'            } else {' +
'                set.add(full.toLowerCase());' +
'            }' +
'        }' +
'        function removePrefix(str, prefix) {' +
'            if (!prefix) return str;' +
'            if (str.toLowerCase().startsWith(prefix.toLowerCase())) {' +
'                return str.substring(prefix.length);' +
'            }' +
'            return str;' +
'        }' +
'        function removeSuffix(str, suffix) {' +
'            if (!suffix) return str;' +
'            if (str.toLowerCase().endsWith(suffix.toLowerCase())) {' +
'                return str.substring(0, str.length - suffix.length);' +
'            }' +
'            return str;' +
'        }' +
'        function generateUsernames(opts) {' +
'            var usernames = new Set();' +
'            var f = sanitize(opts.firstName);' +
'            var l = sanitize(opts.lastName);' +
'            var parsed = null;' +
'            if (opts.existingUsername && opts.existingUsername.trim()) {' +
'                parsed = parseUsername(sanitize(opts.existingUsername));' +
'                if (!f && !l) {' +
'                    f = parsed.possibleFirst;' +
'                    l = parsed.possibleLast;' +
'                }' +
'                addVariation(usernames, parsed.original, opts.prefix, opts.suffix, opts.caseVariations);' +
'                addVariation(usernames, parsed.base, opts.prefix, opts.suffix, opts.caseVariations);' +
'            }' +
'            if (f && !l) {' +
'                l = "";' +
'            } else if (!f && l) {' +
'                f = l;' +
'                l = "";' +
'            }' +
'            if (f) {' +
'                var fi = f.charAt(0);' +
'                var f3 = f.substring(0, Math.min(3, f.length));' +
'                var f4 = f.substring(0, Math.min(4, f.length));' +
'                addVariation(usernames, f, opts.prefix, opts.suffix, opts.caseVariations);' +
'                addVariation(usernames, f3, opts.prefix, opts.suffix, opts.caseVariations);' +
'                addVariation(usernames, f4, opts.prefix, opts.suffix, opts.caseVariations);' +
'                addVariation(usernames, fi, opts.prefix, opts.suffix, opts.caseVariations);' +
'                if (l) {' +
'                    var li = l.charAt(0);' +
'                    var l3 = l.substring(0, Math.min(3, l.length));' +
'                    var l4 = l.substring(0, Math.min(4, l.length));' +
'                    var combinations = [' +
'                        f + l, l + f,' +
'                        fi + l, l + fi,' +
'                        f + li, li + f,' +
'                        f3 + l3, l3 + f3,' +
'                        f4 + l4, l4 + f4,' +
'                        fi + li, li + fi,' +
'                        l' +
'                    ];' +
'                    combinations.forEach(function(combo) {' +
'                        addVariation(usernames, combo, opts.prefix, opts.suffix, opts.caseVariations);' +
'                    });' +
'                    var seps = opts.separators.split(",").map(function(s) { return s.trim(); }).filter(Boolean);' +
'                    seps.forEach(function(sep) {' +
'                        [' +
'                            f + sep + l, l + sep + f,' +
'                            f + sep + li, l + sep + fi,' +
'                            fi + sep + l, li + sep + f,' +
'                            f3 + sep + l3, l3 + sep + f3,' +
'                            fi + sep + li, li + sep + fi' +
'                        ].forEach(function(combo) {' +
'                            addVariation(usernames, combo, opts.prefix, opts.suffix, opts.caseVariations);' +
'                        });' +
'                    });' +
'                }' +
'            }' +
'            if (opts.includeNumbers) {' +
'                var numbers = ["1", "01", "12", "123", "1234", "21", "2023", "2024", "2025"];' +
'                if (parsed && parsed.numbers.length > 0) {' +
'                    numbers.push.apply(numbers, parsed.numbers);' +
'                }' +
'                var currentUsernames = Array.from(usernames);' +
'                currentUsernames.forEach(function(username) {' +
'                    var base = username;' +
'                    base = removePrefix(base, opts.prefix);' +
'                    base = removeSuffix(base, opts.suffix);' +
'                    numbers.forEach(function(num) {' +
'                        addVariation(usernames, base, opts.prefix, (opts.suffix || "") + num, opts.caseVariations);' +
'                        addVariation(usernames, base, (opts.prefix || "") + num, opts.suffix, opts.caseVariations);' +
'                    });' +
'                });' +
'            }' +
'            return Array.from(usernames).filter(function(u) { return u.length > 0; }).sort();' +
'        }' +
'        function downloadFile(filename, text) {' +
'            var blob = new Blob([text], { type: "text/plain" });' +
'            var url = URL.createObjectURL(blob);' +
'            var a = document.createElement("a");' +
'            a.href = url;' +
'            a.download = filename;' +
'            document.body.appendChild(a);' +
'            a.click();' +
'            a.remove();' +
'            URL.revokeObjectURL(url);' +
'        }' +
'        var elements = {' +
'            firstName: document.getElementById("firstName"),' +
'            lastName: document.getElementById("lastName"),' +
'            existingUsername: document.getElementById("existingUsername"),' +
'            separators: document.getElementById("separators"),' +
'            prefix: document.getElementById("prefix"),' +
'            suffix: document.getElementById("suffix"),' +
'            includeNumbers: document.getElementById("includeNumbers"),' +
'            caseVariations: document.getElementById("caseVariations"),' +
'            generateBtn: document.getElementById("generateBtn"),' +
'            copyBtn: document.getElementById("copyBtn"),' +
'            downloadBtn: document.getElementById("downloadBtn"),' +
'            status: document.getElementById("status"),' +
'            meta: document.getElementById("meta"),' +
'            output: document.getElementById("output")' +
'        };' +
'        elements.generateBtn.onclick = function() {' +
'            elements.status.textContent = "Generating...";' +
'            elements.copyBtn.disabled = true;' +
'            elements.downloadBtn.disabled = true;' +
'            var opts = {' +
'                firstName: elements.firstName.value,' +
'                lastName: elements.lastName.value,' +
'                existingUsername: elements.existingUsername.value,' +
'                separators: elements.separators.value || ".,_,-",' +
'                prefix: elements.prefix.value,' +
'                suffix: elements.suffix.value,' +
'                includeNumbers: elements.includeNumbers.checked,' +
'                caseVariations: elements.caseVariations.checked' +
'            };' +
'            if (!opts.firstName && !opts.lastName && !opts.existingUsername) {' +
'                elements.status.textContent = "Input required";' +
'                elements.meta.textContent = "❌ Please provide at least one: first name, last name, or existing username";' +
'                return;' +
'            }' +
'            try {' +
'                var usernames = generateUsernames(opts);' +
'                elements.output.value = usernames.join("\\n");' +
'                var inputDesc = opts.existingUsername ? ' +
'                    "from username \\"" + opts.existingUsername + "\\"" :' +
'                    "for " + (opts.firstName || "?") + " " + (opts.lastName || "?");' +
'                elements.meta.textContent = "Generated " + inputDesc + " • Total: " + usernames.length + " variations";' +
'                elements.status.textContent = "Complete ✓";' +
'                elements.copyBtn.disabled = false;' +
'                elements.downloadBtn.disabled = false;' +
'            } catch (error) {' +
'                elements.status.textContent = "Error occurred";' +
'                elements.meta.textContent = "❌ Generation failed. Please check inputs and try again.";' +
'            }' +
'        };' +
'        elements.copyBtn.onclick = function() {' +
'            elements.output.select();' +
'            elements.output.setSelectionRange(0, 99999);' +
'            try {' +
'                document.execCommand("copy");' +
'                elements.status.textContent = "Copied ✓";' +
'                setTimeout(function() { elements.status.textContent = "Complete ✓"; }, 2000);' +
'            } catch (error) {' +
'                elements.status.textContent = "Copy failed";' +
'            }' +
'        };' +
'        elements.downloadBtn.onclick = function() {' +
'            var timestamp = new Date().toISOString();' +
'            var usernames = elements.output.value.split("\\n").filter(Boolean);' +
'            var inputInfo = elements.existingUsername.value ? ' +
'                "Expanded from: " + elements.existingUsername.value :' +
'                "Names: " + (elements.firstName.value || "?") + " " + (elements.lastName.value || "?");' +
'            var header = "# Username Variations\\n# " + inputInfo + "\\n# Generated: " + timestamp + "\\n# Total: " + usernames.length + "\\n# Generator: ' + CONFIG.name + ' v' + CONFIG.version + '\\n#\\n# Usage: OSINT, social media search, account discovery\\n\\n";' +
'            var filename = "usernames_" + Date.now() + ".txt";' +
'            downloadFile(filename, header + usernames.join("\\n") + "\\n");' +
'            elements.status.textContent = "Downloaded ✓";' +
'            setTimeout(function() { elements.status.textContent = "Complete ✓"; }, 2000);' +
'        };' +
'        elements.firstName.focus();' +
'        elements.existingUsername.oninput = function() {' +
'            if (this.value.trim()) {' +
'                elements.firstName.style.opacity = "0.5";' +
'                elements.lastName.style.opacity = "0.5";' +
'            } else {' +
'                elements.firstName.style.opacity = "1";' +
'                elements.lastName.style.opacity = "1";' +
'            }' +
'        };' +
'        [elements.firstName, elements.lastName].forEach(function(input) {' +
'            input.oninput = function() {' +
'                if (elements.firstName.value.trim() || elements.lastName.value.trim()) {' +
'                    elements.existingUsername.style.opacity = "0.5";' +
'                } else {' +
'                    elements.existingUsername.style.opacity = "1";' +
'                }' +
'            };' +
'        });' +
'    </script>' +
'</body>' +
'</html>';
        return html;
    }
    
    // Open popup window
    const popup = window.open(
        'about:blank',
        CONFIG.popupId,
        'width=850,height=700,resizable=yes,scrollbars=yes,location=no,menubar=no,toolbar=no,status=no'
    );
    
    if(!popup){
        alert('Popup blocked! Please allow popups for this site and try again.');
        return;
    }
    
    popup.document.write(createPopupHTML());
    popup.document.close();
    
    // Store reference to popup
    window.__UsernameGenPopup__ = popup;
    
    // Clean up reference when popup is closed
    const checkClosed = setInterval(() => {
        if(popup.closed){
            clearInterval(checkClosed);
            delete window.__UsernameGenPopup__;
        }
    }, 1000);
    
})();

/*
BOOKMARKLET CODE (copy this entire line for bookmark URL):
javascript:(function(){'use strict';const CONFIG={version:'1.0.0',name:'Username Generator',popupId:'osint-username-gen-'+Date.now()};if(window.__UsernameGenPopup__){try{window.__UsernameGenPopup__.focus();return}catch(e){}}function sanitize(str){return(typeof str==='string'?str:'').replace(/[^a-zA-Z0-9 _.\-]/g,'').trim()}function capitalize(str){return str?str.charAt(0).toUpperCase()+str.slice(1).toLowerCase():str}function parseUsername(username){const clean=username.toLowerCase().replace(/[^a-z]/g,'');const parsed={original:username,base:clean,possibleFirst:'',possibleLast:'',numbers:username.match(/\d+/g)||[],separators:username.match(/[._-]/g)||[]};const parts=username.split(/[._-]/);if(parts.length===2){parsed.possibleFirst=sanitize(parts[0]);parsed.possibleLast=sanitize(parts[1])}else if(clean.length>=4){const mid=Math.floor(clean.length/2);parsed.possibleFirst=clean.substring(0,mid);parsed.possibleLast=clean.substring(mid)}return parsed}function addVariation(set,base,prefix,suffix,caseVariations){if(!base)return;const full=(prefix||'')+base+(suffix||'');if(full.length<1||full.length>50)return;if(caseVariations){set.add(full.toLowerCase());set.add(full.toUpperCase());set.add(capitalize(full));if(full!==full.toLowerCase())set.add(full)}else{set.add(full.toLowerCase())}}function removePrefix(str,prefix){if(!prefix)return str;if(str.toLowerCase().startsWith(prefix.toLowerCase())){return str.substring(prefix.length)}return str}function removeSuffix(str,suffix){if(!suffix)return str;if(str.toLowerCase().endsWith(suffix.toLowerCase())){return str.substring(0,str.length-suffix.length)}return str}function generateUsernames(opts){const{firstName,lastName,existingUsername,separators,suffix,prefix,includeNumbers,caseVariations}=opts;const usernames=new Set();let f=sanitize(firstName);let l=sanitize(lastName);let parsed=null;if(existingUsername&&existingUsername.trim()){parsed=parseUsername(sanitize(existingUsername));if(!f&&!l){f=parsed.possibleFirst;l=parsed.possibleLast}addVariation(usernames,parsed.original,prefix,suffix,caseVariations);addVariation(usernames,parsed.base,prefix,suffix,caseVariations)}if(f&&!l){l=''}else if(!f&&l){f=l;l=''}if(f){const fi=f.charAt(0);const f3=f.substring(0,Math.min(3,f.length));const f4=f.substring(0,Math.min(4,f.length));addVariation(usernames,f,prefix,suffix,caseVariations);addVariation(usernames,f3,prefix,suffix,caseVariations);addVariation(usernames,f4,prefix,suffix,caseVariations);addVariation(usernames,fi,prefix,suffix,caseVariations);if(l){const li=l.charAt(0);const l3=l.substring(0,Math.min(3,l.length));const l4=l.substring(0,Math.min(4,l.length));const combinations=[f+l,l+f,fi+l,l+fi,f+li,li+f,f3+l3,l3+f3,f4+l4,l4+f4,fi+li,li+fi,l];combinations.forEach(combo=>addVariation(usernames,combo,prefix,suffix,caseVariations));const seps=separators.split(',').map(s=>s.trim()).filter(Boolean);seps.forEach(sep=>{[f+sep+l,l+sep+f,f+sep+li,l+sep+fi,fi+sep+l,li+sep+f,f3+sep+l3,l3+sep+f3,fi+sep+li,li+sep+fi].forEach(combo=>addVariation(usernames,combo,prefix,suffix,caseVariations))})}}if(includeNumbers){const numbers=['1','01','12','123','1234','21','2023','2024','2025'];if(parsed&&parsed.numbers.length>0){numbers.push(...parsed.numbers)}const currentUsernames=[...usernames];currentUsernames.forEach(username=>{let base=username;base=removePrefix(base,prefix);base=removeSuffix(base,suffix);numbers.forEach(num=>{addVariation(usernames,base,prefix,(suffix||'')+num,caseVariations);addVariation(usernames,base,(prefix||'')+num,suffix,caseVariations)})})}return[...usernames].filter(u=>u.length>0).sort()}function createPopupHTML(){const html='<!DOCTYPE html><html><head><title>'+CONFIG.name+'</title><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:20px;min-height:100vh}.container{max-width:800px;margin:0 auto;background:#1e293b;border-radius:12px;border:1px solid #334155;overflow:hidden}.header{background:#0f172a;padding:16px 20px;border-bottom:1px solid #334155;display:flex;justify-content:space-between;align-items:center}.title{font-size:18px;font-weight:600;color:#f1f5f9}.version{font-size:12px;color:#64748b;background:#374151;padding:2px 8px;border-radius:4px}.content{padding:24px}.input-group{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}.input-full{grid-column:1/-1}.separator{grid-column:1/-1;text-align:center;color:#64748b;margin:12px 0;position:relative}.separator::before{content:"";position:absolute;top:50%;left:0;right:0;height:1px;background:#334155}.separator span{background:#1e293b;padding:0 12px;font-size:12px;font-weight:500}label{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500;color:#cbd5e1}input,textarea{padding:10px 12px;background:#0f172a;border:1px solid #475569;border-radius:8px;color:#f1f5f9;font-size:13px;font-family:inherit}input:focus,textarea:focus{outline:none;border-color:#0ea5e9;box-shadow:0 0 0 3px rgba(14,165,233,0.1)}.checkbox-group{display:flex;gap:20px;margin:16px 0;align-items:center}.checkbox-item{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px}input[type="checkbox"]{width:16px;height:16px;cursor:pointer}.button-group{display:flex;gap:12px;margin:20px 0;align-items:center}button{padding:10px 16px;border:none;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;transition:all 0.2s}.btn-primary{background:#0ea5e9;color:white}.btn-primary:hover{background:#0284c7}.btn-secondary{background:#475569;color:white}.btn-secondary:hover{background:#64748b}.btn-secondary:disabled{background:#334155;color:#64748b;cursor:not-allowed}.status{margin-left:auto;font-size:12px;color:#64748b}.output-section{margin-top:20px;border-top:1px solid #334155;padding-top:20px}.meta{font-size:12px;color:#64748b;margin-bottom:10px}textarea{width:100%;height:200px;resize:vertical;font-family:ui-monospace,"Cascadia Code",Consolas,monospace;line-height:1.4;white-space:pre}.help-text{font-size:11px;color:#64748b;margin-top:4px}</style></head><body><div class="container"><div class="header"><div class="title">'+CONFIG.name+'</div><div class="version">v'+CONFIG.version+'</div></div><div class="content"><div class="input-group"><label>First name (optional)<input type="text" id="firstName" placeholder="John"><div class="help-text">Leave empty if unknown</div></label><label>Last name (optional)<input type="text" id="lastName" placeholder="Doe"><div class="help-text">Leave empty if unknown</div></label><div class="separator"><span>OR</span></div><label class="input-full">Existing username to expand<input type="text" id="existingUsername" placeholder="johndoe123, j.doe, john_d"><div class="help-text">Parse and generate variations from existing username</div></label><label>Separators (comma-separated)<input type="text" id="separators" value=".,_,-"><div class="help-text">Characters to use between name parts</div></label><label>Prefix (optional)<input type="text" id="prefix" placeholder="user, admin, etc."></label><label>Suffix (optional)<input type="text" id="suffix" placeholder="corp, dev, etc."></label></div><div class="checkbox-group"><label class="checkbox-item"><input type="checkbox" id="includeNumbers">Include numbers (1, 123, 2024, etc.)</label><label class="checkbox-item"><input type="checkbox" id="caseVariations" checked>Case variations (lower, UPPER, Title)</label></div><div class="button-group"><button class="btn-primary" id="generateBtn">Generate</button><button class="btn-secondary" id="copyBtn" disabled>Copy All</button><button class="btn-secondary" id="downloadBtn" disabled>Download .txt</button><div class="status" id="status">Ready</div></div><div class="output-section"><div class="meta" id="meta">Enter information above and click Generate</div><textarea id="output" placeholder="Generated usernames will appear here..." readonly></textarea></div></div></div><script>function sanitize(str){return(typeof str==="string"?str:"").replace(/[^a-zA-Z0-9 _.-]/g,"").trim()}function capitalize(str){return str?str.charAt(0).toUpperCase()+str.slice(1).toLowerCase():str}function parseUsername(username){var clean=username.toLowerCase().replace(/[^a-z]/g,"");var parsed={original:username,base:clean,possibleFirst:"",possibleLast:"",numbers:username.match(/\\d+/g)||[],separators:username.match(/[._-]/g)||[]};var parts=username.split(/[._-]/);if(parts.length===2){parsed.possibleFirst=sanitize(parts[0]);parsed.possibleLast=sanitize(parts[1])}else if(clean.length>=4){var mid=Math.floor(clean.length/2);parsed.possibleFirst=clean.substring(0,mid);parsed.possibleLast=clean.substring(mid)}return parsed}function addVariation(set,base,prefix,suffix,caseVariations){if(!base)return;var full=(prefix||"")+base+(suffix||"");if(full.length<1||full.length>50)return;if(caseVariations){set.add(full.toLowerCase());set.add(full.toUpperCase());set.add(capitalize(full));if(full!==full.toLowerCase())set.add(full)}else{set.add(full.toLowerCase())}}function removePrefix(str,prefix){if(!prefix)return str;if(str.toLowerCase().startsWith(prefix.toLowerCase())){return str.substring(prefix.length)}return str}function removeSuffix(str,suffix){if(!suffix)return str;if(str.toLowerCase().endsWith(suffix.toLowerCase())){return str.substring(0,str.length-suffix.length)}return str}function generateUsernames(opts){var usernames=new Set();var f=sanitize(opts.firstName);var l=sanitize(opts.lastName);var parsed=null;if(opts.existingUsername&&opts.existingUsername.trim()){parsed=parseUsername(sanitize(opts.existingUsername));if(!f&&!l){f=parsed.possibleFirst;l=parsed.possibleLast}addVariation(usernames,parsed.original,opts.prefix,opts.suffix,opts.caseVariations);addVariation(usernames,parsed.base,opts.prefix,opts.suffix,opts.caseVariations)}if(f&&!l){l=""}else if(!f&&l){f=l;l=""}if(f){var fi=f.charAt(0);var f3=f.substring(0,Math.min(3,f.length));var f4=f.substring(0,Math.min(4,f.length));addVariation(usernames,f,opts.prefix,opts.suffix,opts.caseVariations);addVariation(usernames,f3,opts.prefix,opts.suffix,opts.caseVariations);addVariation(usernames,f4,opts.prefix,opts.suffix,opts.caseVariations);addVariation(usernames,fi,opts.prefix,opts.suffix,opts.caseVariations);if(l){var li=l.charAt(0);var l3=l.substring(0,Math.min(3,l.length));var l4=l.substring(0,Math.min(4,l.length));var combinations=[f+l,l+f,fi+l,l+fi,f+li,li+f,f3+l3,l3+f3,f4+l4,l4+f4,fi+li,li+fi,l];combinations.forEach(function(combo){addVariation(usernames,combo,opts.prefix,opts.suffix,opts.caseVariations)});var seps=opts.separators.split(",").map(function(s){return s.trim()}).filter(Boolean);seps.forEach(function(sep){[f+sep+l,l+sep+f,f+sep+li,l+sep+fi,fi+sep+l,li+sep+f,f3+sep+l3,l3+sep+f3,fi+sep+li,li+sep+fi].forEach(function(combo){addVariation(usernames,combo,opts.prefix,opts.suffix,opts.caseVariations)})})}}if(opts.includeNumbers){var numbers=["1","01","12","123","1234","21","2023","2024","2025"];if(parsed&&parsed.numbers.length>0){numbers.push.apply(numbers,parsed.numbers)}var currentUsernames=Array.from(usernames);currentUsernames.forEach(function(username){var base=username;base=removePrefix(base,opts.prefix);base=removeSuffix(base,opts.suffix);numbers.forEach(function(num){addVariation(usernames,base,opts.prefix,(opts.suffix||"")+num,opts.caseVariations);addVariation(usernames,base,(opts.prefix||"")+num,opts.suffix,opts.caseVariations)})})}return Array.from(usernames).filter(function(u){return u.length>0}).sort()}function downloadFile(filename,text){var blob=new Blob([text],{type:"text/plain"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)}var elements={firstName:document.getElementById("firstName"),lastName:document.getElementById("lastName"),existingUsername:document.getElementById("existingUsername"),separators:document.getElementById("separators"),prefix:document.getElementById("prefix"),suffix:document.getElementById("suffix"),includeNumbers:document.getElementById("includeNumbers"),caseVariations:document.getElementById("caseVariations"),generateBtn:document.getElementById("generateBtn"),copyBtn:document.getElementById("copyBtn"),downloadBtn:document.getElementById("downloadBtn"),status:document.getElementById("status"),meta:document.getElementById("meta"),output:document.getElementById("output")};elements.generateBtn.onclick=function(){elements.status.textContent="Generating...";elements.copyBtn.disabled=true;elements.downloadBtn.disabled=true;var opts={firstName:elements.firstName.value,lastName:elements.lastName.value,existingUsername:elements.existingUsername.value,separators:elements.separators.value||".,_,-",prefix:elements.prefix.value,suffix:elements.suffix.value,includeNumbers:elements.includeNumbers.checked,caseVariations:elements.caseVariations.checked};if(!opts.firstName&&!opts.lastName&&!opts.existingUsername){elements.status.textContent="Input required";elements.meta.textContent="❌ Please provide at least one: first name, last name, or existing username";return}try{var usernames=generateUsernames(opts);elements.output.value=usernames.join("\\n");var inputDesc=opts.existingUsername?"from username \\""+opts.existingUsername+"\\"":"for "+(opts.firstName||"?")+" "+(opts.lastName||"?");elements.meta.textContent="Generated "+inputDesc+" • Total: "+usernames.length+" variations";elements.status.textContent="Complete ✓";elements.copyBtn.disabled=false;elements.downloadBtn.disabled=false}catch(error){elements.status.textContent="Error occurred";elements.meta.textContent="❌ Generation failed. Please check inputs and try again."}};elements.copyBtn.onclick=function(){elements.output.select();elements.output.setSelectionRange(0,99999);try{document.execCommand("copy");elements.status.textContent="Copied ✓";setTimeout(function(){elements.status.textContent="Complete ✓"},2000)}catch(error){elements.status.textContent="Copy failed"}};elements.downloadBtn.onclick=function(){var timestamp=new Date().toISOString();var usernames=elements.output.value.split("\\n").filter(Boolean);var inputInfo=elements.existingUsername.value?"Expanded from: "+elements.existingUsername.value:"Names: "+(elements.firstName.value||"?")+" "+(elements.lastName.value||"?");var header="# Username Variations\\n# "+inputInfo+"\\n# Generated: "+timestamp+"\\n# Total: "+usernames.length+"\\n# Generator: '+CONFIG.name+' v'+CONFIG.version+'\\n#\\n# Usage: OSINT, social media search, account discovery\\n\\n";var filename="usernames_"+Date.now()+".txt";downloadFile(filename,header+usernames.join("\\n")+"\\n");elements.status.textContent="Downloaded ✓";setTimeout(function(){elements.status.textContent="Complete ✓"},2000)};elements.firstName.focus();elements.existingUsername.oninput=function(){if(this.value.trim()){elements.firstName.style.opacity="0.5";elements.lastName.style.opacity="0.5"}else{elements.firstName.style.opacity="1";elements.lastName.style.opacity="1"}};[elements.firstName,elements.lastName].forEach(function(input){input.oninput=function(){if(elements.firstName.value.trim()||elements.lastName.value.trim()){elements.existingUsername.style.opacity="0.5"}else{elements.existingUsername.style.opacity="1"}}})</script></body></html>';return html}const popup=window.open('about:blank',CONFIG.popupId,'width=850,height=700,resizable=yes,scrollbars=yes,location=no,menubar=no,toolbar=no,status=no');if(!popup){alert('Popup blocked! Please allow popups for this site and try again.');return}popup.document.write(createPopupHTML());popup.document.close();window.__UsernameGenPopup__=popup;const checkClosed=setInterval(()=>{if(popup.closed){clearInterval(checkClosed);delete window.__UsernameGenPopup__}},1000)})();
*/