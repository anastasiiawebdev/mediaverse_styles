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
  - Color conversion (e.g., `#hex` → `UIColor` or Android `ColorInt`)

- **Custom Formatters**  
  - Tailored for Swift and Kotlin Compose styling conventions

- **Filtering**  
  - Export only specific token types (e.g., only `color` or `typography`)

- **Transform Groups**  
  - Fine-tuned transform groups per platform, adhering to their unique needs and formats

---

### 🗂 Token Organization

- Tokens are modularized into separate files:
  - `colors/`
  - `dimensions/`
  - `fonts/`

- Supports both:
  - **Nested JSON** for clarity  
  - **Flat JSON** for compatibility and export ease

- Applies **platform-specific naming conventions** to prevent naming collisions and improve readability

