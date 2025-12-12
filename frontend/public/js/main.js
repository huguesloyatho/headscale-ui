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
    const h1 = createElement('h1', { className: 'app-logo' }, 'Headscale UI');
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

    card.appendChild(createElement('hr', { className: 'divider' }));

    // Tags form
    const tagsForm = this.createNodeTagsForm();
    card.appendChild(tagsForm);

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

  createNodeTagsForm() {
    const form = createElement('form', { className: 'form-block' });

    // Title with help hint
    const titleDiv = createElement('div', { style: 'margin-bottom: 8px;' });
    const title = createElement('h3', {}, 'Gérer les tags d\'un noeud');
    titleDiv.appendChild(title);
    const hint = createElement('p', {
      className: 'hint',
      style: 'margin: 4px 0 8px 0; font-size: 12px;'
    }, 'Les tags permettent de grouper les machines dans les règles ACL. Format: tag:nomtag (ex: tag:server, tag:laptop)');
    titleDiv.appendChild(hint);
    form.appendChild(titleDiv);

    const idField = createElement('div', { className: 'form-field' });
    idField.appendChild(createElement('label', {}, 'ID du noeud'));
    const idInput = createElement('input', { type: 'text', name: 'node_id', required: true });
    idField.appendChild(idInput);
    form.appendChild(idField);

    const tagsField = createElement('div', { className: 'form-field' });
    tagsField.appendChild(createElement('label', {}, 'Tags (séparés par des virgules)'));
    const tagsInput = createElement('input', {
      type: 'text',
      name: 'tags',
      placeholder: 'tag:server,tag:production'
    });
    const tagsHint = createElement('p', {
      className: 'hint',
      style: 'margin-top: 4px; font-size: 11px;'
    }, 'Exemples: tag:server, tag:laptop, tag:iot, tag:dev, tag:prod.');
    tagsField.appendChild(tagsInput);
    tagsField.appendChild(tagsHint);
    form.appendChild(tagsField);

    // Buttons container
    const buttonsDiv = createElement('div', { style: 'display: flex; gap: 8px; align-items: center;' });

    const button = createElement('button', { type: 'submit' }, 'Modifier les tags');
    buttonsDiv.appendChild(button);

    const removeButton = createElement('button', {
      type: 'button',
      style: 'background: linear-gradient(135deg, #ef4444, #dc2626);'
    }, 'Supprimer tous les tags');
    buttonsDiv.appendChild(removeButton);

    form.appendChild(buttonsDiv);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      button.disabled = true;
      button.textContent = 'Modification...';

      const nodeId = idInput.value.trim();
      const tagsValue = tagsInput.value.trim();

      // Convert to array, filter empty values
      const tagsArray = tagsValue ? tagsValue.split(',').map(t => t.trim()).filter(t => t) : [];

      // Validate tag format
      for (const tag of tagsArray) {
        if (!tag.startsWith('tag:')) {
          await showAlert('Erreur', `Format invalide: "${tag}". Les tags doivent commencer par "tag:" (ex: tag:server)`);
          button.disabled = false;
          button.textContent = 'Modifier les tags';
          return;
        }
      }

      const result = await api.setNodeTags(nodeId, tagsArray);

      if (result.success) {
        idInput.value = '';
        tagsInput.value = '';
        await this.loadSection('nodes', false);
      } else {
        await showAlert('Erreur', result.error);
      }

      button.disabled = false;
      button.textContent = 'Modifier les tags';
    });

    // Remove button handler
    removeButton.addEventListener('click', async () => {
      const nodeId = idInput.value.trim();

      if (!nodeId) {
        await showAlert('Erreur', 'Veuillez entrer l\'ID du noeud');
        return;
      }

      const confirmed = await showConfirm(
        'Supprimer les tags',
        `Voulez-vous vraiment supprimer tous les tags du noeud ${nodeId} ?\n\n⚠️ BUG CONNU HEADSCALE v0.27:\nLes tags seront supprimés TEMPORAIREMENT mais reviendront après le redémarrage de Headscale.\nC'est un bug serveur (https://github.com/juanfont/headscale/issues/2417)\n\nLe noeud ne fera plus partie d'aucun groupe jusqu'au prochain redémarrage.`
      );

      if (!confirmed) return;

      removeButton.disabled = true;
      removeButton.textContent = 'Suppression...';

      const result = await api.setNodeTags(nodeId, []);

      if (result.success) {
        idInput.value = '';
        tagsInput.value = '';
        await showAlert('Succès', 'Tags supprimés (temporairement)\n\n⚠️ Attention: Les tags reviendront après un redémarrage de Headscale à cause d\'un bug connu.\n\nPour une suppression permanente, contactez l\'administrateur serveur.');
        await this.loadSection('nodes', false);
      } else {
        await showAlert('Erreur', result.error);
      }

      removeButton.disabled = false;
      removeButton.textContent = 'Supprimer tous les tags';
    });

    return form;
  }

  /**
   * Render Settings section (IMPORTANT!)
   */
  async renderSettings(container) {
    // Get current settings
    const settingsResult = await api.getSettings();
    const currentSettings = settingsResult.success ? settingsResult.data : {};
    const preferences = currentSettings.preferences || { language: 'fr', theme: 'dark', customLogo: null };

    // Create grid container for two-column layout
    const gridContainer = createElement('div', {
      style: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px;'
    });

    // ==================== HEADSCALE CONFIGURATION CARD ====================
    const headscaleCard = createElement('section', { className: 'card' });
    headscaleCard.appendChild(createElement('h2', {}, t('settings.headscale.title', 'Configuration Headscale')));

    const headscaleForm = createElement('form', { className: 'form-block' });

    // URL field
    const urlField = createElement('div', { className: 'form-field' });
    urlField.appendChild(createElement('label', {}, t('settings.headscale.url', 'URL de Headscale')));
    const urlInput = createElement('input', {
      type: 'url',
      name: 'url',
      value: currentSettings.headscaleUrl || '',
      placeholder: 'http://headscale:8080',
      required: true,
    });
    urlField.appendChild(urlInput);
    headscaleForm.appendChild(urlField);

    // API Key field
    const keyField = createElement('div', { className: 'form-field' });
    keyField.appendChild(createElement('label', {}, t('settings.headscale.apikey', 'Clé API')));
    const keyInput = createElement('input', {
      type: 'password',
      name: 'apiKey',
      placeholder: 'Votre clé API Headscale',
      required: true,
    });
    keyField.appendChild(keyInput);
    headscaleForm.appendChild(keyField);

    // Buttons
    const headscaleButtonGroup = createElement('div', { style: 'display: flex; gap: 10px; margin-top: 10px;' });
    const testButton = createElement('button', { type: 'button' }, t('settings.headscale.test', 'Tester la connexion'));
    const saveButton = createElement('button', { type: 'submit' }, t('settings.headscale.save', 'Enregistrer'));
    headscaleButtonGroup.appendChild(testButton);
    headscaleButtonGroup.appendChild(saveButton);
    headscaleForm.appendChild(headscaleButtonGroup);

    // Result area
    const headscaleResultArea = createElement('div', { className: 'mt-2', id: 'headscale-result' });
    headscaleForm.appendChild(headscaleResultArea);

    // Test connection handler
    testButton.addEventListener('click', async () => {
      clearContainer(headscaleResultArea);
      testButton.disabled = true;
      testButton.textContent = 'Test en cours...';

      const result = await api.testConnection(urlInput.value, keyInput.value);

      clearContainer(headscaleResultArea);
      if (result.success && result.data.success) {
        headscaleResultArea.appendChild(showMessage(
          'Test de connexion',
          0,
          result.data.message,
          result.data.data
        ));
      } else {
        headscaleResultArea.appendChild(showMessage(
          'Test de connexion',
          1,
          result.data?.message || result.error,
          result.data?.data
        ));
      }

      testButton.disabled = false;
      testButton.textContent = t('settings.headscale.test', 'Tester la connexion');
    });

    // Save settings handler
    headscaleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearContainer(headscaleResultArea);
      saveButton.disabled = true;
      saveButton.textContent = 'Enregistrement...';

      const result = await api.updateSettings(urlInput.value, keyInput.value);

      clearContainer(headscaleResultArea);
      if (result.success && result.data.success) {
        headscaleResultArea.appendChild(showMessage(
          'Sauvegarde des paramètres',
          0,
          'Paramètres enregistrés avec succès. L\'application va se reconnecter...'
        ));
        setTimeout(() => window.location.reload(), 2000);
      } else {
        headscaleResultArea.appendChild(showMessage(
          'Sauvegarde des paramètres',
          1,
          result.data?.error || result.error
        ));
      }

      saveButton.disabled = false;
      saveButton.textContent = t('settings.headscale.save', 'Enregistrer');
    });

    headscaleCard.appendChild(headscaleForm);

    // Info section
    if (currentSettings.lastConnection) {
      const lastConn = createElement('p', { style: 'margin-top: 16px; font-size: 13px; color: #9ca3af;' },
        `Dernière connexion réussie : ${new Date(currentSettings.lastConnection).toLocaleString()}`
      );
      headscaleCard.appendChild(lastConn);
    }

    gridContainer.appendChild(headscaleCard);

    // ==================== USER PREFERENCES CARD ====================
    const preferencesCard = createElement('section', { className: 'card' });
    preferencesCard.appendChild(createElement('h2', {}, t('settings.preferences.title', 'Préférences')));

    const preferencesForm = createElement('form', { className: 'form-block' });

    // Language selector
    const langField = createElement('div', { className: 'form-field' });
    langField.appendChild(createElement('label', {}, t('settings.preferences.language', 'Langue')));
    const langSelect = createElement('select', { name: 'language' });
    const languages = [
      { code: 'fr', name: t('lang.fr', 'Français') },
      { code: 'en', name: t('lang.en', 'English') },
      { code: 'es', name: t('lang.es', 'Español') },
      { code: 'ja', name: t('lang.ja', '日本語') },
      { code: 'zh', name: t('lang.zh', '中文') },
    ];
    languages.forEach(lang => {
      const option = createElement('option', { value: lang.code }, lang.name);
      if (lang.code === preferences.language) {
        option.selected = true;
      }
      langSelect.appendChild(option);
    });
    langField.appendChild(langSelect);
    preferencesForm.appendChild(langField);

    // Theme selector
    const themeField = createElement('div', { className: 'form-field' });
    themeField.appendChild(createElement('label', {}, t('settings.preferences.theme', 'Thème')));
    const themeSelect = createElement('select', { name: 'theme' });
    const themes = [
      { code: 'dark', name: t('theme.dark', 'Sombre') },
      { code: 'light', name: t('theme.light', 'Clair') },
      { code: 'green', name: t('theme.green', 'Écolo') },
    ];
    themes.forEach(theme => {
      const option = createElement('option', { value: theme.code }, theme.name);
      if (theme.code === preferences.theme) {
        option.selected = true;
      }
      themeSelect.appendChild(option);
    });
    themeField.appendChild(themeSelect);
    preferencesForm.appendChild(themeField);

    // Custom logo section
    const logoField = createElement('div', { className: 'form-field' });
    logoField.appendChild(createElement('label', {}, t('settings.preferences.logo', 'Logo personnalisé')));

    // Logo preview
    const logoPreview = createElement('div', {
      style: 'margin: 10px 0; padding: 20px; border: 2px dashed #475569; border-radius: 8px; text-align: center; min-height: 80px; display: flex; align-items: center; justify-content: center;'
    });

    if (preferences.customLogo) {
      const previewImg = createElement('img', {
        src: preferences.customLogo,
        style: 'max-width: 100%; max-height: 60px;'
      });
      logoPreview.appendChild(previewImg);
    } else {
      logoPreview.appendChild(createElement('span', { style: 'color: #9ca3af;' }, 'Aucun logo personnalisé'));
    }

    logoField.appendChild(logoPreview);

    // File input (hidden)
    const logoFileInput = createElement('input', {
      type: 'file',
      accept: 'image/*',
      style: 'display: none;'
    });

    // Upload button
    const logoButtonGroup = createElement('div', { style: 'display: flex; gap: 10px;' });
    const uploadLogoButton = createElement('button', { type: 'button' }, t('settings.preferences.logo.upload', 'Télécharger un logo'));
    const removeLogoButton = createElement('button', {
      type: 'button',
      style: 'background: #ef4444;' + (preferences.customLogo ? '' : ' display: none;')
    }, t('settings.preferences.logo.remove', 'Supprimer le logo'));

    uploadLogoButton.addEventListener('click', () => logoFileInput.click());

    logoFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const dataUrl = await fileToDataUrl(file);

        // Update preview
        clearContainer(logoPreview);
        const previewImg = createElement('img', {
          src: dataUrl,
          style: 'max-width: 100%; max-height: 60px;'
        });
        logoPreview.appendChild(previewImg);

        // Store temporarily (will be saved on form submit)
        logoFileInput.dataset.logoData = dataUrl;
        removeLogoButton.style.display = '';
      } catch (error) {
        alert(error.message);
      }
    });

    removeLogoButton.addEventListener('click', () => {
      clearContainer(logoPreview);
      logoPreview.appendChild(createElement('span', { style: 'color: #9ca3af;' }, 'Aucun logo personnalisé'));
      logoFileInput.dataset.logoData = null;
      logoFileInput.value = '';
      removeLogoButton.style.display = 'none';
    });

    logoButtonGroup.appendChild(uploadLogoButton);
    logoButtonGroup.appendChild(removeLogoButton);
    logoField.appendChild(logoButtonGroup);

    const logoHelp = createElement('p', { style: 'font-size: 12px; color: #9ca3af; margin-top: 5px;' },
      t('settings.preferences.logo.max', 'Taille maximale : 1 MB')
    );
    logoField.appendChild(logoHelp);

    preferencesForm.appendChild(logoField);

    // Save preferences button
    const preferencesButtonGroup = createElement('div', { style: 'margin-top: 16px;' });
    const savePrefButton = createElement('button', { type: 'submit' }, t('common.save', 'Enregistrer'));
    preferencesButtonGroup.appendChild(savePrefButton);
    preferencesForm.appendChild(preferencesButtonGroup);

    // Result area
    const preferencesResultArea = createElement('div', { className: 'mt-2', id: 'preferences-result' });
    preferencesForm.appendChild(preferencesResultArea);

    // Save preferences handler
    preferencesForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearContainer(preferencesResultArea);
      savePrefButton.disabled = true;
      savePrefButton.textContent = 'Enregistrement...';

      const newPreferences = {
        language: langSelect.value,
        theme: themeSelect.value,
        customLogo: logoFileInput.dataset.logoData === 'null' ? null : (logoFileInput.dataset.logoData || preferences.customLogo),
      };

      const result = await api.updatePreferences(newPreferences);

      clearContainer(preferencesResultArea);
      if (result.success) {
        preferencesResultArea.appendChild(showMessage(
          'Préférences',
          0,
          'Préférences sauvegardées ! Application en cours...'
        ));

        // Apply changes immediately
        setLanguage(newPreferences.language);
        applyTheme(newPreferences.theme);
        applyCustomLogo(newPreferences.customLogo);

        // Reload page to apply language changes to all UI
        setTimeout(() => window.location.reload(), 1500);
      } else {
        preferencesResultArea.appendChild(showMessage(
          'Préférences',
          1,
          result.error || 'Erreur lors de la sauvegarde'
        ));
      }

      savePrefButton.disabled = false;
      savePrefButton.textContent = t('common.save', 'Enregistrer');
    });

    preferencesCard.appendChild(preferencesForm);
    gridContainer.appendChild(preferencesCard);

    container.appendChild(gridContainer);
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
    // Forms card
    const formsCard = this.createRouteForms();
    container.appendChild(formsCard);

    // Debug card
    const debugCard = createDebugCard('Liste des routes', 'GET /api/routes', { loading: true });
    debugCard.id = 'routes-debug';
    container.appendChild(debugCard);

    // Data card
    const dataCard = createElement('section', { className: 'card card-fullwidth' });
    const h3 = createElement('h3', {}, 'Routes');
    dataCard.appendChild(h3);

    // Show loading
    const loader = createLoader();
    dataCard.appendChild(loader);

    container.appendChild(dataCard);

    // Fetch data
    const result = await api.getRoutes();

    // Remove loader
    loader.remove();

    // Update debug card with result
    if (debugCard && debugCard.parentNode) {
      const newDebugCard = createDebugCard('Liste des routes', 'GET /api/routes', result);
      newDebugCard.id = 'routes-debug';
      debugCard.parentNode.replaceChild(newDebugCard, debugCard);
    }

    if (!result.success) {
      dataCard.appendChild(showMessage('Erreur', 1, result.error));
      return;
    }

    const routes = Array.isArray(result.data) ? result.data : [];
    if (routes.length === 0) {
      dataCard.appendChild(createElement('p', { className: 'hint' }, 'Aucune route trouvée'));
      return;
    }

    // Extract headers from first route object
    const headers = routes.length > 0 ? Object.keys(routes[0]) : [];
    const table = createTable(headers, routes, 'routes');
    dataCard.appendChild(table);
  }

  /**
   * Create Route forms
   */
  createRouteForms() {
    const card = createElement('section', { className: 'card' });
    const h2 = createElement('h2', {}, 'Routes / Subnet router');
    card.appendChild(h2);

    const hint1 = createElement('p', { className: 'hint' }, '1) Sur le noeud routeur : sudo tailscale set --advertise-routes=192.168.1.0/24,10.0.0.0/8 (ou via tailscale up --advertise-routes=...)');
    const hint2 = createElement('p', { className: 'hint' }, '2) ICI, tu approuves les routes via nodes approve-routes --identifier <node> --routes \'\'');
    card.appendChild(hint1);
    card.appendChild(hint2);

    // Approve routes form
    const approveForm = createElement('form', { className: 'form-block' });
    const approveTitle = createElement('h3', {}, 'Approuver les routes');
    approveForm.appendChild(approveTitle);

    // Node ID field (column 14 in the table)
    const nodeIdField = createElement('div', { className: 'form-field' });
    const nodeIdLabel = createElement('label', {}, 'ID du noeud (colonne 14 dans le tableau des routes)');
    const nodeIdInput = createElement('input', {
      type: 'number',
      name: 'nodeId',
      required: true,
      placeholder: '1',
      min: '1',
    });
    nodeIdField.appendChild(nodeIdLabel);
    nodeIdField.appendChild(nodeIdInput);
    approveForm.appendChild(nodeIdField);

    // Routes field
    const routesField = createElement('div', { className: 'form-field' });
    const routesLabel = createElement('label', {}, 'Routes à approuver (liste séparée par des virgules, ex : 192.168.1.0/24,10.0.0.0/8)');
    const routesInput = createElement('input', {
      type: 'text',
      name: 'routes',
      required: true,
      placeholder: '192.168.1.0/24,10.0.0.0/8',
    });
    const routesHint = createElement('p', { className: 'hint', style: 'margin-top: 4px; font-size: 12px;' }, 'Astuce : mettre "" pour supprimer l\'annonce de routes');
    routesField.appendChild(routesLabel);
    routesField.appendChild(routesInput);
    routesField.appendChild(routesHint);
    approveForm.appendChild(routesField);

    const approveButton = createElement('button', { type: 'submit' }, 'Approuver les routes');
    approveForm.appendChild(approveButton);

    approveForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      approveButton.disabled = true;
      approveButton.textContent = 'Approbation...';

      const nodeId = nodeIdInput.value.trim();
      const routes = routesInput.value.trim();

      const confirmed = await showConfirm(
        'Confirmation',
        routes === '""' || routes === "''" || routes === ''
          ? `Êtes-vous sûr de vouloir SUPPRIMER les routes du noeud ${nodeId} ?`
          : `Êtes-vous sûr de vouloir approuver les routes "${routes}" pour le noeud ${nodeId} ?`
      );

      if (!confirmed) {
        approveButton.disabled = false;
        approveButton.textContent = 'Approuver les routes';
        return;
      }

      const result = await api.enableRoute(nodeId, routes);

      // Update debug card with result
      const debugCard = document.getElementById('routes-debug');
      if (debugCard && debugCard.parentNode) {
        const newDebugCard = createDebugCard('Approuver une route', `POST /api/routes/${nodeId}/enable`, result);
        newDebugCard.id = 'routes-debug';
        debugCard.parentNode.replaceChild(newDebugCard, debugCard);
      }

      if (result.success) {
        nodeIdInput.value = '';
        routesInput.value = '';
        await showAlert('Succès', 'Routes approuvées avec succès');
        // Reload routes
        await this.renderRoutes(document.querySelector('.content-wrapper'));
      } else {
        await showAlert('Erreur', result.error);
      }

      approveButton.disabled = false;
      approveButton.textContent = 'Approuver les routes';
    });

    card.appendChild(approveForm);
    return card;
  }

  async renderPolicy(container) {
    // Editor card (left side)
    const editorCard = createElement('section', { className: 'card' });
    editorCard.appendChild(createElement('h2', {}, 'Policy / ACL'));

    // Info message
    const infoMsg = createElement('p', { className: 'hint' },
      'Éditeur de policy HuJSON. La policy est remplacée entièrement à chaque sauvegarde. ' +
      'Assurez-vous que Headscale est configuré avec policy.mode = "database".'
    );
    editorCard.appendChild(infoMsg);

    // Help section (collapsible)
    const helpSection = createElement('details', { style: 'margin: 12px 0; padding: 10px; background: rgba(37, 99, 235, 0.1); border-radius: 8px; border: 1px solid rgba(37, 99, 235, 0.3);' });
    const helpSummary = createElement('summary', { style: 'cursor: pointer; font-weight: 500; color: #60a5fa;' }, '📖 Aide et exemples de syntaxe');
    helpSection.appendChild(helpSummary);

    const helpContent = createElement('div', { style: 'margin-top: 10px; font-size: 12px; line-height: 1.6;' });
    helpContent.innerHTML = `
      <p><strong>Structure de base d'une policy :</strong></p>
      <pre style="background: rgba(15, 23, 42, 0.9); padding: 8px; border-radius: 4px; overflow-x: auto; font-size: 11px;">{
  "groups": {
    "group:admins": ["user1@example.com"],
    "group:devs": ["dev1@example.com", "dev2@example.com"]
  },
  "acls": [
    {
      "action": "accept",
      "src": ["group:admins"],
      "dst": ["*:*"]
    },
    {
      "action": "accept",
      "src": ["group:devs"],
      "dst": ["group:devs:*"]
    }
  ]
}</pre>
      <p><strong>Tags (pour grouper les machines) :</strong></p>
      <ul style="margin: 5px 0; padding-left: 20px;">
        <li><code>tag:server</code> - Machines serveurs</li>
        <li><code>tag:laptop</code> - Ordinateurs portables</li>
        <li><code>tag:iot</code> - Objets connectés</li>
        <li><code>tag:dev</code>, <code>tag:prod</code> - Environnements</li>
      </ul>
      <p style="margin: 8px 0; padding: 8px; background: rgba(59, 130, 246, 0.1); border-radius: 4px; font-size: 13px;">
        💡 <strong>Important :</strong> Les tags sont assignés aux machines (via l'onglet Nodes), puis utilisés dans les ACLs.
        Les <strong>groups</strong> contiennent des utilisateurs, les <strong>tags</strong> identifient des machines.
      </p>
      <p><strong>AutoGroups disponibles :</strong></p>
      <ul style="margin: 5px 0; padding-left: 20px;">
        <li><code>autogroup:self</code> - Accès à ses propres machines</li>
        <li><code>autogroup:member</code> - Tous les membres du réseau</li>
        <li><code>autogroup:internet</code> - Contrôle des exit nodes</li>
      </ul>
      <p><strong>Ports et protocoles :</strong></p>
      <ul style="margin: 5px 0; padding-left: 20px;">
        <li><code>*:*</code> - Tous les ports et protocoles</li>
        <li><code>*:80</code> - Port 80 (HTTP)</li>
        <li><code>*:443</code> - Port 443 (HTTPS)</li>
        <li><code>*:22</code> - Port 22 (SSH)</li>
      </ul>
    `;
    helpSection.appendChild(helpContent);
    editorCard.appendChild(helpSection);

    // Buttons container
    const buttonsContainer = createElement('div', { style: 'display: flex; gap: 8px; margin: 12px 0; flex-wrap: wrap;' });

    const loadButton = createElement('button', {}, 'Charger la policy actuelle');
    const saveButton = createElement('button', {}, 'Sauvegarder');
    const resetButton = createElement('button', {}, 'Réinitialiser');
    const exampleButton = createElement('button', { style: 'background: linear-gradient(135deg, #059669, #047857);' }, 'Charger un exemple');

    buttonsContainer.appendChild(loadButton);
    buttonsContainer.appendChild(saveButton);
    buttonsContainer.appendChild(resetButton);
    buttonsContainer.appendChild(exampleButton);
    editorCard.appendChild(buttonsContainer);

    // Textarea for policy editing
    const policyTextarea = createElement('textarea', {
      className: 'policy-text',
      placeholder: 'Chargez la policy pour commencer l\'édition...',
      spellcheck: 'false'
    });
    editorCard.appendChild(policyTextarea);

    // Validation message
    const validationMsg = createElement('p', { className: 'hint', style: 'margin-top: 8px;' }, '');
    editorCard.appendChild(validationMsg);

    container.appendChild(editorCard);

    // Debug card (right side)
    const debugCard = createDebugCard('Policy', '', { loading: false });
    debugCard.id = 'policy-debug';
    container.appendChild(debugCard);

    // Store original policy for reset
    let originalPolicy = '';

    // Load policy function
    const loadPolicy = async () => {
      loadButton.disabled = true;
      loadButton.textContent = 'Chargement...';
      validationMsg.textContent = '';
      validationMsg.className = 'hint';

      const result = await api.getPolicy();

      // Update debug card
      const debugCardElement = document.getElementById('policy-debug');
      if (debugCardElement && debugCardElement.parentNode) {
        const newDebugCard = createDebugCard('Charger la policy', 'GET /api/policy', result);
        newDebugCard.id = 'policy-debug';
        debugCardElement.parentNode.replaceChild(newDebugCard, debugCardElement);
      }

      if (result.success && result.data) {
        // Extract policy string from response
        const policyData = result.data.policy || result.data;

        // Parse and reformat the JSON for better readability
        let policyString;
        try {
          const policyObj = typeof policyData === 'string' ? JSON.parse(policyData) : policyData;
          policyString = JSON.stringify(policyObj, null, 2);
        } catch (e) {
          policyString = typeof policyData === 'string' ? policyData : JSON.stringify(policyData, null, 2);
        }

        policyTextarea.value = policyString;
        originalPolicy = policyString;
        validationMsg.textContent = 'Policy chargée avec succès';
        validationMsg.className = 'hint status-ok';
      } else {
        validationMsg.textContent = `Erreur: ${result.error || 'Impossible de charger la policy'}`;
        validationMsg.className = 'hint status-error';
      }

      loadButton.disabled = false;
      loadButton.textContent = 'Charger la policy actuelle';
    };

    // Save policy function
    const savePolicy = async () => {
      const policyContent = policyTextarea.value.trim();

      if (!policyContent) {
        await showAlert('Erreur', 'La policy ne peut pas être vide');
        return;
      }

      // Validate JSON
      try {
        JSON.parse(policyContent);
      } catch (e) {
        validationMsg.textContent = `JSON invalide: ${e.message}`;
        validationMsg.className = 'hint status-error';
        return;
      }

      const confirmed = await showConfirm(
        'Confirmation',
        'Êtes-vous sûr de vouloir remplacer la policy actuelle ? Cette action est irréversible.'
      );

      if (!confirmed) return;

      saveButton.disabled = true;
      saveButton.textContent = 'Sauvegarde...';
      validationMsg.textContent = '';

      const result = await api.setPolicy(policyContent);

      // Update debug card
      const debugCardElement = document.getElementById('policy-debug');
      if (debugCardElement && debugCardElement.parentNode) {
        const newDebugCard = createDebugCard('Sauvegarder la policy', 'PUT /api/policy', result);
        newDebugCard.id = 'policy-debug';
        debugCardElement.parentNode.replaceChild(newDebugCard, debugCardElement);
      }

      if (result.success) {
        originalPolicy = policyContent;
        validationMsg.textContent = 'Policy sauvegardée avec succès';
        validationMsg.className = 'hint status-ok';
        await showAlert('Succès', 'Policy mise à jour avec succès');
      } else {
        validationMsg.textContent = `Erreur: ${result.error || 'Échec de la sauvegarde'}`;
        validationMsg.className = 'hint status-error';
        await showAlert('Erreur', result.error || 'Impossible de sauvegarder la policy');
      }

      saveButton.disabled = false;
      saveButton.textContent = 'Sauvegarder';
    };

    // Reset function
    const resetPolicy = () => {
      if (originalPolicy) {
        policyTextarea.value = originalPolicy;
        validationMsg.textContent = 'Policy réinitialisée';
        validationMsg.className = 'hint status-warning';
      }
    };

    // Load example policy
    const loadExample = async () => {
      const examplePolicy = {
        "groups": {
          "group:admins": ["admin@example.com"]
        },
        "tagOwners": {
          "tag:server": ["group:admins"],
          "tag:laptop": ["group:admins"],
          "tag:iot": ["group:admins"],
          "tag:dev": ["group:admins"],
          "tag:prod": ["group:admins"]
        },
        "acls": [
          {
            "action": "accept",
            "src": ["group:admins"],
            "dst": ["*:*"],
            "comment": "Les admins ont accès à tout"
          },
          {
            "action": "accept",
            "src": ["tag:laptop"],
            "dst": ["tag:server:*"],
            "comment": "Les laptops peuvent accéder aux serveurs"
          },
          {
            "action": "accept",
            "src": ["tag:server"],
            "dst": ["tag:iot:22,80,443"],
            "comment": "Les serveurs peuvent gérer les IoT (SSH, HTTP, HTTPS)"
          },
          {
            "action": "accept",
            "src": ["tag:prod"],
            "dst": ["tag:prod:*"],
            "comment": "Isolation de l'environnement de production"
          },
          {
            "action": "accept",
            "src": ["autogroup:self"],
            "dst": ["autogroup:self:*"],
            "comment": "Accès à ses propres machines"
          }
        ],
        "ssh": [
          {
            "action": "accept",
            "src": ["group:admins"],
            "dst": ["tag:server"],
            "users": ["root", "autogroup:nonroot"]
          }
        ]
      };

      const confirmed = await showConfirm(
        'Charger un exemple',
        'Voulez-vous charger un exemple de policy ? Cela remplacera le contenu actuel de l\'éditeur (non sauvegardé).'
      );

      if (confirmed) {
        policyTextarea.value = JSON.stringify(examplePolicy, null, 2);
        validationMsg.textContent = 'Exemple chargé. N\'oubliez pas d\'adapter les emails et groupes à votre configuration.';
        validationMsg.className = 'hint status-warning';
      }
    };

    // Event listeners
    loadButton.addEventListener('click', loadPolicy);
    saveButton.addEventListener('click', savePolicy);
    resetButton.addEventListener('click', resetPolicy);
    exampleButton.addEventListener('click', loadExample);

    // Auto-load policy on mount
    await loadPolicy();
  }

  async renderInfo(container) {
    // Main container with grid layout
    const gridContainer = createElement('div', { style: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 16px;' });

    // === HEALTH STATUS CARD ===
    const healthCard = createElement('section', { className: 'card' });
    healthCard.appendChild(createElement('h2', {}, 'État du système'));

    const healthResult = await api.getHealth();
    // Health endpoint returns data directly without success wrapper
    const health = healthResult.data || healthResult;
    if (health && health.status) {

      // Status indicator
      const statusDiv = createElement('div', { style: 'margin: 12px 0; padding: 12px; border-radius: 6px; background: linear-gradient(135deg, ' + (health.status === 'healthy' ? '#10b981, #047857' : '#ef4444, #dc2626') + '); color: white;' });
      const statusText = createElement('p', { style: 'margin: 0; font-weight: bold; font-size: 1.1em;' },
        (health.status === 'healthy' ? '✅ ' : '❌ ') + 'Statut: ' + (health.status === 'healthy' ? 'Opérationnel' : 'Hors ligne')
      );
      statusDiv.appendChild(statusText);
      healthCard.appendChild(statusDiv);

      // Details
      const details = createElement('div', { style: 'margin-top: 12px;' });

      const items = [
        { label: 'Dashboard Version', value: health.version || 'N/A' },
        { label: 'Headscale URL', value: health.headscale?.url || 'N/A' },
        { label: 'Connexion Headscale', value: health.headscale?.connected ? '✅ Connecté' : '❌ Déconnecté' },
        { label: 'Dernière vérification', value: new Date(health.timestamp).toLocaleString('fr-FR') }
      ];

      items.forEach(item => {
        const row = createElement('div', { style: 'display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #374151;' });
        row.appendChild(createElement('span', { style: 'color: #9ca3af;' }, item.label + ':'));
        row.appendChild(createElement('span', { style: 'font-weight: 500;' }, item.value));
        details.appendChild(row);
      });

      healthCard.appendChild(details);
    } else {
      healthCard.appendChild(createElement('p', { className: 'status-error' }, '❌ Impossible de récupérer l\'état du système'));
    }

    gridContainer.appendChild(healthCard);

    // === HEADSCALE VERSION CARD ===
    const versionCard = createElement('section', { className: 'card' });
    versionCard.appendChild(createElement('h2', {}, 'Version Headscale'));

    // Get Headscale version via nodes endpoint (which is always available)
    const nodesResult = await api.getNodes();
    if (nodesResult.success) {
      const versionInfo = createElement('div', { style: 'margin-top: 12px;' });

      versionInfo.appendChild(createElement('p', {},
        '🔧 Pour obtenir la version de Headscale, exécutez sur le serveur:'
      ));

      const cmdBlock = createElement('pre', {
        className: 'log-block',
        style: 'background: #1f2937; padding: 12px; border-radius: 6px; overflow-x: auto; margin: 12px 0;'
      }, 'docker exec headscale headscale version');
      versionInfo.appendChild(cmdBlock);

      const expectedOutput = createElement('p', { style: 'color: #9ca3af; font-size: 0.9em; margin-top: 8px;' },
        'Version actuelle attendue: v0.27.1 ou supérieure'
      );
      versionInfo.appendChild(expectedOutput);

      // Bug warning
      const warningBox = createElement('div', {
        style: 'margin-top: 16px; padding: 12px; background: #7c2d12; border-left: 4px solid #ea580c; border-radius: 6px;'
      });
      warningBox.appendChild(createElement('p', { style: 'margin: 0 0 8px 0; font-weight: bold;' }, '⚠️ Bug connu v0.27.x'));
      warningBox.appendChild(createElement('p', { style: 'margin: 0; font-size: 0.9em;' },
        'La suppression des tags n\'est pas persistante. Utilisez le script shell fourni pour gérer les tags.'
      ));
      versionInfo.appendChild(warningBox);

      versionCard.appendChild(versionInfo);
    } else {
      versionCard.appendChild(createElement('p', { className: 'status-error' }, '❌ Impossible de récupérer les informations'));
    }

    gridContainer.appendChild(versionCard);

    // === STATISTICS CARD ===
    const statsCard = createElement('section', { className: 'card' });
    statsCard.appendChild(createElement('h2', {}, 'Statistiques'));

    const statsDiv = createElement('div', { style: 'margin-top: 12px;' });

    // Get all data in parallel
    const [nodesRes, usersRes, routesRes, keysRes] = await Promise.all([
      api.getNodes(),
      api.getUsers(),
      api.getRoutes(),
      api.getPreauthKeys('')
    ]);

    const stats = [
      {
        label: 'Noeuds',
        value: nodesRes.success ? (Array.isArray(nodesRes.data) ? nodesRes.data.length : 0) : 'N/A',
        icon: '🖥️'
      },
      {
        label: 'Noeuds en ligne',
        value: nodesRes.success && Array.isArray(nodesRes.data)
          ? nodesRes.data.filter(n => n.connected?.toLowerCase() === 'oui' || n.connected?.toLowerCase() === 'yes').length
          : 'N/A',
        icon: '🟢'
      },
      {
        label: 'Utilisateurs',
        value: usersRes.success ? (Array.isArray(usersRes.data) ? usersRes.data.length : 0) : 'N/A',
        icon: '👤'
      },
      {
        label: 'Routes approuvées',
        value: routesRes.success && Array.isArray(routesRes.data)
          ? routesRes.data.filter(r => r.approved && r.approved !== '-').length
          : 'N/A',
        icon: '🛣️'
      }
    ];

    stats.forEach(stat => {
      const statBox = createElement('div', {
        style: 'background: linear-gradient(135deg, #374151, #1f2937); padding: 16px; border-radius: 8px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;'
      });

      const leftDiv = createElement('div', {});
      leftDiv.appendChild(createElement('div', { style: 'font-size: 2em; margin-bottom: 4px;' }, stat.icon));
      leftDiv.appendChild(createElement('div', { style: 'color: #9ca3af; font-size: 0.9em;' }, stat.label));

      const rightDiv = createElement('div', { style: 'font-size: 2.5em; font-weight: bold; color: #10b981;' }, String(stat.value));

      statBox.appendChild(leftDiv);
      statBox.appendChild(rightDiv);
      statsDiv.appendChild(statBox);
    });

    statsCard.appendChild(statsDiv);
    gridContainer.appendChild(statsCard);

    // === QUICK ACTIONS CARD ===
    const actionsCard = createElement('section', { className: 'card' });
    actionsCard.appendChild(createElement('h2', {}, 'Actions rapides'));

    const actionsDiv = createElement('div', { style: 'margin-top: 12px;' });

    const actions = [
      {
        title: '📋 Gérer les policies',
        description: 'Utilisez le script shell sur le serveur',
        command: './update-headscale-policy.sh verify'
      },
      {
        title: '🏷️ Supprimer des tags',
        description: 'Suppression permanente (workaround bug)',
        command: './remove-headscale-tags.sh <node_id>'
      },
      {
        title: '🔄 Redémarrer Headscale',
        description: 'Redémarre le service Headscale',
        command: 'cd /root/projet/headscale && docker compose restart headscale'
      },
      {
        title: '📊 Voir les logs',
        description: 'Affiche les logs en temps réel',
        command: 'docker logs headscale -f'
      }
    ];

    actions.forEach(action => {
      const actionBox = createElement('div', {
        style: 'background: #1f2937; padding: 12px; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid #3b82f6;'
      });

      actionBox.appendChild(createElement('h3', { style: 'margin: 0 0 8px 0; font-size: 1em;' }, action.title));
      actionBox.appendChild(createElement('p', { style: 'margin: 0 0 8px 0; color: #9ca3af; font-size: 0.9em;' }, action.description));

      const cmdBlock = createElement('code', {
        style: 'display: block; background: #111827; padding: 8px; border-radius: 4px; font-size: 0.85em; overflow-x: auto;'
      }, action.command);
      actionBox.appendChild(cmdBlock);

      actionsDiv.appendChild(actionBox);
    });

    actionsCard.appendChild(actionsDiv);
    gridContainer.appendChild(actionsCard);

    // === DOCUMENTATION CARD ===
    const docsCard = createElement('section', { className: 'card' });
    docsCard.appendChild(createElement('h2', {}, 'Documentation'));

    const docsDiv = createElement('div', { style: 'margin-top: 12px;' });

    const docs = [
      {
        title: '📘 POLICY_MANAGEMENT.md',
        description: 'Guide complet pour gérer les policies ACL',
        path: 'Voir le fichier dans le projet'
      },
      {
        title: '📕 HEADSCALE_TAGS_BUG.md',
        description: 'Documentation du bug tags v0.27 et solutions',
        path: 'Voir le fichier dans le projet'
      },
      {
        title: '📗 UPDATE_POLICY_README.md',
        description: 'Documentation du script de mise à jour des policies',
        path: '/root/UPDATE_POLICY_README.md (sur le serveur)'
      },
      {
        title: '🌐 Documentation Headscale',
        description: 'Documentation officielle de Headscale',
        link: 'https://headscale.net/'
      }
    ];

    docs.forEach(doc => {
      const docBox = createElement('div', {
        style: 'padding: 12px; border-bottom: 1px solid #374151;'
      });

      docBox.appendChild(createElement('h3', { style: 'margin: 0 0 4px 0; font-size: 0.95em;' }, doc.title));
      docBox.appendChild(createElement('p', { style: 'margin: 0; color: #9ca3af; font-size: 0.85em;' }, doc.description));

      if (doc.link) {
        const link = createElement('a', {
          href: doc.link,
          target: '_blank',
          style: 'color: #3b82f6; font-size: 0.85em; text-decoration: underline;'
        }, doc.link);
        docBox.appendChild(link);
      } else {
        docBox.appendChild(createElement('p', { style: 'margin: 4px 0 0 0; color: #6b7280; font-size: 0.8em; font-style: italic;' }, doc.path));
      }

      docsDiv.appendChild(docBox);
    });

    docsCard.appendChild(docsDiv);
    gridContainer.appendChild(docsCard);

    // === SYSTEM INFO CARD ===
    const sysCard = createElement('section', { className: 'card' });
    sysCard.appendChild(createElement('h2', {}, 'Informations système'));

    const sysDiv = createElement('div', { style: 'margin-top: 12px;' });

    const sysInfo = [
      { label: 'Provider', value: 'REST API v1' },
      { label: 'Mode policy', value: 'Database' },
      { label: 'Docker', value: 'Container headscale-ui' },
      { label: 'Serveur Headscale', value: '192.168.1.25:3280' }
    ];

    sysInfo.forEach(info => {
      const row = createElement('div', { style: 'display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #374151;' });
      row.appendChild(createElement('span', { style: 'color: #9ca3af;' }, info.label + ':'));
      row.appendChild(createElement('span', { style: 'font-weight: 500;' }, info.value));
      sysDiv.appendChild(row);
    });

    sysCard.appendChild(sysDiv);
    gridContainer.appendChild(sysCard);

    // Add grid to container
    container.appendChild(gridContainer);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
