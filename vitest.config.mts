import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Los tests y `app/lib` importan "./x.js" / "./x.mjs" apuntando a .ts/.mts.
    // Vite no traduce esa extensión sola, así que se la quitamos.
    alias: [{ find: /^(\.{1,2}\/.*)\.(js|mjs)$/, replacement: "$1" }],
  },
  test: {
    include: ["tests/**/*.test.mts"],
    coverage: {
      provider: "v8",
      all: true,
      include: ["app/lib/**"],
      exclude: ["app/lib/translations.ts"],
      reporter: ["text-summary", "lcov"],
    },
  },
});
