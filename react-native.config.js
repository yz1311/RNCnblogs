// react-native.config.js
module.exports = {
  dependencies: {
    'react-native-code-push': {
      platforms: {
        android: null, // disable Android platform, other platforms will still autolink if provided
      },
    },
    '@yz1311/react-native-smart-barcode': {
      platforms: {
        ios: null,
      },
    },
  },
};
