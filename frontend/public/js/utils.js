/**
 * Utility Functions
 */

/**
 * Create an HTML element with attributes and children
 */
export function createElement(tag, attributes = {}, ...children) {
  const element = document.createElement(tag);

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key.startsWith('on')) {
      // Event listeners
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else {
      element.setAttribute(key, value);
    }
  });

  // Append children
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  });

  return element;
}

/**
 * Show a message (success or error)
 */
export function showMessage(title, status, message, details = null) {
  const card = createElement('section', { className: 'card' });

  const h3 = createElement('h3', {}, title);
  card.appendChild(h3);

  const statusText = createElement('p', {});
  const statusSpan = createElement(
    'span',
    { className: status === 0 ? 'status-ok' : 'status-error' },
    status === 0 ? 'OK' : `Erreur (code ${status})`
  );
  statusText.appendChild(document.createTextNode('Statut : '));
  statusText.appendChild(statusSpan);
  card.appendChild(statusText);

  if (message) {
    const messageBlock = createElement('div', { className: 'message-block' }, message);
    card.appendChild(messageBlock);
  }

  if (details) {
    const detailsBlock = createElement('pre', { className: 'log-block' }, JSON.stringify(details, null, 2));
    card.appendChild(detailsBlock);
  }

  return card;
}

/**
 * Create a debug info card
 */
export function createDebugCard(title, endpoint, result) {
  const card = createElement('section', { className: 'card debug-card' });

  const h3 = createElement('h3', {}, title);
  card.appendChild(h3);

  // Status
  const statusText = createElement('p', {});
  const statusSpan = createElement(
    'span',
    { className: result.success ? 'status-ok' : 'status-error' },
    result.success ? 'OK' : `Erreur`
  );
  statusText.appendChild(document.createTextNode('Statut : '));
  statusText.appendChild(statusSpan);
  card.appendChild(statusText);

  // Endpoint/Command
  if (endpoint) {
    const endpointText = createElement('p', {}, `Endpoint : ${endpoint}`);
    card.appendChild(endpointText);
  }

  // JSON Result
  const jsonBlock = createElement('pre', { className: 'log-block' }, JSON.stringify(result, null, 2));
  card.appendChild(jsonBlock);

  return card;
}

/**
 * Create a loading indicator
 */
export function createLoader() {
  return createElement('div', { className: 'loading' });
}

/**
 * Clear container
 */
export function clearContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

/**
 * Create a table from data
 */
export function createTable(headers, rows, section) {
  const wrapper = createElement('div', { className: 'table-wrapper' });
  const table = createElement('table', {
    className: 'data-table',
    'data-section': section,
  });

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
  rows.forEach(rowData => {
    const tr = createElement('tr');
    headers.forEach(header => {
      const value = rowData[header] || '';
      const td = createElement('td', { 'data-col': header }, String(value));
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  wrapper.appendChild(table);

  // Enable drag & drop for column reordering
  enableColumnReordering(table, section);

  return wrapper;
}

/**
 * Enable drag & drop column reordering
 */
function enableColumnReordering(table, section) {
  const storageKey = `hs_column_order_${section}`;
  const thead = table.tHead;
  const tbody = table.tBodies[0];
  if (!thead || !tbody) return;

  let dragSrcName = null;
  const headerRow = thead.rows[0];

  function getHeaderNames() {
    return Array.from(headerRow.cells).map(th => th.dataset.col);
  }

  function applyOrder(orderNames) {
    const currentNames = getHeaderNames();

    // Effective order = saved order + new columns
    const effective = [];
    orderNames.forEach(name => {
      if (currentNames.includes(name) && !effective.includes(name)) {
        effective.push(name);
      }
    });
    currentNames.forEach(name => {
      if (!effective.includes(name)) {
        effective.push(name);
      }
    });

    // Rebuild header
    const nameToTh = {};
    Array.from(headerRow.cells).forEach(th => {
      nameToTh[th.dataset.col] = th;
    });
    const newHeader = document.createElement('tr');
    effective.forEach(name => {
      if (nameToTh[name]) {
        newHeader.appendChild(nameToTh[name]);
      }
    });
    thead.replaceChild(newHeader, headerRow);

    // Rebuild body rows
    Array.from(tbody.rows).forEach(row => {
      const cells = Array.from(row.cells);
      const nameToTd = {};
      cells.forEach(td => {
        nameToTd[td.dataset.col] = td;
      });
      const newRow = document.createElement('tr');
      effective.forEach(name => {
        if (nameToTd[name]) {
          newRow.appendChild(nameToTd[name]);
        }
      });
      tbody.replaceChild(newRow, row);
    });

    attachDragHandlers();
  }

  // Load saved order
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const order = JSON.parse(saved);
      if (Array.isArray(order) && order.length) {
        applyOrder(order);
      }
    }
  } catch (e) {
    console.warn('Could not load column order', e);
  }

  function handleDragStart(e) {
    dragSrcName = this.dataset.col;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e) {
    e.preventDefault();
    this.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e) {
    e.preventDefault();
    const targetName = this.dataset.col;
    if (!dragSrcName || dragSrcName === targetName) return;

    const current = getHeaderNames();
    const srcIndex = current.indexOf(dragSrcName);
    const tgtIndex = current.indexOf(targetName);
    if (srcIndex === -1 || tgtIndex === -1) return;

    // Reorder
    current.splice(tgtIndex, 0, current.splice(srcIndex, 1)[0]);
    applyOrder(current);
    localStorage.setItem(storageKey, JSON.stringify(current));
  }

  function handleDragEnd() {
    dragSrcName = null;
    Array.from(thead.rows[0].cells).forEach(th => {
      th.classList.remove('dragging', 'drag-over');
    });
  }

  function handleDragLeave() {
    this.classList.remove('drag-over');
  }

  function attachDragHandlers() {
    const currentHeaderRow = thead.rows[0];
    Array.from(currentHeaderRow.cells).forEach(th => {
      th.removeEventListener('dragstart', handleDragStart);
      th.removeEventListener('dragover', handleDragOver);
      th.removeEventListener('drop', handleDrop);
      th.removeEventListener('dragend', handleDragEnd);
      th.removeEventListener('dragleave', handleDragLeave);

      th.addEventListener('dragstart', handleDragStart);
      th.addEventListener('dragover', handleDragOver);
      th.addEventListener('drop', handleDrop);
      th.addEventListener('dragend', handleDragEnd);
      th.addEventListener('dragleave', handleDragLeave);
    });
  }

  attachDragHandlers();
}
