# 🎨 Mediaverse Styles

A comprehensive and scalable **Style Dictionary 5.0** configuration for managing and exporting design tokens across multiple platforms. Built with flexibility, platform specificity, and clean token organization in mind.

## 🔧 Key Features

### 🧩 Multiple Platform Support

This setup exports design tokens for a wide range of platforms, including:

- **CSS**  
  - CSS Custom Properties (`.css`)  
  - SCSS Variables (`.scss`)

- **iOS**  
  - Swift Classes & Enums for SwiftUI  
  - `.plist` files for compatibility with UIKit or legacy codebases

- **Android**  
  - XML Resource files (`colors.xml`, `dimens.xml`)  
  - Kotlin Compose Objects

- **JSON**  
  - For documentation, integrations, or other tooling needs

---

### 🚀 Advanced Configuration

- **Custom Transforms**  
  - Figma gradients → CSS `linear-gradient(...)`
  - Figma text styles → CSS `font` shorthand
  - Typography `fontSize` tokens are emitted as `sp` on Android

- **Custom Formats**  
  - `ios/plist-rgba`: plist with RGBA color dictionaries

- **Filtering**  
  - Export only specific token types per file (colors, sizes)

- **Transform Groups**  
  - Fine-tuned transform groups per platform, adhering to their unique needs and formats

---

### 🗂 Token Organization

- Source tokens live in `tokens/figma-tokens.json`, exported from Figma with the
  [Design Tokens](https://github.com/lukasoppermann/design-tokens) plugin
- Figma values are unitless **px**; they are converted per platform
  (`rem` for CSS, `CGFloat` pt for iOS, `dp`/`sp` for Android)
- Custom hooks (preprocessor, transforms, plist format) live in `scripts/transform.js`
- Applies **platform-specific naming conventions** to prevent naming collisions and improve readability

---

## ▶️ Usage

```bash
npm ci
npm run build
```

Generated files are written to `build/`. Do not edit them by hand — change the tokens and rebuild.
