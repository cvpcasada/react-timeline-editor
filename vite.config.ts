import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite-plus";
import dts from "vite-plugin-dts";
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    dts({
      include: ["src/**/*"],
      exclude: ["src/**/*.test.*", "src/**/*.spec.*", "src/stories/**"],
      outDir: "dist",
      tsconfigPath: "./tsconfig.app.json",
      rollupTypes: true,
      compilerOptions: {
        noEmit: false,
        emitDeclarationOnly: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/index.tsx"),
        utils: path.resolve(__dirname, "src/utils/index.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        if (entryName === 'index') {
          return `react-timeline-editor.${format === 'es' ? 'js' : 'cjs'}`;
        }
        return `${entryName}.${format === 'es' ? 'js' : 'cjs'}`;
      },
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        assetFileNames: 'styles.css',
      }
    },
  },
});
