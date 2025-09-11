/*!
 * Bookmarklet: Domain OSINT Hub v2.0.1
 * Description: Professional OSINT toolkit with working category toggles
 * Version: 2.0.1
 * Author: gl0bal01
 * Tags: osint, investigation, security, domain, reconnaissance, export, presets
 * Compatibility: all-browsers
 * Last Updated: 2025-09-11
 */

javascript:(function(){
    'use strict';
    
    const CONFIG = {
        version: '2.0.1',
        name: 'Domain OSINT Hub',
        windowName: 'domainOSINTHubV2',
        openDelay: 150,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
    };
    
    if (window.domainOSINTHub) {
        try {
            window.domainOSINTHub.focus();
            return;
        } catch(e) {}
    }
    
    try {
        const osintServiceCategories = {
            'reputation': {
                name: 'Reputation & Threat Intelligence',
                icon: '🛡️',
                color: '#ef4444',
                services: [
                    {name: 'VirusTotal', url: 'https://www.virustotal.com/gui/domain/{domain}'},
                    {name: 'URLVoid', url: 'https://www.urlvoid.com/scan/{domain}'},
                    {name: 'AlienVault OTX', url: 'https://otx.alienvault.com/indicator/domain/{domain}'},
                    {name: 'ThreatCrowd', url: 'https://www.threatcrowd.org/searchApi/v2/domain/report/?domain={domain}'},
                    {name: 'Google Safe Browsing', url: 'https://transparencyreport.google.com/safe-browsing/search?url={domain}'},
                    {name: 'Talos Intelligence', url: 'https://talosintelligence.com/reputation_center/lookup?search={domain}'},
                    {name: 'IPVoid', url: 'https://www.ipvoid.com/scan/{domain}/'}
                ]
            },
            'certificates': {
                name: 'Certificates & SSL',
                icon: '🔐',
                color: '#10b981',
                services: [
                    {name: 'crt.sh Certificates', url: 'https://crt.sh/?q={domain}'},
                    {name: 'CertSpotter API', url: 'https://api.certspotter.com/v1/issuances?domain={domain}&include_subdomains=true&expand=dns_names'},
                    {name: 'SSL Labs', url: 'https://www.ssllabs.com/ssltest/analyze.html?hideResults=on&d={domain}', longProcess: true}
                ]
            },
            'dns': {
                name: 'DNS & Network Infrastructure',
                icon: '🌐',
                color: '#3b82f6',
                services: [
                    {name: 'Robtex', url: 'https://www.robtex.com/dns-lookup/{domain}'},
                    {name: 'SecurityTrails', url: 'https://securitytrails.com/domain/{domain}/dns'},
                    {name: 'DNSlytics', url: 'https://dnslytics.com/domain/{domain}'},
                    {name: 'DNSDumpster', url: 'https://dnsdumpster.com/'},
                    {name: 'MXToolbox', url: 'https://mxtoolbox.com/SuperTool.aspx?action=a&run=toolpage&txtinput={domain}'},
                    {name: 'ViewDNS IP History', url: 'https://viewdns.info/iphistory/?domain={domain}'},
                    {name: 'ViewDNS Reverse IP', url: 'https://viewdns.info/reverseip/?host={domain}&t=1'}
                ]
            },
            'whois': {
                name: 'WHOIS & Registration',
                icon: '📋',
                color: '#8b5cf6',
                services: [
                    {name: 'DomainTools WHOIS', url: 'https://whois.domaintools.com/{domain}'},
                    {name: 'ViewDNS WHOIS', url: 'https://viewdns.info/whois/?domain={domain}'},
                    {name: 'Whoisology', url: 'https://whoisology.com/{domain}'},
                    {name: 'WhoIsRequest', url: 'https://whoisrequest.com/whois/{domain}'}
                ]
            },
            'intelligence': {
                name: 'Intelligence & Analytics',
                icon: '🔍',
                color: '#f59e0b',
                services: [
                    {name: 'Shodan', url: 'https://www.shodan.io/search?query=hostname:{domain}'},
                    {name: 'Host.io', url: 'https://host.io/{domain}'},
                    {name: 'SpyOnWeb', url: 'https://spyonweb.com/{domain}'},
                    {name: 'RiskIQ Community', url: 'https://community.riskiq.com/search/{domain}'},
                    {name: 'ThreatMiner', url: 'https://www.threatminer.org/domain.php?q={domain}'},
                    {name: 'Hybrid Analysis', url: 'https://www.hybrid-analysis.com/search?query={domain}'}
                ]
            },
            'technology': {
                name: 'Technology & Content',
                icon: '⚙️',
                color: '#06b6d4',
                services: [
                    {name: 'BuiltWith', url: 'https://builtwith.com/{domain}'},
                    {name: 'Wayback Machine', url: 'https://web.archive.org/web/*/{domain}/*'},
                    {name: 'Netcraft Site Report', url: 'https://sitereport.netcraft.com/?url={domain}'},
                    {name: 'DomainIQ', url: 'https://www.domainiq.com/domain/{domain}'}
                ]
            }
        };

        const defaultPresets = {
            'quick-scan': {
                name: '⚡ Quick Scan',
                description: 'Essential services for rapid assessment',
                services: ['VirusTotal', 'URLVoid', 'crt.sh Certificates', 'ViewDNS WHOIS', 'Shodan']
            },
            'full-investigation': {
                name: '🔍 Full Investigation', 
                description: 'Comprehensive analysis with all available services',
                services: 'all'
            },
            'reputation-check': {
                name: '🛡️ Reputation Check',
                description: 'Focus on threat intelligence and reputation',
                services: ['VirusTotal', 'URLVoid', 'AlienVault OTX', 'ThreatCrowd', 'Google Safe Browsing', 'Talos Intelligence']
            },
            'infrastructure': {
                name: '🌐 Infrastructure Analysis',
                description: 'DNS, certificates, and network infrastructure',
                services: ['crt.sh Certificates', 'SecurityTrails', 'DNSlytics', 'DNSDumpster', 'Robtex', 'MXToolbox', 'SSL Labs']
            },
            'passive-recon': {
                name: '👁️ Passive Reconnaissance',
                description: 'Non-intrusive information gathering',
                services: ['crt.sh Certificates', 'Wayback Machine', 'ViewDNS IP History', 'Whoisology', 'Host.io', 'BuiltWith']
            },
            'threat-hunting': {
                name: '🎯 Threat Hunting',
                description: 'Advanced threat intelligence gathering',
                services: ['VirusTotal', 'AlienVault OTX', 'ThreatCrowd', 'Hybrid Analysis', 'ThreatMiner', 'Shodan', 'RiskIQ Community']
            }
        };

        function cleanDomain(input) {
            return String(input || '')
                .trim()
                .replace(/^https?:\/\//i, '')
                .replace(/^ftp:\/\//i, '')
                .replace(/^[\w-]+:@/i, '')
                .replace(/\/.*$/, '')
                .replace(/:\d+$/, '')
                .replace(/^www\./i, '');
        }
        
        function isValidDomain(domain) {
            if (!domain || typeof domain !== 'string') return false;
            if (domain.length > 253) return false;
            if (!/\./.test(domain)) return false;
            if (domain.endsWith('.')) domain = domain.slice(0, -1);
            return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(domain);
        }
        
        let currentDomain = '';
        try {
            if (window.location && window.location.hostname) {
                currentDomain = cleanDomain(window.location.hostname);
            }
        } catch(e) {
            currentDomain = '';
        }
        
        if (!isValidDomain(currentDomain)) {
            const userInput = prompt('Enter domain for OSINT reconnaissance:', currentDomain || 'example.com');
            if (userInput === null) return;
            currentDomain = cleanDomain(userInput || 'example.com');
        }
        
        if (!isValidDomain(currentDomain)) {
            currentDomain = 'example.com';
        }
        
        if (window.domainOSINTHub) {
            try {
                window.domainOSINTHub.close();
            } catch(e) {}
        }
        
        const windowFeatures = CONFIG.isMobile ? 
            'width=400,height=600,scrollbars=yes,resizable=yes' :
            'width=700,height=800,scrollbars=yes,resizable=yes,menubar=no,toolbar=no';
            
        window.domainOSINTHub = window.open('', CONFIG.windowName, windowFeatures);
        
        if (!window.domainOSINTHub) {
            alert('Popup blocked! Please allow popups for this site and try again.\n\nTo enable popups:\n1. Click the popup blocker icon in your address bar\n2. Select "Always allow popups from this site"\n3. Try the bookmarklet again');
            return;
        }
        
        const popupDoc = window.domainOSINTHub.document;
        
        popupDoc.open();
        popupDoc.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Domain OSINT Hub v2.0</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body></body></html>');
        popupDoc.close();
        
        const styleElement = popupDoc.createElement('style');
        styleElement.textContent = `
            * { box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0; padding: ${CONFIG.isMobile ? '12px' : '20px'};
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh; color: #333; line-height: 1.5;
            }
            .container {
                background: #ffffff; padding: ${CONFIG.isMobile ? '16px' : '24px'};
                border-radius: ${CONFIG.isMobile ? '8px' : '16px'};
                box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 100%;
                ${CONFIG.isMobile ? 'min-height: calc(100vh - 24px);' : ''}
            }
            .header {
                text-align: center; margin-bottom: 24px; padding-bottom: 16px;
                border-bottom: 2px solid #667eea;
            }
            .header h1 {
                margin: 0; color: #2d3748; font-size: ${CONFIG.isMobile ? '20px' : '24px'};
                font-weight: 600;
            }
            .header .subtitle {
                color: #718096; font-size: ${CONFIG.isMobile ? '12px' : '14px'};
                margin-top: 4px;
            }
            .domain-section { margin-bottom: 20px; }
            .domain-input {
                width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0;
                border-radius: 8px; font-size: 16px; transition: border-color 0.2s;
                margin-bottom: 12px;
            }
            .domain-input:focus {
                outline: none; border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            .search-container {
                margin-bottom: 20px; padding: 16px; background: #f8fafc;
                border-radius: 8px; border: 1px solid #e2e8f0;
            }
            .search-input-group { position: relative; margin-bottom: 12px; }
            .search-input {
                width: 100%; padding: 10px 40px 10px 16px; border: 1px solid #d1d5db;
                border-radius: 6px; font-size: 14px; background: white;
            }
            .search-clear {
                position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
                background: none; border: none; font-size: 18px; color: #9ca3af;
                cursor: pointer; padding: 4px;
            }
            .search-filters { display: flex; gap: 6px; flex-wrap: wrap; }
            .filter-btn {
                padding: ${CONFIG.isMobile ? '6px 8px' : '6px 12px'};
                border: 1px solid #d1d5db; border-radius: 4px; background: white;
                font-size: ${CONFIG.isMobile ? '11px' : '12px'}; cursor: pointer;
                transition: all 0.2s;
            }
            .filter-btn:hover, .filter-btn.active {
                background: #667eea; color: white; border-color: #667eea;
            }
            .presets-section {
                margin: 20px 0; padding: 16px; background: #f8fafc;
                border-radius: 8px; border: 1px solid #e2e8f0;
            }
            .presets-header {
                display: flex; justify-content: space-between; align-items: center;
                margin-bottom: 16px;
            }
            .presets-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(${CONFIG.isMobile ? '140px' : '280px'}, 1fr));
                gap: 12px;
            }
            .preset-card {
                background: white; border: 1px solid #e2e8f0; border-radius: 6px;
                padding: 12px; display: flex;
                ${CONFIG.isMobile ? 'flex-direction: column;' : 'justify-content: space-between;'}
                align-items: ${CONFIG.isMobile ? 'center' : 'center'};
                transition: all 0.2s; text-align: ${CONFIG.isMobile ? 'center' : 'left'};
            }
            .preset-card:hover {
                box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-color: #667eea;
            }
            .preset-info {
                flex: 1; ${CONFIG.isMobile ? 'margin-bottom: 8px;' : ''}
            }
            .preset-name {
                font-weight: 600; color: #2d3748;
                font-size: ${CONFIG.isMobile ? '12px' : '14px'}; margin-bottom: 4px;
            }
            .preset-description {
                font-size: ${CONFIG.isMobile ? '10px' : '12px'}; color: #718096;
                margin-bottom: 4px; ${CONFIG.isMobile ? 'display: none;' : ''}
            }
            .preset-meta { font-size: 11px; color: #a0aec0; }
            .preset-actions { display: flex; gap: 4px; }
            .button-group {
                display: flex; gap: 8px; margin-bottom: 20px;
                ${CONFIG.isMobile ? 'flex-direction: column;' : 'flex-wrap: wrap;'}
            }
            .btn {
                padding: 10px 16px; border: none; border-radius: 8px;
                font-size: 14px; font-weight: 500; cursor: pointer;
                transition: all 0.2s;
                ${CONFIG.isMobile ? 'width: 100%;' : 'flex: 1; min-width: 120px;'}
            }
            .btn-primary { background: #667eea; color: white; }
            .btn-primary:hover { background: #5a6fd8; transform: translateY(-1px); }
            .btn-secondary { background: #e2e8f0; color: #4a5568; }
            .btn-secondary:hover { background: #cbd5e0; }
            .btn-success { background: #48bb78; color: white; }
            .btn-success:hover { background: #38a169; transform: translateY(-1px); }
            .btn:disabled {
                opacity: 0.6; cursor: not-allowed; transform: none !important;
            }
            .btn-mini {
                padding: 4px 8px; border: none; border-radius: 4px;
                font-size: 11px; font-weight: 500; cursor: pointer;
                background: #667eea; color: white; transition: all 0.2s;
            }
            .btn-mini:hover { background: #5a6fd8; transform: translateY(-1px); }
            .services-header {
                display: flex; justify-content: space-between; align-items: center;
                margin-bottom: 16px;
            }
            .services-title {
                font-size: 18px; font-weight: 600; color: #2d3748; margin: 0;
            }
            .counter {
                background: #667eea; color: white; padding: 4px 8px;
                border-radius: 12px; font-size: 12px; font-weight: 500;
            }
            .services-list {
                max-height: ${CONFIG.isMobile ? '60vh' : '400px'}; overflow-y: auto;
                border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;
                background: #f8fafc;
            }
            .category-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 12px 16px; margin: 8px 0 4px 0;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border-radius: 8px; border-left: 4px solid var(--category-color, #667eea);
                position: sticky; top: 0; z-index: 10;
            }
            .category-info { display: flex; align-items: center; gap: 8px; }
            .category-icon { font-size: 16px; }
            .category-name {
                font-weight: 600; color: #2d3748; font-size: 14px;
            }
            .category-count {
                background: #667eea; color: white; padding: 2px 6px;
                border-radius: 8px; font-size: 11px; font-weight: 500;
            }
            .category-services {
                margin-left: 16px; border-left: 2px solid #e2e8f0;
                padding-left: 16px; margin-bottom: 16px;
            }
            .service-item {
                display: flex; align-items: center; padding: 6px 0;
                border-bottom: 1px solid #e2e8f0;
            }
            .service-item:last-child { border-bottom: none; }
            .service-checkbox {
                margin-right: 12px; width: 16px; height: 16px;
                accent-color: #667eea;
            }
            .service-label {
                flex: 1; font-size: 14px; color: #4a5568; cursor: pointer;
                user-select: none;
            }
            .service-label:hover { color: #2d3748; }
            .long-process { color: #d69e2e !important; font-weight: 500; }
            .export-section {
                margin: 24px 0; padding: 20px; background: #f8fafc;
                border-radius: 8px; border: 1px solid #e2e8f0;
            }
            .section-title {
                font-size: 16px; font-weight: 600; color: #2d3748;
                margin: 0 0 12px 0;
            }
            .export-buttons {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(${CONFIG.isMobile ? '120px' : '140px'}, 1fr));
                gap: 8px;
            }
            .btn-export {
                padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px;
                background: white; color: #374151; font-size: 13px; font-weight: 500;
                cursor: pointer; transition: all 0.2s;
            }
            .btn-export:hover {
                background: #f3f4f6; border-color: #9ca3af; transform: translateY(-1px);
            }
            .status {
                background: #e6fffa; border: 1px solid #81e6d9; border-radius: 6px;
                padding: 8px 12px; margin: 8px 0; font-size: 13px; color: #285e61;
            }
            .error {
                background: #fed7d7; border-color: #fc8181; color: #742a2a;
            }
            .success {
                background: #d1fae5; border: 1px solid #10b981; color: #065f46;
            }
            .footer {
                margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0;
                text-align: center; color: #718096;
                font-size: ${CONFIG.isMobile ? '11px' : '12px'};
            }
            @media (max-width: 768px) {
                .category-services .service-item { padding: 8px 0; }
                .service-label { font-size: 13px; }
            }
        `;
        popupDoc.head.appendChild(styleElement);
        
        function addStatusMessage(message, type = 'status') {
            const status = popupDoc.getElementById('statusDiv');
            const statusMsg = popupDoc.createElement('div');
            statusMsg.className = 'status ' + type;
            statusMsg.textContent = message;
            status.appendChild(statusMsg);
            setTimeout(() => {
                if (statusMsg.parentNode) {
                    statusMsg.parentNode.removeChild(statusMsg);
                }
            }, 5000);
            return statusMsg;
        }
        
        class PresetManager {
            constructor() {
                this.presets = defaultPresets;
                this.activePreset = null;
            }
            
            applyPreset(presetKey) {
                const preset = this.presets[presetKey];
                if (!preset) return false;
                
                this.activePreset = presetKey;
                
                const allCheckboxes = popupDoc.querySelectorAll('.service-checkbox');
                allCheckboxes.forEach(cb => cb.checked = false);
                
                if (preset.services === 'all') {
                    allCheckboxes.forEach(cb => cb.checked = true);
                } else {
                    preset.services.forEach(serviceName => {
                        const checkbox = this.findServiceCheckbox(serviceName);
                        if (checkbox) checkbox.checked = true;
                    });
                }
                
                window.domainOSINTHub.updateCounter();
                addStatusMessage(`✅ Applied preset: ${preset.name}`, 'success');
                return true;
            }
            
            findServiceCheckbox(serviceName) {
                const allCheckboxes = popupDoc.querySelectorAll('.service-checkbox');
                for (let checkbox of allCheckboxes) {
                    const categoryKey = checkbox.dataset.category;
                    const serviceIndex = parseInt(checkbox.dataset.serviceIndex);
                    const service = osintServiceCategories[categoryKey].services[serviceIndex];
                    if (service.name === serviceName) {
                        return checkbox;
                    }
                }
                return null;
            }
            
            renderPresets() {
                const presetsContainer = popupDoc.getElementById('presetsContainer');
                if (!presetsContainer) return;
                
                const presetsGrid = presetsContainer.querySelector('.presets-grid');
                presetsGrid.innerHTML = Object.keys(this.presets).map(key => {
                    const preset = this.presets[key];
                    const serviceCount = preset.services === 'all' ? 'All' : preset.services.length;
                    return `
                        <div class="preset-card">
                            <div class="preset-info">
                                <div class="preset-name">${preset.name}</div>
                                <div class="preset-description">${preset.description}</div>
                                <div class="preset-meta">${serviceCount} services</div>
                            </div>
                            <div class="preset-actions">
                                <button class="preset-btn btn-mini" data-preset="${key}">Apply</button>
                            </div>
                        </div>
                    `;
                }).join('');
                
                presetsContainer.querySelectorAll('.preset-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        this.applyPreset(btn.dataset.preset);
                    });
                });
            }
        }
        
        class ServiceSearch {
            constructor() {
                this.searchTerm = '';
                this.activeFilters = new Set();
            }
            
            search(term) {
                this.searchTerm = term.toLowerCase();
                this.updateServiceVisibility();
            }
            
            toggleFilter(filter, btnElement) {
                if (this.activeFilters.has(filter)) {
                    this.activeFilters.delete(filter);
                    btnElement.classList.remove('active');
                } else {
                    this.activeFilters.add(filter);
                    btnElement.classList.add('active');
                }
                this.updateServiceVisibility();
            }
            
            clearSearch() {
                this.searchTerm = '';
                this.activeFilters.clear();
                
                const searchInput = popupDoc.querySelector('#serviceSearch');
                const filterBtns = popupDoc.querySelectorAll('.filter-btn');
                
                if (searchInput) searchInput.value = '';
                filterBtns.forEach(btn => btn.classList.remove('active'));
                
                this.updateServiceVisibility();
            }
            
            updateServiceVisibility() {
                const serviceItems = popupDoc.querySelectorAll('.service-item');
                
                serviceItems.forEach(item => {
                    const checkbox = item.querySelector('.service-checkbox');
                    const label = item.querySelector('.service-label');
                    const categoryKey = checkbox.dataset.category;
                    const serviceName = label.textContent.toLowerCase();
                    
                    let visible = true;
                    
                    if (this.searchTerm && !serviceName.includes(this.searchTerm)) {
                        visible = false;
                    }
                    
                    if (this.activeFilters.size > 0 && !this.activeFilters.has(categoryKey)) {
                        visible = false;
                    }
                    
                    item.style.display = visible ? 'flex' : 'none';
                });
                
                Object.keys(osintServiceCategories).forEach(categoryKey => {
                    const categoryServices = popupDoc.querySelector(`[data-category="${categoryKey}"]`);
                    if (categoryServices) {
                        const visibleServices = categoryServices.querySelectorAll('.service-item[style*="flex"], .service-item:not([style])').length;
                        const categoryHeader = categoryServices.previousElementSibling;
                        
                        if (categoryHeader && categoryHeader.classList.contains('category-header')) {
                            categoryHeader.style.display = visibleServices > 0 ? 'flex' : 'none';
                        }
                    }
                });
            }
        }
        
        function generateTextReport(domain, selectedServices, timestamp) {
            const report = [
                '='.repeat(60),
                'DOMAIN OSINT INVESTIGATION REPORT',
                '='.repeat(60),
                '',
                `Target Domain: ${domain}`,
                `Investigation Date: ${timestamp}`,
                `Generated by: Domain OSINT Hub v${CONFIG.version}`,
                `Selected Services: ${selectedServices.length}`,
                '',
                'INVESTIGATION URLS:',
                '-'.repeat(30),
                ''
            ];

            selectedServices.forEach((service, index) => {
                const url = service.url.replace(/{domain}/g, domain);
                report.push(`${index + 1}. ${service.name}`);
                report.push(`   URL: ${url}`);
                if (service.longProcess) {
                    report.push(`   Note: This service may take longer to complete`);
                }
                report.push('');
            });

            report.push(
                'INVESTIGATION CHECKLIST:',
                '-'.repeat(30),
                ''
            );

            selectedServices.forEach((service) => {
                report.push(`[ ] ${service.name} - Analysis completed`);
            });

            report.push(
                '',
                'FINDINGS SUMMARY:',
                '-'.repeat(30),
                '',
                '[ ] Domain reputation check completed',
                '[ ] DNS infrastructure analyzed', 
                '[ ] Certificate analysis completed',
                '[ ] Historical data reviewed',
                '[ ] Technology stack identified',
                '[ ] Threat intelligence gathered',
                '',
                'INVESTIGATION NOTES:',
                '-'.repeat(30),
                '',
                '(Add your investigation findings here)',
                '',
                '='.repeat(60),
                'End of Report',
                '='.repeat(60)
            );

            return report.join('\n');
        }
        
        function handleExport(format) {
            const domain = cleanDomain(popupDoc.getElementById('domainInput').value);
            const checkedBoxes = popupDoc.querySelectorAll('.service-checkbox:checked');
            
            if (checkedBoxes.length === 0) {
                addStatusMessage('⚠️ Please select at least one service before exporting', 'error');
                return;
            }
            
            const selectedServices = Array.from(checkedBoxes).map(checkbox => {
                const categoryKey = checkbox.dataset.category;
                const serviceIndex = parseInt(checkbox.dataset.serviceIndex);
                const service = osintServiceCategories[categoryKey].services[serviceIndex];
                return { ...service, category: categoryKey };
            });
            
            const timestamp = new Date().toISOString();
            let reportContent = generateTextReport(domain, selectedServices, timestamp);
            
            const blob = new Blob([reportContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = popupDoc.createElement('a');
            a.href = url;
            a.download = `osint-investigation-${domain}-${new Date().toISOString().split('T')[0]}.txt`;
            a.style.display = 'none';
            popupDoc.body.appendChild(a);
            a.click();
            popupDoc.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            addStatusMessage(`✅ Text report exported successfully!`, 'success');
        }
        
        const container = popupDoc.createElement('div');
        container.className = 'container';
        
        container.innerHTML = `
            <div class="header">
                <h1>🔍 Domain OSINT Hub v2.0</h1>
                <div class="subtitle">Professional Domain Reconnaissance Toolkit</div>
            </div>
            
            <div class="domain-section">
                <input type="text" class="domain-input" value="${currentDomain}" 
                       placeholder="Enter domain (e.g., example.com)" id="domainInput">
            </div>
            
            <div class="search-container">
                <div class="search-input-group">
                    <input type="text" id="serviceSearch" class="search-input" 
                           placeholder="🔍 Search services..." autocomplete="off">
                    <button class="search-clear" id="clearSearch" title="Clear search">×</button>
                </div>
                <div class="search-filters">
                    <button class="filter-btn" data-filter="reputation">🛡️ Reputation</button>
                    <button class="filter-btn" data-filter="dns">🌐 DNS</button>
                    <button class="filter-btn" data-filter="certificates">🔐 Certificates</button>
                    <button class="filter-btn" data-filter="intelligence">🔍 Intelligence</button>
                    <button class="filter-btn" data-filter="whois">📋 WHOIS</button>
                    <button class="filter-btn" data-filter="technology">⚙️ Technology</button>
                </div>
            </div>
            
            <div class="presets-section" id="presetsContainer">
                <div class="presets-header">
                    <h3 class="section-title">⚡ Service Presets</h3>
                </div>
                <div class="presets-grid"></div>
            </div>
            
            <div class="button-group">
                <button class="btn btn-secondary" id="checkAllBtn">☑️ Check All</button>
                <button class="btn btn-secondary" id="uncheckAllBtn">☐ Uncheck All</button>
                <button class="btn btn-primary" id="helpBtn">❓ Help (F1)</button>
            </div>
            
            <div class="services-header">
                <h3 class="services-title">🔧 OSINT Services</h3>
                <span class="counter" id="selectedCounter">0 selected</span>
            </div>
            
            <div class="services-list" id="servicesList"></div>
            
            <div class="button-group">
                <button class="btn btn-success" id="openSelectedBtn" disabled>🚀 Open Selected Services</button>
            </div>
            
            <div class="export-section">
                <div class="section-title">📄 Export Investigation</div>
                <div class="export-buttons">
                    <button class="btn-export" data-format="txt">📄 Text Report</button>
                </div>
            </div>
            
            <div id="statusDiv"></div>
            
            <div class="footer">
                Domain OSINT Hub v${CONFIG.version} | 30+ Services | Local Processing Only | CSP Compliant
            </div>
        `;
        
        popupDoc.body.appendChild(container);
        
        const presetManager = new PresetManager();
        const serviceSearch = new ServiceSearch();
        
        window.domainOSINTHub.updateServices = function() {
            const input = popupDoc.getElementById('domainInput');
            const list = popupDoc.getElementById('servicesList');
            const openBtn = popupDoc.getElementById('openSelectedBtn');
            const status = popupDoc.getElementById('statusDiv');
            
            if (!input || !list || !openBtn) return;
            
            const domain = cleanDomain(input.value);
            
            list.innerHTML = '';
            status.innerHTML = '';
            
            if (!isValidDomain(domain)) {
                addStatusMessage('⚠️ Please enter a valid domain (e.g., example.com)', 'error');
                openBtn.disabled = true;
                window.domainOSINTHub.updateCounter();
                return;
            }
            
            Object.keys(osintServiceCategories).forEach(categoryKey => {
                const category = osintServiceCategories[categoryKey];
                
                const categoryHeader = popupDoc.createElement('div');
                categoryHeader.className = 'category-header';
                categoryHeader.style.setProperty('--category-color', category.color);
                categoryHeader.innerHTML = `
                    <div class="category-info">
                        <span class="category-icon">${category.icon}</span>
                        <span class="category-name">${category.name}</span>
                        <span class="category-count">${category.services.length} services</span>
                    </div>
                    <div class="category-controls">
                        <button class="btn-mini category-toggle" data-category="${categoryKey}">Toggle All</button>
                    </div>
                `;
                list.appendChild(categoryHeader);
                
                const categoryServices = popupDoc.createElement('div');
                categoryServices.className = 'category-services';
                categoryServices.dataset.category = categoryKey;
                
                category.services.forEach((service, index) => {
                    const serviceItem = popupDoc.createElement('div');
                    serviceItem.className = 'service-item';
                    
                    const checkbox = popupDoc.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'service-checkbox';
                    checkbox.id = `service_${categoryKey}_${index}`;
                    checkbox.dataset.category = categoryKey;
                    checkbox.dataset.serviceIndex = index;
                    
                    const label = popupDoc.createElement('label');
                    label.className = 'service-label';
                    label.setAttribute('for', checkbox.id);
                    label.textContent = service.name;
                    
                    if (service.longProcess) {
                        label.className += ' long-process';
                        label.textContent += ' (long process)';
                    }
                    
                    checkbox.addEventListener('change', window.domainOSINTHub.updateCounter);
                    
                    serviceItem.appendChild(checkbox);
                    serviceItem.appendChild(label);
                    categoryServices.appendChild(serviceItem);
                });
                
                list.appendChild(categoryServices);
            });
            
            const categoryToggleBtns = popupDoc.querySelectorAll('.category-toggle');
            categoryToggleBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const categoryKey = btn.getAttribute('data-category');

                    // Resolve the right container robustly (header → next sibling section)
                    const container =
                        btn.closest('.category-header')?.nextElementSibling ||
                        popupDoc.querySelector(`.category-services[data-category="${categoryKey.replace(/["\\]/g, '\\$&')}"]`);

                    window.domainOSINTHub.toggleCategory(categoryKey, container);
                }, { capture: true });
            });

            
            popupDoc.title = 'Domain OSINT Hub v2.0 - ' + domain;
            window.domainOSINTHub.updateCounter();
        };
        
        window.domainOSINTHub.updateCounter = function() {
            const checkboxes = popupDoc.querySelectorAll('.service-checkbox:checked');
            const counter = popupDoc.getElementById('selectedCounter');
            const openBtn = popupDoc.getElementById('openSelectedBtn');
            
            const count = checkboxes.length;
            
            if (counter) {
                counter.textContent = count + ' selected';
            }
            
            if (openBtn) {
                openBtn.disabled = count === 0;
                openBtn.textContent = count > 0 ? `🚀 Open ${count} Selected Services` : '🚀 Open Selected Services';
            }
        };
        
        window.domainOSINTHub.checkAll = function() {
            const checkboxes = popupDoc.querySelectorAll('.service-checkbox');
            checkboxes.forEach(checkbox => checkbox.checked = true);
            window.domainOSINTHub.updateCounter();
        };
        
        window.domainOSINTHub.uncheckAll = function() {
            const checkboxes = popupDoc.querySelectorAll('.service-checkbox');
            checkboxes.forEach(checkbox => checkbox.checked = false);
            window.domainOSINTHub.updateCounter();
        };
        
        window.domainOSINTHub.toggleCategory = function(categoryKey) {
            console.log('Toggling category:', categoryKey); // Debug log
            
            const categoryServices = popupDoc.querySelector(`[data-category="${categoryKey}"]`);
            if (!categoryServices) {
                console.error('Category services not found for:', categoryKey);
                return;
            }
            
            const checkboxes = categoryServices.querySelectorAll('.service-checkbox');
            if (checkboxes.length === 0) {
                console.error('No checkboxes found in category:', categoryKey);
                return;
            }
            
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            checkboxes.forEach(cb => {
                cb.checked = !allChecked;
            });
            
            window.domainOSINTHub.updateCounter();
            
            const category = osintServiceCategories[categoryKey];
            const action = !allChecked ? 'selected' : 'deselected';
            addStatusMessage(`✅ ${action} all ${category.name} services`, 'success');
        };

        // WITH this hardened version:
        window.domainOSINTHub.toggleCategory = function(categoryKey, containerEl) {
            // Prefer the resolved sibling container from the click; fallback to a qualified selector
            const safeKey = (categoryKey || '').replace(/["\\]/g, '\\$&');
            const categoryServices =
                containerEl ||
                popupDoc.querySelector(`.category-services[data-category="${safeKey}"]`);

            if (!categoryServices) {
                console.error('Category services container not found for:', categoryKey);
                addStatusMessage(`❌ Could not find "${categoryKey}" section`, 'error');
                return;
            }

            const checkboxes = categoryServices.querySelectorAll('input.service-checkbox');
            if (checkboxes.length === 0) {
                console.error('No checkboxes in section:', categoryKey);
                addStatusMessage(`❌ No services in "${categoryKey}"`, 'error');
                return;
            }

            // Tri-state toggle: if all are checked → uncheck all; else → check all
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            checkboxes.forEach(cb => { cb.checked = !allChecked; });

            window.domainOSINTHub.updateCounter();

            const category = osintServiceCategories[categoryKey];
            addStatusMessage(
                `✅ ${!allChecked ? 'selected' : 'deselected'} all ${(category && category.name) || categoryKey} services`,
                'success'
            );
        };

        
        window.domainOSINTHub.openSelectedServices = function() {
            const input = popupDoc.getElementById('domainInput');
            const checkedBoxes = popupDoc.querySelectorAll('.service-checkbox:checked');
            const status = popupDoc.getElementById('statusDiv');
            
            if (!input) {
                addStatusMessage('❌ Error: Domain input not found', 'error');
                return;
            }
            
            const domain = cleanDomain(input.value);
            
            if (checkedBoxes.length === 0) {
                addStatusMessage('⚠️ Please select at least one service to open', 'error');
                return;
            }
            
            if (!isValidDomain(domain)) {
                addStatusMessage('⚠️ Please enter a valid domain', 'error');
                return;
            }
            
            const selectedServices = Array.from(checkedBoxes).map(checkbox => {
                const categoryKey = checkbox.dataset.category;
                const serviceIndex = parseInt(checkbox.dataset.serviceIndex);
                return osintServiceCategories[categoryKey].services[serviceIndex];
            });
            
            status.innerHTML = '';
            const statusMsg = addStatusMessage(`🚀 Opening ${selectedServices.length} services for ${domain}...`);
            
            let openedCount = 0;
            let failedCount = 0;
            
            selectedServices.forEach((service, index) => {
                setTimeout(() => {
                    try {
                        let url = service.url.replace(/{domain}/g, encodeURIComponent(domain));
                        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
                        
                        if (newWindow) {
                            openedCount++;
                        } else {
                            failedCount++;
                        }
                        
                        if (index === selectedServices.length - 1) {
                            setTimeout(() => {
                                if (failedCount === 0) {
                                    statusMsg.textContent = `✅ Successfully opened ${openedCount} services for ${domain}`;
                                    statusMsg.className = 'status success';
                                } else {
                                    statusMsg.textContent = `⚠️ Opened ${openedCount}/${selectedServices.length} services (${failedCount} blocked by popup blocker)`;
                                    statusMsg.className = 'status error';
                                }
                            }, 100);
                        }
                        
                    } catch(error) {
                        failedCount++;
                        console.error('Error opening service:', service.name, error);
                    }
                }, index * CONFIG.openDelay);
            });
        };
        
        const domainInput = popupDoc.getElementById('domainInput');
        const searchInput = popupDoc.getElementById('serviceSearch');
        const clearSearchBtn = popupDoc.getElementById('clearSearch');
        const filterBtns = popupDoc.querySelectorAll('.filter-btn');
        const checkAllBtn = popupDoc.getElementById('checkAllBtn');
        const uncheckAllBtn = popupDoc.getElementById('uncheckAllBtn');
        const helpBtn = popupDoc.getElementById('helpBtn');
        const openSelectedBtn = popupDoc.getElementById('openSelectedBtn');
        const exportBtns = popupDoc.querySelectorAll('.btn-export');
        
        domainInput.addEventListener('input', window.domainOSINTHub.updateServices);
        domainInput.addEventListener('paste', () => setTimeout(window.domainOSINTHub.updateServices, 100));
        
        searchInput.addEventListener('input', (e) => serviceSearch.search(e.target.value));
        clearSearchBtn.addEventListener('click', () => serviceSearch.clearSearch());
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => serviceSearch.toggleFilter(btn.dataset.filter, btn));
        });
        
        checkAllBtn.addEventListener('click', window.domainOSINTHub.checkAll);
        uncheckAllBtn.addEventListener('click', window.domainOSINTHub.uncheckAll);
        helpBtn.addEventListener('click', () => {
            alert('Domain OSINT Hub v2.0 Help:\n\n⌨️ Keyboard Shortcuts:\n• Ctrl+A: Check all services\n• Ctrl+D: Uncheck all services\n• 1-6: Apply presets 1-6\n• F1: Show this help\n• Esc: Close window\n\n🔍 Features:\n• Search services by name\n• Filter by category\n• Apply presets for common tasks\n• Export investigation reports\n• Mobile-optimized interface\n\n⚡ Quick Presets:\n1. Quick Scan\n2. Full Investigation\n3. Reputation Check\n4. Infrastructure Analysis\n5. Passive Reconnaissance\n6. Threat Hunting\n\n🔧 Toggle All Buttons:\n• Click "Toggle All" next to any category header\n• Toggles all services in that category on/off');
        });
        openSelectedBtn.addEventListener('click', window.domainOSINTHub.openSelectedServices);
        
        exportBtns.forEach(btn => {
            btn.addEventListener('click', () => handleExport(btn.dataset.format));
        });
        
        popupDoc.addEventListener('keydown', (e) => {
            const isCtrl = e.ctrlKey || e.metaKey;
            
            if (isCtrl && e.key === 'a') {
                e.preventDefault();
                window.domainOSINTHub.checkAll();
            } else if (isCtrl && e.key === 'd') {
                e.preventDefault();
                window.domainOSINTHub.uncheckAll();
            } else if (isCtrl && e.key === 'Enter') {
                e.preventDefault();
                window.domainOSINTHub.openSelectedServices();
            } else if (e.key === 'F1') {
                e.preventDefault();
                helpBtn.click();
            } else if (e.key === 'Escape') {
                try {
                    window.domainOSINTHub.close();
                } catch(err) {}
            } else if (/^[1-6]$/.test(e.key) && !isCtrl && !e.altKey) {
                const presetKeys = Object.keys(defaultPresets);
                const presetIndex = parseInt(e.key) - 1;
                if (presetKeys[presetIndex]) {
                    presetManager.applyPreset(presetKeys[presetIndex]);
                }
            } else if (e.key === 'Enter' && e.target === domainInput) {
                e.preventDefault();
                window.domainOSINTHub.updateServices();
            }
        });
        
        window.domainOSINTHub.presetManager = presetManager;
        window.domainOSINTHub.serviceSearch = serviceSearch;
        
        window.domainOSINTHub.updateServices();
        presetManager.renderPresets();
        window.domainOSINTHub.focus();
        
        domainInput.focus();
        domainInput.select();
        
    } catch (error) {
        console.error('Domain OSINT Hub Error:', error);
        alert('Domain OSINT Hub Error: ' + error.message + '\n\nPlease try again or check browser console for details.');
        
        if (window.domainOSINTHub) {
            try {
                window.domainOSINTHub.close();
            } catch(e) {}
            window.domainOSINTHub = null;
        }
    }
})();

