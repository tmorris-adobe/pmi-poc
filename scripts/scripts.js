// Updated: product hero decoration, dosage cards, image carousel, order button
import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    // Check if h1 or picture is already inside a hero block
    if (h1.closest('.hero') || picture.closest('.hero')) {
      return; // Don't create a duplicate hero block
    }
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto block `*/fragments/*` references
    const fragments = main.querySelectorAll('a[href*="/fragments/"]');
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(frag.firstElementChild);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }

    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Restores anchor links that the EDS pipeline strips during HTML processing.
 * @param {Element} main The main element
 */
function fixAnchorLinks(main) {
  const anchorMap = {
    'Order Luo': '#find-your-luo',
    'Commander Luo': '#trouvez-votre-luo',
  };

  main.querySelectorAll('a').forEach((link) => {
    const target = anchorMap[link.textContent.trim()];
    if (target && (link.getAttribute('href') === '/' || link.getAttribute('href') === '')) {
      link.href = target;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const el = document.getElementById(target.substring(1));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    }
  });
}

/**
 * Decorates product hero sections into a two-column layout:
 * image on the left, text content on the right.
 * @param {Element} main The main element
 */

// Image sets per product — each dosage maps to a different product shot
const PRODUCT_IMAGES = {
  'vanilla mint': [ // Vanilla Mint (EN + FR)
    'https://www.luomedical.com/ca/wp-content/uploads/2025/05/Group-1343-1.png',
    'https://www.luomedical.com/ca/wp-content/uploads/2025/05/Frame-1371-1.png',
    'https://www.luomedical.com/ca/wp-content/uploads/2025/05/Group-1345.png',
  ],
  'vanille menthe': [ // Vanilla Mint FR alt text
    'https://www.luomedical.com/ca/wp-content/uploads/2025/05/Group-1343-1.png',
    'https://www.luomedical.com/ca/wp-content/uploads/2025/05/Frame-1371-1.png',
    'https://www.luomedical.com/ca/wp-content/uploads/2025/05/Group-1345.png',
  ],
  'tropical fruit': [ // Tropical Fruit (EN + FR)
    'https://www.luomedical.com/ca/wp-content/uploads/2025/05/Group-1344-1.png',
    'https://www.luomedical.com/ca/wp-content/uploads/2025/05/Group-1346.png',
  ],
  'fruits tropicaux': [ // Tropical Fruit FR alt text
    'https://www.luomedical.com/ca/wp-content/uploads/2025/05/Group-1344-1.png',
    'https://www.luomedical.com/ca/wp-content/uploads/2025/05/Group-1346.png',
  ],
};

function getProductImages(altText) {
  const alt = (altText || '').toLowerCase();
  const match = Object.keys(PRODUCT_IMAGES).find((key) => alt.includes(key));
  return match ? PRODUCT_IMAGES[match] : null;
}

