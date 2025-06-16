/*!
 * Bookmarklet: Advanced URL Extractor Bookmarklet
 * Description: Extracts all URLs from any webpage, base64 decode if found and generates comprehensive reports in both TXT and interactive HTML formats.
 * Version: 1.0.0
 * Author: gl0bal01
 * Tags: html, extract, developer-tools, osint, investigation
 * Compatibility: all-browsers
 * Last Updated: 2025-06-12
 */
javascript:(function(){
    var siteName = location.hostname;
    var pageTitle = document.title || siteName;
    var currentDate = new Date();
    var dateStr = currentDate.getFullYear() + '-' + 
                  String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(currentDate.getDate()).padStart(2, '0');
    var timeStr = String(currentDate.getHours()).padStart(2, '0') + ':' + 
                  String(currentDate.getMinutes()).padStart(2, '0');
    
    var els = document.querySelectorAll("*");
    var urlData = [];
    var urlSet = new Set();
    
    // Extract URLs with titles
    for(var i = 0; i < els.length; i++){
        var e = els[i];
        var url = null;
        var title = null;
        
        if(e.src && !urlSet.has(e.src)){
            // Handle SVGAnimatedString objects and other edge cases
            if(typeof e.src === 'object' && e.src.animVal !== undefined) {
                url = String(e.src.animVal);
            } else if(typeof e.src === 'object' && e.src.baseVal !== undefined) {
                url = String(e.src.baseVal);
            } else {
                url = String(e.src);
            }
            
            // Skip if URL is empty or invalid
            if(!url || url === '' || url === 'null' || url === 'undefined') continue;
            
            title = String(e.alt || e.title || e.getAttribute('aria-label') || 'Resource');
            urlSet.add(url);
            urlData.push({url: url, title: title, type: 'Resource'});
        }
        
        if(e.href && !urlSet.has(e.href)){
            // Handle SVGAnimatedString objects and other edge cases
            if(typeof e.href === 'object' && e.href.animVal !== undefined) {
                url = String(e.href.animVal);
            } else if(typeof e.href === 'object' && e.href.baseVal !== undefined) {
                url = String(e.href.baseVal);
            } else {
                url = String(e.href);
            }
            
            // Skip if URL is empty or invalid
            if(!url || url === '' || url === 'null' || url === 'undefined') continue;
            
            // Get better title from various sources
            title = '';
            if(e.textContent && e.textContent.trim()) {
                title = String(e.textContent).trim();
            } else if(e.title) {
                title = String(e.title);
            } else if(e.getAttribute('aria-label')) {
                title = String(e.getAttribute('aria-label'));
            } else if(e.alt) {
                title = String(e.alt);
            } else if(e.tagName === 'A') {
                title = 'Link';
            } else {
                title = 'Link (' + e.tagName.toLowerCase() + ')';
            }
            
            // Clean up title
            if(title.length > 100) title = title.substring(0, 97) + '...';
            if(!title || title.trim() === '' || title === '[object SVGAnimatedString]') {
                title = 'Link (' + e.tagName.toLowerCase() + ')';
            }
            
            urlSet.add(url);
            urlData.push({url: url, title: title, type: 'Link'});
        }
    }
    
    // Sort URLs - Links first, then Resources, alphabetically within each group
    urlData.sort(function(a, b) {
        // First sort by type (Link before Resource)
        if(a.type !== b.type) {
            if(a.type === 'Link') return -1;
            if(b.type === 'Link') return 1;
        }
        // Then sort alphabetically within same type
        if(a.url < b.url) return -1;
        if(a.url > b.url) return 1;
        return 0;
    });
    
    // Create report header
    var report = "================================================================================\n";
    report += "                           URL EXTRACTION REPORT\n";
    report += "================================================================================\n\n";
    report += "Page Title: " + pageTitle + "\n";
    report += "Site: " + siteName + "\n";
    report += "URL: " + location.href + "\n";
    report += "Extraction Date: " + dateStr + " at " + timeStr + "\n";
    report += "Total URLs Found: " + urlData.length + "\n";
    report += "Links: " + urlData.filter(function(item) { return item.type === 'Link'; }).length + "\n";
    report += "Resources: " + urlData.filter(function(item) { return item.type === 'Resource'; }).length + "\n";
    report += "\n================================================================================\n";
    report += "                              EXTRACTED URLS\n";
    report += "================================================================================\n\n";
    
    // Add URLs with titles
    for(var j = 0; j < urlData.length; j++){
        var item = urlData[j];
        report += "[" + item.type + "] " + item.title + "\n";
        report += item.url + "\n\n";
    }
    
    // Create HTML version
    var htmlContent = "<!DOCTYPE html>\n<html>\n<head>\n";
    htmlContent += "<meta charset='UTF-8'>\n";
    htmlContent += "<title>URL Report - " + pageTitle + "</title>\n";
    htmlContent += "<style>\n";
    htmlContent += "body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }\n";
    htmlContent += ".container { max-width: 900px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }\n";
    htmlContent += ".header { background: #2c3e50; color: white; padding: 20px; margin: -20px -20px 20px -20px; border-radius: 8px 8px 0 0; }\n";
    htmlContent += ".stats { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; }\n";
    htmlContent += ".stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }\n";
    htmlContent += ".stat-item { text-align: center; }\n";
    htmlContent += ".stat-number { font-size: 24px; font-weight: bold; color: #2980b9; }\n";
    htmlContent += ".stat-label { font-size: 12px; color: #7f8c8d; }\n";
    htmlContent += ".url-item { margin: 15px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #3498db; border-radius: 0 5px 5px 0; }\n";
    htmlContent += ".url-item.resource { border-left-color: #e74c3c; }\n";
    htmlContent += ".url-title { font-weight: bold; color: #2c3e50; margin-bottom: 5px; }\n";
    htmlContent += ".url-link { color: #3498db; text-decoration: none; word-break: break-all; }\n";
    htmlContent += ".url-link:hover { text-decoration: underline; }\n";
    htmlContent += ".url-type { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; color: white; margin-bottom: 5px; }\n";
    htmlContent += ".type-link { background: #3498db; }\n";
    htmlContent += ".type-resource { background: #e74c3c; }\n";
    htmlContent += ".search-box { width: 100%; padding: 10px; margin: 20px 0; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }\n";
    htmlContent += ".back-to-top { position: fixed; bottom: 20px; right: 20px; background: #3498db; color: white; padding: 10px 15px; border-radius: 5px; text-decoration: none; }\n";
    htmlContent += "</style>\n</head>\n<body>\n";
    htmlContent += "<div class='container'>\n";
    htmlContent += "<div class='header'>\n";
    htmlContent += "<h1>🔗 URL Extraction Report</h1>\n";
    htmlContent += "<p><strong>Page:</strong> " + pageTitle + "</p>\n";
    htmlContent += "<p><strong>Site:</strong> " + siteName + "</p>\n";
    htmlContent += "<p><strong>Source:</strong> <a href='" + location.href + "' style='color: #ecf0f1;'>" + location.href + "</a></p>\n";
    htmlContent += "<p><strong>Extracted:</strong> " + dateStr + " at " + timeStr + "</p>\n";
    htmlContent += "</div>\n";
    
    htmlContent += "<div class='stats'>\n";
    htmlContent += "<div class='stats-grid'>\n";
    htmlContent += "<div class='stat-item'><div class='stat-number'>" + urlData.length + "</div><div class='stat-label'>Total URLs</div></div>\n";
    htmlContent += "<div class='stat-item'><div class='stat-number'>" + urlData.filter(function(item) { return item.type === 'Link'; }).length + "</div><div class='stat-label'><a href='#links-section' style='color: inherit; text-decoration: none;'>Links</a></div></div>\n";
    htmlContent += "<div class='stat-item'><div class='stat-number'>" + urlData.filter(function(item) { return item.type === 'Resource'; }).length + "</div><div class='stat-label'><a href='#resources-section' style='color: inherit; text-decoration: none;'>Resources</a></div></div>\n";
    htmlContent += "</div>\n</div>\n";
    
    htmlContent += "<input type='text' class='search-box' placeholder='🔍 Search URLs...' onkeyup='filterUrls(this.value)'>\n";
    htmlContent += "<div id='urlList'>\n";
    
    var linkCount = 0;
    var resourceCount = 0;
    var currentSection = '';
    
    for(var j = 0; j < urlData.length; j++){
        var item = urlData[j];
        
        // Add section headers
        if(item.type !== currentSection) {
            if(item.type === 'Link') {
                htmlContent += "<h2 id='links-section' style='color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-top: 30px;'>🔗 Links (" + urlData.filter(function(x) { return x.type === 'Link'; }).length + ")</h2>\n";
            } else {
                htmlContent += "<h2 id='resources-section' style='color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px; margin-top: 30px;'>📁 Resources (" + urlData.filter(function(x) { return x.type === 'Resource'; }).length + ")</h2>\n";
            }
            currentSection = item.type;
        }
        
        var typeClass = item.type.toLowerCase();
        var safeUrl = String(item.url || '');
        var safeTitle = String(item.title || '');
        
        // Decode base64 data URLs for better readability
        var displayUrl = safeUrl;
        var decodedContent = '';
        var isImage = false;
        if(safeUrl.startsWith('data:') && safeUrl.includes('base64,')) {
            try {
                var mimeType = safeUrl.substring(5, safeUrl.indexOf(';'));
                var base64Part = safeUrl.split('base64,')[1];
                
                if(mimeType.startsWith('image/')) {
                    isImage = true;
                } else if(base64Part) {
                    decodedContent = atob(base64Part);
                    if(decodedContent.length > 200) {
                        decodedContent = decodedContent.substring(0, 200) + '...';
                    }
                }
            } catch(e) {
                // If decoding fails, just use original URL
            }
        }
        
        htmlContent += "<div class='url-item " + typeClass + "' data-url='" + safeUrl.toLowerCase() + "' data-title='" + safeTitle.toLowerCase() + "'>\n";
        htmlContent += "<span class='url-type type-" + typeClass + "'>" + item.type + "</span>\n";
        htmlContent += "<div class='url-title'>" + safeTitle.replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</div>\n";
        htmlContent += "<a href='" + safeUrl + "' class='url-link' target='_blank'>" + displayUrl + "</a>\n";
        
        if(isImage) {
            htmlContent += "<div style='background: #f1f2f6; padding: 8px; margin-top: 5px; border-radius: 3px;'>\n";
            htmlContent += "<strong>Image Preview:</strong><br>\n";
            htmlContent += "<img src='" + safeUrl + "' style='max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 3px; margin-top: 5px;' onerror='this.style.display=\"none\"; this.nextElementSibling.style.display=\"block\";'>\n";
            htmlContent += "<div style='display: none; color: #e74c3c; font-style: italic;'>Failed to load image preview</div>\n";
            htmlContent += "</div>\n";
        } else if(decodedContent) {
            htmlContent += "<div style='background: #f1f2f6; padding: 8px; margin-top: 5px; border-radius: 3px; font-family: monospace; font-size: 11px; color: #2f3542;'>\n";
            htmlContent += "<strong>Decoded content:</strong><br>" + decodedContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>') + "\n";
            htmlContent += "</div>\n";
        }
        
        htmlContent += "</div>\n";
    }
    
    htmlContent += "</div>\n";
    htmlContent += "<a href='#' class='back-to-top' onclick='window.scrollTo(0,0); return false;'>↑ Top</a>\n";
    htmlContent += "</div>\n";
    
    htmlContent += "<script>\n";
    htmlContent += "function filterUrls(searchTerm) {\n";
    htmlContent += "  var items = document.querySelectorAll('.url-item');\n";
    htmlContent += "  var term = searchTerm.toLowerCase();\n";
    htmlContent += "  items.forEach(function(item) {\n";
    htmlContent += "    var url = item.getAttribute('data-url');\n";
    htmlContent += "    var title = item.getAttribute('data-title');\n";
    htmlContent += "    if(url.includes(term) || title.includes(term)) {\n";
    htmlContent += "      item.style.display = 'block';\n";
    htmlContent += "    } else {\n";
    htmlContent += "      item.style.display = 'none';\n";
    htmlContent += "    }\n";
    htmlContent += "  });\n";
    htmlContent += "}\n";
    htmlContent += "</script>\n</body>\n</html>";
    
    // Download TXT file
    var txtBlob = new Blob([report], {type: "text/plain"});
    var txtUrl = URL.createObjectURL(txtBlob);
    var txtLink = document.createElement("a");
    txtLink.href = txtUrl;
    txtLink.download = siteName + "_urls_" + dateStr + ".txt";
    document.body.appendChild(txtLink);
    txtLink.click();
    document.body.removeChild(txtLink);
    URL.revokeObjectURL(txtUrl);
    
    // Download HTML file
    var htmlBlob = new Blob([htmlContent], {type: "text/html"});
    var htmlUrl = URL.createObjectURL(htmlBlob);
    var htmlLink = document.createElement("a");
    htmlLink.href = htmlUrl;
    htmlLink.download = siteName + "_urls_" + dateStr + ".html";
    document.body.appendChild(htmlLink);
    htmlLink.click();
    document.body.removeChild(htmlLink);
    URL.revokeObjectURL(htmlUrl);
    
    // Show confirmation
    alert("URLs extracted successfully!\nFiles created:\n• " + siteName + "_urls_" + dateStr + ".txt\n• " + siteName + "_urls_" + dateStr + ".html\nTotal URLs: " + urlData.length);
})();

