// style-dictionary.config.js
import {
  hooks,
  COMPOSITE_TYPES,
  isColor,
  isSize,
  isNotGrid,
  isLetterSpacing,
  isUseful
} from '../scripts/transform.js';

const isPrimitive = (token) => !COMPOSITE_TYPES.includes(token.type);
const isTextStyle = (token) => token.type === 'custom-fontStyle';
const isUsefulSize = (token) => isSize(token) && isUseful(token);

const config = {
  // Source token files
  source: ['tokens/**/*.json'],

  hooks,
  preprocessors: ['figma/typography'],

  // Define platforms for different outputs
  platforms: {
    // CSS Variables (sizes in px, same as Figma)
    css: {
      transforms: [
        'attribute/cti',
        'name/kebab',
        'size/px-web',
        'color/css',
        'gradient/css',
        'fontStyle/css/shorthand'
      ],
      buildPath: 'build/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
          filter: (token) => isNotGrid(token) && isUseful(token),
          options: {
            outputReferences: true
          }
        },
        {
          destination: 'tokens.scss',
          format: 'scss/variables',
          filter: (token) => isNotGrid(token) && isUseful(token),
          options: {
            outputReferences: true
          }
        },
        {
          destination: 'typography.css',
          format: 'css/typography-classes',
          filter: isTextStyle
        }
      ]
    },

    // iOS (Swift, UIKit)
    ios: {
      transformGroup: 'ios-swift',
      basePxFontSize: 1,
      buildPath: 'build/ios/',
      files: [
        {
          destination: 'StyleDictionaryColor.swift',
          format: 'ios-swift/class.swift',
          filter: isColor,
          options: {
            className: 'StyleDictionaryColor',
            import: ['UIKit']
          }
        },
        {
          destination: 'StyleDictionarySize.swift',
          format: 'ios-swift/class.swift',
          filter: isUsefulSize,
          options: {
            className: 'StyleDictionarySize',
            import: ['UIKit']
          }
        }
      ]
    },

    // iOS plist (UIKit / legacy codebases)
    'ios-plist': {
      transforms: ['attribute/cti', 'name/pascal'],
      buildPath: 'build/ios/',
      files: [
        {
          destination: 'tokens.plist',
          format: 'ios/plist-rgba',
          filter: (token) => isPrimitive(token) && isUseful(token)
        }
      ]
    },

    // iOS SwiftUI
    'ios-swiftui': {
      transforms: ['attribute/cti', 'name/camel', 'color/ColorSwiftUI', 'size/swift/remToCGFloat'],
      basePxFontSize: 1,
      buildPath: 'build/ios-swiftui/',
      files: [
        {
          destination: 'StyleDictionaryColor.swift',
          format: 'ios-swift/enum.swift',
          filter: isColor,
          options: {
            className: 'StyleDictionaryColor',
            import: ['SwiftUI']
          }
        }
      ]
    },

    // Android XML resources
    android: {
      transformGroup: 'android',
      basePxFontSize: 1,
      buildPath: 'build/android/',
      files: [
        {
          destination: 'colors.xml',
          format: 'android/resources',
          filter: isColor,
          options: {
            resourceType: 'color'
          }
        },
        {
          destination: 'dimens.xml',
          format: 'android/resources',
          filter: (token) => isUsefulSize(token) && !isLetterSpacing(token),
          options: {
            resourceType: 'dimen'
          }
        },
        {
          destination: 'letter_spacing.xml',
          format: 'android/letter-spacing',
          filter: isLetterSpacing
        }
      ]
    },

    // Android Compose
    'android-compose': {
      // Built-in `compose` group + letter spacing in em
      transforms: [
        'attribute/cti',
        'name/camel',
        'color/composeColor',
        'size/compose/em',
        'size/compose/remToSp',
        'size/compose/remToDp',
        'size/compose/letterSpacingEm'
      ],
      basePxFontSize: 1,
      buildPath: 'build/android-compose/',
      files: [
        {
          destination: 'StyleDictionaryColor.kt',
          format: 'compose/object',
          filter: isColor,
          options: {
            className: 'StyleDictionaryColor',
            packageName: 'com.example.tokens'
          }
        },
        {
          destination: 'StyleDictionaryDimensions.kt',
          format: 'compose/object',
          filter: isUsefulSize,
          options: {
            className: 'StyleDictionaryDimensions',
            packageName: 'com.example.tokens'
          }
        }
      ]
    },

    // JSON for documentation or other tools (raw Figma values, sizes in px)
    json: {
      transforms: ['attribute/cti', 'name/pascal'],
      buildPath: 'build/json/',
      files: [
        {
          destination: 'tokens.json',
          format: 'json/nested'
        },
        {
          destination: 'tokens-flat.json',
          format: 'json/flat'
        }
      ]
    }
  },

  // Logging options
  log: {
    warnings: 'warn', // 'warn' | 'error' | 'disabled'
    verbosity: 'default', // 'default' | 'silent' | 'verbose'
    errors: {
      brokenReferences: 'throw' // 'throw' | 'console'
    }
  }
};

export default config;
