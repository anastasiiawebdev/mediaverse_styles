// Custom Style Dictionary hooks for tokens exported by the
// "Design Tokens" Figma plugin (org.lukasoppermann.figmaDesignTokens).
//
// Figma exports every size as a unitless pixel number, so platforms that use
// the built-in rem-based size transforms set `basePxFontSize: 1` to keep the
// values 1:1 with the design.

// Composite token types produced by the Figma plugin.
export const COMPOSITE_TYPES = ['custom-gradient', 'custom-grid', 'custom-fontStyle'];

export const isColor = (token) => token.type === 'color';
export const isSize = (token) => token.type === 'dimension' || token.type === 'fontSize';
export const isFontSize = (token) => token.type === 'fontSize';
export const isNotGrid = (token) => token.type !== 'custom-grid';
export const isLetterSpacing = (token) =>
  token.path[0] === 'typography' && token.path.at(-1) === 'letterSpacing';

// Figma exports these text properties for every style, almost always with the
// default value. Skip them when they are default so the output stays readable.
const TEXT_DEFAULTS = { paragraphIndent: 0, paragraphSpacing: 0, textDecoration: 'none', fontStretch: 'normal' };
export const isUseful = (token) => {
  const key = token.path.at(-1);
  return !(token.path[0] === 'typography' && key in TEXT_DEFAULTS && token.original.value === TEXT_DEFAULTS[key]);
};

const TEXT_TRANSFORM = { uppercase: 'uppercase', lowercase: 'lowercase', title: 'capitalize', capitalize: 'capitalize' };

const hexToRgba = (hex) => {
  const h = hex.replace('#', '');
  const channel = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
  return { r: channel(0), g: channel(2), b: channel(4), a: h.length === 8 ? channel(6) : 1 };
};

// Web output uses px, matching Figma 1:1. Zero stays unitless.
const px = (value) => (Number(value) === 0 ? '0' : `${value}px`);

// Calls fn for every text style in the `typography` group
// (an object with fontSize, lineHeight, letterSpacing, ... tokens).
const eachTextStyle = (node, fn) => {
  if (!node || typeof node !== 'object' || 'value' in node) return;
  if (node.fontSize && 'value' in node.fontSize) return fn(node);
  Object.values(node).forEach((child) => eachTextStyle(child, fn));
};

const round = (n) => Number(n.toFixed(4));

export const hooks = {
  preprocessors: {
    'figma/typography': (dictionary) => {
      eachTextStyle(dictionary.typography, (style) => {
        // Mark fontSize and lineHeight as `fontSize` so Android/Compose emit
        // them in `sp`: both grow with the user's font-size setting.
        ['fontSize', 'lineHeight'].forEach((key) => {
          if (style[key]?.type === 'dimension') style[key].type = 'fontSize';
        });
        // Android letter spacing is relative to the font size (em), not dp.
        if (style.letterSpacing) {
          style.letterSpacing.letterSpacingEm = round(style.letterSpacing.value / style.fontSize.value);
        }
      });
      return dictionary;
    }
  },

  transforms: {
    // Figma px number -> CSS px: 36 -> 36px, 0 -> 0
    'size/px-web': {
      type: 'value',
      filter: isSize,
      transform: (token) => px(token.value)
    },

    // Compose letter spacing in em: 0.09px on 18px text -> 0.005.em
    'size/compose/letterSpacingEm': {
      type: 'value',
      filter: isLetterSpacing,
      transform: (token) => `${token.letterSpacingEm}.em`
    },

    // { gradientType, rotation, stops } -> linear-gradient(...)
    'gradient/css': {
      type: 'value',
      transitive: true,
      filter: (token) => token.type === 'custom-gradient',
      transform: (token) => {
        const { rotation, stops } = token.value;
        const colorStops = stops.map((s) => `${s.color} ${Math.round(s.position * 100)}%`);
        return `linear-gradient(${rotation}deg, ${colorStops.join(', ')})`;
      }
    },

    // Figma text style -> CSS `font` shorthand
    'fontStyle/css/shorthand': {
      type: 'value',
      transitive: true,
      filter: (token) => token.type === 'custom-fontStyle',
      transform: (token) => {
        const { fontStyle, fontWeight, fontSize, lineHeight, fontFamily } = token.value;
        return `${fontStyle} ${fontWeight} ${px(fontSize)}/${px(lineHeight)} '${fontFamily}', sans-serif`;
      }
    }
  },

  formats: {
    // One CSS class per Figma text style. The `font` shorthand cannot hold
    // letter spacing, text case or decoration, so the class adds them.
    'css/typography-classes': ({ dictionary }) => {
      const rule = (token) => {
        const { letterSpacing, textCase, textDecoration } = token.original.value;
        const declarations = [`font: ${token.value};`];
        if (letterSpacing) declarations.push(`letter-spacing: ${px(letterSpacing)};`);
        if (TEXT_TRANSFORM[textCase]) declarations.push(`text-transform: ${TEXT_TRANSFORM[textCase]};`);
        if (textDecoration && textDecoration !== 'none') declarations.push(`text-decoration: ${textDecoration};`);
        return `.${token.name} {\n${declarations.map((d) => `  ${d}`).join('\n')}\n}`;
      };

      return `/**\n * Do not edit directly, this file was auto-generated.\n */\n\n${dictionary.allTokens.map(rule).join('\n\n')}\n`;
    },

    // Android letter spacing is a unitless float (em), which the built-in
    // `android/resources` format would write as an invalid <dimen>.
    'android/letter-spacing': ({ dictionary }) => `<?xml version="1.0" encoding="UTF-8"?>

<!--
  Do not edit directly, this file was auto-generated.
  Letter spacing in em (relative to the font size), for android:letterSpacing.
-->
<resources>
${dictionary.allTokens
  .map((token) => `  <item name="${token.name}" format="float" type="dimen">${token.letterSpacingEm}</item>`)
  .join('\n')}
</resources>
`,

    // The built-in `ios/plist` format expects colors as [r, g, b] arrays,
    // drops alpha and writes decimals as <integer>. This one works from hex.
    'ios/plist-rgba': ({ dictionary }) => {
      const entry = (token) => {
        if (token.type === 'color') {
          const { r, g, b, a } = hexToRgba(token.value);
          const real = (n) => `<real>${Number(n.toFixed(4))}</real>`;
          return `    <key>${token.name}</key>
    <dict>
      <key>r</key>
      ${real(r)}
      <key>g</key>
      ${real(g)}
      <key>b</key>
      ${real(b)}
      <key>a</key>
      ${real(a)}
    </dict>`;
        }
        if (typeof token.value === 'number') {
          return `    <key>${token.name}</key>\n    <real>${token.value}</real>`;
        }
        return `    <key>${token.name}</key>\n    <string>${token.value}</string>`;
      };

      return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<!-- Do not edit directly, this file was auto-generated. -->
<plist version="1.0">
  <dict>
${dictionary.allTokens.map(entry).join('\n')}
  </dict>
</plist>
`;
    }
  }
};
