import { vueConfig } from "@repo/eslint-config/vue";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...vueConfig,
  {
    ignores: [".nuxt/**", ".output/**"],
  },
  {
    files: ["**/*.vue"],
    rules: {
      "no-undef": "off",
      "vue/html-self-closing": "off",
      "vue/max-attributes-per-line": "off",
      "vue/multi-word-component-names": "off",
      "vue/singleline-html-element-content-newline": "off",
    },
  },
];
