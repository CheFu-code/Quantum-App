module.exports = function babelConfig(api) {
  const isProduction = api.env("production");

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      isProduction && [
        "transform-remove-console",
        {
          exclude: ["error", "warn"],
        },
      ],
    ].filter(Boolean),
  };
};
