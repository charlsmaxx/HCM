/**
 * HTML sanitization utility using DOMPurify
 * Prevents XSS attacks by sanitizing user input
 */
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Sanitize HTML string to prevent XSS attacks
 * @param {string} dirty - The HTML string to sanitize
 * @param {object} options - DOMPurify options
 * @returns {string} - Sanitized HTML string
 */
function sanitizeHTML(dirty, options = {}) {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  
  const defaultOptions = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  return DOMPurify.sanitize(dirty, mergedOptions);
}

/**
 * Sanitize plain text (removes all HTML)
 * @param {string} text - The text to sanitize
 * @returns {string} - Plain text without HTML
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

/**
 * Escape HTML entities for safe display
 * @param {string} text - The text to escape
 * @returns {string} - Escaped HTML string
 */
function escapeHTML(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, m => map[m]);
}

module.exports = {
  sanitizeHTML,
  sanitizeText,
  escapeHTML
};

