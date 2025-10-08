// Estado da aplicação
const state = {
    username: '',
    currentScreen: 'login',
    password: ''
};

// Elementos do DOM
const elements = {
    loginForm: document.querySelector('.login-form'),
    passwordForm: document.getElementById('password-form'),
    loginScreen: document.getElementById('login-screen'),
    passwordScreen: document.getElementById('password-screen'),
    qrcodeScreen: document.getElementById('qrcode-screen'),
    userInput: document.getElementById('user'),
    passwordBoxes: document.querySelectorAll('.password-box'),
    userDisplay: document.getElementById('user-display'),
    loginBtn: document.getElementById('login-btn'),
    backBtn: document.getElementById('back-btn'),
    togglePasswordBtn: document.getElementById('toggle-password'),
    newLoginBtn: document.getElementById('new-login'),
    loading: document.getElementById('loading'),
    qrcodeDiv: document.getElementById('qrcode'),
    toggleInfoBtn: document.getElementById('toggle-info'),
    infoContent: document.getElementById('info-content'),
    containerInfo: document.getElementById('container-info')
};

// Configuração da API
const API_BASE_URL = 'http://localhost:4000';

// Funções de navegação entre telas
function showLoginScreen() {
    elements.loginScreen.style.display = 'grid';
    elements.passwordScreen.style.display = 'none';
    elements.qrcodeScreen.style.display = 'none';
    state.currentScreen = 'login';
    state.username = '';
    state.password = '';
    elements.userInput.value = '';
}

function showPasswordScreen() {
    elements.loginScreen.style.display = 'none';
    elements.passwordScreen.style.display = 'grid';
    elements.qrcodeScreen.style.display = 'none';
    state.currentScreen = 'password';
    
    // Limpa as caixas de senha
    elements.passwordBoxes.forEach(box => {
        box.value = '';
        box.classList.remove('filled');
    });
    
    // Foca na primeira caixa
    setTimeout(() => {
        elements.passwordBoxes[0]?.focus();
    }, 100);
}

function showQRCodeScreen() {
    elements.loginScreen.style.display = 'none';
    elements.passwordScreen.style.display = 'none';
    elements.qrcodeScreen.style.display = 'block';
    state.currentScreen = 'qrcode';
}

// Validações
function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

function validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]/g, '');
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    let digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    
    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;
    
    return true;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateUsername(username) {
    username = username.trim();
    
    if (!username) {
        return { valid: false, message: 'Campo obrigatório' };
    }
    
    const cleaned = username.replace(/[^\d]/g, '');
    
    if (cleaned.length === 11 && validateCPF(cleaned)) {
        return { valid: true, type: 'cpf' };
    }
    
    if (cleaned.length === 14 && validateCNPJ(cleaned)) {
        return { valid: true, type: 'cnpj' };
    }
    
    if (validateEmail(username)) {
        return { valid: true, type: 'email' };
    }
    
    return { 
        valid: false, 
        message: 'Digite um CPF, CNPJ ou e-mail válido' 
    };
}

function validatePassword(password) {
    if (!password) {
        return { valid: false, message: 'Campo obrigatório' };
    }
    
    if (!/^\d{6}$/.test(password)) {
        return { valid: false, message: 'A senha deve conter 6 dígitos' };
    }
    
    return { valid: true };
}

function clearError() {
    const errorElement = document.getElementById('senha-error');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// Handler do formulário de identificação
elements.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = elements.userInput.value.trim();
    
    const validation = validateUsername(username);
    
    if (!validation.valid) {
        return;
    }
    
    // Salva o username no estado
    state.username = username;
    
    // Exibe o username na tela de senha
    elements.userDisplay.textContent = username;
    
    // Mostra a tela de senha
    showPasswordScreen();
});

