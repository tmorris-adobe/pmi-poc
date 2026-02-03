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
 * Parse a single row containing all footer content (copyright, nav, legal)
 * and restructure it into 3-column layout
 * @param {Element} row The row element containing pipe-separated content
 */
function decorateCombinedRow(row) {
  const paragraph = row?.querySelector('p');
  if (!paragraph) return;

  const text = paragraph.textContent.trim();
  const parts = text.split('|').map((p) => p.trim()).filter((p) => p);

  // Clear the paragraph
  paragraph.textContent = '';

  // Find copyright (starts with ©), nav links (Patient, HCP), and legal links
  const copyrightPart = parts.find((p) => p.startsWith('©') && p.includes('Luo'));
  const navParts = parts.filter((p) => p === 'Patient' || p === 'HCP');
  const legalParts = parts.filter((p) =>
    p === 'Terms of Use' ||
    p === 'Privacy Policy' ||
    p === 'Cookie Preferences'
  );

  // Left: Copyright
  const copyrightSpan = document.createElement('span');
  copyrightSpan.className = 'footer-copyright';
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

  // Get all rows (sections)
  const rows = footer.querySelectorAll(':scope > div');

  // Handle different content structures:
  // 3 sections: [main row with all content] [trademark] [language]
  // 4 sections: [nav] [legal] [trademark] [language]
  if (rows.length === 3) {
    // 3-section structure: combined main row
    decorateCombinedRow(rows[0]);
    // rows[1] is trademark - leave as is (already centered via CSS)
    decorateLangRow(rows[2]);
  } else if (rows.length >= 4) {
    // 4-section structure: separate nav and legal rows
    // Combine nav (row 0) and legal (row 1) content into row 1
    const navText = rows[0]?.querySelector('p')?.textContent.trim() || '';
    const legalText = rows[1]?.querySelector('p')?.textContent.trim() || '';
    const combinedText = `${legalText}${navText ? ' | ' + navText : ''}`;

    const legalP = rows[1]?.querySelector('p');
    if (legalP) {
      legalP.textContent = combinedText;
      decorateCombinedRow(rows[1]);
    }

    // Hide the original nav row
    rows[0].style.display = 'none';

    // rows[2] is trademark - leave as is
    decorateLangRow(rows[3]);
  }

  block.append(footer);
}
