# 🎨 Mediaverse Styles

Design tokens for Mediaverse, exported from Figma and built with **Style Dictionary 5** for CSS, iOS, Android and JSON.

## ▶️ Usage

Requires Node.js 22 or newer.

```bash
npm ci
npm run build
```

Generated files are written to `build/`. Do not edit them by hand — change the tokens and rebuild.
A GitHub Action runs the build on every pull request and fails if `build/` is out of date.

## 🔄 Updating tokens

1. In Figma, export with the [Design Tokens](https://github.com/lukasoppermann/design-tokens) plugin
2. Replace `tokens/figma-tokens.json` with the exported file
3. Run `npm run build` and commit both the tokens and `build/`

## 📦 Output

| Folder | For | Files |
|---|---|---|
| `build/css/` | Web | `variables.css` (CSS custom properties), `tokens.scss` (SCSS variables), `typography.css` (one class per text style) |
| `build/ios/` | iOS with **UIKit** | `StyleDictionaryColor.swift`, `StyleDictionarySize.swift`, `tokens.plist` |
| `build/ios-swiftui/` | iOS with **SwiftUI** | `StyleDictionaryColor.swift` |
| `build/android/` | Android with **XML views** | `colors.xml`, `dimens.xml`, `letter_spacing.xml` |
| `build/android-compose/` | Android with **Jetpack Compose** | `StyleDictionaryColor.kt`, `StyleDictionaryDimensions.kt` |
| `build/json/` | Docs and other tools | `tokens.json` (nested), `tokens-flat.json` (flat); raw Figma values |

### Text styles on the web

Use the classes from `typography.css`, e.g. `class="font-body-large"`. They include letter spacing and text case, which the `--font-*` shorthand variables cannot hold.

## 📏 Units

Figma exports sizes as unitless **px** numbers. Each platform gets its native unit:

| Value | CSS | iOS | Android |
|---|---|---|---|
| Font size, line height | `px` | pt (`CGFloat`) | `sp` (scales with the user's font-size setting) |
| Letter spacing | `px` | pt (`CGFloat`) | `em`, relative to the font size (0.09px on 18px text → `0.005`) |
| Other sizes | `px` | pt (`CGFloat`) | `dp` |

Text properties that Figma exports with their default value (`paragraphIndent: 0`, `paragraphSpacing: 0`,
`textDecoration: none`, `fontStretch: normal`) are left out of the platform files. `build/json/` keeps everything.

## 🗂 Project structure

```
tokens/figma-tokens.json            # Source tokens exported from Figma
config/style-dictionary.config.js   # Platforms, output files and filters
scripts/transform.js                # Custom preprocessor, transforms and formats
.github/workflows/build.yml         # CI build check
build/                              # Generated output (committed)
```

Custom hooks in `scripts/transform.js`:

- **Preprocessor** `figma/typography`: marks font size and line height for `sp`, computes letter spacing in `em`
- **Transforms**: sizes to `px` for CSS, Figma gradients → `linear-gradient(...)`, text styles → CSS `font` shorthand, letter spacing → Compose `.em`
- **Formats**: CSS typography classes, Android letter spacing floats, plist with RGBA colors
