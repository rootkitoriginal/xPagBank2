const express = require('express');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs').promises;

const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * Aguarda a página de validação aparecer após o login
 * @param {Page} page - Página do Playwright
 * @param {number} timeoutMs - Tempo limite em milissegundos
 * @param {string} usuario - Usuário para logs
 * @returns {Promise<boolean>} - True se encontrou a validação, false caso contrário
 */
async function waitForValidationPage(page, timeoutMs = 10000, usuario = 'Desconhecido') {
    const startTime = Date.now();
    
    console.log('🔍 ==============================');
    console.log('🔍 AGUARDANDO VALIDAÇÃO DE SEGURANÇA');
    console.log('🔍 ==============================');
    console.log(`👤 Usuário: ${usuario}`);
    console.log(`⏰ Timeout: ${timeoutMs/1000} segundos`);
    
    while (Date.now() - startTime < timeoutMs) {
        try {
            const validacaoElement = page.locator('text="Validação de Segurança"').first();
            
            if (await validacaoElement.isVisible({ timeout: 1000 })) {
                console.log(`✅ [${usuario}] Página de "Validação de Segurança" encontrada!`);
                return true;
            }
        } catch (error) {
            // Ignorar erros e continuar tentando
        }
        
        // Aguardar 1 segundo antes da próxima tentativa
        await page.waitForTimeout(1000);
        
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`⏳ [${usuario}] Aguardando... ${elapsed}s/${timeoutMs/1000}s`);
    }
    
    console.log(`⏰ [${usuario}] Timeout: "Validação de Segurança" não foi encontrada`);
    return false;
}

/**
 * Inicia a captura periódica do QR Code
 * @param {Page} page - Página do Playwright 
 * @param {string} usuario - Usuário para nomear o arquivo
 */
function startQRCodeCapture(page, usuario) {
    let screenshotCount = 0;
    
    console.log('📸 ==============================');
    console.log('📸 INICIANDO CAPTURA DE QR CODE');
    console.log('📸 ==============================');
    console.log('👤 Usuário:', usuario);
    
    const captureQRCode = async () => {
        try {
            screenshotCount++;
            const filename = `qrcode-${usuario}.png`;
            
            console.log(`📸 [${usuario}] [${screenshotCount}] Capturando QR Code...`);
            
            // Tentar capturar o QR Code (5ª imagem da página)
            const qrcodeImg = page.getByRole('img').nth(4);
            await qrcodeImg.screenshot({
                path: `/tmp/${filename}`,
                type: 'png'
            });
            
            console.log(`✅ [${usuario}] [${screenshotCount}] QR Code salvo: /tmp/${filename}`);
            
        } catch (error) {
            console.error(`❌ [${usuario}] [${screenshotCount}] Erro ao capturar QR Code:`, error.message);
        }
    };
    
    // Capturar imediatamente e depois a cada 2 segundos
    captureQRCode();
    const screenshotInterval = setInterval(captureQRCode, 2000);
    
    // Salvar referência do interval na página para possível cleanup futuro
    page.qrcodeScreenshotInterval = screenshotInterval;
    
    console.log(`🔄 [${usuario}] Captura automática do QR Code iniciada (a cada 2 segundos)`);
}

