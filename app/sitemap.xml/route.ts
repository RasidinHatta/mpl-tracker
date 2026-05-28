function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3001";
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const siteUrl = getSiteUrl();
  const lastModified = new Date().toISOString();
  const urls = [
    { path: "/", changeFrequency: "weekly", priority: "1.0" },
    { path: "/dashboard", changeFrequency: "daily", priority: "0.9" },
    { path: "/standing", changeFrequency: "daily", priority: "0.8" },
    { path: "/schedule", changeFrequency: "daily", priority: "0.8" },
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((entry) => `  <url>
    <loc>${xmlEscape(`${siteUrl}${entry.path}`)}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`)
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
