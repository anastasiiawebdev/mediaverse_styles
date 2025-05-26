
// style-dictionary.config.js
import StyleDictionary from 'style-dictionary';

const config = {
  // Source token files
  source: ['tokens/**/*.json'],
  
  // Define platforms for different outputs
  platforms: {
    // CSS Variables
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
          options: {
            outputReferences: true
          }
        },
        {
          destination: 'tokens.scss',
          format: 'scss/variables',
          options: {
            outputReferences: true
          }
        }
      ]
    },

    // iOS (Swift)
    ios: {
      transformGroup: 'ios',
      buildPath: 'build/ios/',
      files: [
        {
          destination: 'StyleDictionaryColor.swift',
          format: 'ios-swift/class.swift',
          className: 'StyleDictionaryColor',
          filter: {
            type: 'color'
          }
        },
        {
          destination: 'StyleDictionarySize.swift',
          format: 'ios-swift/class.swift',
          className: 'StyleDictionarySize',
          filter: {
            type: 'dimension'
          }
        },
        {
          destination: 'StyleDictionaryFont.swift',
          format: 'ios-swift/class.swift',
          className: 'StyleDictionaryFont',
          filter: {
            type: 'typography'
          }
        },
        {
          destination: 'tokens.plist',
          format: 'ios/plist'
        }
      ]
    },

    // iOS SwiftUI
    'ios-swiftui': {
      transformGroup: 'ios-swift-separate',
      buildPath: 'build/ios-swiftui/',
      files: [
        {
          destination: 'StyleDictionaryColor.swift',
          format: 'ios-swift/enum.swift',
          className: 'StyleDictionaryColor',
          filter: {
            type: 'color'
          }
        }
      ]
    },

    // Android (Kotlin/Java)
    android: {
      transformGroup: 'android',
      buildPath: 'build/android/',
      files: [
        {
          destination: 'colors.xml',
          format: 'android/resources',
          resourceType: 'color',
          filter: {
            type: 'color'
          }
        },
        {
          destination: 'dimens.xml',
          format: 'android/resources',
          resourceType: 'dimen',
          filter: {
            type: 'dimension'
          }
        },
        {
          destination: 'strings.xml',
          format: 'android/resources',
          resourceType: 'string',
          filter: {
            type: 'content'
          }
        },
        {
          destination: 'font_dimens.xml',
          format: 'android/resources',
          resourceType: 'dimen',
          filter: {
            type: 'fontSizes'
          }
        }
      ]
    },

    // Android Compose
    'android-compose': {
      transformGroup: 'compose',
      buildPath: 'build/android-compose/',
      files: [
        {
          destination: 'StyleDictionaryColor.kt',
          format: 'compose/object',
          className: 'StyleDictionaryColor',
          packageName: 'com.example.tokens',
          filter: {
            type: 'color'
          }
        },
        {
          destination: 'StyleDictionaryDimensions.kt',
          format: 'compose/object',
          className: 'StyleDictionaryDimensions',
          packageName: 'com.example.tokens',
          filter: {
            type: 'dimension'
          }
        }
      ]
    },

    // JSON for documentation or other tools
    json: {
      transformGroup: 'js',
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

  // Custom transforms
  transform: {
    // Custom color transform for hex to UIColor
    'color/UIColorSwift': {
      type: 'value',
      matcher: function(token) {
        return token.type === 'color';
      },
      transformer: function(token) {
        const hex = token.value.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;
        const a = hex.length === 8 ? parseInt(hex.substr(6, 2), 16) / 255 : 1;
        
        return `UIColor(red: ${r.toFixed(3)}, green: ${g.toFixed(3)}, blue: ${b.toFixed(3)}, alpha: ${a.toFixed(3)})`;
      }
    },

    // Custom dimension transform for iOS
    'size/remToPoints': {
      type: 'value',
      matcher: function(token) {
        return token.type === 'dimension' && token.value.includes('rem');
      },
      transformer: function(token) {
        const remValue = parseFloat(token.value);
        return Math.round(remValue * 16) + '.0'; // Convert rem to points
      }
    }
  },

  // Custom formats
  format: {
    // Custom iOS Swift format
    'ios/constants.swift': {
      name: 'ios/constants.swift',
      formatter: function({dictionary, options}) {
        const { className = 'StyleDictionary' } = options;
        
        return `import UIKit

public class ${className} {
${dictionary.allTokens.map(token => 
  `    public static let ${token.name} = ${token.value}`
).join('\n')}
}`;
      }
    },

    // Custom Android Kotlin object format
    'android/compose.kt': {
      name: 'android/compose.kt',
      formatter: function({dictionary, options}) {
        const { className = 'Tokens', packageName = 'com.example' } = options;
        
        return `package ${packageName}

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object ${className} {
${dictionary.allTokens.map(token => {
  let value = token.value;
  if (token.type === 'color') {
    value = `Color(0xFF${token.value.replace('#', '')})`;
  } else if (token.type === 'dimension') {
    value = `${parseFloat(token.value)}.${'dp'}`;
  }
  return `    val ${token.name} = ${value}`;
}).join('\n')}
}`;
      }
    }
  },

  // Custom transform groups
  transformGroup: {
    'ios-swift-separate': [
      'attribute/cti',
      'name/cti/camel',
      'color/hex8ios',
      'size/remToPoints'
    ],
    'compose': [
      'attribute/cti', 
      'name/cti/camel',
      'color/hex8android',
      'size/remToDp'
    ]
  },

  // Custom filters
  filter: {
    'colors-only': function(token) {
      return token.type === 'color';
    },
    'dimensions-only': function(token) {
      return token.type === 'dimension';
    },
    'typography-only': function(token) {
      return token.type === 'typography' || token.type === 'fontSizes' || token.type === 'fontWeights';
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