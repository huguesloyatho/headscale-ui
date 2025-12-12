/**
 * Modal Dialog System
 */

import { createElement } from './utils.js';

/**
 * Show a confirmation dialog
 */
export function showConfirm(title, message) {
  return new Promise((resolve) => {
    // Create overlay
    const overlay = createElement('div', { className: 'modal-overlay' });

    // Create modal
    const modal = createElement('div', { className: 'modal' });

    // Title
    const titleEl = createElement('h3', { className: 'modal-title' }, title);
    modal.appendChild(titleEl);

    // Message
    const messageEl = createElement('p', { className: 'modal-message' }, message);
    modal.appendChild(messageEl);

    // Buttons
    const buttons = createElement('div', { className: 'modal-buttons' });

    const cancelBtn = createElement('button', {
      className: 'btn-secondary',
    }, 'Annuler');

    const confirmBtn = createElement('button', {
      className: 'btn-primary',
    }, 'OK');

    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(false);
    });

    confirmBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve(true);
    });

    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);
    modal.appendChild(buttons);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Focus confirm button
    confirmBtn.focus();

    // Close on Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        document.removeEventListener('keydown', handleEscape);
        resolve(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
  });
}

/**
 * Show an alert dialog
 */
export function showAlert(title, message) {
  return new Promise((resolve) => {
    const overlay = createElement('div', { className: 'modal-overlay' });
    const modal = createElement('div', { className: 'modal' });

    const titleEl = createElement('h3', { className: 'modal-title' }, title);
    modal.appendChild(titleEl);

    const messageEl = createElement('p', { className: 'modal-message' }, message);
    modal.appendChild(messageEl);

    const buttons = createElement('div', { className: 'modal-buttons' });
    const okBtn = createElement('button', { className: 'btn-primary' }, 'OK');

    okBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve();
    });

    buttons.appendChild(okBtn);
    modal.appendChild(buttons);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    okBtn.focus();

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        document.removeEventListener('keydown', handleEscape);
        resolve();
      }
    };
    document.addEventListener('keydown', handleEscape);
  });
}

/**
 * Show API key after creation (with copy button)
 */
export function showApiKey(apiKey) {
  return new Promise((resolve) => {
    const overlay = createElement('div', { className: 'modal-overlay' });
    const modal = createElement('div', { className: 'modal modal-wide' });

    const titleEl = createElement('h3', { className: 'modal-title' }, '✅ API Key créée avec succès');
    modal.appendChild(titleEl);

    const warning = createElement('p', { className: 'modal-warning' },
      '⚠️ Copiez cette clé maintenant ! Elle ne sera plus jamais affichée.');
    modal.appendChild(warning);

    // API Key display with copy button
    const keyContainer = createElement('div', { className: 'api-key-container' });
    const keyInput = createElement('input', {
      type: 'text',
      className: 'api-key-input',
      value: apiKey,
      readonly: true,
    });

    const copyBtn = createElement('button', { className: 'btn-copy' }, '📋 Copier');

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(apiKey);
        copyBtn.textContent = '✅ Copié !';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = '📋 Copier';
          copyBtn.classList.remove('copied');
        }, 2000);
      } catch (err) {
        // Fallback for older browsers
        keyInput.select();
        document.execCommand('copy');
        copyBtn.textContent = '✅ Copié !';
      }
    });

    keyContainer.appendChild(keyInput);
    keyContainer.appendChild(copyBtn);
    modal.appendChild(keyContainer);

    const buttons = createElement('div', { className: 'modal-buttons' });
    const closeBtn = createElement('button', { className: 'btn-primary' }, 'Fermer');

    closeBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve();
    });

    buttons.appendChild(closeBtn);
    modal.appendChild(buttons);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Select the key automatically
    keyInput.select();
    keyInput.focus();

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        document.removeEventListener('keydown', handleEscape);
        resolve();
      }
    };
    document.addEventListener('keydown', handleEscape);
  });
}
