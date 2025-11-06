// usuario.js — Área logada: navegação, chamada, chat, serviços
document.addEventListener('DOMContentLoaded', () => {
  // Sessão obrigatória
  const session = (() => {
    try { return JSON.parse(localStorage.getItem('app:session') || 'null'); } catch { return null; }
  })();
  if (!session) {
    window.location.href = 'index.html';
    return;
  }

  // Cabeçalho e navegação
  const btnLogout = document.getElementById('btn-logout');
  const navButtons = document.querySelectorAll('.nav-button-header');
  const pages = document.querySelectorAll('.page');

  // Chamada
  const btnStartCall = document.getElementById('btn-start-call');
  const btnEndCall = document.getElementById('btn-end-call');
  const callStatus = document.getElementById('call-status');
  const videoArea = document.getElementById('video-area');
  const localVideo = document.getElementById('local-video');
  const callRingingStatus = document.getElementById('call-ringing-status');
  const remoteImage = document.getElementById('remote-image');
  const interpreterName = document.getElementById('interpreter-name');

  // Chat
  const chatWindow = document.getElementById('chat-window');
  const chatInput = document.getElementById('chat-input');
  const btnSend = document.getElementById('btn-send');

  // Serviços
  const problemReportForm = document.getElementById('problem-report-form');
  const scheduleForm = document.getElementById('schedule-form');

  // Acessibilidade header
  const btnIncreaseFont = document.getElementById('btn-increase-font');
  const btnDecreaseFont = document.getElementById('btn-decrease-font');
  const btnToggleTheme = document.getElementById('btn-toggle-theme');
  const btnPhotosensitive = document.getElementById('btn-photosensitive');

  let isCallActive = false;
  let localStream = null;
  let callTimeout = null;

  // Navegação
  initNavigation();

  function initNavigation() {
    navButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetPageId = button.id.replace('nav-', 'page-');
        showPage(targetPageId);
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        // Move o foco para a seção ativa
        const active = document.getElementById(targetPageId);
        active?.setAttribute('tabindex', '-1');
        active?.focus();
      });
    });
  }

  function showPage(pageId) {
    pages.forEach(page => {
      page.classList.remove('active');
      if (page.id === pageId) page.classList.add('active');
    });
  }

  // Logout
  btnLogout?.addEventListener('click', () => {
    if (isCallActive) endCall();
    localStorage.removeItem('app:session');
    window.location.href = 'index.html';
  });

  // Controles de acessibilidade
  function changeFontSize(direction) {
    const bodyStyle = window.getComputedStyle(document.body);
    let currentSize = parseFloat(bodyStyle.fontSize);
    if (direction === 'increase') {
      document.body.style.fontSize = (currentSize * 1.1) + 'px';
    } else if (direction === 'decrease') {
      document.body.style.fontSize = (currentSize * 0.9) + 'px';
    }
  }
  btnIncreaseFont?.addEventListener('click', () => changeFontSize('increase'));
  btnDecreaseFont?.addEventListener('click', () => changeFontSize('decrease'));

  if (btnToggleTheme) {
    btnToggleTheme.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const icon = btnToggleTheme.querySelector('i');
      if (document.body.classList.contains('dark-mode')) {
        icon?.classList.remove('fa-moon');
        icon?.classList.add('fa-sun');
      } else {
        icon?.classList.remove('fa-sun');
        icon?.classList.add('fa-moon');
      }
    });
  }

  btnPhotosensitive?.addEventListener('click', () => {
    document.body.classList.toggle('photosensitive-mode');
    // Região viva da chamada já transmite estados
  });

  // Chamada
  btnStartCall?.addEventListener('click', startCall);
  btnEndCall?.addEventListener('click', endCall);

  async function startCall() {
    isCallActive = true;
    btnStartCall.classList.add('hidden');
    btnEndCall.classList.remove('hidden');
    setCallStatus('Iniciando câmera...', 'calling');

    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoArea.classList.remove('hidden');
      localVideo.srcObject = localStream;

      setCallStatus('Ligando para intérprete...', 'calling');
      callRingingStatus.classList.remove('hidden');
      remoteImage.classList.add('hidden');
      interpreterName.classList.add('hidden');

      callTimeout = setTimeout(() => {
        if (!isCallActive) return;
        setCallStatus('Conectado com intérprete.', 'connected');
        callRingingStatus.classList.add('hidden');
        remoteImage.classList.remove('hidden');
        interpreterName.textContent = 'Neo (Intérprete)';
        interpreterName.classList.remove('hidden');
      }, 3000);
    } catch (err) {
      console.error('Erro ao acessar a webcam:', err);
      setCallStatus('Erro: Não foi possível acessar a câmera.', 'error');
      endCall();
    }
  }

  function setCallStatus(text, mode = '') {
    callStatus.textContent = text;
    callStatus.className = 'call-status' + (mode ? ' ' + mode : '');
    // aria-live no próprio elemento anuncia mudanças
  }

  function endCall() {
    isCallActive = false;
    if (callTimeout) { clearTimeout(callTimeout); callTimeout = null; }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
    videoArea.classList.add('hidden');
    localVideo.srcObject = null;
    btnStartCall.classList.remove('hidden');
    btnEndCall.classList.add('hidden');
    setCallStatus('Chamada encerrada.');
    remoteImage.classList.add('hidden');
    interpreterName.classList.add('hidden');
    callRingingStatus.classList.remove('hidden');
    setTimeout(() => { callStatus.textContent = ''; }, 1500);
  }

  // Chat
  chatInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleSendMessage();
  });
  btnSend?.addEventListener('click', handleSendMessage);

  function handleSendMessage() {
    const messageText = chatInput.value.trim();
    if (messageText === '') return;
    addMessageToChat(messageText, 'user');
    chatInput.value = '';

    const typingIndicator = addMessageToChat('Digitando...', 'bot-typing');
    setTimeout(() => {
      if (chatWindow.contains(typingIndicator)) {
        chatWindow.removeChild(typingIndicator);
      }
      const botResponse = getBotResponse(messageText);
      addMessageToChat(botResponse, 'bot');
    }, 800);
  }

  function addMessageToChat(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    if (sender === 'user') {
      messageElement.classList.add('user-message');
      messageElement.textContent = text;
    } else if (sender === 'bot') {
      messageElement.classList.add('bot-message');
      messageElement.innerHTML = `IANA Rio Verde: ${text}`;
    } else if (sender === 'bot-typing') {
      messageElement.classList.add('bot-message', 'typing-indicator');
      messageElement.innerHTML = `IANA Rio Verde: ...`;
    }
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return messageElement;
  }

  function getBotResponse(userText) {
    const lowerText = userText.toLowerCase();
    if (lowerText.includes('olá') || lowerText.includes('oi')) return 'Olá! Como posso ajudar você hoje?';
    if (lowerText.includes('emergência') || lowerText.includes('polícia')) return 'Emergência recebida. Vá para a seção "Chamada de Emergência".';
    if (lowerText.includes('endereço')) return 'A Prefeitura fica na Av. Presidente Vargas, 3215 - Vila Maria.';
    if (lowerText.includes('problema') || lowerText.includes('rampa')) return 'Use a aba "Serviços" para relatar problemas de acessibilidade.';
    return 'Obrigado pela mensagem. Estou processando sua solicitação.';
  }

  // Preferências de acessibilidade por perfil
  setupAccessibility();

  function setupAccessibility() {
    const userDisability = localStorage.getItem('userDisability');
    const videoCallCard = document.getElementById('video-call-card');
    const chatCard = document.getElementById('chat-card');
    const welcomeMessage = document.querySelector('.welcome-message h2');
    const mainContent = document.getElementById('conteudo');
    const voiceAssistant = document.getElementById('page-voice-assistant');
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const scheduleCard = document.getElementById('schedule-card');

    switch (userDisability) {
      case 'deaf':
        if (welcomeMessage) welcomeMessage.textContent = 'Olá! 🧏 Como podemos ajudar hoje?';
        videoCallCard?.classList.remove('hidden');
        chatCard?.classList.remove('hidden');
        scheduleCard?.classList.remove('hidden');
        break;
      case 'blind':
        header.classList.add('hidden');
        mainContent.classList.add('hidden');
        footer.classList.add('hidden');
        voiceAssistant.classList.add('active');
        document.body.classList.add('voice-assistant-active');
        break;
      default:
        chatCard?.classList.remove('hidden');
        break;
    }
  }

  // Formulários de serviços
  problemReportForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('report-title-input').value.trim();
    const desc = document.getElementById('report-desc-input').value.trim();
    if (!title || !desc) return;
    const reports = (() => {
      try { return JSON.parse(localStorage.getItem('app:reports') || '[]'); } catch { return []; }
    })();
    reports.push({ id: crypto.randomUUID(), title, desc, createdAt: new Date().toISOString() });
    localStorage.setItem('app:reports', JSON.stringify(reports));
    const status = document.getElementById('report-status');
    status.textContent = 'Relato de problema enviado com sucesso. Obrigado!';
    problemReportForm.reset();
  });

  scheduleForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('schedule-date').value;
    const time = document.getElementById('schedule-time').value;
    const type = document.getElementById('schedule-type').value;
    const notes = document.getElementById('schedule-notes').value.trim();

    if (!date || !time || !type) return;

    const schedules = (() => {
      try { return JSON.parse(localStorage.getItem('app:schedules') || '[]'); } catch { return []; }
    })();
    schedules.push({ id: crypto.randomUUID(), date, time, type, notes, createdAt: new Date().toISOString() });
    localStorage.setItem('app:schedules', JSON.stringify(schedules));
    const status = document.getElementById('schedule-status');
    status.textContent = 'Solicitação de agendamento enviada. Você receberá confirmação por e-mail.';
    scheduleForm.reset();
  });
});
