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
 * @param {number} rowIndex The row index (0-based) to determine layout
 */
function decorateFooterParagraph(paragraph, rowIndex) {
  const text = paragraph.textContent.trim();
  const parts = text.split('|').map((p) => p.trim());

  // Skip if only one part (like trademark text)
  if (parts.length <= 1) return;

  // Clear the paragraph
  paragraph.textContent = '';

  // Row 1 (nav) and Row 3 (language) - no separators, use flex gap
  // Row 2 (legal) - copyright left, links right with separators
  const isLegalRow = rowIndex === 1;

  if (isLegalRow) {
    // Create left side (copyright)
    const leftDiv = document.createElement('span');
    leftDiv.className = 'footer-copyright';

    // Create right side (legal links)
    const rightDiv = document.createElement('span');
    rightDiv.className = 'footer-legal-links';

    parts.forEach((part, index) => {
      const href = FOOTER_LINKS[part];

      if (part.startsWith('©')) {
        // Copyright goes to left side
        leftDiv.textContent = part;
      } else if (href) {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = part;
        rightDiv.appendChild(link);
      } else if (part === 'Cookie Preferences') {
        const button = document.createElement('button');
        button.className = 'cookie-preferences-btn';
        button.textContent = part;
        rightDiv.appendChild(button);
      }
    });

    paragraph.appendChild(leftDiv);
    paragraph.appendChild(rightDiv);
  } else {
    // Nav row and language row - just links with flex gap, no separators
    parts.forEach((part) => {
      const href = FOOTER_LINKS[part];

      if (href) {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = part;
        paragraph.appendChild(link);
      } else {
        const span = document.createElement('span');
        span.textContent = part;
        paragraph.appendChild(span);
      }
    });
  }
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
  // Pass row index based on parent div position
  const rows = footer.querySelectorAll(':scope > div');
  rows.forEach((row, index) => {
    const paragraph = row.querySelector('p');
    if (paragraph) {
      decorateFooterParagraph(paragraph, index);
    }
  });

  block.append(footer);
}
