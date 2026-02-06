/*
 * Hero Gateway HCP Block
 * Healthcare professional verification/disclaimer gateway
 * Migrated from: https://www.luomedical.com/ca/?request=hcp
 */
export default function decorate(block) {
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'hero-gateway-hcp-content';

  // Process each row
  const rows = [...block.children];
  let confirmUrl = '/ca/health-care-professionals/';
  let cancelUrl = '/ca/';
  const textElements = [];

  rows.forEach((row) => {
    const cell = row.querySelector('div');
    if (!cell) return;

    // Check for list (ul/ol)
    const list = cell.querySelector('ul, ol');
    if (list) {
      textElements.push(list.cloneNode(true));
      return;
    }

    // Check for link (CTA button)
    const link = cell.querySelector('a');
    if (link) {
      const text = link.textContent.toLowerCase();
      if (text.includes('cancel')) {
        cancelUrl = link.getAttribute('href') || cancelUrl;
      } else {
        confirmUrl = link.getAttribute('href') || confirmUrl;
      }
      return;
    }

    // Check for heading
    const heading = cell.querySelector('h1, h2, h3, h4');
    if (heading) {
      textElements.push(heading.cloneNode(true));
      return;
    }

    // Otherwise treat as paragraph text
    const text = cell.textContent.trim();
    if (text) {
      const p = document.createElement('p');
      p.textContent = text;
      textElements.push(p);
    }
  });

  // Build the disclaimer card
  const card = document.createElement('div');
  card.className = 'hero-gateway-hcp-card';
  textElements.forEach((el) => card.appendChild(el));
  contentWrapper.appendChild(card);

  // Build the checkbox
  const checkboxGroup = document.createElement('div');
  checkboxGroup.className = 'hero-gateway-hcp-checkbox';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'hcp-confirm';

  const checkboxLabel = document.createElement('label');
  checkboxLabel.htmlFor = 'hcp-confirm';
  checkboxLabel.textContent = 'I am a healthcare professional and agree to the above terms.';

  checkboxGroup.appendChild(checkbox);
  checkboxGroup.appendChild(checkboxLabel);
  contentWrapper.appendChild(checkboxGroup);

  // Build the CTA buttons
  const ctaWrapper = document.createElement('div');
  ctaWrapper.className = 'hero-gateway-hcp-cta';

  const confirmBtn = document.createElement('a');
  confirmBtn.href = confirmUrl;
  confirmBtn.className = 'button primary';
  confirmBtn.textContent = 'Enter Luo HCP';
  confirmBtn.setAttribute('aria-disabled', 'true');

  const cancelBtn = document.createElement('a');
  cancelBtn.href = cancelUrl;
  cancelBtn.className = 'button secondary';
  cancelBtn.textContent = 'Cancel';

  ctaWrapper.appendChild(confirmBtn);
  ctaWrapper.appendChild(cancelBtn);
  contentWrapper.appendChild(ctaWrapper);

  // Checkbox enables/disables the confirm button
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      confirmBtn.setAttribute('aria-disabled', 'false');
      confirmBtn.classList.remove('disabled');
    } else {
      confirmBtn.setAttribute('aria-disabled', 'true');
      confirmBtn.classList.add('disabled');
    }
  });

  // Prevent click when disabled
  confirmBtn.addEventListener('click', (e) => {
    if (confirmBtn.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
    }
  });

  // Clear block and add wrapped content
  block.textContent = '';
  block.appendChild(contentWrapper);

  // Add starburst decoration (absolutely positioned behind content)
  const starburst = document.createElement('div');
  starburst.className = 'hero-gateway-hcp-starburst';
  block.appendChild(starburst);

  // Hide default site header and footer on HCP gateway pages
  const siteHeader = document.querySelector('header:not(.gateway-header)');
  if (siteHeader) siteHeader.style.display = 'none';
  const siteFooter = document.querySelector('footer');
  if (siteFooter) siteFooter.style.display = 'none';

  // Create fixed language selector at bottom (matching age verification portal)
  // Find the language paragraph - it's a sibling <p> in the same section wrapper
  const section = block.closest('.section');
  const allParagraphs = section ? section.querySelectorAll('p') : [];
  let languageParagraph = null;
  allParagraphs.forEach((p) => {
    const links = p.querySelectorAll('a');
    if (links.length >= 2) {
      const hasLangLinks = [...links].some((a) => a.textContent.trim() === 'English' || a.textContent.trim() === 'Français');
      if (hasLangLinks) languageParagraph = p;
    }
  });

  if (languageParagraph) {
    const links = languageParagraph.querySelectorAll('a');
    const langSelector = document.createElement('div');
    langSelector.className = 'hero-gateway-hcp-languages';
    links.forEach((link) => {
      const langLink = document.createElement('a');
      langLink.href = link.getAttribute('href');
      langLink.textContent = link.textContent.trim();
      langSelector.appendChild(langLink);
    });
    document.body.appendChild(langSelector);
    // Hide the original language paragraph
    languageParagraph.style.display = 'none';
  }

}
