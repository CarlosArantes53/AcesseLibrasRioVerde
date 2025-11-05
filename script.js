document.addEventListener('DOMContentLoaded', () => {
    
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');
    const interpreterLoginPage = document.getElementById('interpreter-login-page');
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const interpreterLoginForm = document.getElementById('interpreter-login-form');
    
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const showInterpreterLink = document.getElementById('show-interpreter-login');
    const showUserLoginLink = document.getElementById('show-user-login');

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginPage.classList.add('hidden');
        interpreterLoginPage.classList.add('hidden');
        registerPage.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerPage.classList.add('hidden');
        interpreterLoginPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
    });

    showInterpreterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginPage.classList.add('hidden');
        registerPage.classList.add('hidden');
        interpreterLoginPage.classList.remove('hidden');
    });

    showUserLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginPage.classList.remove('hidden');
        registerPage.classList.add('hidden');
        interpreterLoginPage.classList.add('hidden');
    });
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (loginForm['login-email'].value && loginForm['login-password'].value) {
            window.location.href = 'usuario.html'; 
        } else {
            alert("Por favor, preencha e-mail e senha.");
        }
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const disability = document.getElementById('register-disability').value;
        
        if (disability) {
            localStorage.setItem('userDisability', disability);
        } else {
            localStorage.setItem('userDisability', 'none');
        }

        alert("Cadastro realizado com sucesso! Faça o login.");
        registerPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
    });

    interpreterLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (interpreterLoginForm['interpreter-login-email'].value && interpreterLoginForm['interpreter-login-password'].value) {
            window.location.href = 'interprete.html';
        } else {
            alert("Por favor, preencha e-mail e senha.");
        }
    });
});