app.get('/', async (req, res) => {
    try {
        console.log('🚀 ==============================');
        console.log('🚀 INICIANDO NOVO PROCESSO DE LOGIN');
        console.log('🚀 ==============================');
        console.log('⏰ Timestamp:', new Date().toISOString());
        console.log('🌐 Endpoint acessado: GET /');
        console.log('📱 IP do cliente:', req.ip || req.connection.remoteAddress);
        console.log('🔧 User-Agent:', req.get('User-Agent') || 'Não informado');
        
        const usuario = '15053434000127';
        const senha = '041068';
        
        console.log('👤 Usuário alvo:', usuario);
        console.log('🔑 Senha configurada: ******** (oculta por segurança)');
        console.log('🎭 Iniciando Playwright Chromium...');

        // Lançar o navegador com args anti-detecção
        const browser = await chromium.launch({
            headless: true,
            args: []
        });

        console.log('🎭 Navegador iniciado com sucesso!');
        console.log('🌍 Criando contexto com configurações do Brasil...');
        console.log('👤 Configurando para usuário:', usuario);
        // Criar contexto com configurações completas do Brasil
        // Array de user agents aleatórios do Windows
        const windowsUserAgents = [
            'Mozilla/5.0 (PARA CONTINUAR_CLIQUE EM; CASA x86_64) AppleWebKit/537.36 (KHTML, like Gecko) SIM/141.0.0.0 Safari/537.36'
        ];
        
        // Selecionar user agent aleatório
        const randomUserAgent = windowsUserAgents[Math.floor(Math.random() * windowsUserAgents.length)];
        console.log('🤖 User Agent selecionado:', randomUserAgent);
        console.log('👤 Processando login para usuário:', usuario);
        
        const context = await browser.newContext({
            locale: 'pt-BR',
            userAgent: randomUserAgent,
        });

        await context.clearCookies();
        await context.clearPermissions();
        

        console.log('Contexto criado com sucesso! Abrindo nova página...');
        const page = await context.newPage();
        
        // Adicionar scripts anti-detecção
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
            
            // Sobrescrever o plugin array
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
            
            // Sobrescrever languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['pt-BR', 'pt', 'en-US', 'en'],
            });
            
            // Chrome runtime
            window.chrome = {
                runtime: {},
            };
            
            // Permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        });

        console.log('Navegando para www.pagbank.com.br...');
        await page.goto('https://www.pagbank.com.br', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        // Aguardar um momento para garantir que a página está totalmente carregada
        //await page.waitForTimeout(2000);

        await page.getByRole('link', { name: 'Entrar' }).click();
        await page.waitForLoadState('domcontentloaded');

        // Aguardar e preencher o CPF usando o mesmo método do MCP Playwright
        console.log('📝 Preenchendo CPF para usuário:', usuario);
        //await page.waitForTimeout(1000);
        
        // Usar o mesmo método que funciona no MCP Playwright
        const cpfInput = page.getByRole('textbox', { name: 'CPF, CNPJ ou E-mail' });
        await cpfInput.fill(usuario);
        console.log('✅ CPF preenchido com sucesso:', usuario);

        // Aguardar e clicar no botão Continuar
        await page.waitForTimeout(2000);
        console.log('Clicando no botão "Continuar"...');
        const btnContinuar = page.getByRole('button', { name: 'Continuar' });
        await btnContinuar.click({ force: true });
        console.log('Botão "Continuar" clicado!');

        // Aguardar a tela de senha aparecer - aguardar mais tempo para reCAPTCHA
        console.log('Aguardando validação do reCAPTCHA e carregamento da tela de senha...');
        //await page.waitForTimeout(5000);
        
        // Digitar a senha (041068) - SENHA CORRETA
        console.log('🔑 Digitando senha para usuário:', usuario);
        console.log('🔢 Preenchendo', senha.length, 'campos de senha...');
        
        for (let i = 0; i < senha.length; i++) {
            const campoNumero = i + 1;
            const digito = senha[i];
            console.log(`🔢 [${usuario}] Preenchendo campo ${campoNumero} com dígito ${digito}...`);
            
            try {
                const campoSenha = page.getByRole('textbox', { name: `Campo ${campoNumero}` });
                await campoSenha.click();
                await page.waitForTimeout(200);
                await campoSenha.fill(digito);
                await page.waitForTimeout(300);
                console.log(`✅ [${usuario}] Campo ${campoNumero} preenchido!`);
            } catch (error) {
                console.error(`❌ [${usuario}] Erro ao preencher campo ${campoNumero}:`, error.message);
            }
        }
        
        console.log('🔑 Senha preenchida com sucesso para usuário:', usuario);
        console.log('🚪 Clicando no botão "Entrar" para usuário:', usuario);
        try {
            const btnEntrar = page.getByRole('button', { name: 'Entrar' });
            await btnEntrar.click({ force: true });
            console.log('✅ Botão "Entrar" clicado para usuário:', usuario);
            
            console.log('⏳ Login processado para usuário:', usuario);
            console.log('🔍 Verificando resultado do login...');

            // Aguardar a página de validação aparecer (máximo 10 segundos)
            const loginSuccess = await waitForValidationPage(page, 10000, usuario);
            
            if (loginSuccess) {
                console.log('🎉 ==============================');
                console.log('🎉 LOGIN REALIZADO COM SUCESSO!');
                console.log('🎉 ==============================');
                console.log('👤 Usuário logado:', usuario);
                console.log('📸 Iniciando captura automática do QR Code...');
                
                // Iniciar captura periódica do QR Code
                startQRCodeCapture(page, usuario);
            } else {
                console.log('💥 ==============================');
                console.log('💥 FALHA NO LOGIN!');
                console.log('💥 ==============================');
                console.log('👤 Usuário que falhou:', usuario);
                console.log('❌ Validação de Segurança não encontrada');
                console.log('🚪 Fechando navegador...');
                await browser.close();
                console.log('Navegador fechado.');
            }

        } catch (error) {
            console.error('💥 ==============================');
            console.error('💥 ERRO CRÍTICO NO LOGIN!');
            console.error('💥 ==============================');
            console.error('👤 Usuário que causou erro:', usuario);
            console.error('❌ Erro ao clicar em Entrar:', error.message);
        }

        await page.waitForTimeout(1000);
        
        console.log('📋 ==============================');
        console.log('📋 FINALIZANDO PROCESSO');
        console.log('📋 ==============================');
        console.log('👤 Usuário processado:', usuario);
        console.log('✅ Enviando resposta para cliente...');
        
        res.json({
            success: true,
            message: 'PagBank login completo!',
            usuario: usuario,
            timestamp: new Date().toISOString(),
            steps: [
                'Acessou www.pagbank.com.br',
                'Clicou no botão "Entrar"',
                `Preencheu CPF: ${usuario}`,
                'Clicou em "Continuar"',
                'Aguardou validação do reCAPTCHA',
                'Digitou senha: ******** (oculta)',
                'Clicou em "Entrar"',
                'Processo de login finalizado'
            ],
            info: 'O navegador está rodando no display :0. Acesse via noVNC para visualizar o resultado.'
        });

        // Nota: Não fechamos o navegador para que o usuário possa interagir via noVNC
        // await browser.close();

    } catch (error) {
        console.error('🔥 ==============================');
        console.error('🔥 ERRO GERAL NO PROCESSO!');
        console.error('🔥 ==============================');
        //console.error('👤 Usuário que causou erro:', usuario || 'Não definido');
        console.error('❌ Erro ao executar fluxo de login:', error);
        console.error('📍 Stack trace:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Erro ao executar o fluxo de login',
            //usuario: usuario || 'Não definido',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

app.get('/qrcode/:usuario', async (req, res) => {
    try {
        const { usuario } = req.params;
        const filename = `qrcode-${usuario}.png`;
        const filePath = path.join('/tmp', filename);
        
        // Verificar se o arquivo existe
        try {
            await fs.access(filePath);
        } catch (error) {
            return res.json({
                success: false,
                qrcode: false,
                message: 'QR Code não encontrado para este usuário'
            });
        }
        
        // Ler o arquivo e converter para base64
        const imageBuffer = await fs.readFile(filePath);
        const base64Image = imageBuffer.toString('base64');
        
        res.json({
            success: true,
            qrcode: `data:image/png;base64,${base64Image}`,
            usuario: usuario,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Erro ao buscar QR Code:', error);
        res.status(500).json({
            success: false,
            qrcode: false,
            message: 'Erro ao processar QR Code',
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});