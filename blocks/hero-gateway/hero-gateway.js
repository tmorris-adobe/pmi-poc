/*
 * Hero Gateway Block
 * Age verification gateway with location and date of birth form
 * Migrated from: https://www.luomedical.com/
 */

function createGatewayFooter() {
  const footer = document.createElement('footer');
  footer.className = 'gateway-footer';

  footer.innerHTML = `
    <div class="gateway-footer-content">
      <div class="footer-links-row">
        <div class="footer-links-group">
          <a href="/content/ca/patient/index.html" class="footer-link">Patient</a>
          <a href="/content/ca/health-care-professionals/index.html" class="footer-link">HCP</a>
        </div>
        <div class="footer-links-group">
          <a href="/content/ca/terms-of-use/index.html" class="footer-link">Terms of Use</a>
          <a href="/content/ca/privacy-policy/index.html" class="footer-link">Privacy Policy</a>
          <button class="footer-link-btn" id="cookie-prefs-btn">Cookie Preferences</button>
        </div>
      </div>
      <div class="footer-copyright">
        <p class="copyright-main">&copy; Luo ${new Date().getFullYear()}</p>
        <p class="copyright-secondary">&copy; ${new Date().getFullYear()} Verdeya S.A. LUO is a trademark of Verdeya S.A. All rights reserved.</p>
      </div>
    </div>
  `;

  // Cookie preferences button handler
  const cookieBtn = footer.querySelector('#cookie-prefs-btn');
  cookieBtn?.addEventListener('click', () => {
    // eslint-disable-next-line no-undef
    if (typeof OneTrust !== 'undefined' && OneTrust.ToggleInfoDisplay) {
      // eslint-disable-next-line no-undef
      OneTrust.ToggleInfoDisplay();
    }
  });

  return footer;
}

function createGatewayHeader() {
  const header = document.createElement('header');
  header.className = 'gateway-header';

  header.innerHTML = `
    <div class="gateway-header-inner">
      <div class="gateway-header-left">
        <div class="language-dropdown">
          <button class="language-btn" aria-expanded="false" aria-haspopup="true">
            <span>English</span>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <ul class="language-menu" hidden>
            <li><a href="/content/ca/index.html">English</a></li>
            <li><a href="/content/ca/fr/index.html">Français</a></li>
          </ul>
        </div>
      </div>

      <div class="gateway-header-center">
        <a href="/" class="logo-link" aria-label="Luo Home">
          <span class="logo-text">Luo</span>
        </a>
      </div>

      <div class="gateway-header-right">
        <nav class="gateway-nav-primary" aria-label="Primary navigation">
          <a href="/" class="nav-link">Home</a>
          <a href="/content/ca/patient/index.html" class="nav-link">Get Luo</a>
        </nav>

        <nav class="gateway-nav-pills" aria-label="User type">
          <a href="/content/ca/patient/index.html" class="nav-pill active">Patient</a>
          <a href="/content/ca/health-care-professionals/index.html" class="nav-pill">HCP</a>
        </nav>

        <button class="mobile-menu-btn" aria-label="Open menu" aria-expanded="false">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>
    </div>
  `;

  // Add language dropdown toggle
  const langBtn = header.querySelector('.language-btn');
  const langMenu = header.querySelector('.language-menu');
  langBtn?.addEventListener('click', () => {
    const expanded = langBtn.getAttribute('aria-expanded') === 'true';
    langBtn.setAttribute('aria-expanded', !expanded);
    langMenu.hidden = expanded;
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!header.querySelector('.language-dropdown')?.contains(e.target)) {
      langBtn?.setAttribute('aria-expanded', 'false');
      if (langMenu) langMenu.hidden = true;
    }
  });

  // Mobile menu toggle
  const mobileBtn = header.querySelector('.mobile-menu-btn');
  mobileBtn?.addEventListener('click', () => {
    const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
    mobileBtn.setAttribute('aria-expanded', !expanded);
    header.classList.toggle('mobile-open', !expanded);
  });

  return header;
}

const CANADIAN_PROVINCES = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories',
  'Nova Scotia',
  'Nunavut',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon',
];

function createSelect(id, placeholder, options) {
  const select = document.createElement('select');
  select.id = id;
  select.name = id;

  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = placeholder;
  defaultOpt.disabled = true;
  defaultOpt.selected = true;
  select.appendChild(defaultOpt);

  options.forEach((opt) => {
    const option = document.createElement('option');
    option.value = typeof opt === 'object' ? opt.value : opt;
    option.textContent = typeof opt === 'object' ? opt.label : opt;
    select.appendChild(option);
  });

  return select;
}

