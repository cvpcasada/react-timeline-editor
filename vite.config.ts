import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite-plus";

const configDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  lint: {
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
    rules: {
      "eslint/no-unused-expressions": "off",
      "typescript/no-useless-default-assignment": "off",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(configDir, "./src"),
    },
  },
  fmt: {
    ignorePatterns: ["dist/**", "storybook-static/**", "src/stories/**"],
    printWidth: 80,
    semi: true,
    singleQuote: false,
    jsxSingleQuote: false,
    sortPackageJson: false,
    trailingComma: "es5",
  },
  test: {
    passWithNoTests: true,
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/stories/**", "src/typings.d.ts"],
    },
  },
  pack: {
    entry: {
      "react-timeline-editor": "src/index.tsx",
      utils: "src/utils/index.ts",
    },
    dts: true,
    tsconfig: "tsconfig.app.json",
    format: ["esm", "cjs"],
    copy: [{ from: "src/styles.css.d.ts", to: "dist", flatten: true }],
    env: {
      DEV: false,
      PROD: true,
    },
    deps: {
      neverBundle: ["react", "react-dom"],
    },
    css: {
      fileName: "styles.css",
    },
  },
});
