# The thread — art direction (v2, motion rebuild)

**Thesis.** A Khasi-wear boutique at home is a table where cloth is unrolled for you. The site unrolls her real fabric, then follows one gold thread through every chapter of the collection.

**Hero asset.** A WebGL cloth (Three.js shader) textured with a crop of the boutique's own crimson roll with woven gold borders (New Arrivals, 16 Nov). It unrolls from a gold rod on load, sways, parts around the cursor and catches a travelling Muka-gold sheen. On scroll it lifts toward the viewer as the name drifts apart.

**Type.** Cormorant (variable 300–700, italics in gold for emphasis; section titles swell in weight as they rise) + DM Sans for body and labels.

**Colour.** One dusk family of maroon-blacks (`#140a0e`–`#1e1013`) that blends between sections without flashes; ivory text; Muka gold `#d9ad58` / `#f2d38e`. Fabric colour is the only loud thing — a background glow takes on the colour of the shade in view (swatches sampled from her photos into `js/swatches.js`).

## Story and motion

| # | Chapter | Axis | Motion |
|---|---|---|---|
| 0 | Preloader | — | Gold stroke writes “Lynette’s”, thread + needle run, counter, curtains part (≈2.3 s, skippable, once per session) |
| 1 | Hero | vertical, pinned | Cloth unrolls / sways / cursor breeze / sheen; letters rise in; on scroll the cloth unfurls and letters drift like loose threads |
| — | Marquee | horizontal | Range names; speed, direction and skew follow scroll velocity |
| 2 | The boutique | vertical, pinned | Words light up one by one; three photos float at different depths |
| 3 | Twenty colours | **horizontal, pinned** | Rail of the 20 gold-border shades; cards arc and turn through centre, inner image parallax, glow follows each fabric, progress meter |
| 4 | Side by side | vertical, pinned | Five colour pairs; halves wipe in from opposite edges, names rise |
| 5 | Named fabrics | vertical, sticky | Ryndia / Half Khor / Premium cards stack and settle back |
| 6 | New arrivals | **horizontal** | Two photo reels stream in opposite directions (native swipe on phones) |
| 7 | Lookbook | **3D**, pinned | CSS 3D ring turned by scroll and drag; front piece named, sheen on the face |
| 8 | Ranges | vertical | Rows rise, cursor-following cover preview, woven line background weaves in |
| 9 | Collection | — | Fabric-fold clip reveals, Flip-animated colour / range filters, quick view zoom, wishlist |
| 10 | How to order | horizontal line | SVG thread stitches the four steps; “no returns or exchanges” stated plainly |
| 11 | Visit + footer | vertical | Card rise; her name rises letter by letter |
| — | Global | — | Page-long gold thread with a needle drawn by scroll, section tone blending, needle cursor, magnetic buttons |

Phones keep the cloth (lighter mesh, DPR ≤1.25), the colour rail pin and the lookbook; hero, manifesto and pairs unpin, reels become native swipe rows. A footer **Motion: On/Off** switch shows final states with a still image of the cloth.
