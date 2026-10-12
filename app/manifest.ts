import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Automa Soluct",
    short_name: "Automa Soluct",
    description: "Custom Jobber solutions for U.S. service businesses.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#0A4EE4",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
