// run 'npx eslint .' to check for linting errors in all files in current directory

import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { globals: globals.browser },
  },
  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
    },
  },
  pluginReact.configs.flat.recommended,
]);
