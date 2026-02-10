export default function decorate(block) {
  const rows = [...block.children];
  const goBackRow = rows[0];
  const headingRow = rows[1];
  const linkRows = rows.slice(2);

  /* build go-back link */
  const goBackLink = goBackRow?.querySelector('a');
  if (goBackLink) {
    goBackLink.className = 'faq-sidebar-go-back';
  }

  /* build FAQ nav list */
  const nav = document.createElement('div');
  nav.className = 'faq-sidebar-nav';

  /* heading */
  const headingEl = headingRow?.querySelector('strong, h4, h3');
  if (headingEl) {
    const h4 = document.createElement('h4');
    h4.textContent = headingEl.textContent;
    nav.append(h4);
  }

  /* FAQ links */
  const currentPath = window.location.pathname.replace(/\/$/, '');
  linkRows.forEach((row) => {
    const link = row.querySelector('a');
    if (link) {
      const item = document.createElement('a');
      item.href = link.getAttribute('href') || link.href;
      item.className = 'faq-sidebar-link';

      const linkPath = item.getAttribute('href').replace(/\/$/, '');
      if (currentPath === linkPath || currentPath.endsWith(linkPath)) {
        item.classList.add('active');
      }

      const span = document.createElement('span');
      span.textContent = link.textContent;
      item.append(span);

      /* arrow icon */
      const arrow = document.createElement('span');
      arrow.className = 'faq-sidebar-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      item.append(arrow);

      nav.append(item);
    }
  });

  /* rebuild block */
  block.replaceChildren();
  if (goBackLink) {
    const goBackWrapper = document.createElement('div');
    goBackWrapper.className = 'faq-sidebar-go-back-wrapper';
    goBackWrapper.append(goBackLink);
    block.append(goBackWrapper);
  }
  block.append(nav);
}
