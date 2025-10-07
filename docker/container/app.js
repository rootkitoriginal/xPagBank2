const express = require('express');
const { chromium } = require('playwright');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
    try {
        console.log('Iniciando Playwright Chromium...');
        
        // Lançar o navegador com args anti-detecção
        const browser = await chromium.launch({
            headless: false,
            args: [
            ]
        });



        console.log('Navegador iniciado. Criando contexto com configurações do Brasil...');
        // Criar contexto com configurações completas do Brasil
        // Array de user agents aleatórios do Windows
        const windowsUserAgents = [
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        ];
        
        // Selecionar user agent aleatório
        const randomUserAgent = windowsUserAgents[Math.floor(Math.random() * windowsUserAgents.length)];
        console.log('User Agent selecionado:', randomUserAgent);
        
        /*const context = await browser.newContext({
            locale: 'pt-BR',
            timezoneId: 'America/Sao_Paulo',
            geolocation: { latitude: -23.5205, longitude: -46.6333 }, // São Paulo, Brasil
            permissions: ['geolocation'],
            //viewport: { width: 1920, height: 1080 },
            userAgent: randomUserAgent,
            colorScheme: 'light',
            acceptDownloads: true,
            hasTouch: false,
            isMobile: false,
            extraHTTPHeaders: {
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });*/

        const context = await browser.newContext({
            locale: 'pt-BR',
            userAgent: randomUserAgent,
        });

        await context.clearCookies();
        await context.clearPermissions();
        
        const usuario = '15053434000127';
        const senha = '041068';

        console.log('Contexto criado com sucesso! Abrindo nova página...');
        const page = await context.newPage();
        
        // Adicionar scripts anti-detecção
        await page.addInitScript(() => {
            // Remover webdriver property
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
        console.log('Página principal carregada com sucesso!');

        // Aguardar um momento para garantir que a página está totalmente carregada
        await page.waitForTimeout(2000);

        console.log('Clicando no botão "Entrar"...');
        await page.getByRole('link', { name: 'Entrar' }).click();
        
        // Aguardar a página de login carregar
        await page.waitForLoadState('domcontentloaded');
        console.log('Página de login carregada!');

        // Aguardar e preencher o CPF usando o mesmo método do MCP Playwright
        console.log('Preenchendo CPF...');
        await page.waitForTimeout(1000);
        
        // Usar o mesmo método que funciona no MCP Playwright
        const cpfInput = page.getByRole('textbox', { name: 'CPF, CNPJ ou E-mail' });
        await cpfInput.fill(usuario);
        console.log('CPF preenchido!');

        // Aguardar e clicar no botão Continuar
        await page.waitForTimeout(2000);
        console.log('Clicando no botão "Continuar"...');
        const btnContinuar = page.getByRole('button', { name: 'Continuar' });
        await btnContinuar.click({ force: true });
        console.log('Botão "Continuar" clicado!');

        // Aguardar a tela de senha aparecer - aguardar mais tempo para reCAPTCHA
        console.log('Aguardando validação do reCAPTCHA e carregamento da tela de senha...');
        await page.waitForTimeout(5000);
        
        // Digitar a senha (041068) - SENHA CORRETA
        console.log('Digitando senha...');
        
        for (let i = 0; i < senha.length; i++) {
            const campoNumero = i + 1;
            const digito = senha[i];
            console.log(`Preenchendo campo ${campoNumero} com dígito ${digito}...`);
            
            try {
                const campoSenha = page.getByRole('textbox', { name: `Campo ${campoNumero}` });
                await campoSenha.click();
                await page.waitForTimeout(200);
                await campoSenha.fill(digito);
                await page.waitForTimeout(300);
                console.log(`Campo ${campoNumero} preenchido!`);
            } catch (error) {
                console.error(`Erro ao preencher campo ${campoNumero}:`, error.message);
            }
        }
        
        console.log('Senha preenchida com sucesso!');
        // Clicar no botão Entrar
        console.log('Clicando no botão "Entrar"...');
        try {
            const btnEntrar = page.getByRole('button', { name: 'Entrar' });
            await btnEntrar.click({ force: true });
            console.log('Botão "Entrar" clicado!');
            
            console.log('Login processado!');

            // Aguardar até 10 segundos para verificar se aparece "Validação de Segurança"
            console.log('Verificando resultado do login por até 10 segundos...');

            let found = false;
            const startTime = Date.now();
            const maxWaitTime = 10000; // 10 segundos

            while (Date.now() - startTime < maxWaitTime && !found) {
                try {
                    // Procurar pelo texto "Validação de Segurança" na página
                    const validacaoElement = await page.locator('text="Validação de Segurança"').first();
                    if (await validacaoElement.isVisible({ timeout: 1000 })) {
                        console.log('LOGADO');
                        found = true;
                        
                        // Iniciar thread separada para tirar screenshots do QR Code a cada 10 segundos
                        let screenshotCount = 0;
                        const screenshotInterval = setInterval(async () => {
                            try {
                                screenshotCount++;
                                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                                const filename = `qrcode-${usuario}.png`;
                                
                                console.log(`[Screenshot ${screenshotCount}] Capturando QR Code...`);
                                
                                // Tentar pegar a segunda imagem (que geralmente é o QR Code visível)
                                const qrcodeImg = page.getByRole('img').nth(4);
                                await qrcodeImg.screenshot({
                                    path: `/tmp/${filename}`,
                                    type: 'png'
                                });
                                
                                console.log(`[Screenshot ${screenshotCount}] QR Code salvo em /tmp/${filename}`);
                            } catch (error) {
                                console.error(`[Screenshot ${screenshotCount}] Erro ao capturar QR Code:`, error.message);
                            }
                        }, 10000); // 10 segundos
                        
                        // Armazenar o interval para poder limpar depois se necessário
                        page.qrcodeScreenshotInterval = screenshotInterval;
                        console.log('Thread de captura de QR Code iniciada (a cada 10 segundos)');
                        
                        break;
                    }
                } catch (e) {
                }
                await page.waitForTimeout(500);
            }

            if (!found) {
                console.log('Texto "Validação de Segurança" não encontrado após 10 segundos. Fechando navegador...');
                await browser.close();
                console.log('Navegador fechado.');
            }

        } catch (error) {
            console.error('Erro ao clicar em Entrar:', error.message);
        }

        await page.waitForTimeout(1000);
        res.json({
            success: true,
            message: 'PagBank login completo!',
            steps: [
                'Acessou www.pagbank.com.br',
                'Clicou no botão "Entrar"',
                'Preencheu CPF: 15053434000127',
                'Clicou em "Continuar"',
                'Aguardou validação do reCAPTCHA',
                'Digitou senha: 041068',
                'Clicou em "Entrar"',
                'Processo de login finalizado'
            ],
            info: 'O navegador está rodando no display :0. Acesse via noVNC para visualizar o resultado.'
        });

        // Nota: Não fechamos o navegador para que o usuário possa interagir via noVNC
        // await browser.close();

    } catch (error) {
        console.error('Erro ao executar fluxo de login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao executar o fluxo de login',
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});