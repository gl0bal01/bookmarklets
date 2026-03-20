# 🕵️‍♂️ LinkedIn OSINT Comment Extractor

A powerful bookmarklet that extracts comprehensive comment data, user profiles, and engagement metrics from LinkedIn posts with precise timestamp extraction — **perfect for OSINT investigators, social media analysts, and security researchers**.

![LinkedIn OSINT Investigation](/assets/screenshots/linkedin-json.png)
  _Deep diving into LinkedIn social networks for intelligence gathering_

## ✨ Features

### 🎯 Advanced Comment Intelligence

* **Complete comment extraction** – Captures all comments with full metadata, author details, and engagement stats
* **Precise timestamp extraction** – Gets exact posting time from LinkedIn URNs (crucial for timeline analysis)
* **Thread relationship mapping** – Maps reply chains and parent-child comment relationships
* **Author profiling** – Extracts user profiles, headlines, badges, connection degrees, and public IDs

### 📊 Smart Post Type Detection

* **Link post recognition** – Automatically detects LinkedIn link posts vs. regular content
* **Conditional extraction** – Adapts output based on post type for relevant data only
* **Context-aware warnings** – Alerts users when not on link posts with comment-only extraction

### 🗂️ Multi-Format Export System

* **4 comprehensive formats** – TXT, JSON, HTML, and CSV files for different analysis needs
* **Timeline reconstruction** – Chronological comment ordering for investigation workflows
* **Interactive HTML reports** – Rich visual reports with engagement metrics and author analytics
* **Structured data export** – Machine-readable JSON and CSV for automated processing

### 🔍 OSINT-Ready Features

* **Top commenters analysis** – Identifies most active participants in discussions
* **Engagement metrics** – Reaction counts, reply threads, and interaction patterns
* **Media detection** – Flags comments with images, videos, or shared content
* **Connection mapping** – Reveals network relationships between commenters

## 🔍 How It Works

1. **DOM Analysis** – Scans LinkedIn page structure for comment containers
2. **URN Timestamp Extraction** – Decodes LinkedIn activity URNs to extract precise posting timestamps
3. **Author Data Mining** – Extracts comprehensive user profiles and connection information
4. **Relationship Mapping** – Links replies to parent comments and builds conversation threads
5. **Multi-Format Generation** – Creates TXT, JSON, HTML, and CSV reports simultaneously
6. **Secure Download** – Files download individually (LinkedIn blocks zip files)

## 🛠️ Installation

1. **Create a new bookmark** in your browser
2. **Copy the complete code** from [`linkedin-osint-extractor.js`](linkedin-osint-extractor.js)
3. **Paste it as the URL** of the bookmark (include the full `javascript:` code starting with `/*!`)
4. **Navigate to any LinkedIn post** with comments
5. **Click the bookmark** to extract all available data

## 🎮 Usage

### For Link Posts (Full Extraction)
![LinkedIn Post Activity](/assets/screenshots/linkdin-post-activity.png)
1. **Open a LinkedIn link post** (e.g., `linkedin.com/posts/username_content-activity-123456-xyz`)
2. **Scroll to load all comments** you want to extract
3. **Click the bookmarklet**
4. **4 files will download**:
   - `LinkedIn-OSINT-Extract_[timestamp]_[hash].txt` - Human-readable report
   - `LinkedIn-OSINT-Extract_[timestamp]_[hash].json` - Complete structured data
   - `LinkedIn-OSINT-Extract_[timestamp]_[hash].html` - Interactive visual report
   - `LinkedIn-OSINT-Extract_[timestamp]_[hash].csv` - Spreadsheet-compatible data

### For Regular Pages (Comment-Only)
1. **Open any LinkedIn page with comments**
2. **Scroll to load comments**
3. **Click the bookmarklet**
4. **See warning message**: "⚠️ You are not on a link Post I will only extract comments"
5. **Same 4 files download** with comment data only

## 📦 Output Structure

### TXT Report
```
LinkedIn OSINT Comment Extraction Report
=====================================
URL: [LinkedIn post URL]
Total Comments: 45
Unique Commenters: 32
Post Type: Link Post

POST INFORMATION (Link posts only)
================
Author: John Doe
Reactions: 1,240
Comments: 45
Reposts: 23

TOP COMMENTERS (Link posts only)
==============
1. Jane Smith - 5 comments
2. Mike Johnson - 3 comments

COMMENTS (Chronological Order)
===============================
#1
Author: Jane Smith
Posted: Mon, 16 Jun 2025 14:23:45 GMT
Reactions: 12 (like, love, celebrate)
Content: Great insights on cybersecurity trends...
```

### Interactive HTML Report
- **Metadata overview** with extraction details
- **Post information** (for link posts)
- **Top commenters analysis** (for link posts)
- **Comments analytics dashboard** (for link posts)
- **Complete comment thread** with visual styling
- **Responsive design** for mobile and desktop viewing

