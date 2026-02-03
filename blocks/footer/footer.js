import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Link configurations for footer navigation and legal links
 */
const FOOTER_LINKS = {
  Patient: '/ca/patient/',
  HCP: '/ca/health-care-professionals/',
  'Terms of Use': '/ca/terms-of-use/',
  'Privacy Policy': '/ca/privacy-policy/',
  English: '/ca/patient/',
  Français: '/ca-fr/patient/',
};

/**
 * Parse pipe-separated text and convert known items to links
 * @param {Element} paragraph The paragraph element to process
 */
function decorateFooterParagraph(paragraph) {
  const text = paragraph.textContent.trim();
  const parts = text.split('|').map((p) => p.trim());

  // Skip if only one part (like trademark text)
  if (parts.length <= 1) return;

  // Clear the paragraph
  paragraph.textContent = '';

  parts.forEach((part, index) => {
    // Check if this part should be a link
    const href = FOOTER_LINKS[part];

    if (href) {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = part;
      paragraph.appendChild(link);
    } else if (part === 'Cookie Preferences') {
      // Cookie preferences button
      const button = document.createElement('button');
      button.className = 'cookie-preferences-btn';
      button.textContent = part;
      paragraph.appendChild(button);
    } else {
      // Plain text (like copyright)
      const span = document.createElement('span');
      span.textContent = part;
      paragraph.appendChild(span);
    }

    // Add separator except for last item
    if (index < parts.length - 1) {
      const sep = document.createElement('span');
      sep.className = 'footer-sep';
      sep.textContent = ' | ';
      paragraph.appendChild(sep);
    }
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Convert pipe-separated text to proper links
  footer.querySelectorAll('p').forEach(decorateFooterParagraph);

  block.append(footer);
}
