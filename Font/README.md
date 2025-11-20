# Font Directory

This directory contains custom fonts for the AEP Preview plugin.

## Supported Font Formats
- `.ttf` - TrueType Font
- `.otf` - OpenType Font
- `.woff` - Web Open Font Format
- `.woff2` - Web Open Font Format 2

## How to Add Fonts

1. Place your font files in this directory
2. Font files will be automatically detected and loaded by the plugin
3. Fonts are defined in `css/fonts.css`

## Usage

After adding font files, reference them in your CSS:

```css
.custom-text {
    font-family: 'YourFontName', sans-serif;
}
```
