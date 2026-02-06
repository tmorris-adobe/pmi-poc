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
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

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