function createAgeVerificationForm(targetUrl) {
  const form = document.createElement('form');
  form.className = 'age-verification-form';

  // Location field
  const locationGroup = document.createElement('div');
  locationGroup.className = 'form-group';

  const locationLabel = document.createElement('label');
  locationLabel.htmlFor = 'location';
  locationLabel.textContent = 'Where are you located?';
  locationGroup.appendChild(locationLabel);

  const locationSelect = createSelect('location', 'Select your location', CANADIAN_PROVINCES);
  locationGroup.appendChild(locationSelect);
  form.appendChild(locationGroup);

  // Date of birth field
  const dobGroup = document.createElement('div');
  dobGroup.className = 'form-group';

  const dobLabel = document.createElement('label');
  dobLabel.textContent = 'How old are you?';
  dobGroup.appendChild(dobLabel);

  const dateRow = document.createElement('div');
  dateRow.className = 'date-row';

  // Day dropdown (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const daySelect = createSelect('day', 'DD', days);
  dateRow.appendChild(daySelect);

  // Month dropdown (1-12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthSelect = createSelect('month', 'MM', months);
  dateRow.appendChild(monthSelect);

  // Year dropdown (current year back to 1900)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  const yearSelect = createSelect('year', 'YYYY', years);
  dateRow.appendChild(yearSelect);

  dobGroup.appendChild(dateRow);
  form.appendChild(dobGroup);

  // Remember me checkbox
  const rememberGroup = document.createElement('div');
  rememberGroup.className = 'form-group checkbox-group';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'remember';
  checkbox.name = 'remember';

  const checkboxLabel = document.createElement('label');
  checkboxLabel.htmlFor = 'remember';
  checkboxLabel.className = 'checkbox-label';
  checkboxLabel.textContent = 'Remember me: Stores cookie details for longer so we know it is you accessing the site, this will only be on this computer.';

  rememberGroup.appendChild(checkbox);
  rememberGroup.appendChild(checkboxLabel);
  form.appendChild(rememberGroup);

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'button';
  submitBtn.textContent = 'Enter Luo';
  submitBtn.disabled = true;
  form.appendChild(submitBtn);

  // Form validation - enable button when all required fields are filled
  const validateForm = () => {
    const locationVal = locationSelect.value;
    const dayVal = daySelect.value;
    const monthVal = monthSelect.value;
    const yearVal = yearSelect.value;

    submitBtn.disabled = !(locationVal && dayVal && monthVal && yearVal);
  };

  [locationSelect, daySelect, monthSelect, yearSelect].forEach((select) => {
    select.addEventListener('change', validateForm);
  });

  // Form submission - check age and redirect
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const day = parseInt(daySelect.value, 10);
    const month = parseInt(monthSelect.value, 10);
    const year = parseInt(yearSelect.value, 10);

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }

    // Minimum age requirement (18 or 19 depending on province)
    const minAge = ['Alberta', 'Manitoba', 'Quebec'].includes(locationSelect.value) ? 18 : 19;

    if (age >= minAge) {
      // Set cookie if remember me is checked
      if (checkbox.checked) {
        document.cookie = 'luo_age_verified=true; max-age=31536000; path=/';
      } else {
        document.cookie = 'luo_age_verified=true; path=/';
      }
      window.location.href = targetUrl || '/ca/patient/';
    } else {
      // eslint-disable-next-line no-alert
      alert('You must be of legal age in your province to access this site.');
    }
  });

  return form;
}

export default function decorate(block) {
  // Check if user already passed age verification (cookie exists)
  const isVerified = document.cookie.split(';').some((c) => c.trim().startsWith('luo_age_verified='));
  const patientPagePath = '/ca/patient/';
  const isOnPatientPage = window.location.pathname.includes('/patient/');

  if (isVerified) {
    if (isOnPatientPage) {
      // Already on patient page - just hide the gateway block
      block.style.display = 'none';
    } else {
      // On gateway page but already verified - redirect to patient page
      window.location.href = patientPagePath;
    }
    return;
  }

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'hero-gateway-content';

  // Hardcode the target URL for age verification redirect
  // This ensures we always redirect to our local patient page, not the original site
  const targetUrl = '/ca/patient/';
  const rows = [...block.children];
  let starburstPicture = null;
  let languageLinks = null;

  rows.forEach((row, index) => {
    const cells = row.querySelectorAll(':scope > div');
    const firstCell = cells[0];
    if (!firstCell) return;

    // Check for starburst image
    const img = firstCell.querySelector('picture, img');
    if (img && index > 0) {
      starburstPicture = img.cloneNode(true);
      return;
    }

    // Check for language links - look at ALL cells in the row
    const allLinksInRow = row.querySelectorAll('a');
    const rowText = row.textContent;
    if (allLinksInRow.length >= 2 && (rowText.includes('English') || rowText.includes('Français'))) {
      // This is the language links row
      languageLinks = row.cloneNode(true);
      return;
    }

    // Skip link rows - we use hardcoded targetUrl now
    const cellLink = firstCell.querySelector('a');
    if (cellLink && !rowText.includes('English') && !rowText.includes('Français')) {
      return;
    }

    // Text without image is the label
    const text = firstCell.textContent.trim();
    if (text && !firstCell.querySelector('img') && !firstCell.querySelector('a')) {
      const p = document.createElement('p');
      p.className = 'hero-gateway-label';
      p.textContent = text;
      contentWrapper.appendChild(p);
    }
  });

  // Add age verification form
  const form = createAgeVerificationForm(targetUrl);
  contentWrapper.appendChild(form);

  // Add starburst decoration if present
  if (starburstPicture) {
    const starburstWrapper = document.createElement('div');
    starburstWrapper.className = 'hero-gateway-starburst';
    starburstWrapper.appendChild(starburstPicture);
    contentWrapper.appendChild(starburstWrapper);
  }

  // Add language links if present
  if (languageLinks) {
    const langWrapper = document.createElement('div');
    langWrapper.className = 'hero-gateway-languages';
    // Extract just the links from the language row
    const links = languageLinks.querySelectorAll('a');
    links.forEach((link) => {
      const newLink = document.createElement('a');
      newLink.href = link.href;
      newLink.textContent = link.textContent;
      langWrapper.appendChild(newLink);
    });
    contentWrapper.appendChild(langWrapper);
  }

  // Clear block and add wrapped content
  block.textContent = '';
  block.appendChild(contentWrapper);

  // Move the "Enter Your Details" label to appear before the heading in the hero block
  // This matches the original site layout
  const heroBlock = document.querySelector('.hero');
  const label = contentWrapper.querySelector('.hero-gateway-label');
  if (heroBlock && label) {
    const heroH1 = heroBlock.querySelector('h1');
    if (heroH1) {
      // Insert label before the heading
      heroH1.parentElement.insertBefore(label, heroH1);
    }
  }

  // Gateway footer removed - original site only shows language selector on gateway page
}
