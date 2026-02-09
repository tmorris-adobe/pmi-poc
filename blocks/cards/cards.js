/* cards block - product cards with clickable card links */
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    /* make entire card clickable if it contains a link */
    const link = li.querySelector('a');
    if (link) {
      const wrapper = document.createElement('a');
      wrapper.href = link.href;
      wrapper.className = 'cards-card-link';
      /* replace nested links with spans to avoid invalid HTML */
      li.querySelectorAll('a').forEach((a) => {
        const span = document.createElement('span');
        span.className = 'cards-link-text';
        span.textContent = a.textContent;
        a.replaceWith(span);
      });
      while (li.firstChild) wrapper.append(li.firstChild);
      li.append(wrapper);
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);

  /* FAQ cards: add category filter buttons */
  if (block.classList.contains('faq-cards')) {
    const categories = new Set();
    ul.querySelectorAll(':scope > li').forEach((li) => {
      const firstStrong = li.querySelector('strong');
      if (firstStrong) {
        const cat = firstStrong.textContent.trim();
        categories.add(cat);
        li.dataset.category = cat;
      }
    });

    if (categories.size > 0) {
      const filterBar = document.createElement('div');
      filterBar.className = 'faq-cards-filters';

      const showAll = document.createElement('button');
      showAll.textContent = 'Show all';
      showAll.className = 'faq-filter-btn active';
      filterBar.append(showAll);

      categories.forEach((cat) => {
        const btn = document.createElement('button');
        btn.textContent = cat;
        btn.className = 'faq-filter-btn';
        btn.dataset.category = cat;
        filterBar.append(btn);
      });

      filterBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.faq-filter-btn');
        if (!btn) return;
        filterBar.querySelectorAll('.faq-filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const selected = btn.dataset.category;
        ul.querySelectorAll(':scope > li').forEach((li) => {
          li.style.display = (!selected || li.dataset.category === selected) ? '' : 'none';
        });
      });

      block.prepend(filterBar);
    }
  }
}
