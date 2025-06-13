/*!
 * Bookmarklet: Expose Hidden Content
 * Description: Reveals hidden HTML comments and concealed elements on any webpage
 * Version: 1.0.0
 * Author: gl0bal01
 * Tags: html, debug, developer-tools, comments, hidden-elements
 * Compatibility: all-browsers
 * Last Updated: 2025-05-31
 */

/**
 * EXPOSE HIDDEN CONTENT BOOKMARKLET
 * 
 * This bookmarklet reveals:
 * - HTML comments (<!-- -->)
 * - Hidden elements (display:none, visibility:hidden, opacity:0, hidden attribute)
 * - Technical tags (script, style, meta, link, noscript, template)
 * 
 * Features:
 * - Visual highlighting with color coding
 * - Interactive control panel
 * - Toggle visibility
 * - Complete removal option
 * - Non-destructive to original page
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        version: '1.0.0',
        name: 'Expose Hidden Content',
        containerIds: {
            comments: 'exposed-comments-container',
            hidden: 'exposed-hidden-container'
        }
    };
    
    // Check if already running
    if (document.getElementById(CONFIG.containerIds.comments)) {
        alert('Expose Hidden Content is already running on this page!');
        return;
    }
    
    /**
     * Inject CSS styles for visual highlighting
     */
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .exposed-comment {
                background-color: yellow !important;
                color: black !important;
                padding: 5px !important;
                border: 2px solid red !important;
                display: block !important;
                margin: 5px 0 !important;
                font-family: monospace !important;
                white-space: pre-wrap !important;
                position: relative !important;
                z-index: 9999 !important;
                border-radius: 4px !important;
            }
            
            .exposed-hidden {
                background-color: #ffccff !important;
                color: black !important;
                padding: 5px !important;
                border: 2px solid blue !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                margin: 5px 0 !important;
                font-family: monospace !important;
                position: relative !important;
                z-index: 9999 !important;
                border-radius: 4px !important;
            }
            
            .tag-name {
                background-color: #333 !important;
                color: white !important;
                padding: 2px 4px !important;
                border-radius: 3px !important;
                font-weight: bold !important;
                margin-right: 5px !important;
                font-size: 12px !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Create containers for exposed content
     */
    function createContainers() {
        // Comments container
        const commentsContainer = document.createElement('div');
        commentsContainer.id = CONFIG.containerIds.comments;
        commentsContainer.style.cssText = `
            position: relative;
            z-index: 9998;
            margin-bottom: 20px;
            padding: 10px;
            background: #fffacd;
            border: 1px solid #ddd;
            border-radius: 5px;
        `;
        document.body.insertBefore(commentsContainer, document.body.firstChild);
        
        // Hidden elements container
        const hiddenContainer = document.createElement('div');
        hiddenContainer.id = CONFIG.containerIds.hidden;
        hiddenContainer.style.cssText = `
            position: relative;
            z-index: 9998;
            margin-top: 20px;
            padding: 10px;
            background: #f0f8ff;
            border: 1px solid #ddd;
            border-radius: 5px;
        `;
        document.body.insertBefore(hiddenContainer, commentsContainer.nextSibling);
        
        return { commentsContainer, hiddenContainer };
    }
    
    /**
     * Find all HTML comments using TreeWalker
     */
    function findComments() {
        const comments = [];
        const walker = document.createTreeWalker(
            document.documentElement,
            NodeFilter.SHOW_COMMENT,
            null,
            false
        );
        
        let comment;
        while (comment = walker.nextNode()) {
            comments.push(comment);
        }
        
        return comments;
    }
    
    /**
     * Expose HTML comments
     */
    function exposeComments(container) {
        const comments = findComments();
        
        if (comments.length === 0) {
            container.innerHTML = '<p style="color: #666;">No HTML comments found on this page.</p>';
            return;
        }
        
        container.innerHTML = '<h3 style="margin-top: 0;">📝 HTML Comments Found (' + comments.length + ')</h3>';
        
        comments.forEach((comment, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'exposed-comment';
            wrapper.innerHTML = `
                <span class="tag-name">COMMENT #${index + 1}</span>
                &lt;!-- ${comment.textContent.trim()} --&gt;
            `;
            container.appendChild(wrapper);
        });
    }
    
    /**
     * Find hidden elements
     */
    function findHiddenElements() {
        const selectors = [
            '[style*="display: none"]',
            '[style*="display:none"]',
            '[hidden]',
            '[style*="visibility: hidden"]',
            '[style*="visibility:hidden"]',
            '[style*="opacity: 0"]',
            '[style*="opacity:0"]',
            'script',
            'noscript',
            'template',
            'meta',
            'link',
            'style'
        ];
        
        return document.querySelectorAll(selectors.join(','));
    }
    
    /**
     * Expose hidden elements
     */
    function exposeHiddenElements(container) {
        const hiddenElements = findHiddenElements();
        
        if (hiddenElements.length === 0) {
            container.innerHTML = '<p style="color: #666;">No hidden elements found on this page.</p>';
            return;
        }
        
        container.innerHTML = '<h3 style="margin-top: 0;">👻 Hidden Elements Found (' + hiddenElements.length + ')</h3>';
        
        hiddenElements.forEach((element, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'exposed-hidden';
            
            const tagName = document.createElement('span');
            tagName.className = 'tag-name';
            tagName.textContent = `${element.tagName} #${index + 1}`;
            wrapper.appendChild(tagName);
            
            const content = document.createElement('div');
            content.style.marginTop = '5px';
            
            if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
                content.textContent = element.textContent.substring(0, 200) + 
                    (element.textContent.length > 200 ? '...' : '');
            } else {
                content.textContent = element.outerHTML.substring(0, 300) + 
                    (element.outerHTML.length > 300 ? '...' : '');
            }
            
            wrapper.appendChild(content);
            container.appendChild(wrapper);
        });
    }
    
    /**
     * Create control panel
     */
    function createControlPanel() {
        const controlPanel = document.createElement('div');
        controlPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10000;
            background: #333;
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;
        
        controlPanel.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>🔍 ${CONFIG.name} v${CONFIG.version}</strong>
            </div>
            <button id="toggle-exposed" style="margin-right: 5px; padding: 5px 10px; cursor: pointer;">Hide</button>
            <button id="remove-exposed" style="padding: 5px 10px; cursor: pointer;">Remove</button>
        `;
        
        document.body.appendChild(controlPanel);
        
        // Add event listeners
        document.getElementById('toggle-exposed').addEventListener('click', function() {
            const items = document.querySelectorAll('.exposed-comment, .exposed-hidden');
            const isHidden = items[0]?.style.display === 'none';
            
            items.forEach(item => {
                item.style.display = isHidden ? 'block' : 'none';
            });
            
            this.textContent = isHidden ? 'Hide' : 'Show';
        });
        
        document.getElementById('remove-exposed').addEventListener('click', function() {
            const items = document.querySelectorAll('.exposed-comment, .exposed-hidden');
            items.forEach(item => item.remove());
            
            // Remove containers
            const commentsContainer = document.getElementById(CONFIG.containerIds.comments);
            const hiddenContainer = document.getElementById(CONFIG.containerIds.hidden);
            if (commentsContainer) commentsContainer.remove();
            if (hiddenContainer) hiddenContainer.remove();
            
            controlPanel.remove();
        });
    }
    
    /**
     * Main execution function
     */
    function main() {
        try {
            // Inject styles
            injectStyles();
            
            // Create containers
            const { commentsContainer, hiddenContainer } = createContainers();
            
            // Expose content
            exposeComments(commentsContainer);
            exposeHiddenElements(hiddenContainer);
            
            // Create control panel
            createControlPanel();
            
            console.log(`${CONFIG.name} v${CONFIG.version} loaded successfully!`);
            
        } catch (error) {
            console.error('Error running Expose Hidden Content:', error);
            alert('Error running bookmarklet: ' + error.message);
        }
    }
    
    // Execute
    main();
    
})();

/* 
BOOKMARKLET CODE (copy this entire line for bookmark URL):
javascript:(function(){const s=document.createElement('style');s.textContent=".exposed-comment{background-color:yellow!important;color:black!important;padding:5px!important;border:2px solid red!important;display:block!important;margin:5px 0!important;font-family:monospace!important;white-space:pre-wrap!important;position:relative!important;z-index:9999!important;}.exposed-hidden{background-color:#ffccff!important;color:black!important;padding:5px!important;border:2px solid blue!important;display:block!important;visibility:visible!important;opacity:1!important;margin:5px 0!important;font-family:monospace!important;position:relative!important;z-index:9999!important;}.tag-name{background-color:#333!important;color:white!important;padding:2px 4px!important;border-radius:3px!important;font-weight:bold!important;margin-right:5px!important;}";document.head.appendChild(s);const cC=document.createElement('div');cC.id='exposed-comments-container';cC.style.cssText='position:relative;z-index:9998;margin-bottom:20px;';document.body.insertBefore(cC,document.body.firstChild);const hC=document.createElement('div');hC.id='exposed-hidden-container';hC.style.cssText='position:relative;z-index:9998;margin-top:20px;';document.body.insertBefore(hC,cC.nextSibling);(function(){const fC=n=>{const cs=[],w=document.createTreeWalker(n,NodeFilter.SHOW_COMMENT,null,false);let com;while(com=w.nextNode()){cs.push(com);}return cs;};const cs=fC(document.documentElement);cs.forEach(com=>{const w=document.createElement('div');w.className='exposed-comment';w.innerHTML='<span class="tag-name">COMMENT</span>&lt;!-- '+com.textContent+' --&gt;';cC.appendChild(w);});})();(function(){const sel=['[style*="display: none"]','[style*="display:none"]','[hidden]','[style*="visibility: hidden"]','[style*="visibility:hidden"]','[style*="opacity: 0"]','[style*="opacity:0"]','script','noscript','template','meta','link','style'];const hes=document.querySelectorAll(sel.join(','));hes.forEach(el=>{const w=document.createElement('div');w.className='exposed-hidden';const tn=document.createElement('span');tn.className='tag-name';tn.textContent=el.tagName;w.appendChild(tn);const c=document.createElement('div');c.textContent=(el.tagName==='SCRIPT'||el.tagName==='STYLE')?el.textContent:el.outerHTML;w.appendChild(c);hC.appendChild(w);});})();const ctrl=document.createElement('div');ctrl.style.cssText="position:fixed;top:10px;right:10px;z-index:10000;background:#333;color:white;padding:5px;border-radius:5px;font-family:sans-serif;";ctrl.innerHTML="<p>Comments & Hidden Tags Exposed</p><button id='toggle-exposed'>Hide</button><button id='remove-exposed'>Remove</button>";document.body.appendChild(ctrl);document.getElementById('toggle-exposed').addEventListener('click',function(){const items=document.querySelectorAll('.exposed-comment, .exposed-hidden');items.forEach(el=>el.style.display=el.style.display==='none'?'block':'none');this.textContent=this.textContent==='Hide'?'Show':'Hide';});document.getElementById('remove-exposed').addEventListener('click',function(){const items=document.querySelectorAll('.exposed-comment, .exposed-hidden');items.forEach(el=>el.remove());ctrl.remove();});})();
*/