# Philly Pour

Cheap beer, real happy hours, and tonight's lineup for Philly — built for a 21–25 crowd who wants one board instead of a group chat argument. Static site: plain HTML/CSS/JS, no build step, deploys straight to GitHub Pages.

## Project structure

```
philly-pour/
├── index.html          the page
├── css/styles.css       all styles
├── js/script.js         filtering, rendering, form handling
├── data/deals.json       the bars & prices on "The Board"
└── data/events.json      "Tonight's Lineup" (trivia, shows, day parties, etc.)
```

## Run it locally

Because the page loads `deals.json` and `events.json` with `fetch()`, opening `index.html` directly (`file://`) won't work — browsers block that for security. Run a tiny local server instead, from inside the `philly-pour` folder:

```bash
# Python 3 (built into macOS/Linux, and on Windows via python.org)
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

If you have Node installed, `npx serve` works the same way.

## Deploy to GitHub Pages (free hosting)

1. **Create a repo.** On GitHub, click **New repository**, name it (e.g. `philly-pour`), leave it public, don't add a README (you already have one).
2. **Push this folder to it:**
   ```bash
   cd philly-pour
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/philly-pour.git
   git push -u origin main
   ```
3. **Turn on Pages.** In the repo, go to **Settings → Pages**. Under "Build and deployment," set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`. Save.
4. Wait about a minute, then refresh that settings page — GitHub will show your live URL, something like:
   `https://YOUR-USERNAME.github.io/philly-pour/`

That's it — no build step, no server to maintain. Every time you push a change to `main`, the live site updates automatically in a minute or two.

## Editing the content

You don't need to touch any code to update what's on the site:

- **Add/change a bar deal:** edit `data/deals.json`. Each entry looks like:
  ```json
  {"name":"Bar Name","hood":"fishtown","price":4.50,"vibe":["dive","live"],"hh":"live","note":"$4.50 drafts, 4-7pm"}
  ```
  - `hood` must be one of: `fishtown`, `nolibs`, `rittenhouse`, `southphilly`, `fairmount`, `universitycity` (or add a new one — see below).
  - `vibe` is a list from: `dive`, `rooftop`, `sports`, `daydrink`, `live` (or add your own — see below).
  - `hh` is `"live"` (happy hour on right now) or `"soon"` (later today).
- **Add/change tonight's events:** edit `data/events.json`, same idea.
- **Add a new neighborhood or vibe tag:** add a filter button in `index.html` (copy an existing `<button class="pill ...">` line and change its `data-value` and label), and add the matching entry to `HOOD_COLORS`/`HOOD_LABELS` at the top of `js/script.js` if it's a neighborhood.

## Turning on the signup form

The "Get the Drop" form is static-site-friendly by design: it can't send real texts on its own (GitHub Pages has no backend), so out of the box it just shows a confirmation message and logs the entry to your browser console — good enough to demo, not to actually collect numbers.

To make it real, the fastest option is [Formspree](https://formspree.io) (free tier available):

1. Sign up at formspree.io and create a new form.
2. Copy the endpoint URL it gives you (looks like `https://formspree.io/f/xxxxxxxx`).
3. Open `js/script.js` and paste it into the `FORM_ENDPOINT` constant near the top of the file.
4. Commit and push — submissions will now land in your Formspree dashboard (and can be forwarded to email or a Zapier/SMS integration from there).

## Notes

- All bar/event data shipped here is sample data for demonstration — swap in real spots before sharing this publicly, and double check hours/prices since happy hours change often.
- Fonts (Anton, Space Mono, Inter) load from Google Fonts over the network — if you need a fully offline version, download the font files and self-host them instead.
- No analytics, tracking, or ads are included.
