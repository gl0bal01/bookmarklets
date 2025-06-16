/*!
 * Bookmarklet: LinkedIn OSINT Comment Extractor
 * Description: Extracts all comments, user data, and engagement metrics from LinkedIn posts with intelligent post type detection. Generates comprehensive reports in TXT, JSON, HTML, and CSV formats for OSINT investigations.
 * Version: 1.0.0
 * Author: gl0bal01
 * Tags: linkedin, osint, comments, extraction, investigation, social-media, analytics
 * Compatibility: all-browsers
 * Last Updated: 2025-06-16
 * Features: 
 *   - Smart link post detection
 *   - Comment thread mapping with reply relationships
 *   - Author profiling and engagement analytics
 *   - Multi-format export (TXT/JSON/HTML/CSV)
 *   - Timestamp extraction from LinkedIn URNs
 *   - Media detection and metadata extraction
 *   - Top commenters analysis
 *   - Chronological timeline reconstruction
 */
javascript:(function() {
    'use strict';
    
    try {
        // Function to extract timestamp from LinkedIn activity URN
        function extractTimestamp(urn) {
            if (!urn) return null;
            
            try {
                const match = urn.match(/activity:[0-9]+,([0-9]+)/);
                if (!match || !match[1]) {
                    console.log("[OSINT] No timestamp found in activity URN:", urn);
                    return null;
                }
                
                const timestampStr = match[1];
                const binary = BigInt(timestampStr).toString(2);
                const timestampBinary = binary.slice(0, 41);
                const timestamp = parseInt(timestampBinary, 2);
                const date = new Date(timestamp);
                const year = date.getFullYear();
                
                if (year < 2020 || year > 2030) {
                    console.log("[OSINT] Invalid timestamp extracted:", timestamp, "Date:", date);
                    return null;
                }
                
                return timestamp;
            } catch (error) {
                console.error("[OSINT] Timestamp extraction error:", error);
                return null;
            }
        }
        
        // Function to format dates
        function formatDates(timestamp) {
            if (!timestamp) return "Unknown date";
            const date = new Date(timestamp);
            return {
                utc: date.toUTCString(),
                iso: date.toISOString(),
                unix: timestamp,
                local: date.toString()
            };
        }
        
        // Function to extract author information
        function extractAuthor(commentElement) {
            try {
                const authorLink = commentElement.querySelector(".comments-comment-meta__actor a");
                const authorTitle = commentElement.querySelector(".comments-comment-meta__description-title");
                
                const authorData = {
                    name: authorTitle?.textContent.trim() || "Unknown Author",
                    profileUrl: authorLink?.href || "",
                    publicId: authorLink?.href.match(/\/in\/([^\/\?]+)/)?.[1] || "",
                    headline: commentElement.querySelector(".comments-comment-meta__description-subtitle")?.textContent.trim() || "",
                    badge: commentElement.querySelector(".comments-comment-meta__badge")?.textContent.trim() || "",
                    isPremium: !!commentElement.querySelector(".premium-icon"),
                    isInfluencer: !!commentElement.querySelector("li-icon[type=\"linkedin-bug-influencer-color\"]"),
                    connectionDegree: commentElement.querySelector(".comments-comment-meta__data")?.textContent.trim().replace("•", "").trim() || ""
                };
                
                return authorData;
            } catch (error) {
                console.error("[OSINT] Author data extraction error:", error);
                return {
                    name: "Error extracting author",
                    error: error.message
                };
            }
        }
        
        // Function to extract comment content
        function extractContent(commentElement) {
            try {
                const contentContainer = commentElement.querySelector(".comments-comment-item__main-content");
                if (!contentContainer) {
                    return {
                        text: "No content found",
                        mentions: [],
                        hashtags: []
                    };
                }
                
                const text = contentContainer.textContent.trim();
                const mentions = Array.from(contentContainer.querySelectorAll("a[data-attribute-index]")).map(link => ({
                    name: link.textContent.trim(),
                    url: link.href,
                    publicId: link.href.match(/\/in\/([^\/\?]+)/)?.[1] || ""
                }));
                
                const hashtags = Array.from(contentContainer.querySelectorAll("a[href*=\"hashtag\"]")).map(link => 
                    link.textContent.trim().replace("#", "")
                );
                
                const isEdited = !!commentElement.querySelector(".comments-comment-item__edited-badge");
                
                return {
                    text: text,
                    mentions: mentions,
                    hashtags: hashtags,
                    isEdited: isEdited
                };
            } catch (error) {
                console.error("[OSINT] Content extraction error:", error);
                return {
                    text: "Error extracting content",
                    error: error.message,
                    mentions: [],
                    hashtags: []
                };
            }
        }
        
        // Function to extract engagement data
        function extractEngagement(commentElement) {
            try {
                // Get reactions count
                const reactionsElement = commentElement.querySelector(".comments-comment-social-bar__reactions-count--cr");
                let reactionsCount = "0";
                
                if (reactionsElement) {
                    const ariaLabel = reactionsElement.getAttribute("aria-label");
                    const match = ariaLabel?.match(/(\d+)\s+[Rr]eaction/);
                    reactionsCount = match ? match[1] : reactionsElement.textContent.trim() || "0";
                }
                
                // Get reaction types
                const reactionTypes = Array.from(commentElement.querySelectorAll(".reactions-icon"))
                    .map(icon => icon.alt || icon.title || "")
                    .filter(type => type && type !== "like");
                
                // Get replies count
                const repliesElement = commentElement.querySelector(".comments-comment-social-bar__replies-count--cr");
                let repliesCount = 0;
                
                if (repliesElement) {
                    const repliesText = repliesElement.textContent.trim();
                    const repliesMatch = repliesText.match(/(\d+)\s+repl/i);
                    repliesCount = repliesMatch ? parseInt(repliesMatch[1]) : 0;
                }
                
                return {
                    reactions: {
                        count: reactionsCount,
                        types: reactionTypes.length > 0 ? reactionTypes : ["like"]
                    },
                    replies: repliesCount
                };
            } catch (error) {
                console.error("[OSINT] Engagement data extraction error:", error);
                return {
                    reactions: {
                        count: "0",
                        types: []
                    },
                    replies: 0
                };
            }
        }
        
        // Function to extract media content
        function extractMedia(commentElement) {
            try {
                const media = {
                    images: [],
                    videos: [],
                    sharedArticle: null,
                    sharedPost: null
                };
                
                // Extract images
                const images = commentElement.querySelectorAll(".comments-comment-item__media img");
                media.images = Array.from(images).map(img => ({
                    url: img.src || img.dataset.src || "",
                    alt: img.alt || ""
                }));
                
                // Extract videos
                const videos = commentElement.querySelectorAll(".comments-comment-item__media video");
                media.videos = Array.from(videos).map(video => ({
                    url: video.src || video.dataset.src || "",
                    poster: video.poster || ""
                }));
                
                // Extract shared articles
                const sharedArticle = commentElement.querySelector(".comments-comment-shared-article");
                if (sharedArticle) {
                    media.sharedArticle = {
                        url: sharedArticle.querySelector("a")?.href || "",
                        title: sharedArticle.querySelector(".comments-comment-shared-article__title")?.textContent.trim() || "",
                        description: sharedArticle.querySelector(".comments-comment-shared-article__description")?.textContent.trim() || ""
                    };
                }
                
                return media;
            } catch (error) {
                console.error("[OSINT] Media extraction error:", error);
                return {
                    images: [],
                    videos: [],
                    sharedArticle: null,
                    sharedPost: null
                };
            }
        }
        
        // Function to escape CSV values
        function escapeCsvValue(value) {
            if (!value) return "";
            value = (value + "").replace(/"/g, '""');
            if (value.includes(",") || value.includes("\n") || value.includes('"')) {
                return `"${value}"`;
            }
            return value;
        }
        
        // Function to download file
        function downloadFile(content, mimeType, filename) {
            const blob = new Blob([content], { type: mimeType });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        }
        
        // Function to detect if we're on a link post
        function isLinkPost() {
            const url = window.location.href;
            const hasPostPattern = /\/posts\/[^\/]+_[^\/]+-activity-\d+-/.test(url);
            const hasSharedContent = !!document.querySelector('.feed-shared-article, .feed-shared-update-v2__description-wrapper .feed-shared-article');
            const hasMediaShare = !!document.querySelector('.feed-shared-external-video, .feed-shared-linkedin-video');
            
            return hasPostPattern && (hasSharedContent || hasMediaShare || document.querySelector('.update-components-text'));
        }
        
        console.log("[OSINT Extractor] Starting extraction...");
        
        const currentUrl = window.location.href;
        const currentDate = new Date();
        const timestamp = currentDate.toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const dateOnly = currentDate.toISOString().split("T")[0];
        
        // Simple hash function for filename
        function simpleHash(str) {
            var hash = 0;
            if (str.length == 0) return hash;
            for (var i = 0; i < str.length; i++) {
                var char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return Math.abs(hash).toString(16);
        }
        
        const urlHash = simpleHash(currentUrl + dateOnly);
        
        // Find all comment elements
        const commentElements = document.querySelectorAll(".comments-comment-entity");
        
        if (!commentElements.length) {
            alert("No comments found! Please scroll to load all comments first.");
            return;
        }
        
        const isPostType = isLinkPost();
        console.log(`[OSINT] Found ${commentElements.length} comments to extract`);
        console.log(`[OSINT] Post type detected: ${isPostType ? 'Link Post' : 'Regular/Comment-only extraction'}`);
        
        // Extract post information
        const postData = function() {
            if (!isPostType) {
                return {
                    warning: "Not a link post - only extracting comments",
                    author: { name: "N/A" },
                    content: "N/A",
                    timestamp: "N/A",
                    engagement: {
                        reactions: "N/A",
                        comments: "N/A",
                        reposts: "N/A"
                    }
                };
            }
            
            console.log("[OSINT] Extracting post data...");
            try {
                const authorElement = document.querySelector(".update-components-actor__title .t-bold span[dir=\"ltr\"]");
                const authorName = authorElement?.textContent.trim() || 
                                document.querySelector(".update-components-actor__title")?.textContent.trim() || 
                                "Unknown";
                
                const reactionsElement = document.querySelector(".social-details-social-counts__reactions-count");
                const reactionsCount = reactionsElement?.textContent.trim() || 
                                     document.querySelector(".social-details-social-counts__reactions button")?.textContent.trim().match(/\d+/)?.[0] || 
                                     "0";
                
                const commentsElement = document.querySelector(".social-details-social-counts__comments button")?.textContent.trim() || "";
                const commentsCount = commentsElement.match(/\d+/)?.[0] || "0";
                
                const repostsElement = Array.from(document.querySelectorAll(".social-details-social-counts__item button"))
                    .find(button => button.textContent.includes("repost"))?.textContent.trim() || "";
                const repostsCount = repostsElement.match(/\d+/)?.[0] || "0";
                
                const postInfo = {
                    author: {
                        name: authorName,
                        headline: document.querySelector(".update-components-actor__description")?.textContent.trim() || "",
                        link: document.querySelector(".update-components-actor__meta-link")?.href || 
                              document.querySelector(".update-components-actor__container a")?.href || ""
                    },
                    content: document.querySelector(".feed-shared-update-v2__description")?.textContent.trim() || "",
                    timestamp: document.querySelector(".update-components-actor__sub-description")?.textContent.trim().split("•")[0]?.trim() || "",
                    engagement: {
                        reactions: reactionsCount,
                        comments: commentsCount,
                        reposts: repostsCount
                    }
                };
                
                return postInfo;
            } catch (error) {
                console.error("[OSINT] Post data extraction error:", error);
                return { error: error.message };
            }
        }();
        
        // Extract all comments
        const commentsData = [];
        const authorMap = new Map();
        
        Array.from(commentElements).forEach((commentElement, index) => {
            try {
                const commentId = commentElement.getAttribute("data-id") || "";
                const timestamp = extractTimestamp(commentId);
                const dates = formatDates(timestamp);
                const isReply = commentElement.classList.contains("comments-comment-item--reply");
                
                // Find parent author for replies
                let parentAuthor = null;
                if (isReply) {
                    const parentContainer = commentElement.closest(".comments-comments-list__comment-item");
                    const parentComment = parentContainer?.querySelector(".comments-comment-entity:not(.comments-comment-item--reply)");
                    if (parentComment) {
                        const parentId = parentComment.getAttribute("data-id");
                        parentAuthor = authorMap.get(parentId);
                    }
                }
                
                const commentData = {
                    id: commentId,
                    index: index + 1,
                    author: extractAuthor(commentElement),
                    content: extractContent(commentElement),
                    metadata: {
                        relativeDate: commentElement.querySelector("time.comments-comment-meta__data")?.textContent.trim() || "",
                        dates: dates,
                        timestamp: timestamp,
                        isReply: isReply,
                        parentAuthor: parentAuthor,
                        threadDepth: commentElement.querySelectorAll(".comments-comment-item--reply").length
                    },
                    engagement: extractEngagement(commentElement),
                    media: extractMedia(commentElement)
                };
                
                // Store author info for parent-child relationships
                if (!isReply && commentData.author.publicId) {
                    authorMap.set(commentId, commentData.author);
                }
                
                commentsData.push(commentData);
                console.log(`[OSINT] Extracted comment ${index + 1}/${commentElements.length}`);
                
            } catch (error) {
                console.error(`[OSINT] Error extracting comment ${index + 1}:`, error);
                commentsData.push({
                    id: "error-" + index,
                    index: index + 1,
                    error: error.message
                });
            }
        });
        
        // Generate author statistics
        const authorStats = new Map();
        commentsData.forEach(comment => {
            if (comment.author?.publicId && !comment.error) {
                if (!authorStats.has(comment.author.publicId)) {
                    authorStats.set(comment.author.publicId, {
                        name: comment.author.name,
                        profileUrl: comment.author.profileUrl,
                        headline: comment.author.headline,
                        commentCount: 0
                    });
                }
                authorStats.get(comment.author.publicId).commentCount++;
            }
        });
        
        // Create final data structure
        const extractedData = {
            metadata: {
                extractionDate: currentDate.toISOString(),
                extractorVersion: "2.1.0",
                url: currentUrl,
                title: document.title,
                totalComments: commentsData.length,
                uniqueCommenters: authorStats.size,
                isLinkPost: isPostType
            },
            post: postData,
            comments: commentsData,
            topCommenters: Array.from(authorStats.values())
                .sort((a, b) => b.commentCount - a.commentCount)
                .slice(0, 10),
            timeline: {
                earliest: commentsData.filter(c => c.metadata?.timestamp)
                    .sort((a, b) => a.metadata.timestamp - b.metadata.timestamp)[0],
                latest: commentsData.filter(c => c.metadata?.timestamp)
                    .sort((a, b) => b.metadata.timestamp - a.metadata.timestamp)[0]
            }
        };
        
        console.log("[OSINT] Generating outputs...");
        
        // Generate output formats
        const outputs = {
            txt: function(data) {
                let output = `LinkedIn OSINT Comment Extraction Report\n`;
                output += `=====================================\n`;
                output += `URL: ${data.metadata.url}\n`;
                output += `Title: ${data.metadata.title}\n`;
                output += `Extraction Date: ${data.metadata.extractionDate}\n`;
                output += `Total Comments: ${data.metadata.totalComments}\n`;
                output += `Unique Commenters: ${data.metadata.uniqueCommenters}\n`;
                output += `Post Type: ${data.metadata.isLinkPost ? 'Link Post' : 'Comment-only extraction'}\n\n`;
                
                if (!data.metadata.isLinkPost) {
                    output += "⚠️  WARNING: You are not on a link Post I will only extract comments\n\n";
                }
                
                if (data.metadata.isLinkPost) {
                    output += `POST INFORMATION\n`;
                    output += `================\n`;
                    output += `Author: ${data.post.author?.name || "Unknown"}\n`;
                    output += `Headline: ${data.post.author?.headline || "N/A"}\n`;
                    output += `Profile: ${data.post.author?.link || "N/A"}\n`;
                    output += `Posted: ${data.post.timestamp || "Unknown"}\n`;
                    output += `Reactions: ${data.post.engagement?.reactions || "0"}\n`;
                    output += `Comments: ${data.post.engagement?.comments || "0"}\n`;
                    output += `Reposts: ${data.post.engagement?.reposts || "0"}\n\n`;
                    output += `Content:\n${data.post.content || "No content found"}\n\n`;
                    
                    output += `TOP COMMENTERS\n`;
                    output += `==============\n`;
                    data.topCommenters.forEach((commenter, i) => {
                        output += `${i + 1}. ${commenter.name} - ${commenter.commentCount} comments\n`;
                    });
                }
                
                output += `\n\nCOMMENTS (Chronological Order)\n`;
                output += `===============================\n\n`;
                
                const chronologicalComments = data.comments
                    .filter(c => c.metadata?.timestamp)
                    .sort((a, b) => a.metadata.timestamp - b.metadata.timestamp);
                
                chronologicalComments.forEach(comment => {
                    output += `#${comment.index}\n`;
                    output += `Author: ${comment.author?.name || "Unknown"}\n`;
                    output += `Profile: ${comment.author?.profileUrl || "N/A"}\n`;
                    output += `Headline: ${comment.author?.headline || "N/A"}\n`;
                    output += `Badge: ${comment.author?.badge || "None"}\n`;
                    output += `Connection: ${comment.author?.connectionDegree || "N/A"}\n`;
                    output += `Posted: ${comment.metadata?.dates?.utc || "Unknown"}\n`;
                    output += `Relative: ${comment.metadata?.relativeDate || "Unknown"}\n`;
                    output += `Comment ID: ${comment.id}\n`;
                    output += `Is Reply: ${comment.metadata?.isReply ? "Yes" : "No"}\n`;
                    
                    if (comment.metadata?.parentAuthor) {
                        output += `Replying to: ${comment.metadata.parentAuthor.name}\n`;
                    }
                    
                    output += `Reactions: ${comment.engagement?.reactions?.count || "0"} (${comment.engagement?.reactions?.types?.join(", ") || "None"})\n`;
                    output += `Replies: ${comment.engagement?.replies || "0"}\n`;
                    
                    if (comment.content?.mentions?.length > 0) {
                        output += `Mentions: ${comment.content.mentions.map(m => `@${m.name}`).join(", ")}\n`;
                    }
                    
                    if (comment.content?.hashtags?.length > 0) {
                        output += `Hashtags: ${comment.content.hashtags.map(h => `#${h}`).join(", ")}\n`;
                    }
                    
                    if (comment.media?.images?.length > 0) {
                        output += `Images: ${comment.media.images.length} attached\n`;
                    }
                    
                    if (comment.content?.isEdited) {
                        output += `[EDITED]\n`;
                    }
                    
                    output += `\nContent:\n${comment.content?.text || "No content"}\n\n`;
                    output += `----------------------------------------\n\n`;
                });
                
                return output;
            }(extractedData),
            
            json: JSON.stringify(extractedData, null, 2),
            
            html: function(data) {
                const isLink = data.metadata.isLinkPost;
                const warningSection = isLink ? '' : `
                    <div class="card" style="background: #fff3cd; border-left: 4px solid #ffc107;">
                        <h2 style="color: #856404;">⚠️ Notice</h2>
                        <p style="color: #856404; margin: 0;">You are not on a link Post I will only extract comments</p>
                    </div>`;
                
                const postSection = isLink ? `
                    <div class="card">
                        <h2>Post Information</h2>
                        <div class="post-info">
                            <a href="${data.post.author?.link || "#"}" target="_blank" class="post-author">${data.post.author?.name || "Unknown Author"}</a>
                            <div class="post-headline">${data.post.author?.headline || ""}</div>
                            <div class="comment-metadata">Posted: ${data.post.timestamp || "Unknown"}</div>
                        </div>
                        <div class="engagement-stats">
                            <div class="engagement-stat">👍 ${data.post.engagement?.reactions || "0"} reactions</div>
                            <div class="engagement-stat">💬 ${data.post.engagement?.comments || "0"} comments</div>
                            <div class="engagement-stat">🔄 ${data.post.engagement?.reposts || "0"} reposts</div>
                        </div>
                        ${data.post.content ? `<div class="post-content">${data.post.content}</div>` : ""}
                    </div>` : '';
                
                const topCommentersSection = isLink ? `
                    <div class="card">
                        <h2>Top Commenters</h2>
                        <div class="top-commenters">
                            <ol>
                                ${data.topCommenters.map(commenter => 
                                    `<li><strong>${commenter.name}</strong> - ${commenter.commentCount} comment${commenter.commentCount > 1 ? "s" : ""}</li>`
                                ).join("")}
                            </ol>
                        </div>
                    </div>` : '';
                
                const analysisSection = isLink ? `
                    <div class="card">
                        <h2>Comments Analysis</h2>
                        <div class="metrics">
                            <div class="metric">
                                <span class="metric-value">${data.comments.length}</span>
                                <span class="metric-label">Total Comments</span>
                            </div>
                            <div class="metric">
                                <span class="metric-value">${data.metadata.uniqueCommenters}</span>
                                <span class="metric-label">Unique Commenters</span>
                            </div>
                            <div class="metric">
                                <span class="metric-value">${data.comments.filter(c => c.metadata?.isReply).length}</span>
                                <span class="metric-label">Replies</span>
                            </div>
                            <div class="metric">
                                <span class="metric-value">${data.comments.filter(c => c.content?.mentions?.length > 0).length}</span>
                                <span class="metric-label">Comments with Mentions</span>
                            </div>
                        </div>
                    </div>` : '';
                
                const htmlOutput = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkedIn OSINT Report - ${new Date(data.metadata.extractionDate).toLocaleDateString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0077b5 0%, #004471 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; font-weight: 300; }
        .header .subtitle { font-size: 1.1em; opacity: 0.9; }
        .card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); }
        .card h2 { color: #0077b5; margin-bottom: 20px; font-size: 1.8em; font-weight: 400; }
        .post-info { border-left: 4px solid #0077b5; padding-left: 20px; margin-bottom: 20px; }
        .post-author { font-size: 1.2em; font-weight: 600; color: #0077b5; text-decoration: none; display: inline-block; margin-bottom: 5px; }
        .post-author:hover { text-decoration: underline; }
        .post-headline { color: #666; margin-bottom: 10px; }
        .post-content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #0077b5; display: block; }
        .metric-label { color: #666; font-size: 0.9em; margin-top: 5px; }
        .comment { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 15px; transition: box-shadow 0.2s; }
        .comment:hover { box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); }
        .comment.reply { margin-left: 40px; border-left: 3px solid #0077b5; }
        .comment-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px; }
        .comment-author-info { flex: 1; }
        .comment-author { font-weight: 600; color: #0077b5; text-decoration: none; font-size: 1.1em; }
        .comment-author:hover { text-decoration: underline; }
        .comment-headline { color: #666; font-size: 0.9em; margin-top: 3px; }
        .comment-metadata { color: #999; font-size: 0.85em; margin-top: 5px; }
        .comment-content { margin: 15px 0; line-height: 1.6; }
        .comment-actions { display: flex; gap: 20px; margin-top: 15px; font-size: 0.9em; color: #666; }
        .badge { display: inline-block; background: #e7f3ff; color: #0077b5; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; margin-left: 10px; }
        .edited { color: #ff6b6b; font-size: 0.85em; font-style: italic; }
        .mention { color: #0077b5; font-weight: 500; }
        .hashtag { color: #0077b5; }
        .top-commenters { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .top-commenters ol { padding-left: 20px; }
        .top-commenters li { margin-bottom: 10px; color: #333; }
        .metadata-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .metadata-item { display: flex; flex-direction: column; }
        .metadata-label { font-weight: 600; color: #666; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.5px; }
        .metadata-value { color: #333; margin-top: 5px; }
        .engagement-stats { display: flex; gap: 15px; font-size: 0.9em; }
        .engagement-stat { display: flex; align-items: center; gap: 5px; }
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .header { padding: 30px 20px; }
            .header h1 { font-size: 2em; }
            .card { padding: 20px; }
            .comment.reply { margin-left: 20px; }
            .metrics { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>LinkedIn OSINT Analysis Report</h1>
            <div class="subtitle">${data.metadata.title}</div>
        </div>
        
        ${warningSection}
        
        <div class="card">
            <h2>Extraction Metadata</h2>
            <div class="metadata-grid">
                <div class="metadata-item">
                    <span class="metadata-label">URL</span>
                    <span class="metadata-value"><a href="${data.metadata.url}" target="_blank">${data.metadata.url}</a></span>
                </div>
                <div class="metadata-item">
                    <span class="metadata-label">Extraction Date</span>
                    <span class="metadata-value">${new Date(data.metadata.extractionDate).toLocaleString()}</span>
                </div>
                <div class="metadata-item">
                    <span class="metadata-label">Total Comments</span>
                    <span class="metadata-value">${data.metadata.totalComments}</span>
                </div>
                <div class="metadata-item">
                    <span class="metadata-label">Unique Commenters</span>
                    <span class="metadata-value">${data.metadata.uniqueCommenters}</span>
                </div>
                <div class="metadata-item">
                    <span class="metadata-label">Post Type</span>
                    <span class="metadata-value">${data.metadata.isLinkPost ? 'Link Post' : 'Comment-only extraction'}</span>
                </div>
            </div>
        </div>
        
        ${postSection}
        ${topCommentersSection}
        ${analysisSection}
        
        <div class="card">
            <h2>All Comments</h2>
            ${data.comments.map(comment => {
                if (comment.error) {
                    return `<div class="comment"><div class="edited">Error extracting comment ${comment.index}: ${comment.error}</div></div>`;
                }
                
                return `
                    <div class="comment ${comment.metadata?.isReply ? "reply" : ""}">
                        <div class="comment-header">
                            <div class="comment-author-info">
                                <div>
                                    <a href="${comment.author?.profileUrl || "#"}" target="_blank" class="comment-author">${comment.author?.name || "Unknown"}</a>
                                    ${comment.author?.badge ? `<span class="badge">${comment.author.badge}</span>` : ""}
                                </div>
                                ${comment.author?.headline ? `<div class="comment-headline">${comment.author.headline}</div>` : ""}
                                <div class="comment-metadata">
                                    ${comment.metadata?.dates?.utc || "Unknown date"} ${comment.metadata?.relativeDate ? `(${comment.metadata.relativeDate})` : ""} 
                                    ${comment.author?.connectionDegree ? ` • ${comment.author.connectionDegree}` : ""}
                                </div>
                            </div>
                        </div>
                        
                        ${comment.metadata?.isReply && comment.metadata?.parentAuthor ? 
                            `<div style="color: #666; font-size: 0.9em; margin-bottom: 10px;">↳ Replying to ${comment.metadata.parentAuthor.name}</div>` : ""}
                        
                        <div class="comment-content">
                            ${comment.content?.isEdited ? "<span class=\"edited\">[EDITED]</span> " : ""}
                            ${comment.content?.text || "No content"}
                        </div>
                        
                        ${comment.content?.mentions?.length > 0 ? 
                            `<div style="margin-top: 10px;">Mentions: ${comment.content.mentions.map(m => `<span class="mention">@${m.name}</span>`).join(", ")}</div>` : ""}
                        
                        ${comment.content?.hashtags?.length > 0 ? 
                            `<div style="margin-top: 5px;">Hashtags: ${comment.content.hashtags.map(h => `<span class="hashtag">#${h}</span>`).join(", ")}</div>` : ""}
                        
                        <div class="comment-actions">
                            <span>👍 ${comment.engagement?.reactions?.count || "0"} reactions</span>
                            <span>💬 ${comment.engagement?.replies || "0"} replies</span>
                            ${comment.media?.images?.length > 0 ? `<span>📷 ${comment.media.images.length} image(s)</span>` : ""}
                        </div>
                    </div>`;
            }).join("")}
        </div>
    </div>
</body>
</html>`;
                
                return htmlOutput;
            }(extractedData),
            
            csv: function(data) {
                let csvContent = "Comment_Index,Author_Name,Author_PublicID,Author_ProfileURL,Author_Headline,Author_Badge,Connection_Degree,Is_Reply,Parent_Author,Timestamp_UTC,Timestamp_Unix,Relative_Date,Reactions_Count,Reaction_Types,Replies_Count,Mentions,Hashtags,Has_Images,Is_Edited,Content\n";
                
                data.comments.forEach(comment => {
                    if (!comment.error) {
                        const row = [
                            comment.index,
                            escapeCsvValue(comment.author?.name || "Unknown"),
                            escapeCsvValue(comment.author?.publicId || ""),
                            escapeCsvValue(comment.author?.profileUrl || ""),
                            escapeCsvValue(comment.author?.headline || ""),
                            escapeCsvValue(comment.author?.badge || ""),
                            escapeCsvValue(comment.author?.connectionDegree || ""),
                            comment.metadata?.isReply ? "Yes" : "No",
                            escapeCsvValue(comment.metadata?.parentAuthor?.name || ""),
                            escapeCsvValue(comment.metadata?.dates?.utc || ""),
                            comment.metadata?.timestamp || "",
                            escapeCsvValue(comment.metadata?.relativeDate || ""),
                            comment.engagement?.reactions?.count || "0",
                            escapeCsvValue(comment.engagement?.reactions?.types?.join(";") || ""),
                            comment.engagement?.replies || "0",
                            escapeCsvValue(comment.content?.mentions?.map(m => m.name).join(";") || ""),
                            escapeCsvValue(comment.content?.hashtags?.join(";") || ""),
                            comment.media?.images?.length > 0 ? "Yes" : "No",
                            comment.content?.isEdited ? "Yes" : "No",
                            escapeCsvValue(comment.content?.text || "")
                        ];
                        csvContent += row.join(",") + "\n";
                    }
                });
                
                return csvContent;
            }(extractedData)
        };
        
        // Generate filename
        const filename = `LinkedIn-OSINT-Extract_${timestamp}_${urlHash}`;
        
        // Download files
        downloadFile(outputs.txt, "text/plain", `${filename}.txt`);
        setTimeout(() => downloadFile(outputs.json, "application/json", `${filename}.json`), 100);
        setTimeout(() => downloadFile(outputs.html, "text/html", `${filename}.html`), 200);
        setTimeout(() => downloadFile(outputs.csv, "text/csv", `${filename}.csv`), 300);
        
        // Show completion message
        const completionMessage = `LinkedIn OSINT Extraction Complete!\n${!isPostType ? "⚠️  WARNING: You are not on a link Post I will only extract comments\n\n" : ""}Extracted: ${commentsData.length} comments\nUnique users: ${authorStats.size}\nPost Type: ${isPostType ? 'Link Post' : 'Comment-only extraction'}\nFiles saved: TXT, JSON, HTML, CSV\n\nCheck your downloads folder for:\n- ${filename}.txt\n- ${filename}.json  \n- ${filename}.html\n- ${filename}.csv`;
        
        alert(completionMessage);
        console.log("[OSINT] Extraction complete!", extractedData);
        
    } catch (error) {
        console.error("[OSINT] Fatal error:", error);
        alert("OSINT Extraction Error: " + error.message);
    }
})();

/*
BOOKMARKLET CODE (copy this entire line for bookmark URL):
javascript:(function(){'use strict';try{function a(a){if(!a)return null;try{const b=a.match(/activity:[0-9]+,([0-9]+)/);if(!b||!b[1])return console.log("[OSINT] No timestamp found in activity URN:",a),null;const c=b[1],d=BigInt(c).toString(2),e=d.slice(0,41),f=parseInt(e,2),g=new Date(f),h=g.getFullYear();return 2020>h||2030<h?(console.log("[OSINT] Invalid timestamp extracted:",f,"Date:",g),null):f}catch(a){return console.error("[OSINT] Timestamp extraction error:",a),null}}function b(a){if(!a)return"Unknown date";const b=new Date(a);return{utc:b.toUTCString(),iso:b.toISOString(),unix:a,local:b.toString()}}function c(a){try{const b=a.querySelector(".comments-comment-meta__actor a"),c=a.querySelector(".comments-comment-meta__description-title"),d={name:c?.textContent.trim()||"Unknown Author",profileUrl:b?.href||"",publicId:b?.href.match(/\/in\/([^\/\?]+)/)?.[1]||"",headline:a.querySelector(".comments-comment-meta__description-subtitle")?.textContent.trim()||"",badge:a.querySelector(".comments-comment-meta__badge")?.textContent.trim()||"",isPremium:!!a.querySelector(".premium-icon"),isInfluencer:!!a.querySelector("li-icon[type=\"linkedin-bug-influencer-color\"]"),connectionDegree:a.querySelector(".comments-comment-meta__data")?.textContent.trim().replace("\u2022","").trim()||""};return d}catch(a){return console.error("[OSINT] Author data extraction error:",a),{name:"Error extracting author",error:a.message}}}function d(a){try{const b=a.querySelector(".comments-comment-item__main-content");if(!b)return{text:"No content found",mentions:[],hashtags:[]};const c=b.textContent.trim(),d=Array.from(b.querySelectorAll("a[data-attribute-index]")).map(a=>({name:a.textContent.trim(),url:a.href,publicId:a.href.match(/\/in\/([^\/\?]+)/)?.[1]||""})),e=Array.from(b.querySelectorAll("a[href*=\"hashtag\"]")).map(a=>a.textContent.trim().replace("#","")),f=!!a.querySelector(".comments-comment-item__edited-badge");return{text:c,mentions:d,hashtags:e,isEdited:f}}catch(a){return console.error("[OSINT] Content extraction error:",a),{text:"Error extracting content",error:a.message,mentions:[],hashtags:[]}}}function e(a){try{const b=a.querySelector(".comments-comment-social-bar__reactions-count--cr");let c="0";if(b){const a=b.getAttribute("aria-label"),d=a?.match(/(\d+)\s+[Rr]eaction/);c=d?d[1]:b.textContent.trim()||"0"}const d=Array.from(a.querySelectorAll(".reactions-icon")).map(a=>a.alt||a.title||"").filter(a=>a&&"like"!==a),e=a.querySelector(".comments-comment-social-bar__replies-count--cr");let f=0;if(e){const a=e.textContent.trim(),b=a.match(/(\d+)\s+repl/i);f=b?parseInt(b[1]):0}return{reactions:{count:c,types:0<d.length?d:["like"]},replies:f}}catch(a){return console.error("[OSINT] Engagement data extraction error:",a),{reactions:{count:"0",types:[]},replies:0}}}function f(a){try{const b={images:[],videos:[],sharedArticle:null,sharedPost:null},c=a.querySelectorAll(".comments-comment-item__media img");b.images=Array.from(c).map(a=>({url:a.src||a.dataset.src||"",alt:a.alt||""}));const d=a.querySelectorAll(".comments-comment-item__media video");b.videos=Array.from(d).map(a=>({url:a.src||a.dataset.src||"",poster:a.poster||""}));const e=a.querySelector(".comments-comment-shared-article");return e&&(b.sharedArticle={url:e.querySelector("a")?.href||"",title:e.querySelector(".comments-comment-shared-article__title")?.textContent.trim()||"",description:e.querySelector(".comments-comment-shared-article__description")?.textContent.trim()||""}),b}catch(a){return console.error("[OSINT] Media extraction error:",a),{images:[],videos:[],sharedArticle:null,sharedPost:null}}}function g(a){return a?(a=(a+"").replace(/"/g,"\"\""),a.includes(",")||a.includes("\n")||a.includes("\"")?%60"${a}"%60:a):""}function h(a,b,c){const d=new Blob([a],{type:b}),e=document.createElement("a");e.href=URL.createObjectURL(d),e.download=c,e.click()}console.log("[OSINT Extractor] Starting extraction...");const i=window.location.href,j=new Date,k=j.toISOString().replace(/[:.]/g,"-").slice(0,19),l=j.toISOString().split("T")[0],m=function(a){var b=0;if(0==a.length)return b;for(var c,d=0;d<a.length;d++)c=a.charCodeAt(d),b=(b<<5)-b+c,b&=b;return Math.abs(b).toString(16)}(i+l),n=document.querySelectorAll(".comments-comment-entity");if(!n.length)return void alert("No comments found! Please scroll to load all comments first.");const o=function(){const a=window.location.href,b=/\/posts\/[^\/]+_[^\/]+-activity-\d+-/.test(a),c=!!document.querySelector(".feed-shared-article, .feed-shared-update-v2__description-wrapper .feed-shared-article"),d=!!document.querySelector(".feed-shared-external-video, .feed-shared-linkedin-video");return b&&(c||d||document.querySelector(".update-components-text"))}();console.log(%60[OSINT] Found ${n.length} comments to extract%60),console.log(%60[OSINT] Post type detected: ${o?"Link Post":"Regular/Comment-only extraction"}%60);const p=function(){if(!o)return{warning:"Not a link post - only extracting comments",author:{name:"N/A"},content:"N/A",timestamp:"N/A",engagement:{reactions:"N/A",comments:"N/A",reposts:"N/A"}};console.log("[OSINT] Extracting post data...");try{const a=document.querySelector(".update-components-actor__title .t-bold span[dir=\"ltr\"]"),b=a?.textContent.trim()||document.querySelector(".update-components-actor__title")?.textContent.trim()||"Unknown",c=document.querySelector(".social-details-social-counts__reactions-count"),d=c?.textContent.trim()||document.querySelector(".social-details-social-counts__reactions button")?.textContent.trim().match(/\d+/)?.[0]||"0",e=document.querySelector(".social-details-social-counts__comments button")?.textContent.trim()||"",f=e.match(/\d+/)?.[0]||"0",g=Array.from(document.querySelectorAll(".social-details-social-counts__item button")).find(a=>a.textContent.includes("repost"))?.textContent.trim()||"",h=g.match(/\d+/)?.[0]||"0",i={author:{name:b,headline:document.querySelector(".update-components-actor__description")?.textContent.trim()||"",link:document.querySelector(".update-components-actor__meta-link")?.href||document.querySelector(".update-components-actor__container a")?.href||""},content:document.querySelector(".feed-shared-update-v2__description")?.textContent.trim()||"",timestamp:document.querySelector(".update-components-actor__sub-description")?.textContent.trim().split("\u2022")[0]?.trim()||"",engagement:{reactions:d,comments:f,reposts:h}};return i}catch(a){return console.error("[OSINT] Post data extraction error:",a),{error:a.message}}}(),q=[],r=new Map;Array.from(n).forEach((g,h)=>{try{const i=g.getAttribute("data-id")||"",j=a(i),k=b(j),l=g.classList.contains("comments-comment-item--reply");let m=null;if(l){const a=g.closest(".comments-comments-list__comment-item"),b=a?.querySelector(".comments-comment-entity:not(.comments-comment-item--reply)");if(b){const a=b.getAttribute("data-id");m=r.get(a)}}const o={id:i,index:h+1,author:c(g),content:d(g),metadata:{relativeDate:g.querySelector("time.comments-comment-meta__data")?.textContent.trim()||"",dates:k,timestamp:j,isReply:l,parentAuthor:m,threadDepth:g.querySelectorAll(".comments-comment-item--reply").length},engagement:e(g),media:f(g)};!l&&o.author.publicId&&r.set(i,o.author),q.push(o),console.log(%60[OSINT] Extracted comment ${h+1}/${n.length}%60)}catch(a){console.error(%60[OSINT] Error extracting comment ${h+1}:%60,a),q.push({id:"error-"+h,index:h+1,error:a.message})}});const s=new Map;q.forEach(a=>{a.author?.publicId&&!a.error&&(!s.has(a.author.publicId)&&s.set(a.author.publicId,{name:a.author.name,profileUrl:a.author.profileUrl,headline:a.author.headline,commentCount:0}),s.get(a.author.publicId).commentCount++)});const t={metadata:{extractionDate:j.toISOString(),extractorVersion:"2.1.0",url:i,title:document.title,totalComments:q.length,uniqueCommenters:s.size,isLinkPost:o},post:p,comments:q,topCommenters:Array.from(s.values()).sort((c,a)=>a.commentCount-c.commentCount).slice(0,10),timeline:{earliest:q.filter(a=>a.metadata?.timestamp).sort((c,a)=>c.metadata.timestamp-a.metadata.timestamp)[0],latest:q.filter(a=>a.metadata?.timestamp).sort((c,a)=>a.metadata.timestamp-c.metadata.timestamp)[0]}};console.log("[OSINT] Generating outputs...");const u={txt:function(a){let b=%60LinkedIn OSINT Comment Extraction Report\n%60;b+=%60=====================================\n%60,b+=%60URL: ${a.metadata.url}\n%60,b+=%60Title: ${a.metadata.title}\n%60,b+=%60Extraction Date: ${a.metadata.extractionDate}\n%60,b+=%60Total Comments: ${a.metadata.totalComments}\n%60,b+=%60Unique Commenters: ${a.metadata.uniqueCommenters}\n%60,b+=%60Post Type: ${a.metadata.isLinkPost?"Link Post":"Comment-only extraction"}\n\n%60,a.metadata.isLinkPost||(b+="\u26A0\uFE0F  WARNING: You are not on a link Post I will only extract comments\n\n"),a.metadata.isLinkPost&&(b+=%60POST INFORMATION\n%60,b+=%60================\n%60,b+=%60Author: ${a.post.author?.name||"Unknown"}\n%60,b+=%60Headline: ${a.post.author?.headline||"N/A"}\n%60,b+=%60Profile: ${a.post.author?.link||"N/A"}\n%60,b+=%60Posted: ${a.post.timestamp||"Unknown"}\n%60,b+=%60Reactions: ${a.post.engagement?.reactions||"0"}\n%60,b+=%60Comments: ${a.post.engagement?.comments||"0"}\n%60,b+=%60Reposts: ${a.post.engagement?.reposts||"0"}\n\n%60,b+=%60Content:\n${a.post.content||"No content found"}\n\n%60,b+=%60TOP COMMENTERS\n%60,b+=%60==============\n%60,a.topCommenters.forEach((a,c)=>{b+=%60${c+1}. ${a.name} - ${a.commentCount} comments\n%60})),b+=%60\n\nCOMMENTS (Chronological Order)\n%60,b+=%60===============================\n\n%60;const c=a.comments.filter(a=>a.metadata?.timestamp).sort((c,a)=>c.metadata.timestamp-a.metadata.timestamp);return c.forEach(a=>{b+=%60#${a.index}\n%60,b+=%60Author: ${a.author?.name||"Unknown"}\n%60,b+=%60Profile: ${a.author?.profileUrl||"N/A"}\n%60,b+=%60Headline: ${a.author?.headline||"N/A"}\n%60,b+=%60Badge: ${a.author?.badge||"None"}\n%60,b+=%60Connection: ${a.author?.connectionDegree||"N/A"}\n%60,b+=%60Posted: ${a.metadata?.dates?.utc||"Unknown"}\n%60,b+=%60Relative: ${a.metadata?.relativeDate||"Unknown"}\n%60,b+=%60Comment ID: ${a.id}\n%60,b+=%60Is Reply: ${a.metadata?.isReply?"Yes":"No"}\n%60,a.metadata?.parentAuthor&&(b+=%60Replying to: ${a.metadata.parentAuthor.name}\n%60),b+=%60Reactions: ${a.engagement?.reactions?.count||"0"} (${a.engagement?.reactions?.types?.join(", ")||"None"})\n%60,b+=%60Replies: ${a.engagement?.replies||"0"}\n%60,0<a.content?.mentions?.length&&(b+=%60Mentions: ${a.content.mentions.map(a=>%60@${a.name}%60).join(", ")}\n%60),0<a.content?.hashtags?.length&&(b+=%60Hashtags: ${a.content.hashtags.map(a=>%60#${a}%60).join(", ")}\n%60),0<a.media?.images?.length&&(b+=%60Images: ${a.media.images.length} attached\n%60),a.content?.isEdited&&(b+=%60[EDITED]\n%60),b+=%60\nContent:\n${a.content?.text||"No content"}\n\n%60,b+=%60----------------------------------------\n\n%60}),b}(t),json:JSON.stringify(t,null,2),html:function(a){const b=a.metadata.isLinkPost,c=b?"":%60                    <div class="card" style="background: #fff3cd; border-left: 4px solid #ffc107;">                        <h2 style="color: #856404;">⚠%EF%B8%8F Notice</h2>                        <p style="color: #856404; margin: 0;">You are not on a link Post I will only extract comments</p>                    </div>%60,d=b?%60                    <div class="card">                        <h2>Post Information</h2>                        <div class="post-info">                            <a href="${a.post.author?.link||"#"}" target="_blank" class="post-author">${a.post.author?.name||"Unknown Author"}</a>                            <div class="post-headline">${a.post.author?.headline||""}</div>                            <div class="comment-metadata">Posted: ${a.post.timestamp||"Unknown"}</div>                        </div>                        <div class="engagement-stats">                            <div class="engagement-stat">👍 ${a.post.engagement?.reactions||"0"} reactions</div>                            <div class="engagement-stat">💬 ${a.post.engagement?.comments||"0"} comments</div>                            <div class="engagement-stat">🔄 ${a.post.engagement?.reposts||"0"} reposts</div>                        </div>                        ${a.post.content?%60<div class="post-content">${a.post.content}</div>%60:""}                    </div>%60:"",e=b?%60                    <div class="card">                        <h2>Top Commenters</h2>                        <div class="top-commenters">                            <ol>                                ${a.topCommenters.map(a=>%60<li><strong>${a.name}</strong> - ${a.commentCount} comment${1<a.commentCount?"s":""}</li>%60).join("")}                            </ol>                        </div>                    </div>%60:"",f=b?%60                    <div class="card">                        <h2>Comments Analysis</h2>                        <div class="metrics">                            <div class="metric">                                <span class="metric-value">${a.comments.length}</span>                                <span class="metric-label">Total Comments</span>                            </div>                            <div class="metric">                                <span class="metric-value">${a.metadata.uniqueCommenters}</span>                                <span class="metric-label">Unique Commenters</span>                            </div>                            <div class="metric">                                <span class="metric-value">${a.comments.filter(a=>a.metadata?.isReply).length}</span>                                <span class="metric-label">Replies</span>                            </div>                            <div class="metric">                                <span class="metric-value">${a.comments.filter(a=>0<a.content?.mentions?.length).length}</span>                                <span class="metric-label">Comments with Mentions</span>                            </div>                        </div>                    </div>%60:"",g=%60<!DOCTYPE html><html lang="en"><head>    <meta charset="UTF-8">    <meta name="viewport" content="width=device-width, initial-scale=1.0">    <title>LinkedIn OSINT Report - ${new Date(a.metadata.extractionDate).toLocaleDateString()}</title>    <style>        * { margin: 0; padding: 0; box-sizing: border-box; }        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }        .header { background: linear-gradient(135deg, #0077b5 0%, #004471 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }        .header h1 { font-size: 2.5em; margin-bottom: 10px; font-weight: 300; }        .header .subtitle { font-size: 1.1em; opacity: 0.9; }        .card { background: white; border-radius: 12px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); }        .card h2 { color: #0077b5; margin-bottom: 20px; font-size: 1.8em; font-weight: 400; }        .post-info { border-left: 4px solid #0077b5; padding-left: 20px; margin-bottom: 20px; }        .post-author { font-size: 1.2em; font-weight: 600; color: #0077b5; text-decoration: none; display: inline-block; margin-bottom: 5px; }        .post-author:hover { text-decoration: underline; }        .post-headline { color: #666; margin-bottom: 10px; }        .post-content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; }        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }        .metric-value { font-size: 2em; font-weight: bold; color: #0077b5; display: block; }        .metric-label { color: #666; font-size: 0.9em; margin-top: 5px; }        .comment { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 15px; transition: box-shadow 0.2s; }        .comment:hover { box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); }        .comment.reply { margin-left: 40px; border-left: 3px solid #0077b5; }        .comment-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px; }        .comment-author-info { flex: 1; }        .comment-author { font-weight: 600; color: #0077b5; text-decoration: none; font-size: 1.1em; }        .comment-author:hover { text-decoration: underline; }        .comment-headline { color: #666; font-size: 0.9em; margin-top: 3px; }        .comment-metadata { color: #999; font-size: 0.85em; margin-top: 5px; }        .comment-content { margin: 15px 0; line-height: 1.6; }        .comment-actions { display: flex; gap: 20px; margin-top: 15px; font-size: 0.9em; color: #666; }        .badge { display: inline-block; background: #e7f3ff; color: #0077b5; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; margin-left: 10px; }        .edited { color: #ff6b6b; font-size: 0.85em; font-style: italic; }        .mention { color: #0077b5; font-weight: 500; }        .hashtag { color: #0077b5; }        .top-commenters { background: #f8f9fa; padding: 20px; border-radius: 8px; }        .top-commenters ol { padding-left: 20px; }        .top-commenters li { margin-bottom: 10px; color: #333; }        .metadata-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; background: #f8f9fa; padding: 20px; border-radius: 8px; }        .metadata-item { display: flex; flex-direction: column; }        .metadata-label { font-weight: 600; color: #666; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.5px; }        .metadata-value { color: #333; margin-top: 5px; }        .engagement-stats { display: flex; gap: 15px; font-size: 0.9em; }        .engagement-stat { display: flex; align-items: center; gap: 5px; }        @media (max-width: 768px) {            .container { padding: 10px; }            .header { padding: 30px 20px; }            .header h1 { font-size: 2em; }            .card { padding: 20px; }            .comment.reply { margin-left: 20px; }            .metrics { grid-template-columns: 1fr; }        }    </style></head><body>    <div class="container">        <div class="header">            <h1>LinkedIn OSINT Analysis Report</h1>            <div class="subtitle">${a.metadata.title}</div>        </div>                ${c}                <div class="card">            <h2>Extraction Metadata</h2>            <div class="metadata-grid">                <div class="metadata-item">                    <span class="metadata-label">URL</span>                    <span class="metadata-value"><a href="${a.metadata.url}" target="_blank">${a.metadata.url}</a></span>                </div>                <div class="metadata-item">                    <span class="metadata-label">Extraction Date</span>                    <span class="metadata-value">${new Date(a.metadata.extractionDate).toLocaleString()}</span>                </div>                <div class="metadata-item">                    <span class="metadata-label">Total Comments</span>                    <span class="metadata-value">${a.metadata.totalComments}</span>                </div>                <div class="metadata-item">                    <span class="metadata-label">Unique Commenters</span>                    <span class="metadata-value">${a.metadata.uniqueCommenters}</span>                </div>                <div class="metadata-item">                    <span class="metadata-label">Post Type</span>                    <span class="metadata-value">${a.metadata.isLinkPost?"Link Post":"Comment-only extraction"}</span>                </div>            </div>        </div>                ${d}        ${e}        ${f}                <div class="card">            <h2>All Comments</h2>            ${a.comments.map(a=>a.error?%60<div class="comment"><div class="edited">Error extracting comment ${a.index}: ${a.error}</div></div>%60:%60                    <div class="comment ${a.metadata?.isReply?"reply":""}">                        <div class="comment-header">                            <div class="comment-author-info">                                <div>                                    <a href="${a.author?.profileUrl||"#"}" target="_blank" class="comment-author">${a.author?.name||"Unknown"}</a>                                    ${a.author?.badge?%60<span class="badge">${a.author.badge}</span>%60:""}                                </div>                                ${a.author?.headline?%60<div class="comment-headline">${a.author.headline}</div>%60:""}                                <div class="comment-metadata">                                    ${a.metadata?.dates?.utc||"Unknown date"} ${a.metadata?.relativeDate?%60(${a.metadata.relativeDate})%60:""}                                     ${a.author?.connectionDegree?%60 • ${a.author.connectionDegree}%60:""}                                </div>                            </div>                        </div>                                                ${a.metadata?.isReply&&a.metadata?.parentAuthor?%60<div style="color: #666; font-size: 0.9em; margin-bottom: 10px;">↳ Replying to ${a.metadata.parentAuthor.name}</div>%60:""}                                                <div class="comment-content">                            ${a.content?.isEdited?"<span class=\"edited\">[EDITED]</span> ":""}                            ${a.content?.text||"No content"}                        </div>                                                ${0<a.content?.mentions?.length?%60<div style="margin-top: 10px;">Mentions: ${a.content.mentions.map(a=>%60<span class="mention">@${a.name}</span>%60).join(", ")}</div>%60:""}                                                ${0<a.content?.hashtags?.length?%60<div style="margin-top: 5px;">Hashtags: ${a.content.hashtags.map(a=>%60<span class="hashtag">#${a}</span>%60).join(", ")}</div>%60:""}                                                <div class="comment-actions">                            <span>👍 ${a.engagement?.reactions?.count||"0"} reactions</span>                            <span>💬 ${a.engagement?.replies||"0"} replies</span>                            ${0<a.media?.images?.length?%60<span>📷 ${a.media.images.length} image(s)</span>%60:""}                        </div>                    </div>%60).join("")}        </div>    </div></body></html>%60;return g}(t),csv:function(a){let b="Comment_Index,Author_Name,Author_PublicID,Author_ProfileURL,Author_Headline,Author_Badge,Connection_Degree,Is_Reply,Parent_Author,Timestamp_UTC,Timestamp_Unix,Relative_Date,Reactions_Count,Reaction_Types,Replies_Count,Mentions,Hashtags,Has_Images,Is_Edited,Content\n";return a.comments.forEach(a=>{if(!a.error){const c=[a.index,g(a.author?.name||"Unknown"),g(a.author?.publicId||""),g(a.author?.profileUrl||""),g(a.author?.headline||""),g(a.author?.badge||""),g(a.author?.connectionDegree||""),a.metadata?.isReply?"Yes":"No",g(a.metadata?.parentAuthor?.name||""),g(a.metadata?.dates?.utc||""),a.metadata?.timestamp||"",g(a.metadata?.relativeDate||""),a.engagement?.reactions?.count||"0",g(a.engagement?.reactions?.types?.join(";")||""),a.engagement?.replies||"0",g(a.content?.mentions?.map(a=>a.name).join(";")||""),g(a.content?.hashtags?.join(";")||""),0<a.media?.images?.length?"Yes":"No",a.content?.isEdited?"Yes":"No",g(a.content?.text||"")];b+=c.join(",")+"\n"}}),b}(t)},v=%60LinkedIn-OSINT-Extract_${k}_${m}%60;h(u.txt,"text/plain",%60${v}.txt%60),setTimeout(()=>h(u.json,"application/json",%60${v}.json%60),100),setTimeout(()=>h(u.html,"text/html",%60${v}.html%60),200),setTimeout(()=>h(u.csv,"text/csv",%60${v}.csv%60),300);const w=%60LinkedIn OSINT Extraction Complete!\n${o?"":"\u26A0\uFE0F  WARNING: You are not on a link Post I will only extract comments\n\n"}Extracted: ${q.length} comments\nUnique users: ${s.size}\nPost Type: ${o?"Link Post":"Comment-only extraction"}\nFiles saved: TXT, JSON, HTML, CSV\n\nCheck your downloads folder for:\n- ${v}.txt\n- ${v}.json  \n- ${v}.html\n- ${v}.csv%60;alert(w),console.log("[OSINT] Extraction complete!",t)}catch(a){console.error("[OSINT] Fatal error:",a),alert("OSINT Extraction Error: "+a.message)}})();
*/