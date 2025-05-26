module.exports = {
  source: ["tokens/figma-tokens.json"],
  platforms: {
    web: {
      transformGroup: "web",
      buildPath: "build/web/",
      files: [{
        destination: "variables.js",
        format: "javascript/es6"
      }]
    },
    android: {
      transformGroup: "android",
      buildPath: "build/android/",
      files: [{
        destination: "colors.xml",
        format: "android/colors"
      }]
    },
    css: {
      transformGroup: "css",
      buildPath: "build/css/",
      files: [{
        destination: "variables.css",
        format: "css/variables"
      }]
    }
  }
};

