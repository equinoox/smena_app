// Babel config: enables NativeWind JSX + worklets (reanimated 4) plugin.
// Connected to metro.config.js and global.css for Tailwind processing.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Must stay last; reanimated 4 ships its worklets plugin here.
    plugins: ["react-native-worklets/plugin"],
  };
};
