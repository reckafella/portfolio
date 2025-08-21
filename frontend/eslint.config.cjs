const js = require("@eslint/js");
const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");

module.exports = [
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "@typescript-eslint": typescriptEslint,
    },
    rules: {
      // TypeScript ESLint rules
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      
      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      
      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // General rules
      "no-console": "warn",
      "no-debugger": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ignores: [
      "dist/**",
      "build/**", 
      "node_modules/**",
      "public/**",
      "*.config.js",
      "*.config.cjs",
      "*.config.ts",
    ],
  },
];