function decorateProductHero(main) {
  const heroSection = main.querySelector('.section.product-hero');
  if (!heroSection) return;

  const wrapper = heroSection.querySelector('.default-content-wrapper');
  if (!wrapper) return;

  // Find the product image (first img in the wrapper)
  const imgParagraph = wrapper.querySelector('p > picture');
  if (!imgParagraph) return;

  const imgContainer = imgParagraph.closest('p');

  // Create two-column structure
  const heroGrid = document.createElement('div');
  heroGrid.className = 'product-hero-grid';

  const leftCol = document.createElement('div');
  leftCol.className = 'product-hero-image';

  const rightCol = document.createElement('div');
  rightCol.className = 'product-hero-content';

  // Build image carousel from dosage-specific images (match by alt text)
  const currentImg = imgContainer.querySelector('img');
  const altText = currentImg ? currentImg.alt : '';
  const pageImages = getProductImages(altText);

  // Remove original image from wrapper so it doesn't end up in rightCol
  imgContainer.remove();

  if (pageImages && pageImages.length > 1) {
    const carousel = document.createElement('div');
    carousel.className = 'product-image-carousel';
    const track = document.createElement('div');
    track.className = 'product-image-track';
    pageImages.forEach((src) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = currentImg ? currentImg.alt : '';
      img.loading = 'eager';
      track.appendChild(img);
    });
    carousel.appendChild(track);
    leftCol.appendChild(carousel);
  } else {
    leftCol.appendChild(imgContainer);
  }

  // Move all remaining children to right column
  while (wrapper.firstChild) {
    rightCol.appendChild(wrapper.firstChild);
  }

  heroGrid.append(leftCol, rightCol);
  wrapper.appendChild(heroGrid);

  // Transform dosage list into interactive selector cards
  const dosageUl = rightCol.querySelector('ul');
  if (dosageUl) {
    const dosageContainer = document.createElement('div');
    dosageContainer.className = 'dosage-selector';

    // Find and preserve the "Select Your Dosage" label from markdown
    const selectLabelP = [...rightCol.querySelectorAll('p')].find(
      (p) => p.querySelector('strong') && (p.textContent.includes('Select') || p.textContent.includes('lectionnez')),
    );
    if (selectLabelP) {
      const label = document.createElement('div');
      label.className = 'dosage-label';
      label.textContent = selectLabelP.textContent.trim();
      dosageContainer.appendChild(label);
    }

    const dosageRow = document.createElement('div');
    dosageRow.className = 'dosage-row';

    const imageTrack = leftCol.querySelector('.product-image-track');
    const trackImages = leftCol.querySelectorAll('.product-image-track img');
    let currentSlide = 0;

    dosageUl.querySelectorAll('li').forEach((li, index) => {
      const card = document.createElement('div');
      card.className = 'dosage-card';

      const strong = li.querySelector('strong');
      const mg = strong ? strong.textContent.trim() : '';
      const desc = li.textContent.replace(mg, '').replace('—', '').trim();

      const mgEl = document.createElement('div');
      mgEl.className = 'dosage-mg';
      mgEl.textContent = mg;

      const descEl = document.createElement('div');
      descEl.className = 'dosage-desc';
      descEl.textContent = desc;

      card.append(mgEl, descEl);
      card.addEventListener('click', () => {
        dosageRow.querySelectorAll('.dosage-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        const orderBtn = dosageContainer.querySelector('.order-button');
        if (orderBtn) orderBtn.classList.add('enabled');
        const errorMsg = dosageContainer.querySelector('.dosage-error');
        if (errorMsg) errorMsg.style.display = 'none';
        // Fade out first, then slide to new image
        if (imageTrack && index !== currentSlide) {
          const prev = currentSlide;
          trackImages[prev].classList.add('leaving');
          // Delay the slide so fade is mostly done before new image arrives
          setTimeout(() => {
            imageTrack.style.transform = `translateX(-${index * 100}%)`;
          }, 300);
          // Clean up after both transitions complete
          setTimeout(() => {
            trackImages[prev].classList.remove('leaving');
            currentSlide = index;
          }, 1000);
        }
      });

      dosageRow.appendChild(card);
    });

    dosageContainer.appendChild(dosageRow);

    // Add Order button — detect language from URL path
    const isFrench = window.location.pathname.includes('/ca-fr/');
    const orderBtn = document.createElement('a');
    orderBtn.href = 'https://www.auroramedical.com/pages/patients';
    orderBtn.className = 'order-button';
    orderBtn.textContent = isFrench ? 'Commander Luo' : 'Order Luo';
    orderBtn.addEventListener('click', (e) => {
      const hasActive = dosageRow.querySelector('.dosage-card.active');
      if (!hasActive) {
        e.preventDefault();
        const errorMsg = dosageContainer.querySelector('.dosage-error');
        if (errorMsg) errorMsg.style.display = 'block';
      }
    });
    dosageContainer.appendChild(orderBtn);

    // Add error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'dosage-error';
    errorMsg.textContent = isFrench ? 'Sélectionnez votre dosage.' : 'Select your dosage first.';
    errorMsg.style.display = 'none';
    dosageContainer.appendChild(errorMsg);

    // Replace the label paragraph and UL with the new selector
    if (selectLabelP) selectLabelP.replaceWith(dosageContainer);
    else dosageUl.before(dosageContainer);
    dosageUl.remove();
  }
}

/**
 * Icon mapping for feature cards in the "Why choose Luo?" section.
 * Maps feature title keywords (EN + FR) to icon URLs from the original site.
 */
