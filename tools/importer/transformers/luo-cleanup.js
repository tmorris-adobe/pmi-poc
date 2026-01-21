/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for Luo Medical website cleanup
 * Purpose: Remove cookie banners, navigation, footer, and other non-content elements
 * Applies to: www.luomedical.com (all templates)
 * Generated: 2026-01-16
 *
 * SELECTORS EXTRACTED FROM:
 * - Captured DOM during migration workflow (migration-work/cleaned.html)
 * - Page structure analysis from page migration workflow
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform'
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove cookie consent banner
    // EXTRACTED: Found <div id="onetrust-consent-sdk"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
      '.onetrust-pc-dark-filter'
    ]);

    // Remove header/navigation (handled by header block)
    // EXTRACTED: Found <header id="masthead"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '#masthead',
      '.site-header',
      '#mobile-menu'
    ]);

    // Remove footer (handled by footer block)
    // EXTRACTED: Found <footer id="colophon"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '#colophon',
      '.site-footer'
    ]);

    // Remove language selector (footer/nav concern)
    // EXTRACTED: Found <div class="wpml-ls-statics-footer"> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      '.wpml-ls-statics-footer',
      '.wpml-ls-statics-shortcode_actions'
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Clean up tracking attributes
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      el.removeAttribute('data-aos-easing');
      el.removeAttribute('data-aos-duration');
      el.removeAttribute('data-aos-delay');
    });

    // Remove remaining unwanted elements
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'noscript',
      '.skip-link'
    ]);
  }
}
