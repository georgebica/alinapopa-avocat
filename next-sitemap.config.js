/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // Must match `siteUrl` in content/firm.ts and the basePath in next.config.ts.
  siteUrl: process.env.SITE_URL || "https://georgebica.github.io/alinapopa-avocat",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  // Static export writes the site to out/, so the sitemap must land there too.
  outDir: "out",
  trailingSlash: true,
  // These carry `noindex` meta — a sitemap must list only indexable URLs, or
  // Google receives a mixed signal for them.
  exclude: ["/politica-de-confidentialitate", "/termeni-si-conditii"],
  robotsTxtOptions: {
    // The named AI-crawler allows are redundant with the wildcard today, but
    // they make AI access explicit: a future default-deny edit can no longer
    // silently cut the site out of AI search results.
    policies: [
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "*", allow: "/" },
    ],
  },
  changefreq: "monthly",
  priority: 0.7,
  transform: async (config, path) => {
    const isHome = path === "/";
    const isService = path.startsWith("/servicii");
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: isHome ? 1.0 : isService ? 0.8 : config.priority,
      // No lastmod on purpose: the build stamped every URL with the same
      // build-time date, which is a false freshness signal search engines
      // learn to distrust. Omitting it beats lying about it.
    };
  },
};
