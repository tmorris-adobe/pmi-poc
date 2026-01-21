/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-gateway block
 *
 * Source: https://www.luomedical.com/
 * Base Block: hero
 *
 * Block Structure (from markdown example):
 * - Row 1: Background image (optional)
 * - Row 2: Content (eyebrow, heading, CTA)
 *
 * Source HTML Pattern (from captured DOM):
 * <div class="login-surround patient-login-surround">
 *   <h3>Enter Your Details</h3>
 *   <h1>Illuminate Possibilities</h1>
 *   <form>...</form>
 *   <a class="cta-button">Enter Luo</a>
 * </div>
 *
 * Generated: 2026-01-16
 */
export default function parse(element, { document }) {
  // Extract content from source HTML
  // VALIDATED: Selectors extracted from captured DOM (migration-work/cleaned.html)

  // Eyebrow text - h3 element
  // VALIDATED: Found <h3>Enter Your Details</h3> in captured DOM
  const eyebrow = element.querySelector('h3');

  // Main heading - h1 element
  // VALIDATED: Found <h1>Illuminate Possibilities</h1> in captured DOM
  const heading = element.querySelector('h1');

  // CTA button - the submit button wrapper
  // VALIDATED: Found <a class="cta-button"> and input with value "Enter Luo" in captured DOM
  const ctaButton = element.querySelector('.cta-button, #submit-button-wrapper');
  const ctaInput = element.querySelector('input.disabled, input[value="Enter Luo"]');

  // Build cells array matching Hero block structure
  const cells = [];

  // Row 1: Content (eyebrow, heading, CTA combined in single cell)
  const contentCell = [];

  if (eyebrow) {
    // Create paragraph for eyebrow text
    const eyebrowP = document.createElement('p');
    eyebrowP.textContent = eyebrow.textContent;
    contentCell.push(eyebrowP);
  }

  if (heading) {
    // Preserve heading as H1 with italic styling
    const h1 = document.createElement('h1');
    const em = document.createElement('em');
    em.textContent = heading.textContent;
    h1.appendChild(em);
    contentCell.push(h1);
  }

  // Create CTA link
  const ctaLink = document.createElement('a');
  ctaLink.href = '/patient/';
  ctaLink.textContent = 'Enter Luo';
  const strong = document.createElement('strong');
  strong.appendChild(ctaLink);
  contentCell.push(strong);

  cells.push(contentCell);

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Hero-Gateway', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
