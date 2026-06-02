import type { MetadataRoute } from "next";

// Served by Next at /manifest.webmanifest and auto-linked in <head>.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shifumi — Pierre Papier Ciseaux",
    short_name: "Shifumi",
    description: "Jeu de Pierre-Papier-Ciseaux à deux joueurs en temps réel.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#EADDCA",
    theme_color: "#DAA06D",
    lang: "fr",
    categories: ["games", "entertainment"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
