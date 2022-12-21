module.exports = {
    mainEntry: 'src-main/index.js',
    preloadEntry: 'src-preload/index.js',
    outDir: 'public',
    mainTarget: 'electron16.0-main',
    preloadTarget: 'electron16.0-preload',
    experiments: {
        topLevelAwait: true
    },
  }