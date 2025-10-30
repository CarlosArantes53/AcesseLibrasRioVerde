document.addEventListener('DOMContentLoaded', () => {

    // --- Elementos de Autenticação ---
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');
    const appPage = document.getElementById('app-page');
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const btnLogout = document.getElementById('btn-logout');

    // --- Elementos da Aplicação ---
    const btnCall = document.getElementById('btn-call');
    const callStatus = document.getElementById('call-status');
    const videoArea = document.getElementById('video-area');
    const localVideo = document.getElementById('local-video');
    const remoteVideoContainer = document.getElementById('remote-video-container');
    const callRingingStatus = document.getElementById('call-ringing-status');
    const remoteImage = document.getElementById('remote-video');
    const interpreterName = document.getElementById('interpreter-name');

    // --- Elementos do Chat (sem mudança na lógica) ---
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const btnSend = document.getElementById('btn-send');

    // --- Variáveis de Estado ---
    let isCallActive = false;
    let localStream = null; // Armazena o stream da webcam
    let callTimeout = null; // Armazena o timer da chamada

    // =============================================
    // LÓGICA DE AUTENTICAÇÃO MOCADA
    // =============================================

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginPage.classList.add('hidden');
        registerPage.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Mocado: Apenas simula o login se os campos não estiverem vazios
        if (loginForm['login-email'].value && loginForm['login-password'].value) {
            loginPage.classList.add('hidden');
            appPage.classList.remove('hidden');
        } else {
            alert("Por favor, preencha e-mail e senha.");
        }
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Mocado: Simula o cadastro e envia para o login
        alert("Cadastro realizado com sucesso! Faça o login.");
        registerPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
    });

    btnLogout.addEventListener('click', () => {
        // Encerra a chamada se estiver ativa ao deslogar
        if (isCallActive) {
            endCall();
        }
        appPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
    });

    // =============================================
    // LÓGICA DE CHAMADA DE VÍDEO
    // =============================================

    btnCall.addEventListener('click', () => {
        if (!isCallActive) {
            startCall();
        } else {
            endCall();
        }
    });

    async function startCall() {
    isCallActive = true;
    btnCall.textContent = "Cancelar Chamada";
    btnCall.classList.add('active');
    callStatus.textContent = "Iniciando câmera...";
    callStatus.className = 'call-status calling';

    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        videoArea.classList.remove('hidden');
        localVideo.srcObject = localStream;

        callStatus.textContent = "Ligando para intérprete...";
        if (callRingingStatus) callRingingStatus.classList.remove('hidden');

        // proteções adicionais
        if (remoteImage) remoteImage.classList.add('hidden');
        if (interpreterName) interpreterName.classList.add('hidden');

        callTimeout = setTimeout(() => {
            if (!isCallActive) return;

            callStatus.textContent = "Conectado com Intérprete Neo.";
            callStatus.className = 'call-status connected';
            btnCall.textContent = "Encerrar Chamada";

            if (callRingingStatus) callRingingStatus.classList.add('hidden');

            if (remoteImage) {
                remoteImage.src = "https://via.placeholder.com/400x300/3498db/ffffff?text=Neo";
                remoteImage.classList.remove('hidden');
            }
            if (interpreterName) {
                interpreterName.textContent = "Neo (Intérprete)";
                interpreterName.classList.remove('hidden');
            }

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
        
        // Para o timer de atendimento (caso o usuário encerre antes dos 5s)
        if (callTimeout) {
            clearTimeout(callTimeout);
            callTimeout = null;
        }

        // Desliga a webcam
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }

        // Reseta a interface
        videoArea.classList.add('hidden');
        localVideo.srcObject = null;
        btnCall.textContent = "Chamar Intérprete";
        btnCall.classList.remove('active');
        callStatus.textContent = "Chamada encerrada.";
        callStatus.className = 'call-status';
        setTimeout(() => callStatus.style.display = 'none', 2000);

        // Esconde os elementos da chamada remota
        remoteImage.classList.add('hidden');
        interpreterName.classList.add('hidden');
        callRingingStatus.classList.remove('hidden'); // Prepara para a próxima chamada
    }

    // =============================================
    // LÓGICA DO CHATBOT (SEM MUDANÇAS)
    // =============================================
    
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') handleSendMessage();
    });
    btnSend.addEventListener('click', handleSendMessage);

    function handleSendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText === "") return;
        addMessageToChat(messageText, 'user');
        chatInput.value = "";
        setTimeout(() => {
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
        } else {
            messageElement.classList.add('bot-message');
            messageElement.innerHTML = `<strong>Assistente IA:</strong> ${text}`;
        }
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function getBotResponse(userText) {
        // (Mesma lógica de getBotResponse da versão anterior)
        const lowerText = userText.toLowerCase();
        if (lowerText.includes('olá') || lowerText.includes('oi')) return "Olá! Como posso ajudar você hoje?";
        if (lowerText.includes('emergência') || lowerText.includes('polícia')) return "Emergência recebida. Por favor, clique no botão <strong>'Chamar Intérprete'</strong> acima para atendimento imediato.";
        if (lowerText.includes('endereço')) return "A Prefeitura de Rio Verde está localizada na Av. Presidente Vargas, 3215 - Vila Maria.";
        return "Obrigado pela sua mensagem. Estou processando sua solicitação.";
    }
});