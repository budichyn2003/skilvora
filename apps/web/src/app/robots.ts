import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://skilvora-omega.vercel.app/"
  ).replace(/\/+$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/auth", "/users"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
