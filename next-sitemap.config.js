/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // Must match `siteUrl` in content/firm.ts and the basePath in next.config.ts.
  siteUrl: process.env.SITE_URL || "https://georgebica.github.io/alinapopa-avocat",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  // Static export writes the site to out/, so the sitemap must land there too.
  outDir: "out",
  trailingSlash: true,
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
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
      lastmod: new Date().toISOString(),
    };
  },
};
