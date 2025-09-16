module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ignore html2pdf.js source map warnings
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        {
          module: /html2pdf\.js/,
        },
      ];
      return webpackConfig;
    },
  },
};