/*
BOOKMARKLET CODE (copy this entire line for bookmark URL):
javascript:(function(){var s=location.hostname,t=document.title||s,d=new Date(),ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),ts=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'),e=document.querySelectorAll("*"),u=[],us=new Set();for(var i=0;i<e.length;i++){var el=e[i],url=null,title=null;if(el.src&&!us.has(el.src)){url=typeof el.src==='object'&&el.src.animVal!==undefined?String(el.src.animVal):typeof el.src==='object'&&el.src.baseVal!==undefined?String(el.src.baseVal):String(el.src);if(!url||url===''||url==='null'||url==='undefined')continue;title=String(el.alt||el.title||el.getAttribute('aria-label')||'Resource');us.add(url);u.push({url:url,title:title,type:'Resource'});}if(el.href&&!us.has(el.href)){url=typeof el.href==='object'&&el.href.animVal!==undefined?String(el.href.animVal):typeof el.href==='object'&&el.href.baseVal!==undefined?String(el.href.baseVal):String(el.href);if(!url||url===''||url==='null'||url==='undefined')continue;title='';if(el.textContent&&el.textContent.trim()){title=String(el.textContent).trim();}else if(el.title){title=String(el.title);}else if(el.getAttribute('aria-label')){title=String(el.getAttribute('aria-label'));}else if(el.alt){title=String(el.alt);}else if(el.tagName==='A'){title='Link';}else{title='Link ('+el.tagName.toLowerCase()+')';}if(title.length>100)title=title.substring(0,97)+'...';if(!title||title.trim()===''||title==='[object SVGAnimatedString]'){title='Link ('+el.tagName.toLowerCase()+')';}us.add(url);u.push({url:url,title:title,type:'Link'});}}u.sort(function(a,b){if(a.type!==b.type){if(a.type==='Link')return -1;if(b.type==='Link')return 1;}if(a.url<b.url)return -1;if(a.url>b.url)return 1;return 0;});var r="================================================================================\n                           URL EXTRACTION REPORT\n================================================================================\n\nPage Title: "+t+"\nSite: "+s+"\nURL: "+location.href+"\nExtraction Date: "+ds+" at "+ts+"\nTotal URLs Found: "+u.length+"\nLinks: "+u.filter(function(item){return item.type==='Link';}).length+"\nResources: "+u.filter(function(item){return item.type==='Resource';}).length+"\n\n================================================================================\n                              EXTRACTED URLS\n================================================================================\n\n";for(var j=0;j<u.length;j++){var item=u[j];r+="["+item.type+"] "+item.title+"\n"+item.url+"\n\n";}var h="<!DOCTYPE html>\n<html>\n<head>\n<meta charset='UTF-8'>\n<title>URL Report - "+t+"</title>\n<style>\nbody{font-family:Arial,sans-serif;margin:20px;background:#f5f5f5;}\n.container{max-width:900px;margin:0 auto;background:white;padding:20px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}\n.header{background:#2c3e50;color:white;padding:20px;margin:-20px -20px 20px -20px;border-radius:8px 8px 0 0;}\n.stats{background:#ecf0f1;padding:15px;border-radius:5px;margin:20px 0;}\n.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;}\n.stat-item{text-align:center;}\n.stat-number{font-size:24px;font-weight:bold;color:#2980b9;}\n.stat-label{font-size:12px;color:#7f8c8d;}\n.url-item{margin:15px 0;padding:15px;background:#f8f9fa;border-left:4px solid #3498db;border-radius:0 5px 5px 0;}\n.url-item.resource{border-left-color:#e74c3c;}\n.url-title{font-weight:bold;color:#2c3e50;margin-bottom:5px;}\n.url-link{color:#3498db;text-decoration:none;word-break:break-all;}\n.url-link:hover{text-decoration:underline;}\n.url-type{display:inline-block;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:bold;color:white;margin-bottom:5px;}\n.type-link{background:#3498db;}\n.type-resource{background:#e74c3c;}\n.search-box{width:100%;padding:10px;margin:20px 0;border:1px solid #ddd;border-radius:5px;font-size:14px;}\n.back-to-top{position:fixed;bottom:20px;right:20px;background:#3498db;color:white;padding:10px 15px;border-radius:5px;text-decoration:none;}\n</style>\n</head>\n<body>\n<div class='container'>\n<div class='header'>\n<h1>🔗 URL Extraction Report</h1>\n<p><strong>Page:</strong> "+t+"</p>\n<p><strong>Site:</strong> "+s+"</p>\n<p><strong>Source:</strong> <a href='"+location.href+"' style='color:#ecf0f1;'>"+location.href+"</a></p>\n<p><strong>Extracted:</strong> "+ds+" at "+ts+"</p>\n</div>\n<div class='stats'>\n<div class='stats-grid'>\n<div class='stat-item'><div class='stat-number'>"+u.length+"</div><div class='stat-label'>Total URLs</div></div>\n<div class='stat-item'><div class='stat-number'>"+u.filter(function(item){return item.type==='Link';}).length+"</div><div class='stat-label'><a href='#links-section' style='color:inherit;text-decoration:none;'>Links</a></div></div>\n<div class='stat-item'><div class='stat-number'>"+u.filter(function(item){return item.type==='Resource';}).length+"</div><div class='stat-label'><a href='#resources-section' style='color:inherit;text-decoration:none;'>Resources</a></div></div>\n</div>\n</div>\n<input type='text' class='search-box' placeholder='🔍 Search URLs...' onkeyup='filterUrls(this.value)'>\n<div id='urlList'>\n";var lc=0,rc=0,cs='';for(var j=0;j<u.length;j++){var item=u[j];if(item.type!==cs){if(item.type==='Link'){h+="<h2 id='links-section' style='color:#2c3e50;border-bottom:2px solid #3498db;padding-bottom:10px;margin-top:30px;'>🔗 Links ("+u.filter(function(x){return x.type==='Link';}).length+")</h2>\n";}else{h+="<h2 id='resources-section' style='color:#2c3e50;border-bottom:2px solid #e74c3c;padding-bottom:10px;margin-top:30px;'>📁 Resources ("+u.filter(function(x){return x.type==='Resource';}).length+")</h2>\n";}cs=item.type;}var tc=item.type.toLowerCase(),su=String(item.url||''),st=String(item.title||''),du=su,dc='',ii=false;if(su.startsWith('data:')&&su.includes('base64,')){try{var mt=su.substring(5,su.indexOf(';')),bp=su.split('base64,')[1];if(mt.startsWith('image/')){ii=true;}else if(bp){dc=atob(bp);if(dc.length>200){dc=dc.substring(0,200)+'...';}}}catch(e){}}h+="<div class='url-item "+tc+"' data-url='"+su.toLowerCase()+"' data-title='"+st.toLowerCase()+"'>\n<span class='url-type type-"+tc+"'>"+item.type+"</span>\n<div class='url-title'>"+st.replace(/</g,'&lt;').replace(/>/g,'&gt;')+"</div>\n<a href='"+su+"' class='url-link' target='_blank'>"+du+"</a>\n";if(ii){h+="<div style='background:#f1f2f6;padding:8px;margin-top:5px;border-radius:3px;'>\n<strong>Image Preview:</strong><br>\n<img src='"+su+"' style='max-width:200px;max-height:150px;border:1px solid #ddd;border-radius:3px;margin-top:5px;' onerror='this.style.display=\"none\";this.nextElementSibling.style.display=\"block\";'>\n<div style='display:none;color:#e74c3c;font-style:italic;'>Failed to load image preview</div>\n</div>\n";}else if(dc){h+="<div style='background:#f1f2f6;padding:8px;margin-top:5px;border-radius:3px;font-family:monospace;font-size:11px;color:#2f3542;'>\n<strong>Decoded content:</strong><br>"+dc.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')+"\n</div>\n";}h+="</div>\n";}h+="</div>\n<a href='#' class='back-to-top' onclick='window.scrollTo(0,0);return false;'>↑ Top</a>\n</div>\n<script>\nfunction filterUrls(searchTerm){\nvar items=document.querySelectorAll('.url-item');\nvar term=searchTerm.toLowerCase();\nitems.forEach(function(item){\nvar url=item.getAttribute('data-url');\nvar title=item.getAttribute('data-title');\nif(url.includes(term)||title.includes(term)){\nitem.style.display='block';\n}else{\nitem.style.display='none';\n}\n});\n}\n</script>\n</body>\n</html>";var tb=new Blob([r],{type:"text/plain"}),tu=URL.createObjectURL(tb),tl=document.createElement("a");tl.href=tu;tl.download=s+"_urls_"+ds+".txt";document.body.appendChild(tl);tl.click();document.body.removeChild(tl);URL.revokeObjectURL(tu);var hb=new Blob([h],{type:"text/html"}),hu=URL.createObjectURL(hb),hl=document.createElement("a");hl.href=hu;hl.download=s+"_urls_"+ds+".html";document.body.appendChild(hl);hl.click();document.body.removeChild(hl);URL.revokeObjectURL(hu);alert("URLs extracted successfully!\nFiles created:\n• "+s+"_urls_"+ds+".txt\n• "+s+"_urls_"+ds+".html\nTotal URLs: "+u.length);})();
*/