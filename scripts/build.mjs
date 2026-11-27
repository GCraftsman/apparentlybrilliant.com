import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const siteUrl = "https://apparentlybrilliant.com";
const updated = "2026-11-27";

const pages = [
  {
    path: "/",
    file: "index.html",
    title: "Apparently Brilliant",
    description:
      "Apparently Brilliant is an independent studio making thoughtful apps for iPhone and iPad.",
    contentFile: "home.html",
  },
  {
    path: "/apps",
    file: "apps/index.html",
    title: "Apps — Apparently Brilliant",
    description:
      "Apps from Apparently Brilliant. Our first iPhone and iPad apps are coming soon to the App Store.",
    render: renderAppsPage,
  },
  {
    path: "/support",
    file: "support/index.html",
    title: "Support — Apparently Brilliant",
    description:
      "Get help with Apparently Brilliant apps. Email michael@apparentlybrilliant.com.",
    contentFile: "support.html",
  },
  {
    path: "/privacy",
    file: "privacy/index.html",
    title: "Privacy Policy — Apparently Brilliant",
    description:
      "Privacy policy for Apparently Brilliant, LLC. Our iPhone and iPad apps are designed not to collect personal data.",
    contentFile: "privacy.html",
  },
  {
    path: "/contact",
    file: "contact/index.html",
    title: "Contact — Apparently Brilliant",
    description: "Contact Apparently Brilliant by email at michael@apparentlybrilliant.com.",
    contentFile: "contact.html",
  },
  {
    path: null,
    file: "404.html",
    title: "Page not found — Apparently Brilliant",
    description: "That page is not on apparentlybrilliant.com.",
    contentFile: "404.html",
    robots: "noindex",
  },
];

const nav = [
  { href: "/apps", label: "Apps" },
  { href: "/support", label: "Support" },
  { href: "/contact", label: "Contact" },
];

