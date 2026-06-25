// eslint.config.js
import { defineConfig } from "eslint/config";
import react from "eslint-plugin-react";
import js from "@eslint/js";
import globals from "globals";

export default defineConfig([
    {
        files: ["src/**/*.js", "src/**/*.jsx"],
        rules: {
            semi: ["error", "always"],
            "prefer-const": "error",
            indent: ["error", 4],
            "no-unused-vars": "error",
            quotes: ["error", "double"],
            camelcase: "error",
            "react/no-unused-prop-types": "error",
            "react/display-name": "error",
            "react/jsx-key": "error",
            "react/jsx-no-comment-textnodes": "error",
            "react/jsx-no-duplicate-props": "error",
            "react/jsx-no-target-blank": "error",
            "react/jsx-no-undef": "error",
            "react/jsx-uses-react": "error",
            "react/jsx-uses-vars": "error",
            "react/no-children-prop": "error",
            "react/no-danger-with-children": "error",
            "react/no-deprecated": "error",
            "react/no-direct-mutation-state": "error",
            "react/no-find-dom-node": "error",
            "react/no-is-mounted": "error",
            "react/no-render-return-value": "error",
            "react/no-string-refs": "error",
            "react/no-unescaped-entities": "error",
            "react/no-unknown-property": "error",
            "react/no-unsafe": "error",
            "react/prop-types": "error",
            "react/require-render-return": "error",
        },
        extends: [js.configs.recommended],
        plugins: {
            react,
        },
        languageOptions: {
            parserOptions: {
                ecmaVersion: "latest",
                ecmaFeatures: {
                    jsx: true,
                },
                sourceType: "module",
            },
            globals: {
                ...globals.browser, // This defines window, document, etc.
            },
        },
        linterOptions: {
            reportUnusedInlineConfigs: "error",
        },
    },
]);
