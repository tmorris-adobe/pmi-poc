import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Link configurations for footer
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
 * Decorate the main footer row with 3-column layout:
 * Left: © Luo 2026 | Center: Patient HCP | Right: Legal links
 * @param {Element} navRow The navigation row (Patient | HCP)
 * @param {Element} legalRow The legal row (© Luo 2026 | Terms | Privacy | Cookie)
 */
function decorateMainRow(navRow, legalRow) {
  const navText = navRow?.querySelector('p')?.textContent.trim() || '';
  const legalText = legalRow?.querySelector('p')?.textContent.trim() || '';

  const navParts = navText.split('|').map((p) => p.trim());
  const legalParts = legalText.split('|').map((p) => p.trim());

  // Create the 3-column structure in the legal row (second row)
  const paragraph = legalRow?.querySelector('p');
  if (!paragraph) return;

  paragraph.textContent = '';

  // Left: Copyright
  const copyrightSpan = document.createElement('span');
  copyrightSpan.className = 'footer-copyright';
  const copyrightPart = legalParts.find((p) => p.startsWith('©'));
  copyrightSpan.textContent = copyrightPart || '© Luo 2026';

  // Center: Nav links
  const navSpan = document.createElement('span');
  navSpan.className = 'footer-nav-links';
  navParts.forEach((part) => {
    const href = FOOTER_LINKS[part];
    if (href) {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = part;
      navSpan.appendChild(link);
    }
  });

  // Right: Legal links
  const legalSpan = document.createElement('span');
  legalSpan.className = 'footer-legal-links';
  legalParts.forEach((part) => {
    if (part.startsWith('©')) return; // Skip copyright, it's on the left

    const href = FOOTER_LINKS[part];
    if (href) {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = part;
      legalSpan.appendChild(link);
    } else if (part === 'Cookie Preferences') {
      const button = document.createElement('button');
      button.className = 'cookie-preferences-btn';
      button.textContent = part;
      legalSpan.appendChild(button);
    }
  });

  paragraph.appendChild(copyrightSpan);
  paragraph.appendChild(navSpan);
  paragraph.appendChild(legalSpan);
}

/**
 * Decorate the language row with proper links
 * @param {Element} langRow The language selector row
 */
function decorateLangRow(langRow) {
  const paragraph = langRow?.querySelector('p');
  if (!paragraph) return;

  const text = paragraph.textContent.trim();
  const parts = text.split('|').map((p) => p.trim());

  if (parts.length <= 1) return;

  paragraph.textContent = '';

  parts.forEach((part) => {
    const href = FOOTER_LINKS[part];
    if (href) {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = part;
      paragraph.appendChild(link);
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

  // Get all rows
  const rows = footer.querySelectorAll(':scope > div');
  const [navRow, legalRow, trademarkRow, langRow] = rows;

  // Decorate the main row (combines nav and legal into 3 columns)
  decorateMainRow(navRow, legalRow);

  // Decorate language row with proper links
  decorateLangRow(langRow);

  block.append(footer);
}
