import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "client"),  // Définit "client" comme racine du projet Vite
  server: {
    open: true,
    port: 22221,
    host: true,
  },
  build: {
    outDir: path.resolve(__dirname, "client/dist"), // Génère les fichiers buildés ici
  },
  optimizeDeps: {
    include: ["@babylonjs/core", "@babylonjs/loaders"],
  },
});
