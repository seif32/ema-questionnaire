import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: ["dist", "build", "node_modules"],
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2024,
      globals: {
        ...globals.browser,
        ...globals.es2024,
        ...globals.node, //
      },
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: "module",
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // 🔥 Critical JavaScript Rules
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "warn",

      // 🚀 Essential React Rules
      "react/jsx-key": "error", // Prevents React key warnings
      "react/jsx-no-undef": "error", // Catches undefined components
      "react/jsx-uses-vars": "error", // Prevents unused import warnings
      "react/display-name": "error", // Helps with debugging

      // 🎯 React 19 Optimizations
      "react/prop-types": "off", // Not needed in React 19
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/jsx-uses-react": "off", // Not needed in React 17+

      // 🔧 React Hooks (Critical!)
      "react-hooks/rules-of-hooks": "error", // Prevents hook rule violations
      "react-hooks/exhaustive-deps": "warn", // Helps with useEffect dependencies

      // 🔄 React Refresh (Vite Integration)
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
