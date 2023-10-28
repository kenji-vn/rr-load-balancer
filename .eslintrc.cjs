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
      "plugin:@typescript-eslint/recommended-type-checked",
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
      {
        files: ["src/test/**/*.test.ts"],
        rules: {
          "@typescript-eslint/no-floating-promises": "off",
          "@typescript-eslint/require-await": "off"
        }
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
      "@typescript-eslint/semi": ["error", "always"],
      "@typescript-eslint/member-delimiter-style": "error",
      "@typescript-eslint/no-empty-interface": "off",
      // "@typescript-eslint/no-floating-promises": "off",
      // "@typescript-eslint/require-await": "off"
    },
  };
