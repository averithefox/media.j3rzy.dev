import { MetadataRoute } from "next";
import { metadata } from "@/app/layout";

export default function robots(): MetadataRoute.Robots
{
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", metadata.metadataBase!).href,
  };
}