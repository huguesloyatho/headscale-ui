/**
 * Theme Management System
 */

const AVAILABLE_THEMES = ['dark', 'light', 'green'];
let currentTheme = 'dark';
let customLogo = null;

/**
 * Apply theme to document
 * @param {string} theme - Theme name (dark, light, green)
 */
function applyTheme(theme) {
  if (!AVAILABLE_THEMES.includes(theme)) {
    console.warn(`Unknown theme: ${theme}, falling back to dark`);
    theme = 'dark';
  }

  document.body.setAttribute('data-theme', theme);
  currentTheme = theme;

  // Store in localStorage
  localStorage.setItem('theme', theme);

  console.log(`Theme applied: ${theme}`);
}

/**
 * Get current theme
 * @returns {string} Current theme name
 */
function getCurrentTheme() {
  return currentTheme;
}

/**
 * Initialize theme from localStorage or default
 */
function initTheme() {
  const stored = localStorage.getItem('theme');
  if (stored && AVAILABLE_THEMES.includes(stored)) {
    applyTheme(stored);
  } else {
    applyTheme('dark');
  }
}

/**
 * Apply custom logo
 * @param {string|null} logoDataUrl - Base64 image data URL or null to remove
 */
function applyCustomLogo(logoDataUrl) {
  const logoElement = document.querySelector('.app-logo');

  if (!logoDataUrl) {
    // Remove custom logo, restore default
    customLogo = null;
    localStorage.removeItem('customLogo');

    if (logoElement) {
      logoElement.textContent = 'Headscale UI';
      logoElement.style.backgroundImage = '';
      logoElement.style.paddingLeft = '';
    }
    return;
  }

  // Validate base64 image
  if (!logoDataUrl.startsWith('data:image/')) {
    console.error('Invalid logo format');
    return;
  }

  customLogo = logoDataUrl;
  localStorage.setItem('customLogo', logoDataUrl);

  if (logoElement) {
    // Display logo as background image
    logoElement.style.backgroundImage = `url(${logoDataUrl})`;
    logoElement.style.backgroundSize = 'contain';
    logoElement.style.backgroundRepeat = 'no-repeat';
    logoElement.style.backgroundPosition = 'left center';
    logoElement.style.paddingLeft = '40px';
    logoElement.textContent = 'Headscale UI';
  }

  console.log('Custom logo applied');
}

/**
 * Get custom logo
 * @returns {string|null} Custom logo data URL or null
 */
function getCustomLogo() {
  return customLogo;
}

/**
 * Initialize custom logo from localStorage
 */
function initCustomLogo() {
  const stored = localStorage.getItem('customLogo');
  if (stored && stored.startsWith('data:image/')) {
    applyCustomLogo(stored);
  }
}

/**
 * Convert File to base64 data URL
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 data URL
 */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      reject(new Error('File size must be less than 1MB'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  // Logo will be initialized when header is created
  setTimeout(initCustomLogo, 100);
});
