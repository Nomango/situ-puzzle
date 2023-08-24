// astro.config.ts
import { defineConfig } from "astro/config";
import UnoCSS from "unocss/astro";
import vercel from "@astrojs/vercel/edge";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [
    UnoCSS({
      injectReset: true, // or a path to the reset file
    }),
    react(),
  ],
});
