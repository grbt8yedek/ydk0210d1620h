module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // CSS Minification ve optimizasyon
    ...(process.env.NODE_ENV === 'production' && {
      'cssnano': {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          minifySelectors: true,
          minifyParams: true,
          normalizeWhitespace: true,
          reduceIdents: false, // CSS variables korunur
          zindex: false, // z-index değerleri korunur
        }]
      }
    })
  },
}
