# PagBank Container Orchestrator API

API de orquestração de containers Docker que gerencia sessões de usuário PagBank. Cada login cria um container dedicado com ambiente gráfico acessível via noVNC.

## 📋 Sumário

- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Testes](#testes)
- [Troubleshooting](#troubleshooting)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)

## 🏗️ Arquitetura do Projeto

O projeto está dividido em duas partes independentes:

### 1. **Orquestrador** (`/server`) - Roda no Host
- API Express.js que gerencia o ciclo de vida dos containers
- Autentica usuários e gerencia sessões
- Mapeia portas dinâmicas do host para os containers
- Usa templates EJS para interface web
- Endpoints REST para login/logout

### 2. **Aplicação Container** (`/docker/container`) - Roda dentro do Docker
- Aplicação Node.js isolada que roda dentro de cada container
- Interface web simples (Hello World API)
- Ambiente gráfico completo com:
  - Xvfb (framebuffer virtual)
  - Fluxbox (gerenciador de janelas)
  - x11vnc (servidor VNC)
  - noVNC (acesso VNC via navegador)
- Gerenciado por Supervisor

## 📁 Estrutura de Diretórios

```
xPagBank2/
├── server/                    # Orquestrador (host)
│   ├── src/
│   │   ├── app.js            # Configuração Express + EJS
│   │   ├── server.js         # Servidor HTTP
│   │   ├── routes/
│   │   │   └── auth.js       # Login/Logout endpoints
│   │   ├── services/
│   │   │   └── dockerService.js  # Gerenciamento Docker
│   │   ├── utils/
│   │   │   └── asyncHandler.js   # Utilitários
│   │   └── views/            # Templates EJS
│   │       ├── login-success.ejs
│   │       ├── logout-success.ejs
│   │       └── logout-error.ejs
│   ├── tests/
│   │   └── auth.test.js      # Testes do orquestrador
│   └── package.json
├── docker/                    # Configuração do container
│   ├── container/
│   │   ├── app.js            # App Node.js (Hello World)
│   │   └── package.json      # Dependências do container
│   ├── config/
│   │   └── run.sh            # Script de execução principal
│   ├── Dockerfile            # Build da imagem do container
│   ├── supervisord.conf      # Configuração dos serviços
│   └── entrypoint.sh         # Script de inicialização
└── README.md
```

## 📦 Requisitos

- Node.js 18+
- Docker Engine com permissões para `docker build` e `docker run`
- Git (para clonar o repositório)

## 🚀 Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/rootkitoriginal/xPagBank2.git
cd xPagBank2
```

### 2. Instalar Dependências do Orquestrador

```bash
# Instalar dependências do orquestrador
cd server
npm install
cd ..

# Instalar dependências da aplicação container
cd docker/container
npm install
cd ../..
```

### 3. Construir a Imagem Docker

```bash
# Constrói a imagem com a tag 'pagbank-app'
docker build -t pagbank-app -f docker/Dockerfile .

# Verificar se a imagem foi criada
docker images | grep pagbank-app
```

**O que acontece no build:**
- Instala dependências do sistema (Xvfb, Fluxbox, x11vnc, etc)
- Baixa e configura noVNC
- Instala dependências Node.js do container
- Copia aplicação do diretório `/docker/container`
- Configura Supervisor para gerenciar todos os serviços

## ⚙️ Configuração

Variáveis de ambiente opcionais:

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `4000` | Porta do servidor orquestrador |
| `PAGBANK_USERNAME` | _não definido_ | Usuário para autenticação (opcional) |
| `PAGBANK_PASSWORD` | _não definido_ | Senha para autenticação (opcional) |
| `PAGBANK_IMAGE_NAME` | `pagbank-app` | Nome da imagem Docker |
| `PAGBANK_DOCKERFILE` | `Dockerfile` | Caminho do Dockerfile |

**Nota:** Se `PAGBANK_USERNAME` e `PAGBANK_PASSWORD` não forem definidos, qualquer combinação de usuário/senha será aceita.

## 🎯 Uso

### Iniciar o Servidor Orquestrador

```bash
cd server
npm start
```

O servidor iniciará na porta `4000` (ou na porta definida em `PORT`).

### Endpoints da API

#### Login - Iniciar Container

```bash
GET /pagbank/api/v1/login?username=USER&senha=PASSWORD
```

**O que acontece:**
1. Valida credenciais (se configuradas)
2. Verifica se já existe container para o usuário
3. Cria novo container ou reutiliza existente
4. Mapeia portas aleatórias do host para o container
5. Retorna página HTML com:
   - Informações do container
   - Portas mapeadas
   - Links para acessar a aplicação e o noVNC

**Portas mapeadas:**
- Porta aleatória do host → 3000 (aplicação Node.js no container)
- Porta aleatória do host → 6080 (interface noVNC no container)

#### Logout - Parar Container

```bash
GET /pagbank/api/v1/logout?username=USER
```

**O que acontece:**
1. Busca container do usuário
2. Para e remove o container
3. Retorna página HTML confirmando a remoção

### Exemplo de Uso Completo

```bash
# 1. Fazer login
curl "http://localhost:4000/pagbank/api/v1/login?username=teste&senha=123"
# Resposta: Página HTML com portas 35265 (app) e 43947 (vnc)

# 2. Acessar aplicação
# Navegador: http://localhost:35265

# 3. Acessar noVNC
# Navegador: http://localhost:43947

# 4. Fazer logout
curl "http://localhost:4000/pagbank/api/v1/logout?username=teste"
```

## 🧪 Testes

### Executar Testes Automatizados

```bash
cd server
npm test -- --runInBand
```

Os testes verificam:
- Autenticação de usuários
- Criação e gerenciamento de containers
- Fluxos de login/logout
- Tratamento de erros

### Testar Container Manualmente

Para testar um container sem usar o orquestrador:

```bash
# Iniciar container com portas fixas
docker run -d -p 3000:3000 -p 6080:6080 --name test-pagbank pagbank-app

# Verificar se está rodando
docker ps | grep test-pagbank

# Ver logs
docker logs test-pagbank

# Verificar status dos serviços
docker exec test-pagbank supervisorctl status

# Acessar:
# - Aplicação: http://localhost:3000
# - noVNC: http://localhost:6080

# Parar e remover
docker rm -f test-pagbank
```

## 🐳 Arquitetura do Container

### Serviços Gerenciados pelo Supervisor

1. **Xvfb** (prioridade 100) - Display virtual :0
2. **Fluxbox** (prioridade 200) - Gerenciador de janelas
3. **x11vnc** (prioridade 300) - Servidor VNC na porta 5900
4. **noVNC** (prioridade 400) - Interface web na porta 6080
5. **Node App** (prioridade 500) - Aplicação na porta 3000

### Fluxo de Inicialização

1. Docker executa `/config/run.sh`
2. `run.sh` chama `/entrypoint.sh`
3. `entrypoint.sh` prepara ambiente (diretórios, permissões)
4. Supervisor inicia e gerencia todos os serviços
5. Container fica pronto para uso

### Portas Internas do Container

- **3000**: Aplicação Express.js
- **6080**: Interface web noVNC
- **5900**: Servidor VNC (interno)

## 🔧 Troubleshooting

### Problemas no Build

**Erro: noVNC installation fails**
- Verifique conexão com GitHub
- Tente rebuildar: `docker build --no-cache -t pagbank-app -f docker/Dockerfile .`

**Erro: Permission denied**
- Verifique permissões do Docker: `docker run hello-world`
- Adicione usuário ao grupo docker: `sudo usermod -aG docker $USER`

### Problemas em Runtime

**Container não inicia**
```bash
# Ver logs completos
docker logs <container-id>

# Verificar processos
docker exec <container-id> supervisorctl status
```

**noVNC não funciona**
```bash
# Verificar logs do noVNC
docker exec <container-id> cat /var/log/supervisor/novnc.err

# Verificar se x11vnc está rodando
docker exec <container-id> ps aux | grep x11vnc
```

**Porta já em uso**
- O orquestrador usa `get-port` para encontrar portas livres automaticamente
- Para teste manual, escolha outras portas: `docker run -p 3001:3000 -p 6081:6080 ...`

## 🛠️ Tecnologias Utilizadas

### Backend (Orquestrador)
- Express.js - Framework web
- EJS - Template engine
- Morgan - HTTP logger
- get-port - Alocação dinâmica de portas
- Jest - Framework de testes

### Container
- Node.js - Runtime
- Xvfb - Virtual framebuffer
- Fluxbox - Window manager
- x11vnc - VNC server
- noVNC - Browser VNC client
- Supervisor - Process manager

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 👤 Autor

- [@rootkitoriginal](https://github.com/rootkitoriginal)

## 🔗 Links

- Repositório: [https://github.com/rootkitoriginal/xPagBank2](https://github.com/rootkitoriginal/xPagBank2)