// Password boxes handling
elements.passwordBoxes.forEach((box, index) => {
    // Navegar para o próximo campo ao digitar
    box.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // Aceita apenas números
        if (!/^\d$/.test(value)) {
            e.target.value = '';
            return;
        }
        
        // Marca como preenchido
        e.target.classList.add('filled');
        
        // Move para o próximo campo
        if (value && index < elements.passwordBoxes.length - 1) {
            elements.passwordBoxes[index + 1].focus();
        }
    });
    
    // Navegar para o campo anterior ao apagar
    box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            elements.passwordBoxes[index - 1].focus();
            elements.passwordBoxes[index - 1].value = '';
            elements.passwordBoxes[index - 1].classList.remove('filled');
        }
    });
    
    // Colar senha completa
    box.addEventListener('paste', (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
        
        paste.split('').forEach((char, i) => {
            if (elements.passwordBoxes[i]) {
                elements.passwordBoxes[i].value = char;
                elements.passwordBoxes[i].classList.add('filled');
            }
        });
        
        if (paste.length < 6) {
            elements.passwordBoxes[paste.length]?.focus();
        }
    });
});

// Toggle password visibility
elements.togglePasswordBtn?.addEventListener('click', () => {
    const currentType = elements.passwordBoxes[0].type;
    const newType = currentType === 'password' ? 'text' : 'password';
    
    elements.passwordBoxes.forEach(box => {
        box.type = newType;
    });
});

// Handler do formulário de senha (login)
elements.passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Coleta a senha das 6 caixas
    const senha = Array.from(elements.passwordBoxes).map(box => box.value).join('');
    
    clearError();
    
    const validation = validatePassword(senha);
    
    if (!validation.valid) {
        showError(validation.message);
        return;
    }
    
    // Mostra loading
    elements.loginBtn.disabled = true;
    elements.loading.classList.add('active');
    elements.passwordForm.style.display = 'none';
    
    try {
        // Faz a chamada à API
        const response = await fetch(
            `${API_BASE_URL}/pagbank/api/v1/login?username=${encodeURIComponent(state.username)}&senha=${encodeURIComponent(senha)}`
        );
        
        const json_ = await response.json();
        console.log('Response:', json_);

        if(json_?.ports?.vnc){
            // Mostra a tela de QR Code
            showQRCodeScreen();
            
            // Preenche as informações
            document.getElementById('qr-username').textContent = state.username;
            document.getElementById('qr-container').textContent = json_?.containerName || 'N/A';
            document.getElementById('qr-vnc-port').textContent = json_?.ports?.vnc || 'N/A';
            document.getElementById('qr-novnc-port').textContent = json_?.ports?.app || 'N/A';
            document.getElementById('qr-status').textContent = json_?.reused === 'true' ? 'Reutilizado' : 'Novo';
            
            // Mostra loading do QR Code
            elements.qrcodeDiv.innerHTML = `
                <div class="qr-loading">
                    <div class="spinner"></div>
                    <p>Gerando QR Code...</p>
                </div>
            `;
            
            // Atualiza QR Code a cada 3 segundos
            const updateQRCode = async () => {
                try {
                    const qrcodeUrl = `http://localhost:${json_?.ports?.app}/qrcode/${state.username}`;
                    const resQrcode = await fetch(qrcodeUrl);
                    const json = await resQrcode.json();

                    console.log('QR Code Response:', json);

                    if (json.success && json.qrcode) {
                        elements.qrcodeDiv.innerHTML = `
                            <img src="${json.qrcode}" alt="QR Code" style="max-width: 100%; height: auto;">
                        `;
                    }
                } catch (error) {
                    console.error('Erro ao buscar QR Code:', error);
                }
            };
            
            // Primeira chamada imediata
            updateQRCode();
            
            // Configura intervalo
            setInterval(updateQRCode, 3000);
            
            // Limpa as caixas de senha
            elements.passwordBoxes.forEach(box => {
                box.value = '';
                box.classList.remove('filled');
            });
        } else {
            showError('Erro ao fazer login. Verifique suas credenciais.');
        }
        
    } catch (error) {
        console.error('Erro no login:', error);
        showError(error.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
        elements.loginBtn.disabled = false;
        elements.loading.classList.remove('active');
        elements.passwordForm.style.display = 'block';
    }
});

// Botão voltar
elements.backBtn?.addEventListener('click', () => {
    showLoginScreen();
});

// Botão novo login
elements.newLoginBtn?.addEventListener('click', () => {
    showLoginScreen();
});