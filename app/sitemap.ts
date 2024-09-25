import { MetadataRoute } from "next";
import { metadata } from "@/app/layout";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap>
{
  const files = await db.file.findMany({});
  return [
    {
      url: metadata.metadataBase!.href,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
    {
      url: new URL("/account", metadata.metadataBase!).href,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
    },
    ...files.map(file => ({
      url: new URL(`/${file.filename}`, metadata.metadataBase!).href,
      lastModified: file.createdAt,
      changeFrequency: "monthly" as "monthly",
      priority: 0.5,
    })),
  ];
}