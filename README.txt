AK SUGGI — WEBSITE FILES
=======================

START HERE

Open index.html in your browser. The complete website works directly from
these files. There is no installation, localhost server, build process,
subscription or framework to set up.

To put it online, upload the CONTENTS of this folder to your hosting
provider's public web folder (often public_html or www). index.html should
sit at the top of that folder. Keep the assets/ and projects/ folders intact.
It also works inside a subfolder because the links use relative paths.

WHAT'S INCLUDED

index.html             Home, about, discipline links and contact
design.html            Design gallery with six project slots
photo.html             Photo gallery with six project slots
film.html              Film gallery with six project slots
projects/design-01.html through design-06.html
projects/photo-01.html  through photo-06.html
projects/film-01.html   through film-06.html
assets/css/styles.css  All styling, including mobile layouts
assets/js/site.js      Menu enhancements and optional Instagram link
assets/images/         21 local SVG image placeholders
assets/fonts/          Supplied Inter variable font and its licence
assets/favicon.svg     AK browser-tab icon

Each project HTML file is a complete, reusable project template.
All page content is in the HTML files and remains readable without JavaScript.

The design follows the supplied desktop/mobile references: #f4f4f4 background,
Inter typography with tight spacing, stacked name, right-aligned desktop
about section, three disciplines, selected-work galleries, mixed project
image layouts, contact section and footer. On mobile the layouts stack.

BEFORE LAUNCH

1. Replace the image placeholders and their alternative text.
2. Replace the project titles, descriptions and details. These are explicitly
   marked as pending rather than populated with invented clients or projects.
3. Remove any unused project cards from the category pages.
4. Confirm info@suggi.co.uk (copied from the supplied design) and the
   'Available for freelance' line. Contact links open the visitor's email app.
5. Add the correct Instagram link if wanted (instructions below).
6. Update the title and description inside each page's <head> for real projects.

REPLACING IMAGES

Put your JPG, PNG, WebP, AVIF or SVG files inside assets/images/.
Use simple lowercase names with hyphens, for example studio-portrait.jpg.

In the HTML, change an image line from:

  <img src="assets/images/home-hero.svg" alt="Placeholder for AK working in the studio" ...>

to:

  <img src="assets/images/studio-portrait.jpg" alt="AK working on a painting in his studio" ...>

Use an accurate description of YOUR image. Keep the rest of the attributes.
If you know the actual image dimensions, update width and height to match.

On a project page the path starts with ../ because the file is one level down:

  src="../assets/images/my-project.jpg"

Main placeholder map:
  home-hero.svg        Main home-page image
  about-portrait.svg   Portrait above the about text
  footer-portrait.svg  Portrait in every page's footer
  design-01.svg        Design home-page feature and first Design gallery image
  photo-01.svg         Photo home-page feature and first Photo gallery image
  film-01.svg          Film home-page feature and first Film gallery image
  [category]-02.svg through -06.svg   Remaining gallery images

Placeholders are intentionally reused inside the sample project galleries.
Give real project images their own filenames and update the corresponding
src attributes. Updating a single HTML reference only affects that placement.

If you replace an SVG placeholder with a photo, change the extension in the
HTML as well. Do not simply rename a JPG to .svg.

For best loading, resize photos before uploading. About 1800–2400 pixels wide
is a useful starting point for full-width work, and 600–800 pixels for portraits.
Use compressed WebP or JPG where suitable. No external image service is needed.

IMAGE SHAPES AND CROPPING

Each image is wrapped in a <figure>, for example:

  <figure class="media"
    data-shape="landscape"
    data-mobile-shape="portrait"
    style="--position: 50% 50%; --mobile-position: 50% 50%">
    <img src="../assets/images/my-project.jpg" alt="Describe the image"
         width="1600" height="1200" loading="lazy" decoding="async">
  </figure>

data-shape controls the DESKTOP frame:
  landscape = wide (16:9)
  square    = 1:1
  portrait  = upright (4:5)

data-mobile-shape controls the MOBILE frame independently, using the same
three choices. For a landscape hero on mobile, change the hero's
data-mobile-shape="portrait" to data-mobile-shape="landscape" in index.html.

--position controls the crop on desktop; --mobile-position does so on mobile.
The first value is horizontal, the second vertical:
  50% 50% = centre
  50% 20% = keep more of the top in view
  75% 50% = keep more of the right side in view

To show the WHOLE picture without cropping, add data-fit="contain" to the
<figure>. Empty space may appear around it. You can set its background:

  style="background: #101010; --position: 50% 50%; --mobile-position: 50% 50%"

These are editing settings for you, not controls displayed to site visitors.
The home hero and discipline features have slightly different desktop ratios
to match the reference; those overrides live in styles.css.

EDITING A PROJECT

1. Open a file such as projects/design-01.html in a plain-text/code editor.
2. Change 'Project 01' in both <title> and the heading with id="project-title".
3. Replace 'Project description to follow.' and the four 'To be added' fields.
4. Replace gallery images and alternative text, and adjust image shapes.
5. Replace 'Project details to follow.' or remove that entire <p> element.
6. Update the matching title and cover image in design.html.

The image-pair wrapper holds two images side by side on desktop and stacks
them on mobile. Duplicate a full <figure> to add an image, or delete one to
remove it. All galleries are plain HTML.

ADDING OR REMOVING PROJECTS

To add a project, copy projects/design-01.html to a new file in projects/,
for example projects/new-project.html. Edit it as above. Copy an <article>
in design.html and update its link to projects/new-project.html.

Update the 'Next project' link at the bottom of affected project pages to
maintain the order you want. The included six-project sequences loop back
to the first project.

To remove a project, remove its entire <article> card from the gallery and
update any 'Next project' links pointing to it. You can then delete its file.

CONTACT, INSTAGRAM AND REPEATED CONTENT

Email: find and replace info@suggi.co.uk across all HTML files. Both the
visible address and mailto: links need updating. These are email links;
there is no form, inbox backend or pretend submission confirmation.

Instagram: open assets/js/site.js and change this line:
  const instagramURL = '';
to:
  const instagramURL = 'https://www.instagram.com/your_actual_username/';
Use AK's real username. The link stays hidden until it is configured.
No social account was guessed.

The header and footer are deliberately included in each HTML file so the
site works without a server. To change shared wording, use your editor's
'Find and replace in folder' function across the HTML files.

FONT AND COLOURS

Inter is bundled locally; there are no Google Fonts requests. Keep OFL.txt
with the font when uploading or redistributing the website.

At the top of assets/css/styles.css, :root holds the background, text colour,
spacing and margins. Search letter-spacing to adjust the tight typography.
The @media (max-width: 760px) block contains mobile-specific rules.

FILM / VIDEO

The brief uses image galleries for Film, so those are included. If a project
needs an actual video, replace a <figure> with:

  <video controls playsinline preload="metadata"
         poster="../assets/images/film-poster.jpg"
         style="display:block; width:100%; height:auto">
    <source src="../assets/video/my-film.mp4" type="video/mp4">
    Your browser does not support embedded video.
    <a href="../assets/video/my-film.mp4">Download the film</a>.
  </video>

Create assets/video/ and supply the MP4 and poster before adding this markup.

CHECKING YOUR CHANGES

Save the edited file and refresh your browser. Test the category links,
project links, menu, email link and back-to-top links. Narrow the browser
window or check on a phone after upload. Check all final image crops.

The delivered package was checked for local link/asset references, valid HTML
structure, page titles, alternative-text coverage and JavaScript syntax.
It has not been published or run on a localhost server. Visual browser testing
has not been performed. There is no tracking, analytics, CMS or backend.
