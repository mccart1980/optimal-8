# Optimal 8

The companion app for the Optimal 8 fighter build — a 16-week strength and
conditioning cycle. It runs in your phone's browser, keeps everything on the
phone itself, and works with no signal once you've added it to your home screen.

**Address: https://mccart1980.github.io/optimal-8/**

---

## Put it on your iPhone home screen

1. Open **https://mccart1980.github.io/optimal-8/** in **Safari**.
   (It has to be Safari — Chrome on iPhone can't install apps.)
2. Tap the **Share** button — the square with the arrow pointing up, at the
   bottom of the screen.
3. Scroll down the list and tap **Add to Home Screen**.
4. Tap **Add** in the top right.

You'll get an "8" icon on your home screen. Open it from there and it runs
full screen with no browser bars, like any other app.

Once it's installed you can use it on a plane, in a basement gym, anywhere with
no signal. When you next open it with a connection it quietly picks up any new
version in the background.

## Where your data lives

Everything — your maxes, ticked sessions, notes, body weight, Forge and Hell
Week scores — is stored **on your phone**, inside the app. There is no account,
no sign-in and no server. Nobody else can see it, and it doesn't sync to
other devices.

That also means: **if you delete the app from your home screen, or clear
Safari's website data, your training history goes with it.** So back it up.

## Backing up

Open the app, tap the **⚙** button in the top right, and scroll down to
**Backup**.

**To make a backup**

- **EXPORT TO FILE** — the best option. It hands you a `.json` file through the
  normal iPhone share sheet, so you can save it to Files, put it in iCloud
  Drive, message it to yourself, or email it. Do this at the end of every
  block, and before you ever delete or reinstall the app.
- **EXPORT** — shows the same backup as a wall of text you can copy and paste
  into Notes or a message. A fallback if the file option gives you trouble.

**To restore a backup**

- **IMPORT FROM FILE** — pick the `.json` file you saved earlier. The app
  reloads with all your history back.
- **IMPORT** — paste the text you copied earlier into the box, then tap
  **LOAD THIS BACKUP**.

Restoring **replaces** everything currently in the app, so make a fresh backup
first if there's anything in there you want to keep.

## Settings worth knowing

- **Monday of week 1** — tells the app where you are in the cycle. If the
  header shows the wrong week, fix it here, or open the **WEEK** tab, find the
  right week and tap "make this the current week".
- **Iron Mind weeks 17–18 (Hell Week + Reload)** — off by default, which gives
  you the standard **16-week** cycle: test day at the end of week 16, then
  straight into week 1 again. Turn it on if you want Hell Week and the Reload
  bolted on the end, making it an 18-week cycle.
- **Bell sounds** and **Auto rest clock** — timer behaviour, on by default.

## Asking for changes later

This app is built by Claude Code from the files in this repository. To get
something changed, open a Claude Code session on
**github.com/mccart1980/optimal-8** and describe what you want in ordinary
language. Useful things to say:

- What you see now, and what you want to see instead.
- Which screen it's on — TODAY, WEEK, TRACK, IRON, PLAN, or Settings.
- Whether it's a wording change, a number change, or new behaviour.

For example: *"On the Thursday session, the neck protocol says 10 minutes —
make it 12"*, or *"Add a warm-up timer to Wednesday's sled block"*.

Ask it to **commit and push to main** when it's done. Pushing to `main`
rebuilds and republishes the site automatically; give it two or three minutes,
then close and reopen the app on your phone twice — the first open fetches the
new version, the second shows it.

Your training data is untouched by updates. It lives on the phone, not in the
code.

---

## For anyone working on the code

```bash
npm install     # once
npm run dev     # local dev server
npm test        # smoke tests (vitest + jsdom)
npm run build   # production build into dist/
npm run icons   # regenerate the app icons from scripts/generate-icons.mjs
```

- `src/App.jsx` — the whole app: the macrocycle table, the seven session
  cards, protocols, timers, the Forge and Hell Week.
- `src/storage.js` — a `window.storage` shim (the API the original claude.ai
  artifact used) backed by `localStorage`, keeping the existing `o8s-…` keys.
- `vite.config.js` — Vite base path `/optimal-8/` plus the PWA manifest and
  service worker (`registerType: "autoUpdate"`).
- `.github/workflows/deploy.yml` — builds and deploys to GitHub Pages on every
  push to `main`.
