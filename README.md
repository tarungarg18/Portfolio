# tarachand.tech

Personal portfolio site for Tara Chand. Plain HTML/CSS/JS, no framework or build step.

## Structure

```
index.html    page content
style.css     theme (light/dark) and layout
script.js     theme toggle
vercel.json   headers and clean URLs
robots.txt, sitemap.xml
```

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
