/*
 * Hero Legal Block
 * Page title banner for legal/policy pages
 * Migrated from: https://www.luomedical.com/ca/terms-of-use/
 */
export default function decorate(block) {
  const heading = block.querySelector('h1, h2');
  if (heading) {
    heading.className = 'hero-legal-title';
  }
}
