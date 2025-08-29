const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {
      // Target modern browsers only to reduce CSS bloat
      overrideBrowserslist: [
        '> 0.5%',
        'last 2 versions', 
        'not dead',
        'not ie 11',
        'not op_mini all',
        'Chrome >= 80',
        'Firefox >= 72',
        'Safari >= 13.1', 
        'Edge >= 80'
      ]
    },
    // Only run cssnano in production
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: ['default', {
          // Optimize for modern browsers
          normalizeWhitespace: false,
          discardComments: { removeAll: true },
          // Keep modern CSS features
          reduceIdents: false
        }]
      }
    })
  },
};

export default config;
