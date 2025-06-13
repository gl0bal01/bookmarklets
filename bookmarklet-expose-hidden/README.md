# 🕵️‍♂️ Expose Hidden Content Bookmarklet

A lightweight yet powerful bookmarklet that reveals hidden HTML comments, concealed elements, and behind-the-scenes tags on any webpage — **perfect for developers, debuggers, and ctf players**.

![A typical ctf Osint player](/assets/images/hidden-tired.jpeg)
  _A typical ctf player after some hours_

## ✨ Features

### 🧱 Reveal Hidden Structures

* **HTML comment extraction** – Displays all `<!-- hidden comments -->` directly on the page
* **Invisible elements exposure** – Unmasks elements hidden with CSS (`display:none`, `visibility:hidden`, `opacity:0`) or HTML attributes (`hidden`)
* **Technical tag inspection** – Highlights script, style, link, meta, noscript, and template elements

### 🎨 Visual Debugging UI

* **Color-coded highlights** – Easy-to-read backgrounds and borders for different types
* **Floating control panel** – Toggle visibility or remove exposed content at any time
* **Non-destructive overlay** – All changes are temporary and reversible

### 🚀 Fast and Flexible

* **Runs instantly** – No page reload required
* **Works on any site** – From simple blogs to complex apps
* **Standalone** – No dependencies or installations needed

## 🔍 How It Works

1. **Scan the DOM** – Uses TreeWalker to locate HTML comments
2. **Find hidden elements** – Queries the page for hidden styles, attributes, and low-opacity elements
3. **Expose visually** – Displays results directly on the page with helpful labels and styles
4. **Give control** – Use the built-in panel to hide or remove the highlights

## 🛠️ Installation

1. **Create a new bookmark** in your browser
2. **Copy the code** from [`bookmarklet-expose-hidden.js`](bookmarklet-expose-hidden.js)
3. **Paste it as the URL** of the bookmark (include the full `javascript:` code)
4. **Click the bookmark** on any webpage to run the tool

## 🎮 Usage

1. **Open any webpage**
2. **Click the bookmarklet**
3. **Review exposed content**:

   * 📝 HTML Comments
   * 👻 Hidden DOM Elements
   * ⚙️ Scripts, Styles, Meta & more
4. **Use the control panel**:

   * ✅ Toggle visibility
   * ❌ Remove all injected highlights

## 📦 Output Example

Once executed, the page will be enhanced with:

```
📦 Exposed Elements:
├── <div class="exposed-comment"> <!-- hidden message --> </div>
├── <div class="exposed-hidden"> <script>...</script> </div>
└── Control Panel with Show/Hide and Remove options
```

### Color Legend

* 🟡 **Comments**: Yellow background with red border
* 🟣 **Hidden Elements**: Pink-purple background with blue border
* ⚫ **Tag Labels**: Dark background with white bold text

### Scrennshot on wayback during a ctf

![A typical ctf Osint player](/assets/screenshots/hidden-on-wayback.jpg)


## 🌐 Compatibility

* **Browsers**: Chrome, Firefox, Edge, Safari
* **Websites**: Works on virtually all webpages, including:

  * Developer portals
  * Marketing sites
  * CMS platforms
  * SPAs and apps

### Under the Hood

* Uses `TreeWalker` API to parse comments
* Detects visibility via computed style rules and attributes
* Creates safe DOM overlays for display
* Includes a control panel with real-time DOM cleanup

## 💡 Pro Tips

* Use on **template-heavy** pages to debug structure
* Great for **SEO checks** to uncover hidden metadata
* Works even on **dynamic SPAs** without reloading
* Combine with browser dev tools for deeper inspection

## 🐛 Troubleshooting

**Nothing is showing?**

* Some sites may sanitize HTML or prevent script injection
* You may need to scroll to trigger lazy-loaded elements

**Code elements look truncated?**

* Long script/style tags are previewed up to 200–300 characters

**Conflict with site styles?**

* The bookmarklet uses `!important` and high `z-index`, but some sites may still override

## 🔄 Changelog

### v1.0.0 (2025-06-13)

* ✅ Reveal HTML comments via TreeWalker
* ✅ Detect `display:none`, `visibility:hidden`, and `opacity:0`
* ✅ Highlight script, style, link, meta, noscript, and template tags
* ✅ Visual tagging and coloring system
* ✅ Floating control panel with Show/Hide/Remove actions


**Tags**: `html`, `debug`, `developer-tools`, `comments`, `hidden-elements`, `ctf`, `osint`

---

**⭐ Star this repo if you find it helpful!**

*Built for developers, tinkerers, ctf players, and anyone who wants to peek behind the curtain of modern webpages.*
