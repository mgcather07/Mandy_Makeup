# Mandy Makeup

Marketing site for **Mandy Makeup**, a boutique bridal and editorial makeup studio.
Static HTML/CSS/JS — no build step, no framework, no dependencies — deployed to
Firebase Hosting.

**Live:** https://mandymakeup.web.app

---

## Running it locally

Any static server works. From the repo root:

```bash
python3 -m http.server 8877 --directory public
```

Or with the Firebase CLI, which mirrors production rewrites and headers:

```bash
firebase serve --only hosting
```

## Deploying

```bash
firebase deploy --only hosting
```

The project is pinned to the `mandy-makeup` Firebase project in `.firebaserc`.

---

## Structure

```
public/
  index.html          the whole site — one page, anchored sections
  404.html            styled not-found page
  css/styles.css      design tokens + all component styles
  js/main.js          nav, scrollspy, reveals, gallery filter, lightbox,
                      testimonial slider, FAQ accordion, form validation
  img/                29 curated photographs + 3 avatar thumbnails
  favicon.svg, site.webmanifest, robots.txt, sitemap.xml
firebase.json         hosting config: clean URLs, cache + security headers
```

### Sections

Hero → marquee → services → about → portfolio (filterable + lightbox) → the kit →
pricing → testimonials → FAQ → booking form → footer.

---

## Before this goes live for real

The copy and contact details are realistic placeholders. Replace these:

| What | Where |
|---|---|
| Email `hello@mandymakeup.com` | `index.html` (booking, footer, JSON-LD), `js/main.js` |
| Phone `(555) 018-2470` | `index.html` (booking, footer, JSON-LD) |
| Address `218 Rosewood Avenue, Studio 4`, Dallas TX | `index.html` (booking, footer, JSON-LD) |
| Opening hours | `index.html` (booking, footer, JSON-LD) |
| Prices, package contents, FAQ answers | `index.html` |
| Stats (10+ years, 430+ clients, 5.0) | `index.html` — about section + hero |
| Testimonial quotes and names | `index.html` |
| Social links (currently generic homepages) | `index.html` footer |
| Photography | `public/img/` — swap in Mandy's real portfolio |

### Wiring up the booking form

The form validates client-side and currently falls back to opening the visitor's
mail client. To POST somewhere instead, add a `data-endpoint` to the form:

```html
<form class="form" id="bookingForm" data-endpoint="https://formspree.io/f/XXXX" novalidate>
```

`js/main.js` will POST JSON (`name`, `email`, `service`, `date`, `message`) to that
URL and show a success or error message in place. Any endpoint accepting a JSON
POST works — Formspree, a Firebase Function, Cloud Run, etc.

---

## Design notes

- **Palette** — blush (`#f9e6ea`), champagne gold (`#c9a46a`), deep plum (`#351522`)
  on a warm cream ground. All tokens live at the top of `css/styles.css`.
- **Type** — Playfair Display for headings, Jost for body, loaded from Google Fonts.
- **Motion** — scroll reveals, hover lifts and the marquee all collapse under
  `prefers-reduced-motion: reduce`.
- **Accessibility** — skip link, visible focus rings, labelled form fields with
  inline errors, `aria-pressed` on filters, keyboard-navigable lightbox
  (arrows + Escape), and no tap target under 32px.

One non-obvious rule worth keeping: the header's frosted blur lives on
`.header::before`, not on `.header`. `backdrop-filter` on the header itself would
make it the containing block for the `position: fixed` mobile drawer, which
collapses the drawer into the 76px header bar.

---

## Photography

All images are from [Unsplash](https://unsplash.com) under the
[Unsplash License](https://unsplash.com/license) — free for commercial use, no
attribution required. Photographers are credited in [CREDITS.md](CREDITS.md) as a
courtesy.
