import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
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
      entry: path.resolve(__dirname, "src/index.tsx"),
      name: "react-timeline-editor",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom"]
    },
  },
});
