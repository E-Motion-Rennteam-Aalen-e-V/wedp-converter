import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // A config object with only `ignores` applies globally, not just to
    // the preceding config — this keeps eslint from linting Next's own
    // generated output (`eslint .` doesn't auto-skip `.next` the way the
    // `next lint` CLI wrapper does).
    ignores: ["src/workers/**", ".next/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
