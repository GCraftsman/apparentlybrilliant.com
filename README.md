# Apparently Brilliant

Website for [Apparently Brilliant, LLC](https://apparentlybrilliant.com), a Texas studio that publishes iOS apps on the Apple App Store.

The site is static HTML and CSS. There is no backend, no client-side app, and no secret. Cloudflare Pages can build it from this repository.

## Cloudflare Pages

Connect the GitHub repository and use these settings:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variables | None |

`npm run build` runs `node scripts/build.mjs`. Node.js 20 or newer is enough. `.node-version` pins Node 22 for Pages. The build does not install packages and does not need credentials.

Clean URLs (`/apps`, `/support`, `/privacy`, `/contact`) come from a directory and `index.html` for each page. Unknown paths use `404.html`.

Production domain: `https://apparentlybrilliant.com`

## Local preview

```bash
npm run build
npm run preview
```

The preview server listens on [http://127.0.0.1:8080](http://127.0.0.1:8080) and serves `404.html` for missing paths. Set `PORT` to use a different port.

## Add an app

Edit [`data/apps.json`](data/apps.json). It is a JSON array. An empty array shows the Coming soon state. Each object becomes one card:

```json
{
  "name": "App name",
  "summary": "A short description of what the app does.",
  "platforms": ["iPhone", "iPad"],
  "url": "https://apps.apple.com/app/id0000000000"
}
```

[`data/apps.example.json`](data/apps.example.json) is the same shape and is not published. Rebuild after changing `data/apps.json`.

## Privacy policy

The page at `/privacy` is a draft for an independent iOS publisher whose apps, by default, collect no personal data. A comment at the top of [`src/content/privacy.html`](src/content/privacy.html) marks that an attorney should review it before the company relies on it. Update the policy when an app’s data practices change.

## Pages

- `/` Home
- `/apps` Apps
- `/support` Support
- `/privacy` Privacy Policy
- `/contact` Contact
