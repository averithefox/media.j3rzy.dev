import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
    cors: {
      origin: /media\.j3rzy\.dev/i,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Authorization", "Content-Type"],
    }
  },
  plugins: [ sveltekit() ]
});
