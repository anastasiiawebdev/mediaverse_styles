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

const hexToRgba = (hex) => {
  const h = hex.replace('#', '');
  const channel = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
  return { r: channel(0), g: channel(2), b: channel(4), a: h.length === 8 ? channel(6) : 1 };
};

const pxToRem = (px) => (px === 0 ? '0' : `${px / 16}rem`);

// Mark `typography.*.fontSize` tokens as `fontSize` so Android/Compose emit
// them in `sp` (scales with the user's font-size setting) instead of `dp`.
const walk = (node, key, fn) => {
  if (node && typeof node === 'object') {
    if ('value' in node) return fn(node, key);
    Object.entries(node).forEach(([k, child]) => walk(child, k, fn));
  }
};

export const hooks = {
  preprocessors: {
    'figma/font-size-type': (dictionary) => {
      walk(dictionary.typography, null, (token, key) => {
        if (key === 'fontSize' && token.type === 'dimension') token.type = 'fontSize';
      });
      return dictionary;
    }
  },

  transforms: {
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
        return `${fontStyle} ${fontWeight} ${pxToRem(fontSize)}/${pxToRem(lineHeight)} '${fontFamily}', sans-serif`;
      }
    }
  },

  formats: {
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
