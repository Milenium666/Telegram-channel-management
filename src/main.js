import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  const actionButtons = document.querySelectorAll('.table__action-btn');
  const actionModal = document.getElementById('actionModal');
  const modalOverlay = actionModal?.querySelector('.action-modal__overlay');
  const modalMenu = actionModal?.querySelector('.action-modal__menu');
  const settingsButton = actionModal?.querySelector('.action-modal__item--settings');
  const deleteButton = actionModal?.querySelector('.action-modal__item--delete');

  let currentRowId = null;

  function openModal(button, rowId) {
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

  function closeModal() {
    if (!actionModal) return;
    actionModal.setAttribute('aria-hidden', 'true');
    currentRowId = null;
  }

  actionButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const rowId = button.getAttribute('data-row-id');
      
      if (actionModal.getAttribute('aria-hidden') === 'false' && currentRowId === rowId) {
        closeModal();
      } else {
        openModal(button, rowId);
      }
    });
  });

  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
  }

  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      console.log('Настройки для строки:', currentRowId);
      closeModal();
    });
  }

  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      console.log('Удалить сессию для строки:', currentRowId);
      if (confirm('Вы уверены, что хотите удалить сессию?')) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && actionModal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });

  document.addEventListener('click', (e) => {
    if (actionModal.getAttribute('aria-hidden') === 'false') {
      if (!modalMenu.contains(e.target) && !Array.from(actionButtons).some(btn => btn.contains(e.target))) {
        closeModal();
      }
    }
  });
});
