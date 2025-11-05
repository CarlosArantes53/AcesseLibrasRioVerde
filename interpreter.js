document.addEventListener('DOMContentLoaded', () => {

    const btnInterpreterLogout = document.getElementById('btn-interpreter-logout');

    const statusWaiting = document.getElementById('status-waiting');
    const statusIncoming = document.getElementById('status-incoming');
    const statusActive = document.getElementById('status-active');

    const btnAccept = document.getElementById('btn-accept');
    const btnReject = document.getElementById('btn-reject');
    const btnEndCall = document.getElementById('btn-end-call');

    const btnGenerateSummary = document.getElementById('btn-generate-summary');
    const callNotes = document.getElementById('call-notes');
    const summaryOutput = document.getElementById('summary-output');
    const shortcutButtons = document.querySelectorAll('.btn-shortcut');

    const callTimerElement = document.getElementById('call-timer');
    let callTimerInterval = null;
    let secondsInCall = 0;

    btnInterpreterLogout.addEventListener('click', () => {
        if (callTimerInterval) {
            stopCallTimer();
        }
        window.location.href = 'index.html'; 
    });

    setTimeout(() => {
        if (statusWaiting && !statusWaiting.classList.contains('hidden')) {
            showIncomingCall();
        }
    }, 5000);
    
    function showIncomingCall() {
        statusWaiting.classList.add('hidden');
        statusActive.classList.add('hidden');
        statusIncoming.classList.remove('hidden');
    }

    function acceptCall() {
        statusWaiting.classList.add('hidden');
        statusIncoming.classList.add('hidden');
        statusActive.classList.remove('hidden');
        startCallTimer();
    }

    function resetToWaiting() {
        statusActive.classList.add('hidden');
        statusIncoming.classList.add('hidden');
        statusWaiting.classList.remove('hidden');
        
        stopCallTimer();
        
        callNotes.value = "";
        summaryOutput.classList.add('hidden');
        summaryOutput.innerHTML = "";
    }

    btnAccept.addEventListener('click', acceptCall);
    btnReject.addEventListener('click', resetToWaiting);
    btnEndCall.addEventListener('click', resetToWaiting);

    btnGenerateSummary.addEventListener('click', () => {
        const notes = callNotes.value;
        if (notes.trim() === "") {
            summaryOutput.innerHTML = "<strong>Erro:</strong> Por favor, escreva as observações primeiro.";
            summaryOutput.classList.remove('hidden');
            return;
        }

        summaryOutput.innerHTML = `<strong>Resumo Gerado (IA):</strong><br>
            O usuário relatou uma emergência. Intérprete coletou as seguintes observações:
            <em>"${notes.substring(0, 50)}..."</em><br>
            Ação recomendada: Encaminhar para o SAMU.`;
        
        summaryOutput.classList.remove('hidden');
    });

    shortcutButtons.forEach(button => {
        button.addEventListener('click', () => {
            const serviceName = button.getAttribute('data-service');
            
            alert(`Atalho acionado: ${serviceName}`);

            callNotes.value += `\n[Ação: Atalho "${serviceName}" acionado.]\n`;
        });
    });

    function startCallTimer() {
        if (callTimerInterval) clearInterval(callTimerInterval); 
        
        secondsInCall = 0;
        callTimerElement.textContent = "00:00";

        callTimerInterval = setInterval(() => {
            secondsInCall++;
            const minutes = Math.floor(secondsInCall / 60);
            const seconds = secondsInCall % 60;
            
            callTimerElement.textContent = 
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    function stopCallTimer() {
        clearInterval(callTimerInterval);
        callTimerInterval = null;
    }
});