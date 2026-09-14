# Give AK a visual editor for the site

## Context

`aksuggi` is 24 hand-written HTML files with no build step. Every string, image path and crop
value is hardcoded, and the header/footer/contact chrome is duplicated verbatim **24 times** —
`info@suggi.co.uk` alone appears about 144 times across the site. `README.txt:162-164` tells the
owner to make changes with "find and replace in folder", and the git history shows that already
going wrong: commit `b089c45` hand-removed two `<dt>` rows from 19 files and updated the docs
to match.

The site owner is non-technical and needs to change text, swap images, and point videos at new
YouTube links himself. He should never see HTML, git, or a CSS value.

The site is live at `https://marcdelaney.co.uk/aksuggi/`, served by **GitHub Pages** from the
public repo `mdelaneycastle/aksuggi` (verified: `server: GitHub.com`, `has_pages: true`). The
custom domain sits on the user-pages repo, which is why there's no `CNAME` here — this is a
project page at the `/aksuggi/` subpath, and every link in the site is relative because of it.

**Outcome:** the owner logs into a web form, edits fields, and the site rebuilds itself. The
design cannot be broken by anything he types. Hosting stays on GitHub Pages and the cost stays £0.

## Approach

**Jekyll templates (built natively by GitHub Pages) + Pages CMS as the editing UI.**

Two things must happen, in this order:

1. **Restore the templates.** The chrome moves into `_layouts`/`_includes` so it exists once, and
   the 19 project pages come from one layout driven by 19 small data files. This is the bulk of the
   work and it's worth doing on its own merits — it kills the find-and-replace-24-files problem.
2. **Point a CMS at the data files.** [Pages CMS](https://pagescms.org/) is free (hosted at
   `app.pagescms.org`), open source, GitHub-only, and — decisively — **invites editors by email
   with no GitHub account needed**. It reads Jekyll front matter and `_data/*.yml` as first-class
   content types, with `select`, `image`, `object`-list and `block` field types.

Why Jekyll rather than a small custom Node generator (the main alternative considered):

- **GitHub Pages builds Jekyll natively.** Pushing `_config.yml` is enough — no workflow file, no
  CI, no generated HTML committed back. GitHub maintains the build, not us.
- Jekyll is boring and hireable. Anyone can pick this repo up.
- The CMS quality is identical either way, so Jekyll's zero-infrastructure property decides it.

Why not the other options: a bespoke `/admin/` page needs a pasted GitHub token (fine for a
developer, not for this editor) and would end up containing a page generator anyway, with no tests
and commits straight to production. A runtime `content.json` + JS hydration approach breaks link
previews in every social/chat app (no crawler runs JS), fights the existing `IntersectionObserver`
and parallax code in `site.js` — which snapshots its targets at parse time, before hydration — and
leaves the 24× chrome duplication in place. Both are worse.

## What the owner sees

Five things in the sidebar, and nothing else (`settings.hide: true` removes the config screen):

| Entry | Edits |
|---|---|
| **Site-wide** | Contact email, header strapline, button labels, contact headline, footer labels, footer portrait — applied to all 24 pages at once |
| **Home page** | Tab title, meta description, hero image, intro line, About section, the three discipline panels |
| **Design / Photo / Film headings** | Page titles, section headings, meta descriptions |
| **Projects** (19 entries) | Title, description, details rows, gallery card image, and the gallery itself |
| **Photos & images** | Drag-and-drop media library over `assets/images/` |

Crops and shapes are **dropdowns**, never CSS: "Wide (16:9) / Square (1:1) / Tall (4:5)" and
"Centre / Upper middle (good for faces) / Top / Bottom / Left / Right". A `select` can only emit a
listed value, so an invalid layout is unreachable.

