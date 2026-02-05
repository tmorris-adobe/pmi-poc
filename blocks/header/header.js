import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Creates a fallback header when nav fragment is not available
 * @param {Element} block The header block element
 */
function createFallbackHeader(block) {
  block.textContent = '';
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  // Top bar
  const topBar = document.createElement('div');
  topBar.className = 'header-top';

  const topContainer = document.createElement('div');
  topContainer.className = 'header-top-container';

  // Language selector - left side with both English and French
  const langDiv = document.createElement('div');
  langDiv.className = 'header-lang';

  // Determine current language from URL path
  const currentPath = window.location.pathname;
  const isFrench = currentPath.includes('/ca-fr/');

  const engLink = document.createElement('a');
  engLink.href = isFrench ? currentPath.replace('/ca-fr/', '/ca/') : currentPath;
  engLink.textContent = 'English';
  engLink.className = isFrench ? '' : 'current-lang';

  const separator = document.createElement('span');
  separator.className = 'lang-separator';
  separator.textContent = ' | ';

  const frLink = document.createElement('a');
  frLink.href = isFrench ? currentPath : currentPath.replace('/ca/', '/ca-fr/');
  frLink.textContent = 'Français';
  frLink.className = isFrench ? 'current-lang' : '';

  langDiv.appendChild(engLink);
  langDiv.appendChild(separator);
  langDiv.appendChild(frLink);
  topContainer.appendChild(langDiv);

  // Nav section - right side
  const topRight = document.createElement('div');
  topRight.className = 'header-nav';

  // Nav links
  const linksDiv = document.createElement('div');
  linksDiv.className = 'header-links';
  linksDiv.innerHTML = `<ul>
    <li><a href="/ca/patient/">Patient</a></li>
    <li><a href="/ca/health-care-professionals/">HCP</a></li>
  </ul>`;
  topRight.appendChild(linksDiv);

  topContainer.appendChild(topRight);
  topBar.appendChild(topContainer);

  // Bottom bar with logo
  const bottomBar = document.createElement('div');
  bottomBar.className = 'header-bottom';

  const bottomContainer = document.createElement('div');
  bottomContainer.className = 'header-bottom-container';

  const brandDiv = document.createElement('div');
  brandDiv.className = 'header-brand';
  brandDiv.innerHTML = '<a href="/"><img src="/icons/luo-logo-blue.svg" alt="Luo Medical Cannabis"></a>';
  bottomContainer.appendChild(brandDiv);

  bottomBar.appendChild(bottomContainer);

  // Assemble header
  navWrapper.appendChild(topBar);
  navWrapper.appendChild(bottomBar);

  block.append(navWrapper);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  try {
    // load nav as fragment
    const navMeta = getMetadata('nav');
    const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';

    const fragment = await loadFragment(navPath);

    // Get the content wrapper from fragment
    const contentWrapper = fragment ? fragment.querySelector('.default-content-wrapper') : null;
    if (!contentWrapper) {
      // No content wrapper found, use fallback
      createFallbackHeader(block);
      return;
    }

    // decorate nav DOM
    block.textContent = '';

    // Find elements in the nav content
    const logo = contentWrapper.querySelector('p:has(picture), p:has(img)');
    const navLinks = contentWrapper.querySelector('ul');
    const paragraphs = contentWrapper.querySelectorAll('p');
    const langText = paragraphs.length > 1 ? paragraphs[paragraphs.length - 1] : null;

    // Create two-bar header structure
    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';

    // Top bar: language (left) + nav links (right)
    const topBar = document.createElement('div');
    topBar.className = 'header-top';

    const topContainer = document.createElement('div');
    topContainer.className = 'header-top-container';

    // Language selector - left side with both English and French
    const langDiv = document.createElement('div');
    langDiv.className = 'header-lang';

    // Determine current language from URL path
    const currentPath = window.location.pathname;
    const isFrench = currentPath.includes('/ca-fr/');

    const engLink = document.createElement('a');
    engLink.href = isFrench ? currentPath.replace('/ca-fr/', '/ca/') : currentPath;
    engLink.textContent = 'English';
    engLink.className = isFrench ? '' : 'current-lang';

    const separator = document.createElement('span');
    separator.className = 'lang-separator';
    separator.textContent = ' | ';

    const frLink = document.createElement('a');
    frLink.href = isFrench ? currentPath : currentPath.replace('/ca/', '/ca-fr/');
    frLink.textContent = 'Français';
    frLink.className = isFrench ? 'current-lang' : '';

    langDiv.appendChild(engLink);
    langDiv.appendChild(separator);
    langDiv.appendChild(frLink);
    topContainer.appendChild(langDiv);

    // Nav section - right side
    const topRight = document.createElement('div');
    topRight.className = 'header-nav';

    // Hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = `<button type="button" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
    topRight.appendChild(hamburger);

    // Nav links
    if (navLinks) {
      const linksDiv = document.createElement('div');
      linksDiv.className = 'header-links';
      const ul = document.createElement('ul');
      navLinks.querySelectorAll('li').forEach((li) => {
        const newLi = document.createElement('li');
        const link = li.querySelector('a');
        if (link) {
          const newLink = document.createElement('a');
          newLink.href = link.href;
          newLink.textContent = link.textContent;
          newLi.appendChild(newLink);
        }
        ul.appendChild(newLi);
      });
      linksDiv.appendChild(ul);
      topRight.appendChild(linksDiv);
    }

    topContainer.appendChild(topRight);
    topBar.appendChild(topContainer);

    // Bottom bar: logo only
    const bottomBar = document.createElement('div');
    bottomBar.className = 'header-bottom';

    const bottomContainer = document.createElement('div');
    bottomContainer.className = 'header-bottom-container';

    if (logo) {
      const brandDiv = document.createElement('div');
      brandDiv.className = 'header-brand';
      const link = logo.querySelector('a');
      if (link) {
        const newLink = document.createElement('a');
        newLink.href = link.href;
        const img = link.querySelector('img');
        if (img) {
          const newImg = document.createElement('img');
          newImg.src = img.src;
          newImg.alt = img.alt || 'Luo Medical Cannabis';
          newLink.appendChild(newImg);
        }
        brandDiv.appendChild(newLink);
      }
      bottomContainer.appendChild(brandDiv);
    } else {
      // Fallback logo if not in nav content
      const brandDiv = document.createElement('div');
      brandDiv.className = 'header-brand';
      brandDiv.innerHTML = '<a href="/"><img src="/icons/luo-logo-blue.svg" alt="Luo Medical Cannabis"></a>';
      bottomContainer.appendChild(brandDiv);
    }

    bottomBar.appendChild(bottomContainer);

    // Assemble header
    navWrapper.appendChild(topBar);
    navWrapper.appendChild(bottomBar);

    block.append(navWrapper);
  } catch (e) {
    // Any error, use fallback
    // eslint-disable-next-line no-console
    console.warn('Header: using fallback due to error:', e);
    createFallbackHeader(block);
  }
}
