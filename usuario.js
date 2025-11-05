document.addEventListener('DOMContentLoaded', () => {
    const btnLogout = document.getElementById('btn-logout');

    const navButtons = document.querySelectorAll('.nav-button-header'); 
    const pages = document.querySelectorAll('.page');

    const btnStartCall = document.getElementById('btn-start-call');
    const btnEndCall = document.getElementById('btn-end-call');
    const callStatus = document.getElementById('call-status');
    const videoArea = document.getElementById('video-area');
    const localVideo = document.getElementById('local-video');
    const callRingingStatus = document.getElementById('call-ringing-status');
    const remoteImage = document.getElementById('remote-image');
    const interpreterName = document.getElementById('interpreter-name');

    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const btnSend = document.getElementById('btn-send');

    const problemReportForm = document.getElementById('problem-report-form');
    const scheduleForm = document.getElementById('schedule-form');
    const btnIncreaseFont = document.getElementById('btn-increase-font');
    const btnDecreaseFont = document.getElementById('btn-decrease-font');
    const btnToggleTheme = document.getElementById('btn-toggle-theme');
    const btnPhotosensitive = document.getElementById('btn-photosensitive');

    let isCallActive = false;
    let localStream = null;
    let callTimeout = null;

    
    initNavigation();
    function changeFontSize(direction) {
        const bodyStyle = window.getComputedStyle(document.body);
        let currentSize = parseFloat(bodyStyle.fontSize);
        
        if (direction === 'increase') {
            document.body.style.fontSize = (currentSize * 1.1) + 'px';
        } else if (direction === 'decrease') {
            document.body.style.fontSize = (currentSize * 0.9) + 'px';
        }
    }if (btnIncreaseFont) btnIncreaseFont.addEventListener('click', () => changeFontSize('increase'));
    if (btnDecreaseFont) btnDecreaseFont.addEventListener('click', () => changeFontSize('decrease'));

    // Alternar Tema (Dark Mode)
    if (btnToggleTheme) {
        btnToggleTheme.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            // Atualizar ícone
            const icon = btnToggleTheme.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }

    // Modo Fotossensível
    if (btnPhotosensitive) {
        btnPhotosensitive.addEventListener('click', () => {
            document.body.classList.toggle('photosensitive-mode');
            alert("Modo Fotossensível (Redução de Animações) " + 
                  (document.body.classList.contains('photosensitive-mode') ? "Ativado" : "Desativado"));
        });
    }

    function initNavigation() {
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetPageId = button.id.replace('nav-', 'page-');
                showPage(targetPageId);
                
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === pageId) {
                page.classList.add('active');
            }
        });
    }

    btnLogout.addEventListener('click', () => {
        if (isCallActive) {
            endCall();
        }
        window.location.href = 'index.html'; 
    });

    btnStartCall.addEventListener('click', startCall);
    btnEndCall.addEventListener('click', endCall);

    async function startCall() {
        isCallActive = true;
        btnStartCall.classList.add('hidden');
        btnEndCall.classList.remove('hidden');
        callStatus.textContent = "Iniciando câmera...";
        callStatus.className = 'call-status calling';

        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            videoArea.classList.remove('hidden');
            localVideo.srcObject = localStream;

            callStatus.textContent = "Ligando para intérprete...";
            callRingingStatus.classList.remove('hidden');
            remoteImage.classList.add('hidden');
            interpreterName.classList.add('hidden');

            callTimeout = setTimeout(() => {
                if (!isCallActive) return;
                
                callStatus.textContent = "Conectado com Intérprete Neo.";
                callStatus.className = 'call-status connected';

                callRingingStatus.classList.add('hidden');
                remoteImage.classList.remove('hidden');
                interpreterName.textContent = "Neo (Intérprete)";
                interpreterName.classList.remove('hidden');

            }, 5000);
            
        } catch (error) {
            console.error("Erro ao acessar a webcam:", error);
            callStatus.textContent = "Erro: Não foi possível acessar a câmera.";
            callStatus.className = 'call-status error';
            endCall();
        }
    }

    function endCall() {
        isCallActive = false;
        
        if (callTimeout) {
            clearTimeout(callTimeout);
            callTimeout = null;
        }

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }

        videoArea.classList.add('hidden');
        localVideo.srcObject = null;
        btnStartCall.classList.remove('hidden');
        btnEndCall.classList.add('hidden');
        
        callStatus.textContent = "Chamada encerrada.";
        callStatus.className = 'call-status';
        setTimeout(() => callStatus.textContent = '', 2000);
        remoteImage.classList.add('hidden');
        interpreterName.classList.add('hidden');
        callRingingStatus.classList.remove('hidden');
    }

    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') handleSendMessage();
    });
    btnSend.addEventListener('click', handleSendMessage);

    function handleSendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText === "") return;

        addMessageToChat(messageText, 'user');
        chatInput.value = "";

        const typingIndicator = addMessageToChat("Digitando...", 'bot-typing');

        setTimeout(() => {
            if (chatWindow.contains(typingIndicator)) {
                chatWindow.removeChild(typingIndicator); 
            }
            const botResponse = getBotResponse(messageText);
            addMessageToChat(botResponse, 'bot');
        }, 1500);
    }

    function addMessageToChat(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        if (sender === 'user') {
            messageElement.classList.add('user-message');
            messageElement.textContent = text;
        } else if (sender === 'bot') {
            messageElement.classList.add('bot-message');
            messageElement.innerHTML = `<strong>IANA Rio Verde:</strong> ${text}`;
        } else if (sender === 'bot-typing') {
            messageElement.classList.add('bot-message', 'typing-indicator');
            messageElement.innerHTML = `<strong>IANA Rio Verde:</strong> <span>.</span><span>.</span><span>.</span>`;
        }

        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return messageElement; 
    }

    function getBotResponse(userText) {
        const lowerText = userText.toLowerCase();
        if (lowerText.includes('olá') || lowerText.includes('oi')) return "Olá! Como posso ajudar você hoje?";
        if (lowerText.includes('emergência') || lowerText.includes('polícia')) return "Emergência recebida. Por favor, vá para a seção <strong>'Chamada de Emergência'</strong> acima para atendimento imediato.";
        if (lowerText.includes('endereço')) return "A Prefeitura de Rio Verde está localizada na Av. Presidente Vargas, 3215 - Vila Maria.";
        if (lowerText.includes('problema') || lowerText.includes('rampa')) return "Para relatar problemas de acessibilidade, por favor, use a aba <strong>'Serviços'</strong> no menu inferior.";
        return "Obrigado pela sua mensagem. Estou processando sua solicitação.";
    }
    function setupAccessibility() {
        const userDisability = localStorage.getItem('userDisability');
        const videoCallCard = document.getElementById('video-call-card');
        const chatCard = document.getElementById('chat-card');
        const welcomeMessage = document.querySelector('.welcome-message h2');

        switch (userDisability) {
            case 'deaf':
                if (welcomeMessage) welcomeMessage.innerHTML = "Olá! 🧏‍♂️🤟 Como podemos ajudar hoje?";
                videoCallCard.classList.remove('hidden');
                chatCard.classList.remove('hidden');
                break;
                
            case 'blind':
                if (welcomeMessage) welcomeMessage.innerHTML = "Olá! 🎧 Como podemos ajudar hoje?";
                if (videoCallCard) videoCallCard.classList.add('hidden');
                chatCard.classList.remove('hidden');

                alert("Modo 'Cego / Baixa Visão' Ativado (Protótipo): Chamada de vídeo oculta.");
                break;
                
            case 'physical':
            case 'neuro':
            case 'mute':
                if (welcomeMessage) welcomeMessage.innerHTML = "Olá! 👋 Como podemos ajudar hoje?";
                videoCallCard.classList.remove('hidden');
                chatCard.classList.remove('hidden');
                break;
                
            default:
                videoCallCard.classList.remove('hidden');
                chatCard.classList.remove('hidden');
        }
    }
    
    setupAccessibility();
    if (problemReportForm) {
        problemReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Relato de problema enviado com sucesso! Agradecemos sua contribuição.");
            problemReportForm.reset();
        });
    }

    if (scheduleForm) {
        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Solicitação de agendamento enviada. Você receberá uma confirmação por e-mail em breve.");
            scheduleForm.reset();
        });
    }
});