const FEATURE_ICONS = {
  ease: 'https://www.luomedical.com/ca/wp-content/uploads/2024/07/icon1-1.svg',
  simplicité: 'https://www.luomedical.com/ca/wp-content/uploads/2024/07/icon1-1.svg',
  quality: 'https://www.luomedical.com/ca/wp-content/uploads/2024/07/icon2-1.svg',
  qualité: 'https://www.luomedical.com/ca/wp-content/uploads/2024/07/icon2-1.svg',
  reliability: 'https://www.luomedical.com/ca/wp-content/uploads/2024/07/icon3-1.svg',
  fiabilité: 'https://www.luomedical.com/ca/wp-content/uploads/2024/07/icon3-1.svg',
  confidence: 'https://www.luomedical.com/ca/wp-content/uploads/2024/09/Luo_Icons_Healthcare_Provider.png',
  confiance: 'https://www.luomedical.com/ca/wp-content/uploads/2024/09/Luo_Icons_Healthcare_Provider.png',
};

/**
 * Decorates feature cards in the "features" section on product pages
 * by adding icons and separating the title from the description text.
 * @param {Element} main The main element
 */
function decorateFeatureCards(main) {
  const featuresSection = main.querySelector('.section.features');
  if (!featuresSection) return;

  // Only apply on product pages
  if (!main.querySelector('.section.product-hero')) return;

  featuresSection.querySelectorAll('.cards li').forEach((li) => {
    const body = li.querySelector('.cards-card-body') || li;
    const strong = body.querySelector('strong');
    if (!strong) return;

    const title = strong.textContent.trim();
    const paragraph = strong.closest('p');
    if (!paragraph) return;

    // Get description text (everything after the strong tag)
    const descText = paragraph.textContent.replace(title, '').trim();

    // Find matching icon by checking if title contains a known keyword
    const titleLower = title.toLowerCase();
    const iconKey = Object.keys(FEATURE_ICONS).find((key) => titleLower.includes(key));
    const iconSrc = iconKey ? FEATURE_ICONS[iconKey] : null;

    // Clear body and rebuild with icon + title + description
    body.textContent = '';

    if (iconSrc) {
      const icon = document.createElement('img');
      icon.src = iconSrc;
      icon.alt = title;
      icon.className = 'feature-icon';
      icon.loading = 'eager';
      body.appendChild(icon);
    }

    const titleEl = document.createElement('h4');
    titleEl.className = 'feature-title';
    titleEl.textContent = title;
    body.appendChild(titleEl);

    const descEl = document.createElement('p');
    descEl.className = 'feature-desc';
    descEl.textContent = descText;
    body.appendChild(descEl);
  });
}

/**
 * Bottles image for the dosing section on product pages.
 * The original site shows 3 bottles (all dosage strengths) beside the dosing text.
 */
const BOTTLES_IMAGE = 'https://www.luomedical.com/ca/wp-content/uploads/2025/05/Luo_New_Bottle_Vanilla_Three_Line-1.png';

/**
 * Product bottle images for the "Find Your Luo" product cards.
 * Maps card title keywords to individual product bottle images.
 */
const PRODUCT_CARD_IMAGES = {
  'vanilla mint': 'https://www.luomedical.com/ca/wp-content/uploads/2025/05/Luo_New_FOP_Bottle_Vanilla_Mint_5mg.png',
  'vanille menthe': 'https://www.luomedical.com/ca/wp-content/uploads/2025/05/Luo_New_FOP_Bottle_Vanilla_Mint_5mg.png',
  'tropical fruit': 'https://www.luomedical.com/ca/wp-content/uploads/2025/05/Luo_New_FOP_Bottle_Tropical_Fruit_75mg.png',
  'fruits tropicaux': 'https://www.luomedical.com/ca/wp-content/uploads/2025/05/Luo_New_FOP_Bottle_Tropical_Fruit_75mg.png',
};

/**
 * Decorates the dosing section on product pages by adding a bottles image
 * to the right of the text content, and enhancing the "Find Your Luo" product cards
 * with individual product bottle images.
 * @param {Element} main The main element
 */
