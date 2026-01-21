/*
 * Hero Gateway Block
 * Age verification gateway with location and date of birth form
 * Migrated from: https://www.luomedical.com/
 */

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
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'hero-gateway-content';

  // Find target URL from any link in the block
  let targetUrl = '/ca/patient/';
  const link = block.querySelector('a');
  if (link) {
    targetUrl = link.href;
  }

  // Find label text (e.g., "Enter Your Details")
  const rows = [...block.children];
  rows.forEach((row) => {
    const cell = row.querySelector('div');
    if (!cell) return;

    const cellLink = cell.querySelector('a');
    if (cellLink) return; // Skip link rows

    const text = cell.textContent.trim();
    if (text && !cell.querySelector('img')) {
      const p = document.createElement('p');
      p.className = 'hero-gateway-label';
      p.textContent = text;
      contentWrapper.appendChild(p);
    }
  });

  // Add age verification form
  const form = createAgeVerificationForm(targetUrl);
  contentWrapper.appendChild(form);

  // Clear block and add wrapped content
  block.textContent = '';
  block.appendChild(contentWrapper);
}
