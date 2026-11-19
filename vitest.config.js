import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    // jsdom works through the app's whole style sheet each time a test asks
    // for a button by its role. Since brief 27 the sheet carries both themes,
    // so the heavier screen tests take several seconds: 30 s each, not 5.
    testTimeout: 30000,
    include: ["src/**/*.test.{js,jsx}"],
  },
});
