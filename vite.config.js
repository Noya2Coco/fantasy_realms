import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "starfall/client"),  // Définit "client" comme racine du projet Vite
  server: {
    open: false,
    port: 22221,
    host: true,
  },
  build: {
    outDir: path.resolve(__dirname, "starfall/client/dist"), // Génère les fichiers buildés ici
  },
  optimizeDeps: {
    include: ["@babylonjs/core", "@babylonjs/loaders"],
  },
});
