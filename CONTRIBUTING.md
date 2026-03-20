# Contributing

Thanks for your interest in contributing to this project.

## How to Contribute

1. **Fork** the repository
2. **Create a branch** for your change (`git checkout -b my-feature`)
3. **Make your changes** and test them in at least Chrome and Firefox
4. **Submit a pull request** with a clear description of what you changed and why

## Adding a New Bookmarklet

1. Create a directory named `bookmarklet-your-tool-name/`
2. Include a `.js` file with both readable and minified versions
3. Add a `README.md` with:
   - Description and screenshot
   - Feature list
   - Installation instructions
   - Usage guide
4. Add a screenshot to `assets/screenshots/`
5. Update the main `README.md` table
6. Add a minified entry to `install.html` with drag-and-drop support

## Code Guidelines

- Bookmarklets must run entirely client-side with no external calls
- Use `javascript:void(function(){...}())` wrapper format
- Test on pages with strict Content Security Policy
- Handle errors gracefully — don't break the host page
- Keep the minified version under the browser bookmark URL limit

## Bug Reports

Open an issue with:
- Which bookmarklet is affected
- Browser and version
- Steps to reproduce
- Expected vs actual behavior

## Questions

Open an issue for questions or suggestions.