Per the decisions taken: all 19 project pages stay and become editable (`operations.create/
delete/rename: false` — he can't add or remove pages), and each video takes an **uploaded still**
as its poster, keeping the site's zero-third-party-request property intact.

## Content model

```
_data/site.yml                   chrome: email, strapline, contact + footer labels
_data/home.yml                   hero, intro, about, the 3 discipline panels
_data/categories.yml             design/photo/film page + tab titles
_projects/design-01.md … -06.md  ┐
_projects/photo-01.md  … -06.md  ├ 19 files, front matter only, empty body
_projects/film-01.md   … -06.md  │
_projects/film-if-i-were-the-devil.md ┘
```

Home content lives in `_data/home.yml`, **not** in `index.html`'s front matter — so `index.html`
becomes a 3-line stub the CMS never opens, and the CMS entry is a pure YAML file with no body
concept for the editor to stumble into.

Each project carries `category` + `order`, and the three listing pages plus the "Next project →"
pagination are **derived** from that:

```liquid
{%- assign items = site.projects | where: "category", page.category | sort: "order" -%}
```

The `design-06 → design-01` wrap falls out of a modulo. This deletes two chores `README.txt`
documents as manual (lines 132 and 144-146): the gallery card and the next-project link no longer
need hand-syncing.

`thumbnail` stays a separate field rather than being derived from `gallery[0]` — the src matches in
all 19 cases but the alt text deliberately differs ("…Project 01" vs "…Project 01, image 1").

## The three pieces of real logic

**`_includes/figure.html`** — the whole image model, used ~161 times. Two details make byte-identity
fall out for free: `class="media {{ include.class }}"` reproduces the trailing space in
`class="media "`, and `loading="{{ load }}" {{ prio }} decoding=` reproduces the double space in
`loading="lazy"  decoding="async"` when `fetchpriority` is absent. `eager` is purely positional
(hero, first card in a `.works-list`, first figure in a `.project-gallery`) so it comes from
`forloop.first`, not a data field.

**YouTube URL → ID, in Liquid.** He pastes whatever YouTube gave him; the template extracts the ID.
Test path forms (`/shorts/`, `/embed/`, `/live/`, `youtu.be/`) *before* `v=`, then strip query and
fragment junk and truncate to 11 chars:

```liquid
{%- assign vid = vid | split: '&' | first | split: '?' | first | split: '#' | first | slice: 0, 11 -%}
```

Handles `watch?v=…&t=42s`, `youtu.be/…?si=…`, `/shorts/…`, `m.youtube.com/watch?app=desktop&v=…`,
and a bare ID. **Fail-safe:** if the result isn't 11 characters, render the poster with no play
button and no `data-video` — a typo degrades to a still image, never a broken player. A `pattern`
on the CMS field catches it earlier, in the browser.

**The gallery as a `block` list.** Four block types the editor can reorder and drag: `single`,
`pair`, `note`, `video`. One hard constraint — `site.js:52` observes `.project-gallery > *`, so the
loop must emit `<figure>`, `<div class="image-pair">` and `<p class="project-note">` as **direct
children with no wrapper**.

## Keeping CSS and JS untouched

`styles.css` and `site.js` are not modified (one deliberate exception in the last phase).
`site.js` hardcodes its targets, so the templates owe it exactly this:

| `site.js` | Contract |
|---|---|
| `:8` | footer emits `<a data-instagram hidden>Instagram</a>` |
| `:14` | header keeps the native `<details class="menu">` / `<summary>` |
| `:42-45` | `.hero-image`, `.discipline-link .media`, `.work-link .media`, `.project-gallery .media` |
| `:49-54` | 15 reveal selectors — incl. `.project-gallery > *` and `.works-list > article`: **no new wrappers** |
| `:171-188` | `.video-embed[data-video]`, `.video-play`, `data-video-title` |

No CSS class is ever an editable value. That is what makes the design un-breakable.

Every text field goes through Liquid's `escape`. This is byte-neutral here: all apostrophes in the
current copy are curly `’`, and the only `&` is the already-escaped `&amp;` in the home `<title>`.
The one exception is `statement_lines`, which contains a literal `<wbr>` — marked `readonly` so it
can't be destroyed.

## Files

**Created:** `Gemfile`, `Gemfile.lock`, `.gitignore`, `_config.yml`; `_layouts/{base,home,category,project}.html`;
`_includes/{head,header,wordmark,contact,footer,figure,video-figure,work-card}.html`;
`_data/{site,home,categories}.yml`; `_projects/*.md` (19); `.pages.yml`; `EDITOR-GUIDE.md`.

**Modified:** `index.html`, `design.html`, `photo.html`, `film.html` → front-matter stubs.
`README.txt` rewritten (its find-and-replace instructions become actively wrong).

**Deleted:** the 19 `projects/*.html`; `.DS_Store` ×2 (currently committed *and* served);
`1000060862.png` (2.4 MB, referenced by nothing — verified).

**Untouched:** `assets/css/*`, `assets/js/*`, `assets/images/*`, `assets/fonts/*`, `card.html`,
`ak-suggi.vcf`.

**`card.html` is explicitly out of scope.** It has no front matter, so Jekyll copies it byte-for-byte
as a static file — zero risk. It's `noindex`, has its own CSS/JS and design system, and is coupled
to `ak-suggi.vcf` which must change in lockstep. `ak-suggi.vcf` must **not** be added to
`_config.yml`'s `exclude` list.

## Phases

Each phase leaves `main` working and deployable. The riskiest work is first, because it's the only
phase that's cheap to abandon — nothing is live until Phase 2.

**Phase 0 — baseline.** `git tag pre-jekyll HEAD` and push it (the rollback anchor). Install Ruby
3.3 + bundler. Screenshot `/aksuggi/`, `design.html`, `projects/design-01.html` and the devil page
at 1440px and 375px, and play the video. Write the diff harness (below).

**Phase 1 — convert to Jekyll on a branch `jekyll-migration`; prove byte-identity.**
Order matters: `_includes/figure.html` first (161 uses, every later diff depends on it), then
`index.html` alone to zero — it exercises the hero class, the `<br>` caption lines, the `<wbr>`
statement and the `&amp;` title. Then the three listing pages, then the 19 projects. Write a
throwaway extraction script for the project front matter; do not hand-type 19 × ~50 fields.
**Exit criterion: the harness prints all 24 files byte-identical.**

**Phase 2 — deploy.** Merge to `main`. **No repo settings change** — branch-source Pages detects
`_config.yml` and runs Jekyll itself. Verify live against the Phase 0 screenshots. Rollback is
`git revert -m 1 <merge-sha>`. *This phase alone delivers most of the engineering value, CMS or not.*

**Phase 3 — wire up Pages CMS.** Commit `.pages.yml` (a dotfile; never published). Install the
Pages CMS GitHub App **scoped to `mdelaneycastle/aksuggi` only**. Smoke-test it yourself: change
the strapline, upload a real photo with a crop, re-paste the YouTube URL in `youtu.be` form and
confirm `data-video` is still `q38Be7Plti4`. **Then** invite the owner by email.

**Phase 4 — cleanup**, each an independently revertable commit. Delete the now-obsolete
`<!-- HERO: -->` / `<!-- WORK 01: -->` instruction comments from the templates (after Phase 2 —
they are load-bearing for the diff). Move `instagramURL` out of `site.js:6` into `_data/site.yml`
so the owner can change his own Instagram handle; this is the only `site.js` change in the plan.
Rewrite `README.txt` and write `EDITOR-GUIDE.md`.

**Phase 5 — optional, only if oversized uploads become a real problem.** Add a GitHub Actions
build (free, public repo) that runs `vipsthumbnail --size 2400x2400 [Q=82]` over `_site/assets/images`
before `deploy-pages`. In-place, same filenames, so no HTML changes; typically 8 MB → ~350 KB.
Requires flipping Pages source to "GitHub Actions" (rollback: flip it back). Until then the simpler
mitigation is one line in the editor guide: export at 2000–2500 px wide.

## Verification

The gate for Phase 1, run after every template change:

```bash
bundle exec jekyll build -d /tmp/aksuggi-site --trace
fail=0
for f in $(git ls-tree -r --name-only pre-jekyll | grep '\.html$'); do
  diff -u <(git show pre-jekyll:"$f") "/tmp/aksuggi-site/$f" >/dev/null || { echo "DIFF: $f"; fail=1; }
done
[ $fail -eq 0 ] && echo "ALL 24 FILES BYTE-IDENTICAL"
```

Plus: `git diff --stat pre-jekyll -- assets/ card.html ak-suggi.vcf` must be empty, and a
file-list diff of `_site` against the tag should show only the two deliberate removals
(`README.txt` excluded from the build, `1000060862.png` deleted).

Byte-identity is the point: `styles.css` and `site.js` are tightly coupled to exact DOM structure,
and `README.txt:198` admits the scroll choreography has **never been visually tested in a browser**.
An empty diff is the only cheap way to prove the desktop parallax and reveals still work.

End-to-end after Phase 3: the owner logs in on his own device, changes one word, and sees it live
— no GitHub account, no help.

## Two things to verify on first build

- `permalink: /projects/:path.html` must output exactly `projects/design-01.html` (all 19
  pagination links and 19 card hrefs are relative to it). Fallback: an explicit `permalink:` per
  file, `hidden: true` in the CMS.
- Pages CMS `block` field syntax. If polymorphic blocks don't behave as documented, fall back to an
  `object` list with a `type` select — same output, only documented field types.

Also: set `baseurl: ""` and never emit `{{ site.baseurl }}`. Depth is handled by one variable set
in `_config.yml` `defaults` (`root: ""` at top level, `root: "../"` for the `projects` collection),
so `{{ page.root }}assets/css/styles.css` renders correctly at both depths. This keeps every link
relative — the site stays path-agnostic, works from `file://`, and the byte-diff stays possible.

## Risks

- **A build failure cannot take the site down.** Both native Pages and `deploy-pages` only replace
  the live site on success; a failure leaves the last good build serving and emails you. The
  failure mode is "my edit didn't appear".
- **Byte-identity may cost 2-3 rounds of whitespace tuning.** Mechanical and self-verifying — the
  diff names the wrong byte. If one truly resists, relax the criterion for that one spot explicitly
  and write it down; don't relax it silently.
- **Pages CMS holds repo write access.** The repo is already public, so there's nothing to
  exfiltrate; every action is an authored, revertable commit. Structurally, the CMS is a *writer of
  YAML* — if it vanished tomorrow the site keeps building and the YAML stays hand-editable.
- **The owner has no preview.** He saves, then waits ~1 minute. Mitigated by making invalid states
  unreachable, so the worst case is a typo rather than a broken layout.

## Bonus this unlocks (not required, one line each)

Adding, deleting and reordering *gallery blocks* within a project already works. Adding a whole new
project page is `operations.create: true` plus exposing `order` — the listing card and the
pagination cycle then splice themselves in with nothing to hand-sync. Ship with these off; turn
them on once you've seen how he treats the CMS.
