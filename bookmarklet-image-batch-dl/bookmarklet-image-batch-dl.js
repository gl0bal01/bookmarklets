/*!
 * Bookmarklet: Image Batch Downloader Bookmarklet
 * Description:  Downloads images from any webpage with advanced filtering
 * Version: 1.1.0
 * Author: gl0bal01
 * Tags: html, image download, developer-tools, osint
 * Compatibility: all-browsers
 * Last Updated: 2025-06-16
 */
javascript:(function(){
    const s='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    const l=src=>new Promise(r=>{const e=document.createElement('script');e.src=src;e.onload=r;document.head.appendChild(e);});
    
    (async function(){
        // Prompt user for minimum image size
        const userInput = prompt('Enter minimum image size (width or height in pixels):', '300');
        let minSize;
        
        if (userInput === null) {
            // User cancelled
            return;
        } else if (userInput === '' || userInput === '0') {
            // User wants 0 or empty (treat as 0)
            minSize = 0;
        } else {
            // Parse the input
            minSize = parseInt(userInput);
            if (isNaN(minSize) || minSize < 0) {
                alert('Invalid input. Using default size of 300px.');
                minSize = 300;
            }
        }
        
        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #333; color: white;' +
            'padding: 15px; border-radius: 8px; z-index: 10001; font-family: Arial;' +
            'box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
        loadingDiv.innerHTML = 'Scanning page for images ≥' + minSize + 'px...<br><small>Auto-scrolling to detect lazy-loaded images</small>';
        document.body.appendChild(loadingDiv);
        
        // Auto-scroll to trigger lazy loading
        const originalScrollY = window.scrollY;
        const scrollStep = Math.max(window.innerHeight * 0.8, 600);
        const documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        
        // Scroll down to trigger lazy loading
        for (let scrollPos = 0; scrollPos < documentHeight; scrollPos += scrollStep) {
            window.scrollTo(0, scrollPos);
            loadingDiv.innerHTML = 'Scanning page for images...<br><small>Scrolling: ' + Math.round((scrollPos/documentHeight)*100) + '%</small>';
            await new Promise(resolve => setTimeout(resolve, 250)); // Wait for images to load
        }
        
        // Scroll back to original position
        window.scrollTo(0, originalScrollY);
        loadingDiv.innerHTML = 'Processing images...';
        
        await l(s);
        const z=new JSZip();
        
        // Get all images including those loaded via CSS, lazy loading, etc.
        const allImages = [
            ...Array.from(document.images),
            ...Array.from(document.querySelectorAll('[style*="background-image"]')),
            ...Array.from(document.querySelectorAll('*')).filter(el => {
                const style = window.getComputedStyle(el);
                return style.backgroundImage && style.backgroundImage !== 'none';
            })
        ];
        
        const i = [];
        
        // Process regular img elements
        Array.from(document.images).forEach(img => {
            if (img && img.src && (img.naturalWidth >= minSize || img.naturalHeight >= minSize)) {
                i.push(img);
            }
        });
        
        // Process background images
        const bgImagePromises = [];
        Array.from(document.querySelectorAll('*')).forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.backgroundImage && style.backgroundImage !== 'none') {
                const matches = style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (matches && matches[1]) {
                    const promise = new Promise((resolve) => {
                        const fakeImg = new Image();
                        fakeImg.onload = function() {
                            if (this.naturalWidth >= minSize || this.naturalHeight >= minSize) {
                                this.isBackgroundImage = true;
                                i.push(this);
                            }
                            resolve();
                        };
                        fakeImg.onerror = function() {
                            resolve(); // Continue even if image fails to load
                        };
                        fakeImg.src = matches[1];
                    });
                    bgImagePromises.push(promise);
                }
            }
        });
        
        // Wait for background images to load
        await Promise.all(bgImagePromises);
        
        // Wait a moment for background images to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if(!i.length){
            alert('No images larger than ' + minSize + 'x' + minSize + ' found.');
            return;
        }
        
        // Show preview dialog
        const previewDialog = document.createElement('div');
        previewDialog.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);' +
            'background: white; border: 2px solid #333; padding: 20px; z-index: 10000;' +
            'max-width: 80vw; max-height: 80vh; overflow: auto; border-radius: 8px;' +
            'box-shadow: 0 4px 20px rgba(0,0,0,0.3);';
        
        const imageCheckboxes = i.filter(img => img && img.src).map((img, k) => {
            return '<label style="display: block; margin: 5px 0; padding: 5px; border: 1px solid #ddd;">' +
                '<input type="checkbox" checked data-index="' + k + '" class="image-checkbox">' +
                '<img src="' + (img.src || img.getAttribute('data-src') || '') + '" ' +
                'style="max-width: 100px; max-height: 100px; margin: 0 10px; vertical-align: middle;">' +
                '<span>' + (img.naturalWidth || '?') + 'x' + (img.naturalHeight || '?') + 'px</span>' +
                '</label>';
        }).join('');
        
        previewDialog.innerHTML = '<h3>Found ' + i.length + ' images (≥' + minSize + 'px)</h3>' +
            '<div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">' +
            '<h4>Options:</h4>' +
            '<label style="display: block; margin: 5px 0;">' +
            '<input type="checkbox" id="useOriginalNames" checked>' +
            'Keep original image filenames' +
            '</label>' +
            '<label style="display: block; margin: 5px 0;">' +
            '<input type="checkbox" id="includeReadme" checked>' +
            'Include README file with page info' +
            '</label>' +
            '<label style="display: block; margin: 5px 0;">' +
            '<input type="checkbox" id="usePageNameInZip" checked>' +
            'Use page name in ZIP filename' +
            '</label>' +
            '<label style="display: block; margin: 5px 0;">' +
            '<input type="checkbox" id="selectAll" checked>' +
            'Select/Deselect All' +
            '</label>' +
            '</div>' +
            '<p>Select images to download:</p>' +
            '<div style="max-height: 400px; overflow-y: auto; margin: 10px 0;">' +
            imageCheckboxes +
            '</div>' +
            '<button id="downloadSelected">Download Selected</button>' +
            '<button id="cancelDownload">Cancel</button>';
        
        document.body.appendChild(previewDialog);
        
        // Add select/deselect all functionality
        document.getElementById('selectAll').onchange = function() {
            const checkboxes = previewDialog.querySelectorAll('.image-checkbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
        };
        
        document.getElementById('downloadSelected').onclick = async function() {
            const selected = Array.from(previewDialog.querySelectorAll('input[type="checkbox"]:checked'))
                .map(cb => parseInt(cb.dataset.index))
                .filter(index => i[index] && i[index].src); // Filter out invalid indices
            
            const useOriginalNames = document.getElementById('useOriginalNames').checked;
            const includeReadme = document.getElementById('includeReadme').checked;
            const usePageNameInZip = document.getElementById('usePageNameInZip').checked;
            
            if (!selected.length) {
                alert('No valid images selected!');
                return;
            }
            
            document.body.removeChild(previewDialog);
            
            // Helper function to get filename from URL
            const getOriginalFilename = (url, fallback) => {
                try {
                    const urlObj = new URL(url, window.location.href); // Handle relative URLs
                    const pathname = urlObj.pathname;
                    const filename = pathname.split('/').pop();
                    if (filename && filename.includes('.')) {
                        return filename.split('?')[0]; // Remove query parameters
                    }
                } catch (e) {
                    console.log('Error parsing URL:', e);
                }
                return fallback;
            };
            
            // Helper function to sanitize filename
            const sanitizeFilename = (name) => {
                return name.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_');
            };
            
            const j=[];
            const usedNames = new Set();
            
            const p=selected.map((k, index)=>{
                const x = i[k];
                if (!x || !x.src) {
                    console.warn('Skipping invalid image at index ' + k);
                    return Promise.resolve();
                }
                
                const u = x.src || x.getAttribute('data-src');
                if (!u) {
                    console.warn('No URL found for image at index ' + k);
                    return Promise.resolve();
                }
                
                let filename;
                if (useOriginalNames) {
                    const originalName = getOriginalFilename(u, 'image_' + (k+1));
                    const ext = originalName.includes('.') ? '' : (u.split('.').pop().split('?')[0] || 'jpg');
                    const baseName = originalName.includes('.') ? originalName : originalName + '.' + ext;
                    
                    // Handle duplicate names
                    let finalName = baseName;
                    let counter = 1;
                    while (usedNames.has(finalName)) {
                        const nameWithoutExt = baseName.replace(/\.[^/.]+$/, '');
                        const extension = baseName.includes('.') ? baseName.split('.').pop() : '';
                        finalName = extension ? nameWithoutExt + '_' + counter + '.' + extension : nameWithoutExt + '_' + counter;
                        counter++;
                    }
                    filename = sanitizeFilename(finalName);
                    usedNames.add(filename);
                } else {
                    const ext = u.split('.').pop().split('?')[0] || 'jpg';
                    filename = 'image_' + (k+1) + '_' + (x.naturalWidth || 0) + 'x' + (x.naturalHeight || 0) + '.' + ext;
                }
                
                j.push({
                    originalFilename: filename,
                    url: u,
                    width: x.naturalWidth || 0,
                    height: x.naturalHeight || 0,
                    isBackgroundImage: x.isBackgroundImage || false,
                    originalUrl: u
                });
                
                return fetch(u).then(r=>r.blob()).then(b=>z.file(filename,b)).catch(e=>{
                    console.error('Failed to fetch ' + u + ':', e);
                    return null;
                });
            }).filter(p => p); // Remove null promises
            
            await Promise.all(p);
            
            // Add metadata file
            z.file('images_metadata.json',JSON.stringify(j,null,2));
            
            // Add README file if requested
            if (includeReadme) {
                const pageTitle = document.title || 'Unknown Page';
                const pageUrl = window.location.href;
                const currentDate = new Date().toISOString();
                const imagesList = j.map((img, idx) => (idx + 1) + '. ' + img.originalFilename + ' (' + img.width + 'x' + img.height + 'px)').join('\n');
                
                const readmeContent = '# Images Downloaded from: ' + pageTitle + '\n\n' +
                    '**Source URL:** ' + pageUrl + '\n' +
                    '**Download Date:** ' + currentDate + '\n' +
                    '**Total Images:** ' + selected.length + '\n' +
                    '**Minimum Size Filter:** ' + minSize + 'px\n\n' +
                    '## Download Options Used:\n' +
                    '- Original filenames: ' + (useOriginalNames ? 'Yes' : 'No') + '\n' +
                    '- README included: ' + (includeReadme ? 'Yes' : 'No') + '\n' +
                    '- Page name in ZIP: ' + (usePageNameInZip ? 'Yes' : 'No') + '\n\n' +
                    '## Images List:\n' +
                    imagesList + '\n\n' +
                    '---\n' +
                    'Generated by Enhanced Image Downloader Bookmarklet\n';
                
                z.file('README.md', readmeContent);
            }
            
            const c = await z.generateAsync({type:'blob'});
            const a=document.createElement('a');
            a.href=URL.createObjectURL(c);
            
            // Generate ZIP filename
            let zipName;
            if (usePageNameInZip) {
                const pageTitle = document.title || 'webpage';
                const sanitizedTitle = sanitizeFilename(pageTitle).substring(0, 50); // Limit length
                const date = new Date().toISOString().slice(0,10);
                zipName = sanitizedTitle + '_' + date + '_images.zip';
            } else {
                zipName = 'images_' + minSize + 'px_' + new Date().toISOString().slice(0,10) + '.zip';
            }
            
            a.download = zipName;
            a.click();
            
            alert('Downloaded ' + selected.length + ' images as "' + zipName + '"!');
        };
        
        document.getElementById('cancelDownload').onclick = function() {
            document.body.removeChild(previewDialog);
        };
        
        // Remove loading indicator
        if (loadingDiv.parentNode) {
            document.body.removeChild(loadingDiv);
        }
        
    })();
})();