function decorateDosingSection(main) {
  if (!main.querySelector('.section.product-hero')) return;

  // The dosing section is the first .cards-container after .features (not .steps)
  const featuresSection = main.querySelector('.section.features');
  if (!featuresSection) return;

  let dosingSection = featuresSection.nextElementSibling;
  while (dosingSection && !dosingSection.classList.contains('cards-container')) {
    dosingSection = dosingSection.nextElementSibling;
  }
  if (!dosingSection || dosingSection.classList.contains('steps')) return;

  const textWrapper = dosingSection.querySelector('.default-content-wrapper');
  if (!textWrapper) return;

  // Only add if not already decorated
  if (dosingSection.querySelector('.dosing-bottles')) return;

  // Create bottles image container
  const bottlesDiv = document.createElement('div');
  bottlesDiv.className = 'dosing-bottles';
  const bottlesImg = document.createElement('img');
  bottlesImg.src = BOTTLES_IMAGE;
  bottlesImg.alt = 'Luo CBD lozenges bottles';
  bottlesImg.loading = 'eager';
  bottlesDiv.appendChild(bottlesImg);

  // Insert bottles image after the text wrapper (CSS will position as right column)
  textWrapper.after(bottlesDiv);

  // Add a layout class to the section for CSS targeting
  dosingSection.classList.add('dosing-layout');

  // Decorate "Find Your Luo" product cards with bottle images
  const cardsWrapper = dosingSection.querySelector('.cards-wrapper');
  if (!cardsWrapper) return;

  // Add class for CSS targeting
  cardsWrapper.classList.add('find-your-luo');

  cardsWrapper.querySelectorAll('.cards li').forEach((li) => {
    const body = li.querySelector('.cards-card-body') || li;
    const strong = body.querySelector('strong');
    if (!strong) return;

    const titleText = strong.textContent.trim();
    const paragraph = strong.closest('p');
    if (!paragraph) return;

    // Get description and link from the paragraph
    const link = paragraph.closest('a') || paragraph.querySelector('a');
    const fullText = paragraph.textContent;
    const descText = fullText
      .replace(titleText, '')
      .replace(/\s*(Learn More|En savoir plus)\s*$/i, '')
      .trim();
    const linkHref = link ? link.href : '#';
    const isFrench = window.location.pathname.includes('/ca-fr/');
    const linkText = isFrench ? 'En savoir plus' : 'Learn More';

    // Find matching product image
    const titleLower = titleText.toLowerCase();
    const imgKey = Object.keys(PRODUCT_CARD_IMAGES).find((key) => titleLower.includes(key));
    const imgSrc = imgKey ? PRODUCT_CARD_IMAGES[imgKey] : null;

    // Clear body and rebuild with image + title + description
    body.textContent = '';

    if (imgSrc) {
      const imgDiv = document.createElement('div');
      imgDiv.className = 'product-card-image';
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = titleText;
      img.loading = 'eager';
      imgDiv.appendChild(img);
      body.appendChild(imgDiv);
    }

    const titleEl = document.createElement('h4');
    titleEl.className = 'product-card-title';
    titleEl.textContent = titleText;
    body.appendChild(titleEl);

    const descEl = document.createElement('p');
    descEl.className = 'product-card-desc';
    descEl.textContent = descText;
    body.appendChild(descEl);

    // Wrap entire card in a link if one existed
    if (link && link.tagName === 'A') {
      // The entire li is already wrapped in the link by the cards block
      // Just ensure the link wraps properly
    }
  });
}

/**
 * Decorates step cards in the "steps" section by extracting leading numbers
 * from bold titles and creating styled number + title elements.
 * @param {Element} main The main element
 */
