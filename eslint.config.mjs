import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    rules: {
      "@next/next/no-img-element": "off",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/immutability": "off",
      "react-hooks/gating": "off",
      "react-hooks/use-memo": "off",
      "react-hooks/use-effect": "off",
      "react-hooks/use-callback": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/static-components": "off",
      "react/display-name": "off",
      "jsx-a11y/alt-text": "off",
    },
  },
];
