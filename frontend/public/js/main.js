/**
 * Main Application Entry Point
 *
 * Headscale UI - Modern Dashboard
 */

import { config } from './config.js';
import { api } from './api.js';
import { createElement, showMessage, createLoader, clearContainer, createTable, createDebugCard } from './utils.js';
import { showApiKey, showAlert, showConfirm } from './modal.js';

class App {
  constructor() {
    this.currentSection = config.defaultSection;
    this.container = null;
  }

  /**
   * Initialize the application
   */
  async init() {
    this.container = document.getElementById('app');
    if (!this.container) {
      console.error('App container not found');
      return;
    }

    this.render();

    // Load current section from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section') || localStorage.getItem(config.storage.currentSection) || config.defaultSection;
    this.loadSection(section);

    // Handle popstate (browser back/forward)
    window.addEventListener('popstate', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const section = urlParams.get('section') || config.defaultSection;
      this.loadSection(section, false);
    });
  }

  /**
   * Render the main application structure
   */
  render() {
    const appContainer = createElement('div', { className: 'app-container' });

    // Header
    const header = this.renderHeader();
    appContainer.appendChild(header);

    // Navigation tabs
    const nav = this.renderNavigation();
    appContainer.appendChild(nav);

    // Main content area
    const main = createElement('main', { className: 'app-main', id: 'main-content' });
    appContainer.appendChild(main);

    clearContainer(this.container);
    this.container.appendChild(appContainer);
  }

  /**
   * Render header
   */
  renderHeader() {
    const header = createElement('header', { className: 'app-header' });
    const h1 = createElement('h1', {}, 'Headscale Admin');
    const subtitle = createElement('p', { className: 'app-subtitle' },
      'Dashboard moderne utilisant l\'API REST de Headscale'
    );

    header.appendChild(h1);
    header.appendChild(subtitle);

    return header;
  }

  /**
   * Render navigation tabs
   */
  renderNavigation() {
    const nav = createElement('nav', { className: 'nav-tabs' });

    Object.entries(config.sections).forEach(([key, label]) => {
      const tab = createElement('button', {
        className: `nav-tab ${key === this.currentSection ? 'nav-tab-active' : ''}`,
        'data-section': key,
        onClick: () => this.loadSection(key),
      }, label);

      nav.appendChild(tab);
    });

    return nav;
  }

  /**
   * Load a section
   */
  async loadSection(section, pushState = true) {
    if (!config.sections[section]) {
      section = config.defaultSection;
    }

    this.currentSection = section;

    // Update URL
    if (pushState) {
      const url = new URL(window.location);
      url.searchParams.set('section', section);
      window.history.pushState({}, '', url);
    }

    // Save to localStorage
    localStorage.setItem(config.storage.currentSection, section);

    // Update navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
      if (tab.dataset.section === section) {
        tab.classList.add('nav-tab-active');
      } else {
        tab.classList.remove('nav-tab-active');
      }
    });

    // Load section content
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    clearContainer(mainContent);
    mainContent.appendChild(createLoader());

    try {
      await this.renderSection(section, mainContent);
    } catch (error) {
      clearContainer(mainContent);
      mainContent.appendChild(showMessage('Erreur', 1, error.message));
    }
  }

  /**
   * Render section content
   */
  async renderSection(section, container) {
    clearContainer(container);

    switch (section) {
      case 'users':
        await this.renderUsers(container);
        break;
      case 'nodes':
        await this.renderNodes(container);
        break;
      case 'apikeys':
        await this.renderApiKeys(container);
        break;
      case 'preauth':
        await this.renderPreauth(container);
        break;
      case 'routes':
        await this.renderRoutes(container);
        break;
      case 'policy':
        await this.renderPolicy(container);
        break;
      case 'info':
        await this.renderInfo(container);
        break;
      case 'settings':
        await this.renderSettings(container);
        break;
      default:
        container.appendChild(showMessage('Erreur', 1, 'Section inconnue'));
    }
  }

  /**
   * Render Users section
   */
  async renderUsers(container) {
    // Form card
    const formCard = this.createUserForm();
    container.appendChild(formCard);

    // Debug card
    const debugCard = createDebugCard('Liste des utilisateurs', 'GET /api/users', { loading: true });
    container.appendChild(debugCard);

    // Data card
    const dataCard = createElement('section', { className: 'card card-fullwidth' });
    const h3 = createElement('h3', {}, 'Liste des utilisateurs');
    dataCard.appendChild(h3);
    container.appendChild(dataCard);

    // Fetch data
    const result = await api.getUsers();

    // Update debug card with result
    container.replaceChild(createDebugCard('Liste des utilisateurs', 'GET /api/users', result), debugCard);

    if (!result.success) {
      dataCard.appendChild(showMessage('Erreur', 1, result.error));
      return;
    }

    // result.data is now directly an array
    const users = Array.isArray(result.data) ? result.data : [];

    if (users.length === 0) {
      dataCard.appendChild(createElement('p', { className: 'hint' }, 'Aucun utilisateur'));
      return;
    }

    // Create table with action buttons
    const table = this.createUsersTable(users);
    dataCard.appendChild(table);
  }

  /**
   * Create users table with action buttons
   */
  createUsersTable(users) {
    const wrapper = createElement('div', { className: 'table-wrapper' });
    const table = createElement('table', {
      className: 'data-table',
      'data-section': 'users',
    });

    // Get headers (exclude 'id' from display if present, but keep for actions)
    const allHeaders = Object.keys(users[0]);
    const displayHeaders = allHeaders.filter(h => h !== 'id');

    // Add Actions column
    const headers = [...displayHeaders, 'Actions'];

    // Create thead
    const thead = createElement('thead');
    const headerRow = createElement('tr');
    headers.forEach(header => {
      const th = createElement('th', { 'data-col': header }, header);
      if (header !== 'Actions') {
        th.draggable = true;
      }
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create tbody
    const tbody = createElement('tbody');
    users.forEach(user => {
      const tr = createElement('tr');

      // Data columns
      displayHeaders.forEach(header => {
        const value = user[header] || '';
        const td = createElement('td', { 'data-col': header }, String(value));
        tr.appendChild(td);
      });

      // Actions column
      const actionsTd = createElement('td', { 'data-col': 'Actions' });
      const deleteBtn = createElement('button', {
        className: 'btn-delete',
        title: 'Supprimer l\'utilisateur'
      }, '🗑️');

      deleteBtn.addEventListener('click', async () => {
        const confirmed = await showConfirm(
          'Confirmation de suppression',
          `Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" ?\n\nCette action est irréversible et supprimera également tous les nœuds associés.`
        );

        if (!confirmed) {
          return;
        }

        deleteBtn.disabled = true;
        deleteBtn.textContent = '⏳';

        // Use ID for deletion, not name (Headscale API requirement)
        const result = await api.deleteUser(user.id);

        if (result.success) {
          await this.loadSection('users', false);
        } else {
          await showAlert('Erreur', `Erreur lors de la suppression: ${result.error}`);
          deleteBtn.disabled = false;
          deleteBtn.textContent = '🗑️';
        }
      });

      actionsTd.appendChild(deleteBtn);
      tr.appendChild(actionsTd);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    wrapper.appendChild(table);
    return wrapper;
  }

  /**
   * Create API keys table with expire buttons
   */
  createApiKeysTable(apiKeys, currentKeyPrefix, showExpired) {
    const wrapper = createElement('div', { className: 'table-wrapper' });
    const table = createElement('table', {
      className: 'data-table',
      'data-section': 'apikeys',
    });

    // Get headers
    const allHeaders = Object.keys(apiKeys[0]);
    const displayHeaders = allHeaders.filter(h => h !== 'id');

    // Add Actions column
    const headers = [...displayHeaders, 'Actions'];

    // Create thead
    const thead = createElement('thead');
    const headerRow = createElement('tr');
    headers.forEach(header => {
      const th = createElement('th', { 'data-col': header }, header);
      if (header !== 'Actions') {
        th.draggable = true;
      }
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create tbody
    const tbody = createElement('tbody');
    apiKeys.forEach(apiKey => {
      // Check if the key is expired
      const isExpired = apiKey.expiration && new Date(apiKey.expiration) < new Date();

      // Skip expired keys if filter is active
      if (isExpired && !showExpired) {
        return;
      }

      const tr = createElement('tr');

      // Check if this is the current key being used
      const isCurrentKey = currentKeyPrefix && apiKey.prefix === currentKeyPrefix;

      // Highlight current key
      if (isCurrentKey) {
        tr.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
        tr.style.borderLeft = '3px solid #22c55e';
      }

      // Data columns
      displayHeaders.forEach(header => {
        let value = apiKey[header] || '';

        // Add badge for current key
        if (header === 'prefix' && isCurrentKey) {
          value = `${value} 🔑 (en cours d'utilisation)`;
        }

        const td = createElement('td', { 'data-col': header }, String(value));
        tr.appendChild(td);
      });

      // Actions column with expire button (only show for active keys)
      const actionsTd = createElement('td', { 'data-col': 'Actions' });

      if (!isExpired) {
        if (isCurrentKey) {
          // For the current key, show a warning instead of button
          const warning = createElement('span', {
            title: 'Vous ne pouvez pas expirer la clé en cours d\'utilisation'
          }, '🔒');
          warning.style.color = '#22c55e';
          warning.style.cursor = 'help';
          actionsTd.appendChild(warning);
        } else {
          // Only show expire button for other active keys
          const expireBtn = createElement('button', {
            className: 'btn-delete',
            title: 'Expirer cette clé API'
          }, '⏹️');

          expireBtn.addEventListener('click', async () => {
            const confirmed = await showConfirm(
              'Confirmation',
              `Êtes-vous sûr de vouloir expirer la clé API avec le préfixe "${apiKey.prefix}" ?\n\nCette action est irréversible.`
            );

            if (!confirmed) {
              return;
            }

            expireBtn.disabled = true;
            expireBtn.textContent = '⏳';

            // Use prefix for expiration (Headscale API requirement)
            const result = await api.expireApiKey(apiKey.prefix);

            if (result.success) {
              await this.loadSection('apikeys', false);
            } else {
              await showAlert('Erreur', `Erreur lors de l'expiration: ${result.error}`);
              expireBtn.disabled = false;
              expireBtn.textContent = '⏹️';
            }
          });

          actionsTd.appendChild(expireBtn);
        }
      } else {
        // For expired keys, show they're already expired
        actionsTd.textContent = 'Expirée';
        actionsTd.style.color = '#9ca3af';
        actionsTd.style.fontStyle = 'italic';
      }

      tr.appendChild(actionsTd);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    wrapper.appendChild(table);
    return wrapper;
  }

  /**
   * Create user form
   */
  createUserForm() {
    const card = createElement('section', { className: 'card' });
    const h2 = createElement('h2', {}, 'Créer un utilisateur');
    card.appendChild(h2);

    const form = createElement('form', { className: 'form-block' });

    const field = createElement('div', { className: 'form-field' });
    const label = createElement('label', {}, 'Nom d\'utilisateur');
    const input = createElement('input', {
      type: 'text',
      name: 'username',
      required: true,
    });
    field.appendChild(label);
    field.appendChild(input);
    form.appendChild(field);

    const button = createElement('button', { type: 'submit' }, 'Créer');
    form.appendChild(button);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      button.disabled = true;
      button.textContent = 'Création...';

      const username = input.value.trim();
      const result = await api.createUser(username);

      if (result.success) {
        input.value = '';
        await this.loadSection('users', false);
      } else {
        await showAlert('Erreur', result.error);
      }

      button.disabled = false;
      button.textContent = 'Créer';
    });

    card.appendChild(form);
    return card;
  }

  /**
   * Render Nodes section
   */
  async renderNodes(container) {
    // Forms card
    const formCard = this.createNodeForms();
    container.appendChild(formCard);

    // Debug card
    const debugCard = createDebugCard('Liste des noeuds', 'GET /api/nodes', { loading: true });
    container.appendChild(debugCard);

    // Data card
    const dataCard = createElement('section', { className: 'card card-fullwidth' });
    const h3 = createElement('h3', {}, 'Liste des noeuds');
    dataCard.appendChild(h3);
    container.appendChild(dataCard);

    const result = await api.getNodes();

    // Update debug card with result
    container.replaceChild(createDebugCard('Liste des noeuds', 'GET /api/nodes', result), debugCard);

    if (!result.success) {
      dataCard.appendChild(showMessage('Erreur', 1, result.error));
      return;
    }

    // result.data is now directly an array
    const nodes = Array.isArray(result.data) ? result.data : [];
    if (nodes.length === 0) {
      dataCard.appendChild(createElement('p', { className: 'hint' }, 'Aucun noeud'));
      return;
    }

    const headers = Object.keys(nodes[0]);
    const table = createTable(headers, nodes, 'nodes');
    dataCard.appendChild(table);
  }

  /**
   * Create node forms
   */
  createNodeForms() {
    const card = createElement('section', { className: 'card' });
    const h2 = createElement('h2', {}, 'Gestion des noeuds');
    card.appendChild(h2);

    // Register form
    const registerForm = this.createNodeRegisterForm();
    card.appendChild(registerForm);

    card.appendChild(createElement('hr', { className: 'divider' }));

    // Rename form
    const renameForm = this.createNodeRenameForm();
    card.appendChild(renameForm);

    return card;
  }

  createNodeRegisterForm() {
    const form = createElement('form', { className: 'form-block' });

    // User field
    const userField = createElement('div', { className: 'form-field' });
    userField.appendChild(createElement('label', {}, 'Utilisateur'));
    const userInput = createElement('input', { type: 'text', name: 'user', required: true });
    userField.appendChild(userInput);
    form.appendChild(userField);

    // Key field
    const keyField = createElement('div', { className: 'form-field' });
    keyField.appendChild(createElement('label', {}, 'Clé de noeud (nodekey:...)'));
    const keyInput = createElement('input', { type: 'text', name: 'key', required: true });
    keyField.appendChild(keyInput);
    form.appendChild(keyField);

    const button = createElement('button', { type: 'submit' }, 'Enregistrer le noeud');
    form.appendChild(button);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      button.disabled = true;
      const result = await api.registerNode(userInput.value.trim(), keyInput.value.trim());
      if (result.success) {
        userInput.value = '';
        keyInput.value = '';
        await this.loadSection('nodes', false);
      } else {
        await showAlert('Erreur', result.error);
      }
      button.disabled = false;
    });

    return form;
  }

  createNodeRenameForm() {
    const form = createElement('form', { className: 'form-block' });

    const idField = createElement('div', { className: 'form-field' });
    idField.appendChild(createElement('label', {}, 'ID du noeud'));
    const idInput = createElement('input', { type: 'text', name: 'node_id', required: true });
    idField.appendChild(idInput);
    form.appendChild(idField);

    const nameField = createElement('div', { className: 'form-field' });
    nameField.appendChild(createElement('label', {}, 'Nouveau hostname'));
    const nameInput = createElement('input', { type: 'text', name: 'hostname', required: true });
    nameField.appendChild(nameInput);
    form.appendChild(nameField);

    const button = createElement('button', { type: 'submit' }, 'Renommer le noeud');
    form.appendChild(button);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      button.disabled = true;
      const result = await api.renameNode(idInput.value.trim(), nameInput.value.trim());
      if (result.success) {
        idInput.value = '';
        nameInput.value = '';
        await this.loadSection('nodes', false);
      } else {
        await showAlert('Erreur', result.error);
      }
      button.disabled = false;
    });

    return form;
  }

  /**
   * Render Settings section (IMPORTANT!)
   */
  async renderSettings(container) {
    const card = createElement('section', { className: 'card' });
    const h2 = createElement('h2', {}, 'Configuration Headscale');
    card.appendChild(h2);

    // Get current settings
    const settingsResult = await api.getSettings();
    const currentSettings = settingsResult.success ? settingsResult.data.data : {};

    const form = createElement('form', { className: 'form-block' });

    // URL field
    const urlField = createElement('div', { className: 'form-field' });
    urlField.appendChild(createElement('label', {}, 'URL de Headscale'));
    const urlInput = createElement('input', {
      type: 'url',
      name: 'url',
      value: currentSettings.headscaleUrl || '',
      placeholder: 'http://headscale:8080',
      required: true,
    });
    urlField.appendChild(urlInput);
    form.appendChild(urlField);

    // API Key field
    const keyField = createElement('div', { className: 'form-field' });
    keyField.appendChild(createElement('label', {}, 'API Key'));
    const keyInput = createElement('input', {
      type: 'password',
      name: 'apiKey',
      placeholder: 'Votre clé API Headscale',
      required: true,
    });
    keyField.appendChild(keyInput);
    form.appendChild(keyField);

    // Buttons
    const buttonGroup = createElement('div', { style: 'display: flex; gap: 10px; margin-top: 10px;' });
    const testButton = createElement('button', { type: 'button' }, 'Tester la connexion');
    const saveButton = createElement('button', { type: 'submit' }, 'Enregistrer');
    buttonGroup.appendChild(testButton);
    buttonGroup.appendChild(saveButton);
    form.appendChild(buttonGroup);

    // Result area
    const resultArea = createElement('div', { className: 'mt-2', id: 'settings-result' });
    form.appendChild(resultArea);

    // Test connection handler
    testButton.addEventListener('click', async () => {
      clearContainer(resultArea);
      testButton.disabled = true;
      testButton.textContent = 'Test en cours...';

      const result = await api.testConnection(urlInput.value, keyInput.value);

      clearContainer(resultArea);
      if (result.success && result.data.success) {
        resultArea.appendChild(showMessage(
          'Test de connexion',
          0,
          result.data.message,
          result.data.data
        ));
      } else {
        resultArea.appendChild(showMessage(
          'Test de connexion',
          1,
          result.data?.message || result.error,
          result.data?.data
        ));
      }

      testButton.disabled = false;
      testButton.textContent = 'Tester la connexion';
    });

    // Save settings handler
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearContainer(resultArea);
      saveButton.disabled = true;
      saveButton.textContent = 'Enregistrement...';

      const result = await api.updateSettings(urlInput.value, keyInput.value);

      clearContainer(resultArea);
      if (result.success && result.data.success) {
        resultArea.appendChild(showMessage(
          'Sauvegarde des paramètres',
          0,
          'Paramètres enregistrés avec succès. L\'application va se reconnecter...'
        ));
        setTimeout(() => window.location.reload(), 2000);
      } else {
        resultArea.appendChild(showMessage(
          'Sauvegarde des paramètres',
          1,
          result.data?.error || result.error
        ));
      }

      saveButton.disabled = false;
      saveButton.textContent = 'Enregistrer';
    });

    card.appendChild(form);

    // Info section
    if (currentSettings.lastConnection) {
      const infoCard = createElement('section', { className: 'card mt-2' });
      infoCard.appendChild(createElement('h3', {}, 'Informations'));
      infoCard.appendChild(createElement('p', {},
        `Dernière connexion réussie : ${new Date(currentSettings.lastConnection).toLocaleString()}`
      ));
      container.appendChild(infoCard);
    }

    container.appendChild(card);
  }

  /**
   * Render other sections (simplified for now)
   */
  async renderApiKeys(container) {
    // Forms card
    const formsCard = this.createApiKeyForms();
    container.appendChild(formsCard);

    // Debug card
    const debugCard = createDebugCard('Liste des API keys', 'GET /api/apikeys', { loading: true });
    container.appendChild(debugCard);

    // Data card
    const dataCard = createElement('section', { className: 'card card-fullwidth' });
    const headerDiv = createElement('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;' });
    const h3 = createElement('h3', {}, 'Liste des API Keys');
    headerDiv.appendChild(h3);

    // Add filter toggle for expired keys
    const filterDiv = createElement('div', { style: 'display: flex; align-items: center; gap: 8px;' });
    const filterLabel = createElement('label', { style: 'font-size: 13px; color: #9ca3af; cursor: pointer;' }, 'Afficher les clés expirées');
    const filterCheckbox = createElement('input', { type: 'checkbox', checked: false });
    filterCheckbox.style.accentColor = '#3b82f6';
    filterDiv.appendChild(filterCheckbox);
    filterDiv.appendChild(filterLabel);
    headerDiv.appendChild(filterDiv);
    dataCard.appendChild(headerDiv);

    container.appendChild(dataCard);

    // Fetch current settings to get the API key prefix
    const settingsResult = await api.getSettings();
    const currentKeyPrefix = settingsResult.success ? settingsResult.data.apiKeyPrefix : null;

    // Fetch API keys
    const result = await api.getApiKeys();

    // Update debug card
    container.replaceChild(createDebugCard('Liste des API keys', 'GET /api/apikeys', result), debugCard);

    if (!result.success) {
      dataCard.appendChild(showMessage('Erreur', 1, result.error));
      return;
    }

    const apiKeys = Array.isArray(result.data) ? result.data : [];
    if (apiKeys.length === 0) {
      dataCard.appendChild(createElement('p', { className: 'hint' }, 'Aucune API key'));
      return;
    }

    // Initial render with expired keys hidden
    const renderTable = (showExpired) => {
      const existingTable = dataCard.querySelector('.table-wrapper');
      if (existingTable) {
        existingTable.remove();
      }
      const table = this.createApiKeysTable(apiKeys, currentKeyPrefix, showExpired);
      dataCard.appendChild(table);
    };

    // Render initial table
    renderTable(false);

    // Add event listener for filter toggle
    filterCheckbox.addEventListener('change', () => {
      renderTable(filterCheckbox.checked);
    });
  }

  /**
   * Create API key forms
   */
  createApiKeyForms() {
    const card = createElement('section', { className: 'card' });
    const h2 = createElement('h2', {}, 'API Keys');
    card.appendChild(h2);

    // Create API key form
    const createForm = createElement('form', { className: 'form-block' });
    const createTitle = createElement('h3', {}, 'Créer une API key');
    createForm.appendChild(createTitle);

    const expirationField = createElement('div', { className: 'form-field' });
    const expirationLabel = createElement('label', {}, 'Expiration (ex : 90d, 24h, 1y) - optionnel');
    const expirationInput = createElement('input', {
      type: 'text',
      name: 'expiration',
      placeholder: '90d',
    });
    expirationField.appendChild(expirationLabel);
    expirationField.appendChild(expirationInput);
    createForm.appendChild(expirationField);

    const createButton = createElement('button', { type: 'submit' }, 'Créer une API key');
    createForm.appendChild(createButton);

    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      createButton.disabled = true;
      createButton.textContent = 'Création...';

      const expiration = expirationInput.value.trim();
      const result = await api.createApiKey(expiration || null);

      if (result.success) {
        expirationInput.value = '';
        // Show the API key in a modal
        if (result.data && result.data.apiKey) {
          await showApiKey(result.data.apiKey);
        }
        await this.loadSection('apikeys', false);
      } else {
        await showAlert('Erreur', result.error);
      }

      createButton.disabled = false;
      createButton.textContent = 'Créer une API key';
    });

    card.appendChild(createForm);

    // Divider
    card.appendChild(createElement('hr', { className: 'divider' }));

    // Expire API key form
    const expireForm = createElement('form', { className: 'form-block' });
    const expireTitle = createElement('h3', {}, 'Expirer une API key');
    expireForm.appendChild(expireTitle);

    const prefixField = createElement('div', { className: 'form-field' });
    const prefixLabel = createElement('label', {}, 'Préfixe de la clé à expirer');
    const prefixInput = createElement('input', {
      type: 'text',
      name: 'prefix',
      required: true,
    });
    prefixField.appendChild(prefixLabel);
    prefixField.appendChild(prefixInput);
    expireForm.appendChild(prefixField);

    const expireButton = createElement('button', { type: 'submit' }, 'Expirer l\'API key');
    expireForm.appendChild(expireButton);

    expireForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const confirmed = await showConfirm(
        'Confirmation',
        `Êtes-vous sûr de vouloir expirer l'API key avec le préfixe "${prefixInput.value}" ?`
      );

      if (!confirmed) {
        return;
      }

      expireButton.disabled = true;
      expireButton.textContent = 'Expiration...';

      const prefix = prefixInput.value.trim();
      const result = await api.expireApiKey(prefix);

      if (result.success) {
        prefixInput.value = '';
        await this.loadSection('apikeys', false);
      } else {
        await showAlert('Erreur', result.error);
      }

      expireButton.disabled = false;
      expireButton.textContent = 'Expirer l\'API key';
    });

    card.appendChild(expireForm);
    return card;
  }

  async renderPreauth(container) {
    // Forms card
    const formsCard = this.createPreauthForms();
    container.appendChild(formsCard);

    // Debug card
    const debugCard = createDebugCard('Clés Preauth', '', { loading: false });
    debugCard.id = 'preauth-debug';
    container.appendChild(debugCard);

    // Results card (will be updated when user loads keys)
    const resultsCard = createElement('section', { className: 'card card-fullwidth', id: 'preauth-results' });
    const h3 = createElement('h3', {}, 'Clés Preauth');
    resultsCard.appendChild(h3);
    resultsCard.appendChild(createElement('p', { className: 'hint' }, 'Sélectionnez un utilisateur pour afficher ses clés preauth'));
    container.appendChild(resultsCard);
  }

  /**
   * Create Preauth key forms
   */
  createPreauthForms() {
    const card = createElement('section', { className: 'card' });
    const h2 = createElement('h2', {}, 'Preauth Keys');
    card.appendChild(h2);

    // Create Preauth key form
    const createForm = createElement('form', { className: 'form-block' });
    const createTitle = createElement('h3', {}, 'Créer une Preauth key');
    createForm.appendChild(createTitle);

    // User field
    const userField = createElement('div', { className: 'form-field' });
    const userLabel = createElement('label', {}, 'Utilisateur (ID uniquement) *');
    const userInput = createElement('input', {
      type: 'number',
      name: 'user',
      required: true,
      placeholder: '1',
      min: '1',
    });
    userField.appendChild(userLabel);
    userField.appendChild(userInput);
    createForm.appendChild(userField);

    // Expiration field
    const expirationField = createElement('div', { className: 'form-field' });
    const expirationLabel = createElement('label', {}, 'Expiration (ex : 48h, 7d, 1y) - optionnel');
    const expirationInput = createElement('input', {
      type: 'text',
      name: 'expiration',
      placeholder: '48h',
    });
    expirationField.appendChild(expirationLabel);
    expirationField.appendChild(expirationInput);
    createForm.appendChild(expirationField);

    // Reusable checkbox
    const reusableField = createElement('div', { className: 'form-field' });
    const reusableLabel = createElement('label', {}, 'Reusable');
    const reusableInput = createElement('input', {
      type: 'checkbox',
      name: 'reusable',
    });
    reusableField.appendChild(reusableInput);
    reusableField.appendChild(reusableLabel);
    createForm.appendChild(reusableField);

    // Ephemeral checkbox
    const ephemeralField = createElement('div', { className: 'form-field' });
    const ephemeralLabel = createElement('label', {}, 'Ephemeral');
    const ephemeralInput = createElement('input', {
      type: 'checkbox',
      name: 'ephemeral',
    });
    ephemeralField.appendChild(ephemeralInput);
    ephemeralField.appendChild(ephemeralLabel);
    createForm.appendChild(ephemeralField);

    const createButton = createElement('button', { type: 'submit' }, 'Créer une Preauth key');
    createForm.appendChild(createButton);

    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      createButton.disabled = true;
      createButton.textContent = 'Création...';

      const user = userInput.value.trim();
      const expiration = expirationInput.value.trim() || null;
      const reusable = reusableInput.checked;
      const ephemeral = ephemeralInput.checked;

      const result = await api.createPreauthKey(user, expiration, reusable, ephemeral);

      // Update debug card with result
      const debugCard = document.getElementById('preauth-debug');
      if (debugCard && debugCard.parentNode) {
        const newDebugCard = createDebugCard('Créer une Preauth key', 'POST /api/preauth', result);
        newDebugCard.id = 'preauth-debug';
        debugCard.parentNode.replaceChild(newDebugCard, debugCard);
      }

      if (result.success) {
        // Show the preauth key in a modal
        if (result.data && result.data.preauthKey && result.data.preauthKey.key) {
          await showApiKey(result.data.preauthKey.key);
        }
        // Clear form
        userInput.value = '';
        expirationInput.value = '';
        reusableInput.checked = false;
        ephemeralInput.checked = false;
      } else {
        await showAlert('Erreur', result.error);
      }

      createButton.disabled = false;
      createButton.textContent = 'Créer une Preauth key';
    });

    card.appendChild(createForm);

    // Divider
    card.appendChild(createElement('hr', { className: 'divider' }));

    // List keys for user form
    const listForm = createElement('form', { className: 'form-block' });
    const listTitle = createElement('h3', {}, 'Afficher les clés d\'un utilisateur');
    listForm.appendChild(listTitle);

    const listUserField = createElement('div', { className: 'form-field' });
    const listUserLabel = createElement('label', {}, 'Utilisateur (ID uniquement)');
    const listUserInput = createElement('input', {
      type: 'number',
      name: 'user',
      required: true,
      placeholder: '1',
      min: '1',
    });
    listUserField.appendChild(listUserLabel);
    listUserField.appendChild(listUserInput);
    listForm.appendChild(listUserField);

    const listButton = createElement('button', { type: 'submit' }, 'Afficher les clés de cet utilisateur');
    listForm.appendChild(listButton);

    listForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      listButton.disabled = true;
      listButton.textContent = 'Chargement...';

      const user = listUserInput.value.trim();
      await this.loadPreauthKeys(user);

      listButton.disabled = false;
      listButton.textContent = 'Afficher les clés de cet utilisateur';
    });

    card.appendChild(listForm);

    // Divider
    card.appendChild(createElement('hr', { className: 'divider' }));

    // Expire Preauth key form
    const expireForm = createElement('form', { className: 'form-block' });
    const expireTitle = createElement('h3', {}, 'Expirer une Preauth key');
    expireForm.appendChild(expireTitle);

    const keyField = createElement('div', { className: 'form-field' });
    const keyLabel = createElement('label', {}, 'Clé à expirer');
    const keyInput = createElement('input', {
      type: 'text',
      name: 'key',
      required: true,
      placeholder: 'Coller la clé complète ici',
    });
    keyField.appendChild(keyLabel);
    keyField.appendChild(keyInput);
    expireForm.appendChild(keyField);

    const expireButton = createElement('button', { type: 'submit' }, 'Expirer la Preauth key');
    expireForm.appendChild(expireButton);

    expireForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Check if user has loaded preauth keys first
      if (!this.currentPreauthUser) {
        await showAlert('Erreur', 'Veuillez d\'abord afficher les clés d\'un utilisateur avant d\'expirer une clé');
        return;
      }

      const confirmed = await showConfirm(
        'Confirmation',
        `Êtes-vous sûr de vouloir expirer cette preauth key ?`
      );

      if (!confirmed) {
        return;
      }

      expireButton.disabled = true;
      expireButton.textContent = 'Expiration...';

      const key = keyInput.value.trim();

      // Use the current user ID from the loaded keys
      const result = await api.expirePreauthKey(this.currentPreauthUser, key);

      // Update debug card with result
      const debugCard = document.getElementById('preauth-debug');
      if (debugCard && debugCard.parentNode) {
        const newDebugCard = createDebugCard('Expirer une Preauth key', 'POST /api/preauth/expire', result);
        newDebugCard.id = 'preauth-debug';
        debugCard.parentNode.replaceChild(newDebugCard, debugCard);
      }

      if (result.success) {
        keyInput.value = '';
        await showAlert('Succès', 'Clé preauth expirée avec succès');
        // Reload the current user's keys
        await this.loadPreauthKeys(this.currentPreauthUser);
      } else {
        await showAlert('Erreur', result.error);
      }

      expireButton.disabled = false;
      expireButton.textContent = 'Expirer la Preauth key';
    });

    card.appendChild(expireForm);
    return card;
  }

  /**
   * Load preauth keys for a specific user
   */
  async loadPreauthKeys(user) {
    const resultsCard = document.getElementById('preauth-results');
    if (!resultsCard) return;

    // Store current user ID for expire operations
    this.currentPreauthUser = user;

    // Clear existing content
    clearContainer(resultsCard);

    const headerDiv = createElement('div', { style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;' });
    const h3 = createElement('h3', {}, `Clés Preauth - Utilisateur: ${user}`);

    // Add checkbox filter for expired keys
    const filterDiv = createElement('div', { style: 'display: flex; align-items: center; gap: 8px;' });
    const showExpiredCheckbox = createElement('input', {
      type: 'checkbox',
      id: 'show-expired-preauth',
      checked: true,
    });
    const showExpiredLabel = createElement('label', {
      htmlFor: 'show-expired-preauth',
      style: 'cursor: pointer; font-size: 13px; user-select: none;'
    }, 'Afficher les clés expirées');
    filterDiv.appendChild(showExpiredCheckbox);
    filterDiv.appendChild(showExpiredLabel);

    headerDiv.appendChild(h3);
    headerDiv.appendChild(filterDiv);
    resultsCard.appendChild(headerDiv);

    // Show loading
    const loader = createLoader();
    resultsCard.appendChild(loader);

    // Fetch data
    const result = await api.getPreauthKeys(user);

    // Remove loader
    loader.remove();

    // Update debug card with result
    const debugCard = document.getElementById('preauth-debug');
    if (debugCard && debugCard.parentNode) {
      const newDebugCard = createDebugCard(`Liste des Preauth keys (utilisateur : ${user})`, `GET /api/preauth?user=${user}`, result);
      newDebugCard.id = 'preauth-debug';
      debugCard.parentNode.replaceChild(newDebugCard, debugCard);
    }

    if (!result.success) {
      resultsCard.appendChild(showMessage('Erreur', 1, result.error));
      return;
    }

    const preauthKeys = Array.isArray(result.data) ? result.data : [];
    if (preauthKeys.length === 0) {
      resultsCard.appendChild(createElement('p', { className: 'hint' }, `Aucune clé preauth pour l'utilisateur ${user}`));
      return;
    }

    // Create table wrapper div
    const tableContainer = createElement('div', { id: 'preauth-table-container' });
    const table = this.createPreauthKeysTable(preauthKeys, showExpiredCheckbox.checked);
    tableContainer.appendChild(table);
    resultsCard.appendChild(tableContainer);

    // Add event listener for filter checkbox
    showExpiredCheckbox.addEventListener('change', () => {
      const container = document.getElementById('preauth-table-container');
      if (container) {
        clearContainer(container);
        const newTable = this.createPreauthKeysTable(preauthKeys, showExpiredCheckbox.checked);
        container.appendChild(newTable);
      }
    });
  }

  /**
   * Create Preauth keys table
   */
  createPreauthKeysTable(preauthKeys, showExpired = true) {
    const wrapper = createElement('div', { className: 'table-wrapper' });
    const table = createElement('table', {
      className: 'data-table',
      'data-section': 'preauth',
    });

    // Get headers
    const allHeaders = Object.keys(preauthKeys[0]);
    const headers = allHeaders;

    // Create thead
    const thead = createElement('thead');
    const headerRow = createElement('tr');
    headers.forEach(header => {
      const th = createElement('th', { 'data-col': header }, header);
      th.draggable = true;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create tbody
    const tbody = createElement('tbody');
    preauthKeys.forEach(preauthKey => {
      // Determine if expired or used
      const isExpired = preauthKey.expiration && new Date(preauthKey.expiration) < new Date();
      const isUsed = preauthKey.used === 'yes' || preauthKey.used === true;

      // Skip expired/used keys if filter is off
      if (!showExpired && (isExpired || isUsed)) {
        return;
      }

      const tr = createElement('tr');

      // Highlight expired or used keys
      if (isExpired || isUsed) {
        tr.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        tr.style.opacity = '0.6';
      }

      headers.forEach(header => {
        const value = preauthKey[header] || '';
        const td = createElement('td', { 'data-col': header }, String(value));
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    wrapper.appendChild(table);
    return wrapper;
  }

  async renderRoutes(container) {
    const card = createElement('section', { className: 'card' });
    card.appendChild(createElement('h2', {}, 'Routes'));
    card.appendChild(createElement('p', { className: 'hint' }, 'Section en développement...'));
    container.appendChild(card);
  }

  async renderPolicy(container) {
    const card = createElement('section', { className: 'card' });
    card.appendChild(createElement('h2', {}, 'Policy'));
    card.appendChild(createElement('p', { className: 'hint' }, 'Section en développement...'));
    container.appendChild(card);
  }

  async renderInfo(container) {
    const card = createElement('section', { className: 'card' });
    card.appendChild(createElement('h2', {}, 'Informations'));

    const result = await api.getHealth();
    if (result.success && result.data) {
      const pre = createElement('pre', { className: 'log-block' }, JSON.stringify(result.data, null, 2));
      card.appendChild(pre);
    } else {
      card.appendChild(createElement('p', { className: 'status-error' }, 'Impossible de récupérer les informations'));
    }

    container.appendChild(card);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