/* 
BOOKMARKLET CODE (copy this entire line for bookmark URL):
javascript:!function(){"use strict";const e={version:"2.0.1",name:"Domain OSINT Hub",windowName:"domainOSINTHubV2",openDelay:150,isMobile:/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)||window.innerWidth<=768};if(window.domainOSINTHub)try{return void window.domainOSINTHub.focus()}catch(n){}try{const t={reputation:{name:"Reputation & Threat Intelligence",icon:"🛡%EF%B8%8F",color:"#ef4444",services:[{name:"VirusTotal",url:"https://www.virustotal.com/gui/domain/{domain}"},{name:"URLVoid",url:"https://www.urlvoid.com/scan/{domain}"},{name:"AlienVault OTX",url:"https://otx.alienvault.com/indicator/domain/{domain}"},{name:"ThreatCrowd",url:"https://www.threatcrowd.org/searchApi/v2/domain/report/?domain={domain}"},{name:"Google Safe Browsing",url:"https://transparencyreport.google.com/safe-browsing/search?url={domain}"},{name:"Talos Intelligence",url:"https://talosintelligence.com/reputation_center/lookup?search={domain}"},{name:"IPVoid",url:"https://www.ipvoid.com/scan/{domain}/"}]},certificates:{name:"Certificates & SSL",icon:"%F0%9F%94%90",color:"#10b981",services:[{name:"crt.sh Certificates",url:"https://crt.sh/?q={domain}"},{name:"CertSpotter API",url:"https://api.certspotter.com/v1/issuances?domain={domain}&include_subdomains=true&expand=dns_names"},{name:"SSL Labs",url:"https://www.ssllabs.com/ssltest/analyze.html?hideResults=on&d={domain}",longProcess:!0}]},dns:{name:"DNS & Network Infrastructure",icon:"🌐",color:"#3b82f6",services:[{name:"Robtex",url:"https://www.robtex.com/dns-lookup/{domain}"},{name:"SecurityTrails",url:"https://securitytrails.com/domain/{domain}/dns"},{name:"DNSlytics",url:"https://dnslytics.com/domain/{domain}"},{name:"DNSDumpster",url:"https://dnsdumpster.com/"},{name:"MXToolbox",url:"https://mxtoolbox.com/SuperTool.aspx?action=a&run=toolpage&txtinput={domain}"},{name:"ViewDNS IP History",url:"https://viewdns.info/iphistory/?domain={domain}"},{name:"ViewDNS Reverse IP",url:"https://viewdns.info/reverseip/?host={domain}&t=1"}]},whois:{name:"WHOIS & Registration",icon:"📋",color:"#8b5cf6",services:[{name:"DomainTools WHOIS",url:"https://whois.domaintools.com/{domain}"},{name:"ViewDNS WHOIS",url:"https://viewdns.info/whois/?domain={domain}"},{name:"Whoisology",url:"https://whoisology.com/{domain}"},{name:"WhoIsRequest",url:"https://whoisrequest.com/whois/{domain}"}]},intelligence:{name:"Intelligence & Analytics",icon:"🔍",color:"#f59e0b",services:[{name:"Shodan",url:"https://www.shodan.io/search?query=hostname:{domain}"},{name:"Host.io",url:"https://host.io/{domain}"},{name:"SpyOnWeb",url:"https://spyonweb.com/{domain}"},{name:"RiskIQ Community",url:"https://community.riskiq.com/search/{domain}"},{name:"ThreatMiner",url:"https://www.threatminer.org/domain.php?q={domain}"},{name:"Hybrid Analysis",url:"https://www.hybrid-analysis.com/search?query={domain}"}]},technology:{name:"Technology & Content",icon:"⚙%EF%B8%8F",color:"#06b6d4",services:[{name:"BuiltWith",url:"https://builtwith.com/{domain}"},{name:"Wayback Machine",url:"https://web.archive.org/web/*/{domain}/*"},{name:"Netcraft Site Report",url:"https://sitereport.netcraft.com/?url={domain}"},{name:"DomainIQ",url:"https://www.domainiq.com/domain/{domain}"}]}},o={"quick-scan":{name:"⚡ Quick Scan",description:"Essential services for rapid assessment",services:["VirusTotal","URLVoid","crt.sh Certificates","ViewDNS WHOIS","Shodan"]},"full-investigation":{name:"🔍 Full Investigation",description:"Comprehensive analysis with all available services",services:"all"},"reputation-check":{name:"🛡%EF%B8%8F Reputation Check",description:"Focus on threat intelligence and reputation",services:["VirusTotal","URLVoid","AlienVault OTX","ThreatCrowd","Google Safe Browsing","Talos Intelligence"]},infrastructure:{name:"🌐 Infrastructure Analysis",description:"DNS, certificates, and network infrastructure",services:["crt.sh Certificates","SecurityTrails","DNSlytics","DNSDumpster","Robtex","MXToolbox","SSL Labs"]},"passive-recon":{name:"👁%EF%B8%8F Passive Reconnaissance",description:"Non-intrusive information gathering",services:["crt.sh Certificates","Wayback Machine","ViewDNS IP History","Whoisology","Host.io","BuiltWith"]},"threat-hunting":{name:"🎯 Threat Hunting",description:"Advanced threat intelligence gathering",services:["VirusTotal","AlienVault OTX","ThreatCrowd","Hybrid Analysis","ThreatMiner","Shodan","RiskIQ Community"]}};function i(e){return String(e||"").trim().replace(/^https?:\/\//i,"").replace(/^ftp:\/\//i,"").replace(/^[\w-]+:@/i,"").replace(/\/.*$/,"").replace(/:\d+$/,"").replace(/^www\./i,"")}function r(e){return!(!e||"string"!=typeof e)&&(!(e.length>253)&&(!!/\./.test(e)&&(e.endsWith(".")&&(e=e.slice(0,-1)),/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(e))))}let a="";try{window.location&&window.location.hostname&&(a=i(window.location.hostname))}catch(O){a=""}if(!r(a)){const E=prompt("Enter domain for OSINT reconnaissance:",a||"example.com");if(null===E)return;a=i(E||"example.com")}if(r(a)||(a="example.com"),window.domainOSINTHub)try{window.domainOSINTHub.close()}catch(C){}const s=e.isMobile?"width=400,height=600,scrollbars=yes,resizable=yes":"width=700,height=800,scrollbars=yes,resizable=yes,menubar=no,toolbar=no";if(window.domainOSINTHub=window.open("",e.windowName,s),!window.domainOSINTHub)return void alert('Popup blocked! Please allow popups for this site and try again.\n\nTo enable popups:\n1. Click the popup blocker icon in your address bar\n2. Select "Always allow popups from this site"\n3. Try the bookmarklet again');const c=window.domainOSINTHub.document;c.open(),c.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Domain OSINT Hub v2.0</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body></body></html>'),c.close();const l=c.createElement("style");function d(e,n="status"){const t=c.getElementById("statusDiv"),o=c.createElement("div");return o.className="status "+n,o.textContent=e,t.appendChild(o),setTimeout((()=>{o.parentNode&&o.parentNode.removeChild(o)}),5e3),o}l.textContent=%60*{box-sizing:border-box;}body{font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;margin:0;padding:${e.isMobile?"12px":"20px"};background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);min-height:100vh;color:#333;line-height:1.5;}.container{background:#ffffff;padding:${e.isMobile?"16px":"24px"};border-radius:${e.isMobile?"8px":"16px"};box-shadow:0 20px 40px rgba(0,0,0,0.1);max-width:100%;${e.isMobile?"min-height:calc(100vh - 24px);":""}}.header{text-align:center;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #667eea;}.header h1{margin:0;color:#2d3748;font-size:${e.isMobile?"20px":"24px"};font-weight:600;}.header .subtitle{color:#718096;font-size:${e.isMobile?"12px":"14px"};margin-top:4px;}.domain-section{margin-bottom:20px;}.domain-input{width:100%;padding:12px 16px;border:2px solid #e2e8f0;border-radius:8px;font-size:16px;transition:border-color 0.2s;margin-bottom:12px;}.domain-input:focus{outline:none;border-color:#667eea;box-shadow:0 0 0 3px rgba(102, 126, 234, 0.1);}.search-container{margin-bottom:20px;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;}.search-input-group{position:relative;margin-bottom:12px;}.search-input{width:100%;padding:10px 40px 10px 16px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;background:white;}.search-clear{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:18px;color:#9ca3af;cursor:pointer;padding:4px;}.search-filters{display:flex;gap:6px;flex-wrap:wrap;}.filter-btn{padding:${e.isMobile?"6px 8px":"6px 12px"};border:1px solid #d1d5db;border-radius:4px;background:white;font-size:${e.isMobile?"11px":"12px"};cursor:pointer;transition:all 0.2s;}.filter-btn:hover, .filter-btn.active{background:#667eea;color:white;border-color:#667eea;}.presets-section{margin:20px 0;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;}.presets-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}.presets-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(${e.isMobile?"140px":"280px"}, 1fr));gap:12px;}.preset-card{background:white;border:1px solid #e2e8f0;border-radius:6px;padding:12px;display:flex;${e.isMobile?"flex-direction:column;":"justify-content:space-between;"}align-items:${e.isMobile,"center"};transition:all 0.2s;text-align:${e.isMobile?"center":"left"};}.preset-card:hover{box-shadow:0 2px 4px rgba(0,0,0,0.1);border-color:#667eea;}.preset-info{flex:1;${e.isMobile?"margin-bottom:8px;":""}}.preset-name{font-weight:600;color:#2d3748;font-size:${e.isMobile?"12px":"14px"};margin-bottom:4px;}.preset-description{font-size:${e.isMobile?"10px":"12px"};color:#718096;margin-bottom:4px;${e.isMobile?"display:none;":""}}.preset-meta{font-size:11px;color:#a0aec0;}.preset-actions{display:flex;gap:4px;}.button-group{display:flex;gap:8px;margin-bottom:20px;${e.isMobile?"flex-direction:column;":"flex-wrap:wrap;"}}.btn{padding:10px 16px;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s;${e.isMobile?"width:100%;":"flex:1;min-width:120px;"}}.btn-primary{background:#667eea;color:white;}.btn-primary:hover{background:#5a6fd8;transform:translateY(-1px);}.btn-secondary{background:#e2e8f0;color:#4a5568;}.btn-secondary:hover{background:#cbd5e0;}.btn-success{background:#48bb78;color:white;}.btn-success:hover{background:#38a169;transform:translateY(-1px);}.btn:disabled{opacity:0.6;cursor:not-allowed;transform:none !important;}.btn-mini{padding:4px 8px;border:none;border-radius:4px;font-size:11px;font-weight:500;cursor:pointer;background:#667eea;color:white;transition:all 0.2s;}.btn-mini:hover{background:#5a6fd8;transform:translateY(-1px);}.services-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}.services-title{font-size:18px;font-weight:600;color:#2d3748;margin:0;}.counter{background:#667eea;color:white;padding:4px 8px;border-radius:12px;font-size:12px;font-weight:500;}.services-list{max-height:${e.isMobile?"60vh":"400px"};overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;padding:12px;background:#f8fafc;}.category-header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;margin:8px 0 4px 0;background:linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);border-radius:8px;border-left:4px solid var(--category-color, #667eea);position:sticky;top:0;z-index:10;}.category-info{display:flex;align-items:center;gap:8px;}.category-icon{font-size:16px;}.category-name{font-weight:600;color:#2d3748;font-size:14px;}.category-count{background:#667eea;color:white;padding:2px 6px;border-radius:8px;font-size:11px;font-weight:500;}.category-services{margin-left:16px;border-left:2px solid #e2e8f0;padding-left:16px;margin-bottom:16px;}.service-item{display:flex;align-items:center;padding:6px 0;border-bottom:1px solid #e2e8f0;}.service-item:last-child{border-bottom:none;}.service-checkbox{margin-right:12px;width:16px;height:16px;accent-color:#667eea;}.service-label{flex:1;font-size:14px;color:#4a5568;cursor:pointer;user-select:none;}.service-label:hover{color:#2d3748;}.long-process{color:#d69e2e !important;font-weight:500;}.export-section{margin:24px 0;padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;}.section-title{font-size:16px;font-weight:600;color:#2d3748;margin:0 0 12px 0;}.export-buttons{display:grid;grid-template-columns:repeat(auto-fit, minmax(${e.isMobile?"120px":"140px"}, 1fr));gap:8px;}.btn-export{padding:10px 12px;border:1px solid #d1d5db;border-radius:6px;background:white;color:#374151;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s;}.btn-export:hover{background:#f3f4f6;border-color:#9ca3af;transform:translateY(-1px);}.status{background:#e6fffa;border:1px solid #81e6d9;border-radius:6px;padding:8px 12px;margin:8px 0;font-size:13px;color:#285e61;}.error{background:#fed7d7;border-color:#fc8181;color:#742a2a;}.success{background:#d1fae5;border:1px solid #10b981;color:#065f46;}.footer{margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;color:#718096;font-size:${e.isMobile?"11px":"12px"};}@media (max-width:768px){.category-services .service-item{padding:8px 0;}.service-label{font-size:13px;}}\n%60,c.head.appendChild(l);class p{constructor(){this.presets=o,this.activePreset=null}applyPreset(e){const n=this.presets[e];if(!n)return!1;this.activePreset=e;const t=c.querySelectorAll(".service-checkbox");return t.forEach((e=>e.checked=!1)),"all"===n.services?t.forEach((e=>e.checked=!0)):n.services.forEach((e=>{const n=this.findServiceCheckbox(e);n&&(n.checked=!0)})),window.domainOSINTHub.updateCounter(),d(%60✅ Applied preset:${n.name}%60,"success"),!0}findServiceCheckbox(e){const n=c.querySelectorAll(".service-checkbox");for(let o of n){const n=o.dataset.category,i=parseInt(o.dataset.serviceIndex);if(t[n].services[i].name===e)return o}return null}renderPresets(){const e=c.getElementById("presetsContainer");if(!e)return;e.querySelector(".presets-grid").innerHTML=Object.keys(this.presets).map((e=>{const n=this.presets[e],t="all"===n.services?"All":n.services.length;return%60<div class="preset-card"><div class="preset-info"><div class="preset-name">${n.name}</div><div class="preset-description">${n.description}</div><div class="preset-meta">${t} services</div></div><div class="preset-actions"><button class="preset-btn btn-mini" data-preset="${e}">Apply</button></div></div>%60})).join(""),e.querySelectorAll(".preset-btn").forEach((e=>{e.addEventListener("click",(()=>{this.applyPreset(e.dataset.preset)}))}))}}class u{constructor(){this.searchTerm="",this.activeFilters=new Set}search(e){this.searchTerm=e.toLowerCase(),this.updateServiceVisibility()}toggleFilter(e,n){this.activeFilters.has(e)?(this.activeFilters.delete(e),n.classList.remove("active")):(this.activeFilters.add(e),n.classList.add("active")),this.updateServiceVisibility()}clearSearch(){this.searchTerm="",this.activeFilters.clear();const e=c.querySelector("#serviceSearch"),n=c.querySelectorAll(".filter-btn");e&&(e.value=""),n.forEach((e=>e.classList.remove("active"))),this.updateServiceVisibility()}updateServiceVisibility(){c.querySelectorAll(".service-item").forEach((e=>{const n=e.querySelector(".service-checkbox"),t=e.querySelector(".service-label"),o=n.dataset.category,i=t.textContent.toLowerCase();let r=!0;this.searchTerm&&!i.includes(this.searchTerm)&&(r=!1),this.activeFilters.size>0&&!this.activeFilters.has(o)&&(r=!1),e.style.display=r?"flex":"none"})),Object.keys(t).forEach((e=>{const n=c.querySelector(%60[data-category="${e}"]%60);if(n){const e=n.querySelectorAll('.service-item[style*="flex"], .service-item:not([style])').length,t=n.previousElementSibling;t&&t.classList.contains("category-header")&&(t.style.display=e>0?"flex":"none")}}))}}function m(n,t,o){const i=["=".repeat(60),"DOMAIN OSINT INVESTIGATION REPORT","=".repeat(60),"",%60Target Domain:${n}%60,%60Investigation Date:${o}%60,%60Generated by:Domain OSINT Hub v${e.version}%60,%60Selected Services:${t.length}%60,"","INVESTIGATION URLS:","-".repeat(30),""];return t.forEach(((e,t)=>{const o=e.url.replace(/{domain}/g,n);i.push(%60${t+1}. ${e.name}%60),i.push(%60   URL:${o}%60),e.longProcess&&i.push("   Note:This service may take longer to complete"),i.push("")})),i.push("INVESTIGATION CHECKLIST:","-".repeat(30),""),t.forEach((e=>{i.push(%60[ ] ${e.name} - Analysis completed%60)})),i.push("","FINDINGS SUMMARY:","-".repeat(30),"","[ ] Domain reputation check completed","[ ] DNS infrastructure analyzed","[ ] Certificate analysis completed","[ ] Historical data reviewed","[ ] Technology stack identified","[ ] Threat intelligence gathered","","INVESTIGATION NOTES:","-".repeat(30),"","(Add your investigation findings here)","","=".repeat(60),"End of Report","=".repeat(60)),i.join("\n")}function h(e){const n=i(c.getElementById("domainInput").value),o=c.querySelectorAll(".service-checkbox:checked");if(0===o.length)return void d("⚠%EF%B8%8F Please select at least one service before exporting","error");let r=m(n,Array.from(o).map((e=>{const n=e.dataset.category,o=parseInt(e.dataset.serviceIndex);return{...t[n].services[o],category:n}})),(new Date).toISOString());const a=new Blob([r],{type:"text/plain"}),s=URL.createObjectURL(a),l=c.createElement("a");l.href=s,l.download=%60osint-investigation-${n}-${(new Date).toISOString().split("T")[0]}.txt%60,l.style.display="none",c.body.appendChild(l),l.click(),c.body.removeChild(l),URL.revokeObjectURL(s),d("✅ Text report exported successfully!","success")}const b=c.createElement("div");b.className="container",b.innerHTML=%60<div class="header"><h1>🔍 Domain OSINT Hub v2.0</h1><div class="subtitle">Professional Domain Reconnaissance Toolkit</div></div><div class="domain-section"><input type="text" class="domain-input" value="${a}"placeholder="Enter domain (e.g., example.com)" id="domainInput"></div><div class="search-container"><div class="search-input-group"><input type="text" id="serviceSearch" class="search-input"placeholder="🔍 Search services..." autocomplete="off"><button class="search-clear" id="clearSearch" title="Clear search">×</button></div><div class="search-filters"><button class="filter-btn" data-filter="reputation">🛡%EF%B8%8F Reputation</button><button class="filter-btn" data-filter="dns">🌐 DNS</button><button class="filter-btn" data-filter="certificates">%F0%9F%94%90 Certificates</button><button class="filter-btn" data-filter="intelligence">🔍 Intelligence</button><button class="filter-btn" data-filter="whois">📋 WHOIS</button><button class="filter-btn" data-filter="technology">⚙%EF%B8%8F Technology</button></div></div><div class="presets-section" id="presetsContainer"><div class="presets-header"><h3 class="section-title">⚡ Service Presets</h3></div><div class="presets-grid"></div></div><div class="button-group"><button class="btn btn-secondary" id="checkAllBtn">☑%EF%B8%8F Check All</button><button class="btn btn-secondary" id="uncheckAllBtn">☐ Uncheck All</button><button class="btn btn-primary" id="helpBtn">❓ Help (F1)</button></div><div class="services-header"><h3 class="services-title">🔧 OSINT Services</h3><span class="counter" id="selectedCounter">0 selected</span></div><div class="services-list" id="servicesList"></div><div class="button-group"><button class="btn btn-success" id="openSelectedBtn" disabled>🚀 Open Selected Services</button></div><div class="export-section"><div class="section-title">📄 Export Investigation</div><div class="export-buttons"><button class="btn-export" data-format="txt">📄 Text Report</button></div></div><div id="statusDiv"></div><div class="footer">Domain OSINT Hub v${e.version} | 30+ Services | Local Processing Only | CSP Compliant</div>\n%60,c.body.appendChild(b);const g=new p,f=new u;window.domainOSINTHub.updateServices=function(){const e=c.getElementById("domainInput"),n=c.getElementById("servicesList"),o=c.getElementById("openSelectedBtn"),a=c.getElementById("statusDiv");if(!e||!n||!o)return;const s=i(e.value);if(n.innerHTML="",a.innerHTML="",!r(s))return d("⚠%EF%B8%8F Please enter a valid domain (e.g., example.com)","error"),o.disabled=!0,void window.domainOSINTHub.updateCounter();Object.keys(t).forEach((e=>{const o=t[e],i=c.createElement("div");i.className="category-header",i.style.setProperty("--category-color",o.color),i.innerHTML=%60<div class="category-info"><span class="category-icon">${o.icon}</span><span class="category-name">${o.name}</span><span class="category-count">${o.services.length} services</span></div><div class="category-controls"><button class="btn-mini category-toggle" data-category="${e}">Toggle All</button></div>%60,n.appendChild(i);const r=c.createElement("div");r.className="category-services",r.dataset.category=e,o.services.forEach(((n,t)=>{const o=c.createElement("div");o.className="service-item";const i=c.createElement("input");i.type="checkbox",i.className="service-checkbox",i.id=%60service_${e}_${t}%60,i.dataset.category=e,i.dataset.serviceIndex=t;const a=c.createElement("label");a.className="service-label",a.setAttribute("for",i.id),a.textContent=n.name,n.longProcess&&(a.className+=" long-process",a.textContent+=" (long process)"),i.addEventListener("change",window.domainOSINTHub.updateCounter),o.appendChild(i),o.appendChild(a),r.appendChild(o)})),n.appendChild(r)}));c.querySelectorAll(".category-toggle").forEach((e=>{e.addEventListener("click",(n=>{n.preventDefault(),n.stopPropagation();const t=e.getAttribute("data-category"),o=e.closest(".category-header")?.nextElementSibling||c.querySelector(%60.category-services[data-category="${t.replace(/["\\]/g,"\\$&")}"]%60);window.domainOSINTHub.toggleCategory(t,o)}),{capture:!0})})),c.title="Domain OSINT Hub v2.0 - "+s,window.domainOSINTHub.updateCounter()},window.domainOSINTHub.updateCounter=function(){const e=c.querySelectorAll(".service-checkbox:checked"),n=c.getElementById("selectedCounter"),t=c.getElementById("openSelectedBtn"),o=e.length;n&&(n.textContent=o+" selected"),t&&(t.disabled=0===o,t.textContent=o>0?%60🚀 Open ${o} Selected Services%60:"🚀 Open Selected Services")},window.domainOSINTHub.checkAll=function(){c.querySelectorAll(".service-checkbox").forEach((e=>e.checked=!0)),window.domainOSINTHub.updateCounter()},window.domainOSINTHub.uncheckAll=function(){c.querySelectorAll(".service-checkbox").forEach((e=>e.checked=!1)),window.domainOSINTHub.updateCounter()},window.domainOSINTHub.toggleCategory=function(e){console.log("Toggling category:",e);const n=c.querySelector(%60[data-category="${e}"]%60);if(!n)return void console.error("Category services not found for:",e);const o=n.querySelectorAll(".service-checkbox");if(0===o.length)return void console.error("No checkboxes found in category:",e);const i=Array.from(o).every((e=>e.checked));o.forEach((e=>{e.checked=!i})),window.domainOSINTHub.updateCounter();const r=t[e];d(%60✅ ${i?"deselected":"selected"} all ${r.name} services%60,"success")},window.domainOSINTHub.toggleCategory=function(e,n){const o=(e||"").replace(/["\\]/g,"\\$&"),i=n||c.querySelector(%60.category-services[data-category="${o}"]%60);if(!i)return console.error("Category services container not found for:",e),void d(%60❌ Could not find "${e}" section%60,"error");const r=i.querySelectorAll("input.service-checkbox");if(0===r.length)return console.error("No checkboxes in section:",e),void d(%60❌ No services in "${e}"%60,"error");const a=Array.from(r).every((e=>e.checked));r.forEach((e=>{e.checked=!a})),window.domainOSINTHub.updateCounter();const s=t[e];d(%60✅ ${a?"deselected":"selected"} all ${s&&s.name||e} services%60,"success")},window.domainOSINTHub.openSelectedServices=function(){const n=c.getElementById("domainInput"),o=c.querySelectorAll(".service-checkbox:checked"),a=c.getElementById("statusDiv");if(!n)return void d("❌ Error:Domain input not found","error");const s=i(n.value);if(0===o.length)return void d("⚠%EF%B8%8F Please select at least one service to open","error");if(!r(s))return void d("⚠%EF%B8%8F Please enter a valid domain","error");const l=Array.from(o).map((e=>{const n=e.dataset.category,o=parseInt(e.dataset.serviceIndex);return t[n].services[o]}));a.innerHTML="";const p=d(%60🚀 Opening ${l.length} services for ${s}...%60);let u=0,m=0;l.forEach(((n,t)=>{setTimeout((()=>{try{let e=n.url.replace(/{domain}/g,encodeURIComponent(s));window.open(e,"_blank","noopener,noreferrer")?u++:m++,t===l.length-1&&setTimeout((()=>{0===m?(p.textContent=%60✅ Successfully opened ${u} services for ${s}%60,p.className="status success"):(p.textContent=%60⚠%EF%B8%8F Opened ${u}/${l.length} services (${m} blocked by popup blocker)%60,p.className="status error")}),100)}catch(e){m++,console.error("Error opening service:",n.name,e)}}),t*e.openDelay)}))};const v=c.getElementById("domainInput"),x=c.getElementById("serviceSearch"),y=c.getElementById("clearSearch"),w=c.querySelectorAll(".filter-btn"),S=c.getElementById("checkAllBtn"),I=c.getElementById("uncheckAllBtn"),k=c.getElementById("helpBtn"),T=c.getElementById("openSelectedBtn"),N=c.querySelectorAll(".btn-export");v.addEventListener("input",window.domainOSINTHub.updateServices),v.addEventListener("paste",(()=>setTimeout(window.domainOSINTHub.updateServices,100))),x.addEventListener("input",(e=>f.search(e.target.value))),y.addEventListener("click",(()=>f.clearSearch())),w.forEach((e=>{e.addEventListener("click",(()=>f.toggleFilter(e.dataset.filter,e)))})),S.addEventListener("click",window.domainOSINTHub.checkAll),I.addEventListener("click",window.domainOSINTHub.uncheckAll),k.addEventListener("click",(()=>{alert('Domain OSINT Hub v2.0 Help:\n\n⌨%EF%B8%8F Keyboard Shortcuts:\n• Ctrl+A:Check all services\n• Ctrl+D:Uncheck all services\n• 1-6:Apply presets 1-6\n• F1:Show this help\n• Esc:Close window\n\n🔍 Features:\n• Search services by name\n• Filter by category\n• Apply presets for common tasks\n• Export investigation reports\n• Mobile-optimized interface\n\n⚡ Quick Presets:\n1. Quick Scan\n2. Full Investigation\n3. Reputation Check\n4. Infrastructure Analysis\n5. Passive Reconnaissance\n6. Threat Hunting\n\n🔧 Toggle All Buttons:\n• Click "Toggle All" next to any category header\n• Toggles all services in that category on/off')})),T.addEventListener("click",window.domainOSINTHub.openSelectedServices),N.forEach((e=>{e.addEventListener("click",(()=>h(e.dataset.format)))})),c.addEventListener("keydown",(e=>{const n=e.ctrlKey||e.metaKey;if(n&&"a"===e.key)e.preventDefault(),window.domainOSINTHub.checkAll();else if(n&&"d"===e.key)e.preventDefault(),window.domainOSINTHub.uncheckAll();else if(n&&"Enter"===e.key)e.preventDefault(),window.domainOSINTHub.openSelectedServices();else if("F1"===e.key)e.preventDefault(),k.click();else if("Escape"===e.key)try{window.domainOSINTHub.close()}catch(e){}else if(!/^[1-6]$/.test(e.key)||n||e.altKey)"Enter"===e.key&&e.target===v&&(e.preventDefault(),window.domainOSINTHub.updateServices());else{const n=Object.keys(o),t=parseInt(e.key)-1;n[t]&&g.applyPreset(n[t])}})),window.domainOSINTHub.presetManager=g,window.domainOSINTHub.serviceSearch=f,window.domainOSINTHub.updateServices(),g.renderPresets(),window.domainOSINTHub.focus(),v.focus(),v.select()}catch(H){if(console.error("Domain OSINT Hub Error:",H),alert("Domain OSINT Hub Error:"+H.message+"\n\nPlease try again or check browser console for details."),window.domainOSINTHub){try{window.domainOSINTHub.close()}catch(A){}window.domainOSINTHub=null}}}();
*/