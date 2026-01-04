import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    ignores: [
      "dist",
      "node_modules",
      "coverage",
      "build",
      "*.config.js",
      "eslint.config.js",
      "vite.config.js",
    ],
  },

  js.configs.recommended,

  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier: prettierPlugin,
    },

    rules: {
      // React correctness
      ...reactHooks.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,

      // 🔑 IMPORTANT: disable PropTypes
      "react/prop-types": "off",

      // Fast Refresh safety
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // Prettier enforcement
      "prettier/prettier": [
        "error",
        {
          semi: true,
        },
      ],

      // JS correctness
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "no-console": ["warn", { allow: ["warn", "error", "debug"] }],
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
      "prefer-arrow-callback": "error",
      "no-nested-ternary": "warn",
      "no-unneeded-ternary": "error",
    },

    settings: {
      react: {
        version: "detect",
      },
    },
  },

  prettierConfig,
];
