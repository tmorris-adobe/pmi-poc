/*
 * Hero Gateway HCP Block
 * Healthcare professional verification/disclaimer gateway
 * Migrated from: https://www.luomedical.com/ca/?request=hcp
 */
export default function decorate(block) {
  // Create content wrapper for the card layout
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'hero-gateway-hcp-content';

  // Process each row - flexible structure
  const rows = [...block.children];
  rows.forEach((row) => {
    const cell = row.querySelector('div');
    if (!cell) return;

    // Check for list (ul/ol)
    const list = cell.querySelector('ul, ol');
    if (list) {
      contentWrapper.appendChild(list.cloneNode(true));
      return;
    }

    // Check for link (CTA button)
    const link = cell.querySelector('a');
    if (link) {
      const wrapper = document.createElement('div');
      wrapper.className = 'hero-gateway-hcp-cta';
      const btn = link.cloneNode(true);
      // Check if it's the cancel link
      if (link.textContent.toLowerCase().includes('cancel')) {
        btn.className = 'button secondary';
      } else {
        btn.className = 'button primary';
      }
      wrapper.appendChild(btn);
      contentWrapper.appendChild(wrapper);
      return;
    }

    // Check for heading
    const heading = cell.querySelector('h1, h2, h3, h4');
    if (heading) {
      contentWrapper.appendChild(heading.cloneNode(true));
      return;
    }

    // Check for paragraph
    const para = cell.querySelector('p');
    if (para) {
      contentWrapper.appendChild(para.cloneNode(true));
      return;
    }

    // Otherwise treat as paragraph text
    const text = cell.textContent.trim();
    if (text) {
      const p = document.createElement('p');
      p.textContent = text;
      contentWrapper.appendChild(p);
    }
  });

  // Clear block and add wrapped content
  block.textContent = '';
  block.appendChild(contentWrapper);
}
