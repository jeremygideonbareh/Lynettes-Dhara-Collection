# Independent design review

> These scores are for the first version of the site (before the November 2026 motion rebuild). See docs/art-direction.md for the current build.

Two rounds used the desktop and mobile site, browser screenshots and source. A score of 8/10 was required for the demo.

| Category | Round 1 | Round 2 |
|---|---:|---:|
| Visual design | 8.1 | 8.5 |
| Motion | 7.5 | 8.2 |
| Product presentation | 6.4 | 7.7 |
| Ease of enquiry | 8.5 | 9.1 |
| Performance | 7.2 | 9.1 |
| Mobile | 7.2 | 8.4 |
| Accessibility | 7.5 | 8.5 |
| **Overall** | **7.4** | **8.3** |

The first review found empty filters, a visible edge on the mobile hero and an enquiry button below the initial mobile quick-view screen. The second version added a populated colour filter, offered verified range and fabric options, labelled range enquiries, placed a WhatsApp button at the top of the mobile quick view, and added a compact navigation menu. The hero artwork now blends into the background at small widths.

At 1440 × 900 and 390 × 844 the reviewer saw no horizontal overflow, missing requests or JavaScript errors. Tests exercised product browsing, range/colour/fabric filtering, image zoom, the rotating lookbook, saved selections and their WhatsApp links. An enquiry carries the item descriptor and its exact source URL. The local Lighthouse run measured performance 96/100, accessibility 100/100 and cumulative layout shift 0.005. Automated accessibility and lab performance measurements cover the tested configuration.

The main remaining limit is the source inventory. Of 53 photographed item references, five have confirmed ranges and six have a confirmed fabric. No individual price was verified. See the [source audit](research.md) for owner confirmations.

## Screenshots

On the published GitHub Pages site, mobile Lighthouse measured **95/100 performance**, **100/100 accessibility**, a 2.2-second largest contentful paint and 0.006 cumulative layout shift. A separate live mobile test checked the 53-entry catalogue, a two-photo gallery, the exact enquiry link, touch swiping in the lookbook and the reduced-motion setting.

| Desktop | Mobile |
|---|---|
| [Hero](review/desktop-hero.jpg) | [Hero](review/mobile-hero.jpg) |
| [Catalogue](review/desktop-grid.jpg) | [Catalogue](review/mobile-grid.jpg) |
| [Quick view](review/desktop-quick.jpg) | [Quick view](review/mobile-quick.jpg) |
| [Lookbook](review/desktop-look.jpg) | [Lookbook](review/mobile-look.jpg) |

