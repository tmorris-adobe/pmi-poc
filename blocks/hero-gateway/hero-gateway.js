/*
 * Hero Gateway Block
 * Gateway form section with label and CTA button
 * Migrated from: https://www.luomedical.com/
 */
export default function decorate(block) {
  // Create content wrapper for centering
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'hero-gateway-content';

  // Process each row - flexible structure
  const rows = [...block.children];
  rows.forEach((row) => {
    const cell = row.querySelector('div');
    if (!cell) return;

    // Check for link (CTA button)
    const link = cell.querySelector('a');
    if (link) {
      const btn = link.cloneNode(true);
      btn.className = 'button';
      contentWrapper.appendChild(btn);
      return;
    }

    // Check for heading
    const heading = cell.querySelector('h1, h2, h3, h4');
    if (heading) {
      contentWrapper.appendChild(heading.cloneNode(true));
      return;
    }

    // Check for image (logo)
    const img = cell.querySelector('img');
    if (img) {
      const logoWrapper = document.createElement('div');
      logoWrapper.className = 'hero-gateway-logo';
      logoWrapper.appendChild(img.cloneNode(true));
      contentWrapper.appendChild(logoWrapper);
      return;
    }

    // Otherwise treat as label text
    const text = cell.textContent.trim();
    if (text) {
      const p = document.createElement('p');
      p.className = 'hero-gateway-label';
      p.textContent = text;
      contentWrapper.appendChild(p);
    }
  });

  // Clear block and add wrapped content
  block.textContent = '';
  block.appendChild(contentWrapper);
}
