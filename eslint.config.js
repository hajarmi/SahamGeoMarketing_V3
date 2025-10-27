
module.exports = [
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    ignores: ["**/.next/**", "**/node_modules/**"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      globals: {
        "React": "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      "react": require("eslint-plugin-react"),
      "react-hooks": require("eslint-plugin-react-hooks")
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "react/react-in-jsx-scope": "off"
    }
  }
];
