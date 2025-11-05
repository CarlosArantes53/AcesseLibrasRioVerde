// script.js — Autenticação + Persistência + Acessibilidade
(() => {
  const PAGES = {
    login: document.getElementById('login-page'),
    register: document.getElementById('register-page'),
    interpreter: document.getElementById('interpreter-login-page'),
  };

  const FORMS = {
    login: document.getElementById('login-form'),
    register: document.getElementById('register-form'),
    interpreter: document.getElementById('interpreter-login-form'),
  };

  const TOGGLES = {
    showRegister: document.getElementById('show-register'),
    showLogin: document.getElementById('show-login'),
    showInterpreter: document.getElementById('show-interpreter-login'),
    showUserLogin: document.getElementById('show-user-login'),
  };

  const LIVE = {
    loginStatus: document.getElementById('login-status'),
    loginError: document.getElementById('login-error'),
    registerStatus: document.getElementById('register-status'),
    registerError: document.getElementById('register-error'),
    interpreterStatus: document.getElementById('interpreter-status'),
    interpreterError: document.getElementById('interpreter-error'),
  };

  const KEYS = {
    usuarios: 'app:usuarios',
    session: 'app:session',
  };

  const qs = (sel, root = document) => root.querySelector(sel);
  const setHidden = (el, hidden) => el.classList.toggle('hidden', hidden);

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getUsuarios() {
    return readJSON(KEYS.usuarios, []);
  }

  function saveUsuarios(list) {
    writeJSON(KEYS.usuarios, list);
  }

  function setSession(session) {
    writeJSON(KEYS.session, session);
  }

  function getSession() {
    return readJSON(KEYS.session, null);
  }

  function focusFirstInput(section) {
    const first = section.querySelector('input, select, textarea, button');
    if (first) first.focus();
  }

  function show(page) {
    setHidden(PAGES.login, page !== 'login');
    setHidden(PAGES.register, page !== 'register');
    setHidden(PAGES.interpreter, page !== 'interpreter');
    const current = page === 'login' ? PAGES.login : page === 'register' ? PAGES.register : PAGES.interpreter;
    focusFirstInput(current);
  }

  // Toggles entre telas
  TOGGLES.showRegister?.addEventListener('click', () => show('register'));
  TOGGLES.showLogin?.addEventListener('click', () => show('login'));
  TOGGLES.showInterpreter?.addEventListener('click', () => show('interpreter'));
  TOGGLES.showUserLogin?.addEventListener('click', () => show('login'));

  // Cadastro
  FORMS.register?.addEventListener('submit', (e) => {
    e.preventDefault();
    LIVE.registerError.textContent = '';
    const name = qs('#register-name').value.trim();
    const email = qs('#register-email').value.trim().toLowerCase();
    const password = qs('#register-password').value;
    const disability = qs('#register-disability').value || 'none';

    if (!name || !email || !password || password.length < 6) {
      LIVE.registerError.textContent = 'Verifique nome, e-mail e senha (mínimo 6 caracteres).';
      return;
    }

    const usuarios = getUsuarios();
    if (usuarios.some(u => u.email === email)) {
      LIVE.registerError.textContent = 'Este e-mail já está cadastrado.';
      return;
    }

    const novo = {
      id: crypto.randomUUID(),
      nome: name,
      email,
      senha: password, // protótipo
      tipoUsuario: 'usuario',
      acessibilidade: disability,
      criadoEm: new Date().toISOString(),
    };

    usuarios.push(novo);
    saveUsuarios(usuarios);

    LIVE.registerStatus.textContent = 'Cadastro realizado com sucesso! Faça o login.';
    show('login');
  });

  // Login usuário
  FORMS.login?.addEventListener('submit', (e) => {
    e.preventDefault();
    LIVE.loginError.textContent = '';
    const email = qs('#login-email').value.trim().toLowerCase();
    const password = qs('#login-password').value;

    if (!email || !password) {
      LIVE.loginError.textContent = 'Por favor, preencha e-mail e senha.';
      return;
    }

    const usuarios = getUsuarios();
    const user = usuarios.find(u => u.email === email && u.senha === password);
    if (!user) {
      LIVE.loginError.textContent = 'Credenciais inválidas.';
      return;
    }

    setSession({ userId: user.id, tipoUsuario: user.tipoUsuario });
    // Preferência de acessibilidade por compatibilidade com usuário.js atual
    localStorage.setItem('userDisability', user.acessibilidade || 'none');

    window.location.href = 'usuario.html';
  });

  // Login intérprete
  FORMS.interpreter?.addEventListener('submit', (e) => {
    e.preventDefault();
    LIVE.interpreterError.textContent = '';

    const email = qs('#interpreter-login-email').value.trim().toLowerCase();
    const password = qs('#interpreter-login-password').value;

    if (!email || !password) {
      LIVE.interpreterError.textContent = 'Por favor, preencha e-mail e senha.';
      return;
    }

    // Para protótipo, aceitar qualquer credencial e marcar tipo intérprete
    const usuarios = getUsuarios();
    let user = usuarios.find(u => u.email === email && u.senha === password);
    if (!user) {
      user = {
        id: crypto.randomUUID(),
        nome: email.split('@')[0],
        email,
        senha: password,
        tipoUsuario: 'interprete',
        acessibilidade: 'none',
        criadoEm: new Date().toISOString(),
      };
      usuarios.push(user);
      saveUsuarios(usuarios);
    } else {
      user.tipoUsuario = 'interprete';
      saveUsuarios(usuarios);
    }

    setSession({ userId: user.id, tipoUsuario: 'interprete' });
    localStorage.setItem('userDisability', user.acessibilidade || 'none');

    // Rota existente no protótipo
    window.location.href = 'interprete.html';
  });

  // Tela inicial padrão
  show('login');

  // Acesso por Enter nos toggles linklike
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('linklike')) {
      e.target.click();
    }
  });
})();
