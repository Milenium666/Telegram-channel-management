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

  function generateChannelId() {
    channelCounter++;
    return channelCounter;
  }

  function generateChannelNumber() {
    return Math.floor(Math.random() * 900000) + 100000;
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

  function createTableRow(channelId, channelNumber) {
    const row = document.createElement('tr');
    row.className = 'table__row';
    row.setAttribute('data-id', channelId);

    const randomId = Math.floor(Math.random() * 9000000000) + 1000000000;

    row.innerHTML = `
      <td class="table__cell" data-label="Название">
        <span class="table__cell-content">Канал ${channelNumber}</span>
      </td>
      <td class="table__cell" data-label="Воронка и этап">
        <span class="table__cell-content">
          <span class="table__text">Воронка</span>
          <span class="table__text">Неразобранное</span>
        </span>
      </td>
      <td class="table__cell" data-label="Данные аккаунта">
        <span class="table__cell-content">
          <span class="table__text">ID:</span>
          <span class="table__text">Профиль</span>
          <span class="table__text">${randomId}</span>
        </span>
      </td>
      <td class="table__cell" data-label="Статус">
        <span class="table__cell-content">Авторизуйтесь</span>
      </td>
      <td class="table__cell" data-label="Действие">
        <span class="table__cell-content">
          <button class="table__action-btn" type="button" aria-label="Действия" data-row-id="${channelId}">
            <img class="table__img" src="./src/images/menu-dots-vertical.svg" alt="иконка три точки">
          </button>
        </span>
      </td>
    `;

    const actionBtn = row.querySelector('.table__action-btn');
    if (actionBtn) {
      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rowId = actionBtn.getAttribute('data-row-id');
        
        if (actionModal.getAttribute('aria-hidden') === 'false' && currentRowId === rowId) {
          closeActionModal();
        } else {
          openActionModal(actionBtn, rowId);
        }
      });
    }

    return row;
  }

  function addChannel(channelNumber) {
    if (!tableBody) return;
    
    const channelId = generateChannelId();
    const newRow = createTableRow(channelId, channelNumber);
    tableBody.appendChild(newRow);
    
    closeQRModal();
  }

  function deleteChannel(rowId) {
    const row = document.querySelector(`.table__row[data-id="${rowId}"]`);
    if (row) {
      row.remove();
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

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      openQRModal();
    });
  }

  if (searchButton) {
    searchButton.addEventListener('click', (e) => {
      e.preventDefault();
      openQRModal();
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
      if (!modalMenu.contains(e.target) && !Array.from(actionButtons).some(btn => btn.contains(e.target))) {
        closeActionModal();
      }
    }
  });

});
