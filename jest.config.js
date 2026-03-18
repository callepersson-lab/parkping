module.exports = {
  preset: "react-native",
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-native-community|@react-navigation|react-native-screens|react-native-safe-area-context|react-native-sensors|react-native-background-actions|react-native-push-notification|react-native-maps)/)",
  ],
  setupFiles: ["./jest.setup.js"],
};
