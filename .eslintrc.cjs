module.exports = {
    root: true,
    ignorePatterns: ["dist/*", "@types/*", "data-scripts"],
    env: {
      es2021: true,
      node: true,
    },
    extends: [
      "prettier",
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/stylistic",
    ],
    overrides: [
      {
        env: {
          node: true,
        },
        files: [".eslintrc.{js,cjs}"],
        parserOptions: {
          sourceType: "script",
        },
      },
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      project: true,
    },
    plugins: ["@typescript-eslint"],
    rules: {
      quotes: ["error", "double", { avoidEscape: true }],
      semi: "off",
      "require-await": "off",
      "@typescript-eslint/semi": ["error", "always"],
      "@typescript-eslint/member-delimiter-style": "error",
      "@typescript-eslint/no-empty-interface": "off",
    },
  };
  