import './style.css';
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.querySelector('.search-form__form');
  const searchButton = document.getElementById('searchButton');
  const tableBody = document.querySelector('.table__body');
  const actionButtons = document.querySelectorAll('.table__action-btn');
  const actionModal = document.getElementById('actionModal');
  const modalOverlay = actionModal?.querySelector('.action-modal__overlay');
  const modalMenu = actionModal?.querySelector('.action-modal__menu');
  const settingsButton = actionModal?.querySelector('.action-modal__item--settings');
  const deleteButton = actionModal?.querySelector('.action-modal__item--delete');
  const qrModal = document.getElementById('qrModal');
  const qrModalOverlay = qrModal?.querySelector('.qr-modal__overlay');
  const qrModalClose = qrModal?.querySelector('.qr-modal__close');
  const qrChannelNumber = document.getElementById('qrChannelNumber');
  const addChannelBtn = document.getElementById('addChannelBtn');

  let currentRowId = null;
  let channelCounter = 3;
  let currentChannelNumber = null;

  const STORAGE_KEY_CHANNELS = 'telegram_channels';
  const STORAGE_KEY_COUNTER = 'telegram_channel_counter';

  function parseChannelFromRow(row) {
    const channelId = row.getAttribute('data-id');
    const nameCell = row.querySelector('[data-label="Название"] .table__cell-content');
    const accountCell = row.querySelector('[data-label="Данные аккаунта"] .table__cell-content');

    if (!nameCell || !accountCell) return null;

    const channelName = nameCell.textContent.trim();
    const channelNumber = channelName.replace('Канал ', '');
    const accountTexts = accountCell.querySelectorAll('.table__text');
    const randomId = accountTexts.length > 2 ? accountTexts[2].textContent.trim() : '';

    return {
      id: channelId,
      channelNumber: channelNumber,
      randomId: randomId
    };
  }

  function getAllChannels() {
    if (!tableBody) return [];

    const channels = [];
    const rows = tableBody.querySelectorAll('.table__row');

    rows.forEach(row => {
      const channel = parseChannelFromRow(row);
      if (channel) {
        channels.push(channel);
      }
    });

    return channels;
  }

  function saveChannels() {
    const channels = getAllChannels();
    localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(channels));
    localStorage.setItem(STORAGE_KEY_COUNTER, channelCounter.toString());
  }

  function renderChannels(channels) {
    if (!tableBody) return;

    tableBody.innerHTML = '';

    channels.forEach(channel => {
      const row = createChannelRow(channel);
      tableBody.appendChild(row);
    });
  }

  function loadChannels() {
    const savedChannels = localStorage.getItem(STORAGE_KEY_CHANNELS);
    const savedCounter = localStorage.getItem(STORAGE_KEY_COUNTER);

    if (savedCounter) {
      const parsedCounter = parseInt(savedCounter, 10);
      if (!isNaN(parsedCounter)) {
        channelCounter = parsedCounter;
      }
    }

    if (savedChannels) {
      try {
        const channels = JSON.parse(savedChannels);

        if (Array.isArray(channels)) {
          renderChannels(channels);
        }
      } catch (e) {
        console.error('Ошибка при загрузке данных из localStorage:', e);
        localStorage.removeItem(STORAGE_KEY_CHANNELS);
        localStorage.removeItem(STORAGE_KEY_COUNTER);
        loadChannelsFromJSON();
      }
    }
  }

  async function loadChannelsFromJSON() {
    try {
      const response = await fetch('/channels.json');
      if (!response.ok) {
        throw new Error('Failed to load channels.json');
      }
      const channels = await response.json();
      
      if (Array.isArray(channels) && channels.length > 0) {
        let maxId = 0;
        channels.forEach(channel => {
          const id = parseInt(channel.id, 10);
          if (id > maxId) {
            maxId = id;
          }
        });
        
        channelCounter = maxId;
        renderChannels(channels);
        localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(channels));
        localStorage.setItem(STORAGE_KEY_COUNTER, channelCounter.toString());
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных из JSON:', error);
    }
  }

  function generateChannelId() {
    channelCounter++;
    return channelCounter;
  }

  function generateChannelNumber() {
    return Math.floor(Math.random() * 900) + 100;
  }


  function openQRModal() {
    if (!qrModal) return;

    currentChannelNumber = generateChannelNumber();
    if (qrChannelNumber) {
      qrChannelNumber.textContent = currentChannelNumber;
    }

    qrModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeQRModal() {
    if (!qrModal) return;
    qrModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function createCell(label, content) {
    const cell = document.createElement('td');
    cell.className = 'table__cell';
    cell.setAttribute('data-label', label);

    const cellContent = document.createElement('span');
    cellContent.className = 'table__cell-content';

    if (typeof content === 'string') {
      cellContent.textContent = content;
    } else if (Array.isArray(content)) {
      content.forEach(text => {
        const textSpan = document.createElement('span');
        textSpan.className = 'table__text';
        textSpan.textContent = text;
        cellContent.appendChild(textSpan);
      });
    } else if (content instanceof Node) {
      cellContent.appendChild(content);
    }

    cell.appendChild(cellContent);
    return cell;
  }

  function createActionButton(channelId) {
    const button = document.createElement('button');
    button.className = 'table__action-btn';
    button.type = 'button';
    button.setAttribute('aria-label', 'Действия');
    button.setAttribute('data-row-id', channelId);

    const img = document.createElement('img');
    img.className = 'table__img';
    img.src = './menu-dots-vertical.svg';
    img.alt = 'иконка три точки';

    button.appendChild(img);
    return button;
  }

  function attachActionButtonHandler(button, channelId) {
    button.addEventListener('click', (e) => {
      e.stopPropagation();

      if (actionModal.getAttribute('aria-hidden') === 'false' && currentRowId === channelId) {
        closeActionModal();
      } else {
        openActionModal(button, channelId);
      }
    });
  }

  function createChannelRow(channel) {
    const row = document.createElement('tr');
    row.className = 'table__row';
    row.setAttribute('data-id', channel.id);

    const randomId = channel.randomId || generateRandomId();

    const nameCell = createCell('Название', `Канал ${channel.channelNumber}`);
    const funnelCell = createCell('Воронка и этап', ['Воронка', 'Неразобранное']);
    const accountCell = createCell('Данные аккаунта', ['ID:', 'Профиль', randomId]);
    const statusCell = createCell('Статус', 'Авторизуйтесь');

    const actionButton = createActionButton(channel.id);
    const actionButtonWrapper = document.createElement('span');
    actionButtonWrapper.className = 'table__cell-content';
    actionButtonWrapper.appendChild(actionButton);
    const actionCell = document.createElement('td');
    actionCell.className = 'table__cell';
    actionCell.setAttribute('data-label', 'Действие');
    actionCell.appendChild(actionButtonWrapper);

    row.appendChild(nameCell);
    row.appendChild(funnelCell);
    row.appendChild(accountCell);
    row.appendChild(statusCell);
    row.appendChild(actionCell);

    attachActionButtonHandler(actionButton, channel.id);

    return row;
  }

  function generateRandomId() {
    return Math.floor(Math.random() * 90000000) + 10000000;
  }

  function addChannel(channelNumber) {
    if (!tableBody) return;

    const channelId = generateChannelId();
    const channel = {
      id: channelId.toString(),
      channelNumber: channelNumber.toString(),
      randomId: null
    };

    const newRow = createChannelRow(channel);
    tableBody.appendChild(newRow);

    saveChannels();
    closeQRModal();
  }

  function deleteChannel(rowId) {
    const row = document.querySelector(`.table__row[data-id="${rowId}"]`);
    if (row) {
      row.remove();
      saveChannels();
    }
  }

  function openActionModal(button, rowId) {
    if (!actionModal) return;

    currentRowId = rowId;
    actionModal.setAttribute('aria-hidden', 'false');

    const rect = button.getBoundingClientRect();
    const menuRect = modalMenu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = rect.bottom + 8;
    let left = rect.left;

    if (left + menuRect.width > viewportWidth) {
      left = viewportWidth - menuRect.width - 16;
    }

    if (top + menuRect.height > viewportHeight) {
      top = rect.top - menuRect.height - 8;
    }

    if (left < 16) {
      left = 16;
    }

    if (top < 16) {
      top = 16;
    }

    modalMenu.style.position = 'fixed';
    modalMenu.style.top = `${top}px`;
    modalMenu.style.left = `${left}px`;
    modalMenu.style.transform = 'none';
  }

  function closeActionModal() {
    if (!actionModal) return;
    actionModal.setAttribute('aria-hidden', 'true');
    currentRowId = null;
  }

  if (searchButton) {
    searchButton.addEventListener('click', (e) => {
      e.preventDefault();
      openQRModal();
    });
  }

  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });
  }

  actionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const rowId = button.getAttribute('data-row-id');

      if (actionModal.getAttribute('aria-hidden') === 'false' && currentRowId === rowId) {
        closeActionModal();
      } else {
        openActionModal(button, rowId);
      }
    });
  });

  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeActionModal);
  }

  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      console.log('Настройки для строки:', currentRowId);
      closeActionModal();
    });
  }

  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      if (confirm('Вы уверены, что хотите удалить сессию?')) {
        if (currentRowId) {
          deleteChannel(currentRowId);
        }
        closeActionModal();
      }
    });
  }

  if (qrModalOverlay) {
    qrModalOverlay.addEventListener('click', closeQRModal);
  }

  if (qrModalClose) {
    qrModalClose.addEventListener('click', closeQRModal);
  }

  if (addChannelBtn) {
    addChannelBtn.addEventListener('click', () => {
      if (currentChannelNumber) {
        addChannel(currentChannelNumber);
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (actionModal.getAttribute('aria-hidden') === 'false') {
        closeActionModal();
      }
      if (qrModal.getAttribute('aria-hidden') === 'false') {
        closeQRModal();
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (actionModal.getAttribute('aria-hidden') === 'false') {
      const currentActionButtons = tableBody.querySelectorAll('.table__action-btn');
      if (!modalMenu.contains(e.target) && !Array.from(currentActionButtons).some(btn => btn.contains(e.target))) {
        closeActionModal();
      }
    }
  });

  const savedChannels = localStorage.getItem(STORAGE_KEY_CHANNELS);
  if (savedChannels) {
    loadChannels();
  } else {
    loadChannelsFromJSON();
  }

});
