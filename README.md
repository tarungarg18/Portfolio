# tarachand.tech

Personal portfolio site for Tara Chand. Plain HTML/CSS/JS, no framework or build step.

## Structure

```
index.html    page content
style.css     theme (light/dark) and layout
script.js     theme toggle, scroll effects, live stats fetch
api/          Vercel serverless functions, one per coding platform
vercel.json   headers and clean URLs
robots.txt, sitemap.xml
```

## Coding-platform stats

The Coding Profiles section is populated from `/api/*` serverless functions, called client-side on page load. Handles are hardcoded in each function file — update them there if a username changes.

| Platform | Source | Notes |
|---|---|---|
| Codeforces | Official public API | Stable — safe to rely on. |
| LeetCode | Unofficial GraphQL endpoint | Widely used, but not officially supported; could change without notice. |
| CodeChef | HTML scrape of the profile page | Breaks if CodeChef changes their page markup. |
| AtCoder | `/users/{handle}/history/json`, an unofficial but public endpoint AtCoder itself serves | Reasonably stable, not a documented API. |
| GeeksforGeeks | HTML scrape — regex match on `"score"` / `"total_problems_solved"` embedded in the raw page | Most fragile of the five — GFG's frontend changes relatively often. |

Every function fails soft: on error it returns `{ error: true }` and `script.js` leaves the static fallback numbers already in `index.html` untouched, so a broken scraper degrades to stale-but-correct-looking data instead of a blank or broken card. When you update your rank/rating on a platform, remember to also bump the fallback text in `index.html` occasionally in case an endpoint goes down for good.

## Running locally

Open `index.html` directly in a browser, or serve it:

```
npx serve .
```

## Deployment

Connected to Vercel, mapped to the `tarachand.tech` domain. Pushing to `main` deploys automatically. For a manual deploy from this directory:

```
vercel --prod
```
