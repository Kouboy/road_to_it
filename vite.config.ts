import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/road_to_it/",
  plugins: [react()],
});
