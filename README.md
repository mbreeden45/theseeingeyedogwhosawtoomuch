# theseeingeyedogwhosawtoomuch

Website for *The Seeing Eye Dog Who Saw Too Much* (dir. Eric Jackowitz, Sono Bloccato, 2026).

The site is presented in-world as the 1975 season programme of the fictional Teatro Januzzi in Rome, with the real credits always one click away.

## Pages

| Path | What it is |
| --- | --- |
| `/` | The stage: cover, I. synopsis and uncut 4K restoration notes, II. stills, III. credits, IV. festival tour, press ticket |
| `/about/` | *Dietro le Quinte* (backstage): the real people, label, call sheet, crew |
| `/downloads/` | Press archive: access by request to the press contact |
| `/404.html` | *Questa pagina è stata assassinata* |

## Structure

Plain static HTML, CSS and JS with no build step.

- `assets/css/site.css`: every style. Palette tokens are at the top.
- `assets/js/site.js`: curtains, dubbed subtitles, gel lighting, restoration sliders, lightbox, credit reveal, synthesized audio stings, Seeing Eye Mode.
- `assets/img/`: poster, logos, cursors, `stills/` (full size plus `-sm` thumbnails).

## Common edits

- **Festivals:** add an `<li>` under the right month in the `#tournee` section of `index.html`. Each month block has a `data-month="YYYY-MM"`, and screenings in the current month are tagged *in corso* automatically.
- **Credits:** each name in the `#locandina` block is a `.flip` with a `.fake` (1975 billing) and a `.real` span. New flips are picked up by the reveal button automatically.
- **Stills:** add a `<button class="still">` to `#movimenti`. Give it a plain `alt` (for screen readers) and a `.dog-desc` (Ziggy's narration, shown in Seeing Eye Mode).

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. It deploys as-is to any static host (Vercel, Netlify, GitHub Pages).