### JSON Structure
```json
{
  "metadata": {
    "extractionDate": "2025-06-16T14:30:00.000Z",
    "isLinkPost": true,
    "totalComments": 45,
    "uniqueCommenters": 32
  },
  "post": { /* Post data for link posts */ },
  "comments": [ /* Array of comment objects */ ],
  "topCommenters": [ /* Top 10 commenters */ ],
  "timeline": { /* Earliest and latest comments */ }
}
```

### CSV Format
Perfect for spreadsheet analysis with columns:
- Author info (name, profile, headline, badge, connection degree)
- Timestamps (UTC, Unix, relative)
- Content and engagement data
- Reply relationships and thread mapping

## 🎯 OSINT Use Cases

### 🔍 **Timeline Investigation**
- **Precise timestamps** help establish when comments were posted
- **Chronological ordering** reveals conversation flow and timing patterns
- **Thread relationships** show who responded to whom and when

### 👥 **Network Analysis**
- **Connection degrees** reveal professional relationships
- **Top commenters** identify key participants and influencers
- **Cross-referencing** profiles across multiple posts for pattern recognition

### 📈 **Engagement Analysis**
- **Reaction patterns** show community sentiment and engagement levels
- **Reply threads** indicate discussion depth and controversy levels
- **Media sharing** reveals content types driving engagement

### 🌐 **Content Intelligence**
- **Hashtag tracking** for trend analysis and topic mapping
- **Mention networks** showing professional connections and collaborations
- **Content evolution** through edited comment detection

## 🌐 Compatibility

* **Browsers**: Chrome, Firefox, Edge, Safari (all modern browsers)
* **LinkedIn Pages**: 
  - ✅ Public posts with comments
  - ✅ Link posts (full extraction)
  - ✅ Regular posts (comment-only extraction)
  - ✅ Company page posts
  - ✅ Personal profile posts
* **Languages**: Works with all LinkedIn language interfaces

### Technical Requirements

* **JavaScript enabled** in browser
* **Pop-up downloads allowed** for the site
* **Scroll to load** all comments before extraction
* **No authentication required** for public posts

## 💡 Pro Tips for OSINT

* **Load all comments first** - Scroll down completely before running extraction
* **Multiple extractions** - Run on different dates to track conversation evolution
* **Cross-reference data** - Use CSV exports in spreadsheet tools for advanced analysis
* **Combine with other tools** - JSON format integrates well with analysis frameworks
* **Timeline correlation** - Use precise timestamps to correlate with external events
* **Network mapping** - Track commenters across multiple posts for relationship analysis

## 🐛 Troubleshooting

**No comments found?**
* Ensure you've scrolled to load all comments
* Some posts may have comments disabled
* Private posts require login access

**Files not downloading?**
* Check browser download settings and pop-up blockers
* LinkedIn blocks zip files, so files download individually
* Clear browser cache if downloads hang

**Missing post information?**
* Tool automatically detects post type
* Regular posts only extract comments (this is intentional)
* Link posts get full analysis including post data

**Timestamp extraction issues?**
* Some very old posts may have different URN formats
* Tool validates timestamps and skips invalid ones
* Check console for extraction warnings

## 🔄 Changelog

### v2.0.0 (2025-06-16)

* ✅ Smart link post detection with conditional content extraction
* ✅ Enhanced timestamp extraction from LinkedIn activity URNs
* ✅ Multi-format export system (TXT/JSON/HTML/CSV)
* ✅ Interactive HTML reports with responsive design
* ✅ Top commenters analysis and engagement metrics
* ✅ Reply thread mapping with parent-child relationships
* ✅ Author profiling with badges, headlines, and connection degrees
* ✅ Media detection and content analysis
* ✅ Chronological timeline reconstruction
* ✅ Warning system for non-link post extractions
* ✅ Complete rewrite for improved reliability
* ✅ Enhanced comment thread detection
* ✅ Better author data extraction
* ✅ Improved engagement metrics collection

## 📋 Export File Details

The tool generates **4 separate files** because LinkedIn's security policies prevent zip file downloads:

1. **`.txt`** - Human-readable investigation report
2. **`.json`** - Complete structured data for automation
3. **`.html`** - Interactive visual report for presentations
4. **`.csv`** - Spreadsheet data for quantitative analysis

Each file is timestamped and contains a unique hash for organization and reference.

**Tags**: `linkedin`, `osint`, `investigation`, `social-media`, `comments`, `extraction`, `timeline`, `network-analysis`, `intelligence`

---

**⭐ Star this repo if it helps your investigations!**

*Built for OSINT investigators, social media analysts, security researchers, and anyone conducting legitimate social network intelligence gathering.*

## ⚖️ Legal Notice

This tool is designed for legitimate OSINT research and investigation purposes. Users are responsible for:
- Complying with LinkedIn's Terms of Service
- Respecting privacy and data protection laws
- Using extracted data ethically and legally
- Following applicable local and international regulations

Only extract data from public posts and respect user privacy.