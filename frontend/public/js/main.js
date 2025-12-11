/**
 * Main Application Entry Point
 *
 * Headscale UI - Modern Dashboard
 */

import { config } from './config.js';
import { api } from './api.js';
import { createElement, showMessage, createLoader, clearContainer, createTable } from './utils.js';

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

    // Data card
    const dataCard = createElement('section', { className: 'card card-fullwidth' });
    const h3 = createElement('h3', {}, 'Liste des utilisateurs');
    dataCard.appendChild(h3);
    container.appendChild(dataCard);

    // Fetch data
    const result = await api.getUsers();
    if (!result.success) {
      dataCard.appendChild(showMessage('Erreur', 1, result.error));
      return;
    }

    const users = result.data.data || result.data.users || [];
    if (users.length === 0) {
      dataCard.appendChild(createElement('p', { className: 'hint' }, 'Aucun utilisateur'));
      return;
    }

    const headers = Object.keys(users[0]);
    const table = createTable(headers, users, 'users');
    dataCard.appendChild(table);
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
        alert(`Erreur: ${result.error}`);
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

    // Data card
    const dataCard = createElement('section', { className: 'card card-fullwidth' });
    const h3 = createElement('h3', {}, 'Liste des noeuds');
    dataCard.appendChild(h3);
    container.appendChild(dataCard);

    const result = await api.getNodes();
    if (!result.success) {
      dataCard.appendChild(showMessage('Erreur', 1, result.error));
      return;
    }

    const nodes = result.data.data || [];
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
        alert(`Erreur: ${result.error}`);
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
        alert(`Erreur: ${result.error}`);
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
    const card = createElement('section', { className: 'card' });
    card.appendChild(createElement('h2', {}, 'API Keys'));
    card.appendChild(createElement('p', { className: 'hint' }, 'Section en développement...'));
    container.appendChild(card);
  }

  async renderPreauth(container) {
    const card = createElement('section', { className: 'card' });
    card.appendChild(createElement('h2', {}, 'Preauth Keys'));
    card.appendChild(createElement('p', { className: 'hint' }, 'Section en développement...'));
    container.appendChild(card);
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
