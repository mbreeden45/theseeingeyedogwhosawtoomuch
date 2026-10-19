# theseeingeyedogwhosawtoomuch

Website for *The Seeing Eye Dog Who Saw Too Much* (dir. Eric Jackowitz, Sono Bloccato, 2026).

The site is presented in-world as the 1975 season programme of the fictional Teatro Januzzi in Rome, with the real credits always one click away.

## Pages

| Path | What it is |
| --- | --- |
| `/` | The stage: cover, synopsis and restoration notes, orchestra seating chart (cast), stills, credits, festival tour, Ziggy's testimony, press ticket |
| `/about/` | *Dietro le Quinte* (backstage): the real people, label, call sheet, crew |
| `/downloads/` | Press archive: access by request to the press contact |
| `/404.html` | *Questa pagina è stata assassinata* |

## Structure

Plain static HTML, CSS and JS with no build step.

- `assets/css/site.css`: every style. Palette tokens are at the top.
- `assets/js/site.js`: curtains, dubbed subtitles, gel lighting, seating chart and body count, restoration sliders, lightbox, credit reveal, Ziggy easter egg, synthesized audio stings, Seeing Eye Mode.
- `assets/img/`: poster, logos, cursors, `stills/` (full size plus `-sm` thumbnails).

## Common edits

- **Seating chart:** the `cast` and `victims` arrays near the top of `buildOrchestra()` in `site.js` set who sits where, their instruments, their notes and the order of the murders.
- **Festivals:** add an `<li>` under the right month in the `#tournee` section of `index.html`. Each month block has a `data-month="YYYY-MM"`, and screenings in the current month are tagged *in corso* automatically.
- **Stills:** add a `<button class="still">` to `#movimenti`. Give it a plain `alt` (for screen readers) and a `.dog-desc` (Ziggy's narration, shown in Seeing Eye Mode).

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. It deploys as-is to any static host (Vercel, Netlify, GitHub Pages).