/* 
BOOKMARKLET CODE (copy this entire line for bookmark URL):
javascript:(function(){const a=a=>new Promise(b=>{const c=document.createElement("script");c.src=a,c.onload=b,document.head.appendChild(c)});(async function(){const b=prompt("Enter minimum image size (width or height in pixels):","300");let d;if(null===b)return;""===b||"0"===b?d=0:(d=parseInt(b),(isNaN(d)||0>d)&&(alert("Invalid input. Using default size of 300px."),d=300));const e=document.createElement("div");e.style.cssText="position: fixed; top: 20px; right: 20px; background: #333; color: white;padding: 15px; border-radius: 8px; z-index: 10001; font-family: Arial;box-shadow: 0 4px 12px rgba(0,0,0,0.3);",e.innerHTML="Scanning page for images \u2265"+d+"px...<br><small>Auto-scrolling to detect lazy-loaded images</small>",document.body.appendChild(e);const f=window.scrollY,g=Math.max(.8*window.innerHeight,600),h=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);for(let a=0;a<h;a+=g)window.scrollTo(0,a),e.innerHTML="Scanning page for images...<br><small>Scrolling: "+Math.round(100*(a/h))+"%</small>",await new Promise(a=>setTimeout(a,250));window.scrollTo(0,f),e.innerHTML="Processing images...",await a("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");const k=new JSZip,c=[...Array.from(document.images),...Array.from(document.querySelectorAll("[style*=\"background-image\"]")),...Array.from(document.querySelectorAll("*")).filter(a=>{const b=window.getComputedStyle(a);return b.backgroundImage&&"none"!==b.backgroundImage})],l=[];Array.from(document.images).forEach(a=>{a&&a.src&&(a.naturalWidth>=d||a.naturalHeight>=d)&&l.push(a)});const i=[];if(Array.from(document.querySelectorAll("*")).forEach(a=>{const b=window.getComputedStyle(a);if(b.backgroundImage&&"none"!==b.backgroundImage){const a=b.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);if(a&&a[1]){const b=new Promise(b=>{const c=new Image;c.onload=function(){(this.naturalWidth>=d||this.naturalHeight>=d)&&(this.isBackgroundImage=!0,l.push(this)),b()},c.onerror=function(){b()},c.src=a[1]});i.push(b)}}}),await Promise.all(i),await new Promise(a=>setTimeout(a,1e3)),!l.length)return void alert("No images larger than "+d+"x"+d+" found.");const m=document.createElement("div");m.style.cssText="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);background: white; border: 2px solid #333; padding: 20px; z-index: 10000;max-width: 80vw; max-height: 80vh; overflow: auto; border-radius: 8px;box-shadow: 0 4px 20px rgba(0,0,0,0.3);";const n=l.filter(a=>a&&a.src).map((a,b)=>"<label style=\"display: block; margin: 5px 0; padding: 5px; border: 1px solid #ddd;\"><input type=\"checkbox\" checked data-index=\""+b+"\" class=\"image-checkbox\"><img src=\""+(a.src||a.getAttribute("data-src")||"")+"\" style=\"max-width: 100px; max-height: 100px; margin: 0 10px; vertical-align: middle;\"><span>"+(a.naturalWidth||"?")+"x"+(a.naturalHeight||"?")+"px</span></label>").join("");m.innerHTML="<h3>Found "+l.length+" images (\u2265"+d+"px)</h3><div style=\"margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;\"><h4>Options:</h4><label style=\"display: block; margin: 5px 0;\"><input type=\"checkbox\" id=\"useOriginalNames\" checked>Keep original image filenames</label><label style=\"display: block; margin: 5px 0;\"><input type=\"checkbox\" id=\"includeReadme\" checked>Include README file with page info</label><label style=\"display: block; margin: 5px 0;\"><input type=\"checkbox\" id=\"usePageNameInZip\" checked>Use page name in ZIP filename</label><label style=\"display: block; margin: 5px 0;\"><input type=\"checkbox\" id=\"selectAll\" checked>Select/Deselect All</label></div><p>Select images to download:</p><div style=\"max-height: 400px; overflow-y: auto; margin: 10px 0;\">"+n+"</div><button id=\"downloadSelected\">Download Selected</button><button id=\"cancelDownload\">Cancel</button>",document.body.appendChild(m),document.getElementById("selectAll").onchange=function(){const a=m.querySelectorAll(".image-checkbox");a.forEach(a=>a.checked=this.checked)},document.getElementById("downloadSelected").onclick=async function(){const b=Array.from(m.querySelectorAll("input[type=\"checkbox\"]:checked")).map(a=>parseInt(a.dataset.index)).filter(a=>l[a]&&l[a].src),e=document.getElementById("useOriginalNames").checked,f=document.getElementById("includeReadme").checked,g=document.getElementById("usePageNameInZip").checked;if(!b.length)return void alert("No valid images selected!");document.body.removeChild(m);const h=(a,b)=>{try{const b=new URL(a,window.location.href),c=b.pathname,d=c.split("/").pop();if(d&&d.includes("."))return d.split("?")[0]}catch(a){console.log("Error parsing URL:",a)}return b},i=a=>a.replace(/[<>:"/\\|?*]/g,"_").replace(/\s+/g,"_"),n=[],j=new Set,o=b.map(a=>{const b=l[a];if(!b||!b.src)return console.warn("Skipping invalid image at index "+a),Promise.resolve();const c=b.src||b.getAttribute("data-src");if(!c)return console.warn("No URL found for image at index "+a),Promise.resolve();let d;if(e){const b=h(c,"image_"+(a+1)),e=b.includes(".")?"":c.split(".").pop().split("?")[0]||"jpg",f=b.includes(".")?b:b+"."+e;let g=f,k=1;for(;j.has(g);){const a=f.replace(/\.[^/.]+$/,""),b=f.includes(".")?f.split(".").pop():"";g=b?a+"_"+k+"."+b:a+"_"+k,k++}d=i(g),j.add(d)}else{const e=c.split(".").pop().split("?")[0]||"jpg";d="image_"+(a+1)+"_"+(b.naturalWidth||0)+"x"+(b.naturalHeight||0)+"."+e}return n.push({originalFilename:d,url:c,width:b.naturalWidth||0,height:b.naturalHeight||0,isBackgroundImage:b.isBackgroundImage||!1,originalUrl:c}),fetch(c).then(a=>a.blob()).then(a=>k.file(d,a)).catch(a=>(console.error("Failed to fetch "+c+":",a),null))}).filter(a=>a);if(await Promise.all(o),k.file("images_metadata.json",JSON.stringify(n,null,2)),f){const a=document.title||"Unknown Page",c=window.location.href,h=new Date().toISOString(),i=n.map((a,b)=>b+1+". "+a.originalFilename+" ("+a.width+"x"+a.height+"px)").join("\n"),j="# Images Downloaded from: "+a+"\n\n**Source URL:** "+c+"\n**Download Date:** "+h+"\n**Total Images:** "+b.length+"\n**Minimum Size Filter:** "+d+"px\n\n## Download Options Used:\n- Original filenames: "+(e?"Yes":"No")+"\n- README included: "+(f?"Yes":"No")+"\n- Page name in ZIP: "+(g?"Yes":"No")+"\n\n## Images List:\n"+i+"\n\n---\nGenerated by Enhanced Image Downloader Bookmarklet\n";k.file("README.md",j)}const p=await k.generateAsync({type:"blob"}),c=document.createElement("a");c.href=URL.createObjectURL(p);let a;if(g){const b=document.title||"webpage",c=i(b).substring(0,50),d=new Date().toISOString().slice(0,10);a=c+"_"+d+"_images.zip"}else a="images_"+d+"px_"+new Date().toISOString().slice(0,10)+".zip";c.download=a,c.click(),alert("Downloaded "+b.length+" images as \""+a+"\"!")},document.getElementById("cancelDownload").onclick=function(){document.body.removeChild(m)},e.parentNode&&document.body.removeChild(e)})()})();
*/