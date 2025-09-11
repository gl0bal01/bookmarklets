# 🕵️ Username Generator Bookmarklet

Generate comprehensive username variations with flexible input options - now in popup format for maximum compatibility.

## Screenshot
![Generator](/assets/screenshots/username-generator.png)

## ✨ Features

### 🔤 Flexible Input Options
- **Name-based Generation**: Enter first and/or last name
- **Single Name Mode**: Use just first OR last name when available
- **Username Expansion**: Parse existing usernames to generate variations
- **Smart Parsing**: Automatically extract name parts from usernames like "john.doe123"
- **Mixed Input**: Intelligent handling of partial information

### 🔗 Username Formats & Patterns
- **Basic Combinations**: FirstLast, LastFirst, F.Last, First.L
- **Initials & Abbreviations**: FL, LF, Fir.Las, First.L
- **Length Variations**: 3-4 character combinations (Joh.Doe, John.D)
- **Single Names**: First name only, Last name only
- **Existing Username Patterns**: Extract and build upon existing formats

### 🎯 Advanced Customization
- **Separators**: Dots (.), underscores (_), hyphens (-), custom characters
- **Prefixes**: Add custom prefixes to all variations
- **Suffixes**: Add custom suffixes to all variations  
- **Number Variations**: Common numbers (1, 01, 12, 123, 1234, 21, 2023-2025)
- **Case Variations**: lowercase, UPPERCASE, Title Case, and original
- **Smart Numbers**: Include numbers found in existing usernames

### 📊 Export & Analysis
- **Copy to Clipboard**: Quick copy for immediate use
- **TXT Download**: Export with metadata and generation timestamp
- **Real-time Count**: See total variations generated
- **Organized Output**: Alphabetically sorted results
- **Generation Context**: Shows what was used to generate results

### 🪟 Popup Interface Benefits
- **Zero CSS Conflicts**: Popup window prevents site interference
- **Consistent Appearance**: Same look across all websites
- **Resizable**: User can adjust window size as needed
- **Independent**: Remains open during navigation
- **Clean Design**: Modern dark theme optimized for OSINT work

## 🚀 Installation

### Method 1: Manual Bookmark Creation
1. Copy the bookmarklet code from [username-generator.js](username-generator.js)
2. Create a new bookmark in your browser
3. Paste the code as the bookmark URL
4. Name it "Username Generator" and save

### Method 2: Drag & Drop Installation
1. Visit the [installation page](../../install.html)
2. Drag the "Username Generator" button to your bookmarks bar
3. Ready to use!

## 📖 Usage

### Basic Usage
1. **Navigate** to any webpage (or just use from bookmarks bar)
2. **Click** the "Username Generator" bookmark to open popup
3. **Choose your input method**:
   - Enter first and/or last name if known
   - OR enter an existing username to expand
4. **Customize** separators, prefixes, suffixes as needed
5. **Toggle** number and case variations based on your needs
6. **Click "Generate"** to create the username list
7. **Copy** results or **download** as TXT file for later use

### Input Scenarios

#### Scenario 1: Full Name Available
```
First name: John
Last name: Doe
Result: johndoe, john.doe, j.doe, doejohn, etc.
```

#### Scenario 2: Partial Name Information
```
First name: John
Last name: (empty)
Result: john, john123, john_1, john.2024, etc.
```

#### Scenario 3: Existing Username Analysis
```
Existing username: john.doe123
Result: john, doe, johndoe, j.doe, john_doe, john123, doe123, etc.
```

#### Scenario 4: Mixed Information
```
First name: John
Existing username: jd_corp
Result: Combines John + parsed "jd" + "corp" patterns
```

## 🛠️ Use Cases

### 🔍 OSINT & Investigation
- Social media account discovery across platforms
- Email address enumeration and verification
- Username pattern analysis for target profiling
- Account correlation across different services
- Expanding partial username information

### 🛡️ Security Research
- User account auditing and discovery
- Penetration testing reconnaissance
- Social engineering assessment preparation
- Identity verification research
- Username enumeration for security testing

## 🔧 Technical Details

### Compatibility
- **Browsers**: Chrome, Firefox, Safari, Edge (all modern versions)
- **Popup Support**: Requires popup permission (automatically requested)
- **Mobile**: Works on mobile browsers with popup support
- **Zero Conflicts**: Popup isolation prevents any CSS/JS interference

### Smart Parsing Features
- **Separator Detection**: Automatically finds dots, underscores, hyphens
- **Number Extraction**: Pulls existing numbers for reuse in variations
- **Name Splitting**: Intelligent parsing of first.last patterns
- **Length Analysis**: Handles usernames of various lengths
- **Pattern Recognition**: Identifies common username structures

### Generation Patterns
- **Base Formats**: 14+ core username combinations
- **With Separators**: Multiplied by number of separators
- **With Numbers**: Common number patterns + extracted numbers
- **Case Variations**: 4 case formats when enabled
- **Smart Deduplication**: Removes duplicate variations
- **Typical Output**: 20-500+ variations depending on options and input

### What Gets Generated
- **Names**: johndoe, doejohn, john, doe
- **Abbreviated**: jdoe, doej, jd, dj  
- **With Separators**: john.doe, john_doe, john-doe
- **With Numbers**: johndoe123, john.doe21, jdoe2024
- **Case Variations**: JohnDoe, JOHNDOE, johndoe, Johndoe
- **Existing Patterns**: Maintains and expands existing username formats

## 🛡️ Privacy & Security

- **Local Processing**: All generation happens in your browser
- **No External Calls**: No data sent to servers or third parties
- **No Storage**: Names and results not saved anywhere
- **Open Source**: Fully transparent, auditable code
- **Popup Isolation**: Complete separation from host website
- **No Tracking**: Zero analytics or monitoring

## 🤝 Contributing

Contributions welcome! Please see the main repository's [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

### Ideas for Enhancement
- Additional number patterns (birth years, etc.)
- L33t speak variations (a→@, e→3, etc.)
- Common username suffixes by platform
- Export formats (CSV, JSON)
- Integration with username checking APIs
- Bulk processing capabilities

## 🆘 Troubleshooting

### Common Issues

**Popup is blocked**
- Allow popups for the current website
- Check browser popup blocker settings
- Try clicking the bookmarklet again after allowing popups
- Some browsers show popup permission request automatically


## 📄 License

MIT License - see [LICENSE](../../LICENSE) file for details.

## 🏷️ Tags

`osint` `investigation` `username` `reconnaissance` `security` `social-media` `enumeration` `discovery` `ctf` `pentesting` 

---
**Made with ❤️ for OSINT investigators and security researchers**