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
javascript:(function(){for(var a=location.hostname,b=document.title||a,c=new Date,d=c.getFullYear()+"-"+(c.getMonth()+1+"").padStart(2,"0")+"-"+(c.getDate()+"").padStart(2,"0"),f=(c.getHours()+"").padStart(2,"0")+":"+(c.getMinutes()+"").padStart(2,"0"),g=document.querySelectorAll("*"),h=[],k=new Set,l=0;l<g.length;l++){var m=g[l],e=null,n=null;if(m.src&&!k.has(m.src)){if(e="object"==typeof m.src&&void 0!==m.src.animVal?m.src.animVal+"":"object"==typeof m.src&&void 0!==m.src.baseVal?m.src.baseVal+"":m.src+"",!e||""===e||"null"===e||"undefined"===e)continue;n=(m.alt||m.title||m.getAttribute("aria-label")||"Resource")+"",k.add(e),h.push({url:e,title:n,type:"Resource"})}if(m.href&&!k.has(m.href)){if(e="object"==typeof m.href&&void 0!==m.href.animVal?m.href.animVal+"":"object"==typeof m.href&&void 0!==m.href.baseVal?m.href.baseVal+"":m.href+"",!e||""===e||"null"===e||"undefined"===e)continue;n="",n=m.textContent&&m.textContent.trim()?(m.textContent+"").trim():m.title?m.title+"":m.getAttribute("aria-label")?m.getAttribute("aria-label")+"":m.alt?m.alt+"":"A"===m.tagName?"Link":"Link ("+m.tagName.toLowerCase()+")",100<n.length&&(n=n.substring(0,97)+"..."),n&&""!==n.trim()&&"[object SVGAnimatedString]"!==n||(n="Link ("+m.tagName.toLowerCase()+")"),k.add(e),h.push({url:e,title:n,type:"Link"})}}h.sort(function(c,a){if(c.type!==a.type){if("Link"===c.type)return-1;if("Link"===a.type)return 1}return c.url<a.url?-1:c.url>a.url?1:0});var o="================================================================================\n";o+="                           URL EXTRACTION REPORT\n",o+="================================================================================\n\n",o+="Page Title: "+b+"\n",o+="Site: "+a+"\n",o+="URL: "+location.href+"\n",o+="Extraction Date: "+d+" at "+f+"\n",o+="Total URLs Found: "+h.length+"\n",o+="Links: "+h.filter(function(a){return"Link"===a.type}).length+"\n",o+="Resources: "+h.filter(function(a){return"Resource"===a.type}).length+"\n",o+="\n================================================================================\n",o+="                              EXTRACTED URLS\n",o+="================================================================================\n\n";for(var p,q=0;q<h.length;q++)p=h[q],o+="["+p.type+"] "+p.title+"\n",o+=p.url+"\n\n";var r="<!DOCTYPE html>\n<html>\n<head>\n";r+="<meta charset=%27UTF-8%27>\n",r+="<title>URL Report - "+b+"</title>\n",r+="<style>\n",r+="body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }\n",r+=".container { max-width: 900px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }\n",r+=".header { background: #2c3e50; color: white; padding: 20px; margin: -20px -20px 20px -20px; border-radius: 8px 8px 0 0; }\n",r+=".stats { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; }\n",r+=".stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }\n",r+=".stat-item { text-align: center; }\n",r+=".stat-number { font-size: 24px; font-weight: bold; color: #2980b9; }\n",r+=".stat-label { font-size: 12px; color: #7f8c8d; }\n",r+=".url-item { margin: 15px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #3498db; border-radius: 0 5px 5px 0; }\n",r+=".url-item.resource { border-left-color: #e74c3c; }\n",r+=".url-title { font-weight: bold; color: #2c3e50; margin-bottom: 5px; }\n",r+=".url-link { color: #3498db; text-decoration: none; word-break: break-all; }\n",r+=".url-link:hover { text-decoration: underline; }\n",r+=".url-type { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; color: white; margin-bottom: 5px; }\n",r+=".type-link { background: #3498db; }\n",r+=".type-resource { background: #e74c3c; }\n",r+=".search-box { width: 100%; padding: 10px; margin: 20px 0; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }\n",r+=".back-to-top { position: fixed; bottom: 20px; right: 20px; background: #3498db; color: white; padding: 10px 15px; border-radius: 5px; text-decoration: none; }\n",r+="</style>\n</head>\n<body>\n",r+="<div class='container'>\n",r+="<div class='header'>\n",r+="<h1>\uD83D\uDD17 URL Extraction Report</h1>\n",r+="<p><strong>Page:</strong> "+b+"</p>\n",r+="<p><strong>Site:</strong> "+a+"</p>\n",r+="<p><strong>Source:</strong> <a href='"+location.href+"' style='color: #ecf0f1;'>"+location.href+"</a></p>\n",r+="<p><strong>Extracted:</strong> "+d+" at "+f+"</p>\n",r+="</div>\n",r+="<div class='stats'>\n",r+="<div class='stats-grid'>\n",r+="<div class='stat-item'><div class='stat-number'>"+h.length+"</div><div class='stat-label'>Total URLs</div></div>\n",r+="<div class='stat-item'><div class='stat-number'>"+h.filter(function(a){return"Link"===a.type}).length+"</div><div class='stat-label'><a href='#links-section' style='color: inherit; text-decoration: none;'>Links</a></div></div>\n",r+="<div class='stat-item'><div class='stat-number'>"+h.filter(function(a){return"Resource"===a.type}).length+"</div><div class='stat-label'><a href='#resources-section' style='color: inherit; text-decoration: none;'>Resources</a></div></div>\n",r+="</div>\n</div>\n",r+="<input type='text' class='search-box' placeholder='\uD83D\uDD0D Search URLs...' onkeyup='filterUrls(this.value)'>\n",r+="<div id='urlList'>\n";for(var p,s="",q=0;q<h.length;q++){p=h[q],p.type!==s&&(r+="Link"===p.type?"<h2 id='links-section' style='color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-top: 30px;'>\uD83D\uDD17 Links ("+h.filter(function(a){return"Link"===a.type}).length+")</h2>\n":"<h2 id='resources-section' style='color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px; margin-top: 30px;'>\uD83D\uDCC1 Resources ("+h.filter(function(a){return"Resource"===a.type}).length+")</h2>\n",s=p.type);var t=p.type.toLowerCase(),u=(p.url||"")+"",v=(p.title||"")+"",w="",x=!1;if(u.startsWith("data:")&&u.includes("base64,"))try{var y=u.substring(5,u.indexOf(";")),z=u.split("base64,")[1];y.startsWith("image/")?x=!0:z&&(w=atob(z),200<w.length&&(w=w.substring(0,200)+"..."))}catch(a){}r+="<div class='url-item "+t+"' data-url='"+u.toLowerCase()+"' data-title='"+v.toLowerCase()+"'>\n",r+="<span class='url-type type-"+t+"'>"+p.type+"</span>\n",r+="<div class='url-title'>"+v.replace(/</g,"&lt;").replace(/>/g,"&gt;")+"</div>\n",r+="<a href='"+u+"' class='url-link' target='_blank'>"+u+"</a>\n",x?(r+="<div style='background: #f1f2f6; padding: 8px; margin-top: 5px; border-radius: 3px;'>\n",r+="<strong>Image Preview:</strong><br>\n",r+="<img src='"+u+"' style='max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 3px; margin-top: 5px;' onerror='this.style.display=\"none\"; this.nextElementSibling.style.display=\"block\";'>\n",r+="<div style='display: none; color: #e74c3c; font-style: italic;'>Failed to load image preview</div>\n",r+="</div>\n"):w&&(r+="<div style='background: #f1f2f6; padding: 8px; margin-top: 5px; border-radius: 3px; font-family: monospace; font-size: 11px; color: #2f3542;'>\n",r+="<strong>Decoded content:</strong><br>"+w.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>")+"\n",r+="</div>\n"),r+="</div>\n"}r+="</div>\n",r+="<a href='#' class='back-to-top' onclick='window.scrollTo(0,0); return false;'>\u2191 Top</a>\n",r+="</div>\n",r+="<script>\n",r+="function filterUrls(searchTerm) {\n",r+="  var items = document.querySelectorAll('.url-item');\n",r+="  var term = searchTerm.toLowerCase();\n",r+="  items.forEach(function(item) {\n",r+="    var url = item.getAttribute('data-url');\n",r+="    var title = item.getAttribute('data-title');\n",r+="    if(url.includes(term) || title.includes(term)) {\n",r+="      item.style.display = 'block';\n",r+="    } else {\n",r+="      item.style.display = 'none';\n",r+="    }\n",r+="  });\n",r+="}\n",r+="</script>\n</body>\n</html>";var A=new Blob([o],{type:"text/plain"}),B=URL.createObjectURL(A),C=document.createElement("a");C.href=B,C.download=a+"_urls_"+d+".txt",document.body.appendChild(C),C.click(),document.body.removeChild(C),URL.revokeObjectURL(B);var D=new Blob([r],{type:"text/html"}),E=URL.createObjectURL(D),F=document.createElement("a");F.href=E,F.download=a+"_urls_"+d+".html",document.body.appendChild(F),F.click(),document.body.removeChild(F),URL.revokeObjectURL(E),alert("URLs extracted successfully!\nFiles created:\n\u2022 "+a+"_urls_"+d+".txt\n\u2022 "+a+"_urls_"+d+".html\nTotal URLs: "+h.length)})();
*/