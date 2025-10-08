/**
 * JavaScript para o Dashboard do PagBank Admin
 */

// Modal functions
function openOperarModal(username) {
  const modal = document.getElementById('modal-operar');
  const usernameElement = document.getElementById('modal-cliente-username');
  const iframe = document.getElementById('operar-iframe');
  
  // Atualiza o nome do cliente no modal
  usernameElement.textContent = username;
  
  // Configura o iframe (pode adicionar o usuário como parâmetro na URL se necessário)
  iframe.src = `http://localhost:46805/?username=${encodeURIComponent(username)}`;
  
  // Exibe o modal
  modal.classList.add('is-open');
  
  // Impede o rolamento do fundo
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('modal-operar');
  
  // Esconde o modal
  modal.classList.remove('is-open');
  
  // Permite o rolamento novamente
  document.body.style.overflow = '';
  
  // Reseta o iframe para evitar problemas
  setTimeout(() => {
    const iframe = document.getElementById('operar-iframe');
    iframe.src = 'about:blank';
  }, 300);
}

// Fechar o modal ao clicar fora dele
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('modal-operar');
  
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeModal();
    }
  });
  
  // Fechar modal com ESC
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
});

// Função para atualizar os dados do dashboard
function refreshData() {
  // Mostrar indicador de carregamento
  const refreshButton = document.querySelector('.gh-subnav__actions .gh-btn');
  const originalText = refreshButton.textContent;
  refreshButton.textContent = 'Atualizando...';
  refreshButton.disabled = true;
  
  // Recarrega a página para obter dados atualizados
  fetch(window.location.href, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro ao atualizar os dados');
    }
    return response.text();
  })
  .then(html => {
    // Atualiza o conteúdo principal sem recarregar toda a página
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Atualiza as estatísticas
    const newStats = doc.querySelectorAll('.gh-card strong');
    const currentStats = document.querySelectorAll('.gh-card strong');
    
    currentStats.forEach((stat, index) => {
      if (newStats[index]) {
        // Animação simples para mudança de números
        const oldValue = parseInt(stat.textContent.replace(/\D/g, '')) || 0;
        const newValue = parseInt(newStats[index].textContent.replace(/\D/g, '')) || 0;
        animateCounter(stat, oldValue, newValue);
      }
    });
    
    // Atualiza a tabela de clientes
    const newTable = doc.querySelector('.gh-panel__table');
    if (newTable) {
      document.querySelector('.gh-panel__table').innerHTML = newTable.innerHTML;
    }
    
    // Atualiza o contador de resultados
    const newCount = doc.querySelector('.gh-section__hint');
    if (newCount) {
      document.querySelector('.gh-section__hint').textContent = newCount.textContent;
    }
    
    // Notifica usuário
    showNotification('Dados atualizados com sucesso!');
  })
  .catch(error => {
    console.error('Erro:', error);
    showNotification('Erro ao atualizar dados. Tente novamente.', 'error');
  })
  .finally(() => {
    // Restaura o botão
    refreshButton.textContent = originalText;
    refreshButton.disabled = false;
  });
}

// Animação simples de contador
function animateCounter(element, start, end) {
  const duration = 1000; // 1 segundo
  const startTime = performance.now();
  
  function updateCounter(timestamp) {
    const elapsedTime = timestamp - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    const currentValue = Math.floor(start + progress * (end - start));
    
    element.textContent = currentValue;
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = end;
    }
  }
  
  requestAnimationFrame(updateCounter);
}

// Mostrar notificação
function showNotification(message, type = 'success') {
  // Verifica se já existe uma notificação
  let notification = document.querySelector('.gh-notification');
  
  if (!notification) {
    // Cria um elemento de notificação
    notification = document.createElement('div');
    notification.className = 'gh-notification';
    document.body.appendChild(notification);
    
    // Adiciona estilos dinâmicos (caso o CSS não esteja carregado)
    Object.assign(notification.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 16px',
      borderRadius: '6px',
      boxShadow: '0 8px 24px rgba(140, 149, 159, 0.2)',
      zIndex: '100',
      transition: 'transform 0.3s ease, opacity 0.3s ease',
      transform: 'translateY(10px)',
      opacity: '0'
    });
  }
  
  // Configura o tipo de notificação
  notification.className = `gh-notification gh-notification--${type}`;
  if (type === 'success') {
    notification.style.backgroundColor = '#dafbe1';
    notification.style.border = '1px solid #1a7f37';
    notification.style.color = '#1a7f37';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#ffebe9';
    notification.style.border = '1px solid #cf222e';
    notification.style.color = '#cf222e';
  }
  
  // Define o conteúdo
  notification.textContent = message;
  
  // Mostra a notificação
  setTimeout(() => {
    notification.style.transform = 'translateY(0)';
    notification.style.opacity = '1';
  }, 10);
  
  // Remove após alguns segundos
  setTimeout(() => {
    notification.style.transform = 'translateY(10px)';
    notification.style.opacity = '0';
    
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Adicionar estilos dinâmicos para a notificação
document.addEventListener('DOMContentLoaded', function() {
  const style = document.createElement('style');
  style.textContent = `
    .gh-notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 6px;
      box-shadow: 0 8px 24px rgba(140, 149, 159, 0.2);
      z-index: 100;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }
    .gh-notification--success {
      background-color: #dafbe1;
      border: 1px solid #1a7f37;
      color: #1a7f37;
    }
    .gh-notification--error {
      background-color: #ffebe9;
      border: 1px solid #cf222e;
      color: #cf222e;
    }
  `;
  document.head.appendChild(style);
});