function decorateStepCards(main) {
  main.querySelectorAll('.section.steps .cards li').forEach((li) => {
    // Cards block wraps content in .cards-card-body > p > strong
    const strong = li.querySelector('.cards-card-body strong') || li.querySelector('strong');
    if (!strong) return;

    const text = strong.textContent;
    const match = text.match(/^(\d+)\.\s*(.*)/);
    if (!match) return;

    const [, num, title] = match;
    const paragraph = strong.closest('p');
    const descText = paragraph ? paragraph.textContent.replace(text, '').trim() : '';

    // Create step number circle
    const numEl = document.createElement('div');
    numEl.className = 'step-number';
    numEl.textContent = num;

    // Create step title
    const titleEl = document.createElement('div');
    titleEl.className = 'step-title';
    titleEl.textContent = title;

    // Create step description
    const descEl = document.createElement('p');
    descEl.className = 'step-desc';
    descEl.textContent = descText;

    // Clear the li completely and rebuild
    li.textContent = '';
    li.className = '';
    li.append(numEl, titleEl, descEl);
  });
}

/**
 * Decorates FAQ accordion sections by converting bulleted lists into
 * details/summary accordion elements.
 * @param {Element} main The main element
 */
function decorateFaqAccordion(main) {
  main.querySelectorAll('.section.faq-accordion').forEach((section) => {
    const ul = section.querySelector('ul');
    if (!ul) return;

    const accordion = document.createElement('div');
    accordion.className = 'faq-accordion-list';

    ul.querySelectorAll('li').forEach((li) => {
      const strong = li.querySelector('strong');
      if (!strong) return;

      const question = strong.textContent;
      // Get answer text: everything after the strong tag
      const fullText = li.textContent;
      const answer = fullText.replace(question, '').trim();

      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = question;

      const answerEl = document.createElement('div');
      answerEl.className = 'faq-answer';
      answerEl.textContent = answer;

      details.append(summary, answerEl);
      accordion.append(details);
    });

    ul.replaceWith(accordion);
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  fixAnchorLinks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Initializes scroll-triggered animations using Intersection Observer
 * @param {Element} main The main element
 */
function initScrollAnimations(main) {
  // Hero section uses pure CSS keyframe animations (defined in styles.css)
  // No JavaScript needed - animations start automatically on page load

  // Add animations to other sections (non-hero)
  const sections = main.querySelectorAll('.section:not(.hero-patient)');
  sections.forEach((section) => {
    const headings = section.querySelectorAll('h2, h3');
    const cards = section.querySelectorAll('.cards > div');

    headings.forEach((h) => h.classList.add('animate-on-scroll', 'animate-fade-in'));

    cards.forEach((card, i) => {
      card.classList.add('animate-on-scroll', 'animate-fade-up');
      card.classList.add(`delay-${Math.min(i, 4)}`);
    });
  });

  // Create Intersection Observer for element animations
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Create separate observer for background zoom effects (sections with ::before pseudo-elements)
  const bgZoomObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('bg-zoom-active');
        bgZoomObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.2,
  });

  // Observer for section-level animations (banner sections, etc.)
  const sectionAnimObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-animated');
        sectionAnimObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.15,
  });

  // Delay observer start so user sees initial hidden state first
  setTimeout(() => {
    // Observe animated elements
    const animatedElements = main.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    // Observe sections with background zoom (mission section)
    const bgZoomSections = main.querySelectorAll('.section.mission');
    bgZoomSections.forEach((section) => bgZoomObserver.observe(section));

    // Observe banner sections for scroll animations
    const bannerSections = main.querySelectorAll('.section.banner-left, .section.banner-right');
    bannerSections.forEach((section) => sectionAnimObserver.observe(section));

    // Observe FAQ sections for fade-up animation
    const faqSections = main.querySelectorAll('.section.faq-block');
    faqSections.forEach((section) => sectionAnimObserver.observe(section));

    // Observe gradient-cta sections (footer tagline) for fade-up animation
    const ctaSections = main.querySelectorAll('.section.gradient-cta');
    ctaSections.forEach((section) => sectionAnimObserver.observe(section));
  }, 100);

  // Sources section - collapsible toggle
  const sourcesSections = main.querySelectorAll('.section.sources h4');
  sourcesSections.forEach((heading) => {
    heading.addEventListener('click', () => {
      heading.classList.toggle('open');
    });
  });
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  // Post-block-load decorations (run after block JS has processed the DOM)
  decorateProductHero(main);
  decorateFeatureCards(main);
  decorateDosingSection(main);
  decorateStepCards(main);
  decorateFaqAccordion(main);

  // Initialize scroll animations
  initScrollAnimations(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