function anchor(href, label, currentPath) {
  const current = href === currentPath ? ` aria-current="page"` : "";
  return `<a href="${href}"${current}>${label}</a>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function loadApps(data, file) {
  if (!Array.isArray(data)) {
    throw new Error(`${file} must be a JSON array`);
  }

  return data.map((app, index) => {
    const where = `${file}[${index}]`;
    if (!app || typeof app !== "object") {
      throw new Error(`${where} must be an object`);
    }

    const name = typeof app.name === "string" ? app.name.trim() : "";
    const summary = typeof app.summary === "string" ? app.summary.trim() : "";
    if (!name) throw new Error(`${where} is missing a name`);
    if (!summary) throw new Error(`${where} is missing a summary`);
    if (!Array.isArray(app.platforms) || app.platforms.length === 0) {
      throw new Error(`${where} needs a platforms array`);
    }

    const platforms = app.platforms.map((platform, platformIndex) => {
      if (typeof platform !== "string" || platform.trim() === "") {
        throw new Error(`${where}.platforms[${platformIndex}] must be text`);
      }
      return platform.trim();
    });

    let url;
    try {
      url = new URL(app.url);
    } catch {
      throw new Error(`${where} has an invalid url`);
    }
    if (url.protocol !== "https:") {
      throw new Error(`${where} url must use https`);
    }

    return { name, summary, platforms, url: url.href };
  });
}

function renderAppsPage(apps) {
  if (apps.length === 0) {
    return `<div class="page">
  <div class="wrap">
    <!-- Cards on this page are generated from data/apps.json. An empty list shows Coming soon. -->
    <header class="page-header">
      <h1>Apps</h1>
      <p class="lede">Software for iPhone and iPad, published on the App Store.</p>
    </header>
    <section class="coming-soon" aria-labelledby="coming-soon">
      <h2 id="coming-soon">Coming soon</h2>
      <p>We are preparing our first apps. When they are ready, each one will appear here with a short description and a link to the App Store.</p>
    </section>
  </div>
</div>`;
  }

  const cards = apps
    .map(
      (app) => `    <article class="app-card">
      <h2>${escapeHtml(app.name)}</h2>
      <p>${escapeHtml(app.summary)}</p>
      <p class="platforms">${escapeHtml(app.platforms.join(" · "))}</p>
      <p class="app-link"><a href="${escapeHtml(app.url)}">View on the App Store</a></p>
    </article>`,
    )
    .join("\n");

  return `<div class="page">
  <div class="wrap">
    <!-- Cards on this page are generated from data/apps.json. -->
    <header class="page-header">
      <h1>Apps</h1>
      <p class="lede">Software for iPhone and iPad, published on the App Store.</p>
    </header>
    <div class="app-grid">
${cards}
    </div>
  </div>
</div>`;
}

function renderDocument(page, body) {
  const canonical = page.path ? `${siteUrl}${page.path === "/" ? "/" : page.path}` : "";
  const robots = page.robots
    ? `  <meta name="robots" content="${escapeHtml(page.robots)}">\n`
    : "";
  const canonicalTag = canonical
    ? `  <link rel="canonical" href="${escapeHtml(canonical)}">\n`
    : "";
  const social = canonical
    ? `  <meta property="og:url" content="${escapeHtml(canonical)}">\n  <meta property="og:title" content="${escapeHtml(page.title)}">\n  <meta property="og:description" content="${escapeHtml(page.description)}">\n  <meta property="og:type" content="website">\n  <meta property="og:site_name" content="Apparently Brilliant">\n  <meta property="og:locale" content="en_US">\n  <meta name="twitter:card" content="summary">\n  <meta name="twitter:title" content="${escapeHtml(page.title)}">\n  <meta name="twitter:description" content="${escapeHtml(page.description)}">\n`
    : "";

  const links = nav
    .map((item) => anchor(item.href, item.label, page.path))
    .join("\n        ");
  const footerLinks = [
    anchor("/privacy", "Privacy", page.path),
    anchor("/support", "Support", page.path),
  ].join("\n        ");

  const wordmarkCurrent = page.path === "/" ? ` aria-current="page"` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <meta name="author" content="Apparently Brilliant, LLC">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
  <meta name="format-detection" content="telephone=no">
${robots}${canonicalTag}${social}  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <a class="skip-link" href="#content">Skip to content</a>
  <header class="site-header">
    <div class="wrap header-inner">
      <a class="wordmark" href="/"${wordmarkCurrent}>Apparently Brilliant</a>
      <nav class="nav" aria-label="Primary">
        ${links}
      </nav>
    </div>
  </header>
  <main id="content">
${body}
  </main>
  <footer class="site-footer">
    <div class="wrap footer-inner">
      <p>© 2026 Apparently Brilliant, LLC</p>
      <nav class="footer-nav" aria-label="Footer">
        ${footerLinks}
      </nav>
    </div>
  </footer>
</body>
</html>
`;
}

function renderSitemap() {
  const urls = pages
    .filter((page) => page.path)
    .map(
      (page) => `  <url>
    <loc>${siteUrl}${page.path === "/" ? "/" : page.path}</loc>
    <lastmod>${updated}</lastmod>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

async function readContent(name) {
  return readFile(path.join(root, "src/content", name), "utf8");
}

const publishedApps = loadApps(
  JSON.parse(await readFile(path.join(root, "data/apps.json"), "utf8")),
  "data/apps.json",
);
loadApps(
  JSON.parse(await readFile(path.join(root, "data/apps.example.json"), "utf8")),
  "data/apps.example.json",
);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, "public"), dist, { recursive: true });
await cp(path.join(root, "src/styles.css"), path.join(dist, "styles.css"));
await cp(path.join(root, "src/favicon.svg"), path.join(dist, "favicon.svg"));

for (const page of pages) {
  const body = page.render ? page.render(publishedApps) : await readContent(page.contentFile);
  const html = renderDocument(page, body.trimEnd());
  const target = path.join(dist, page.file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
}

await writeFile(path.join(dist, "sitemap.xml"), renderSitemap());
await writeFile(
  path.join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
);

console.log(`Built ${pages.length} pages to ${dist}`);
