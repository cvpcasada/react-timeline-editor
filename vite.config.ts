import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite-plus";
import dts from "vite-plugin-dts";

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
    dts({
      include: ["src/**/*"],
      exclude: ["src/**/*.test.*", "src/**/*.spec.*", "src/stories/**"],
      outDirs: "dist",
      entryRoot: "src",
      tsconfigPath: "./tsconfig.app.json",
      bundleTypes: true,
      beforeWriteFile: (filePath, content) => {
        const srcIndexPath = path.join("dist", "src", "index.d.ts");

        if (filePath.endsWith(srcIndexPath)) {
          return {
            filePath: filePath.replace(
              srcIndexPath,
              path.join("dist", "index.d.ts")
            ),
            content,
          };
        }
      },
      compilerOptions: {
        noEmit: false,
        emitDeclarationOnly: true,
      },
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
  },
  build: {
    lib: {
      entry: {
        index: path.resolve(configDir, "src/index.tsx"),
        utils: path.resolve(configDir, "src/utils/index.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        if (entryName === "index") {
          return `react-timeline-editor.${format === "es" ? "js" : "cjs"}`;
        }
        return `${entryName}.${format === "es" ? "js" : "cjs"}`;
      },
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        assetFileNames: "styles.css",
      },
    },
  },
});
