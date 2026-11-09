import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    environment: "jsdom",
    environmentOptions: { jsdom: { url: "https://automasoluct.com/contact" } },
    include: ["tests/ui/**/*.test.tsx"],
    env: { NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA" },
    clearMocks: true,
    restoreMocks: true,
  },
});
