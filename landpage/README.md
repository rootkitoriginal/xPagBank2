# Landing Page - Conversão de Leads

## 📋 Visão Geral

Landing page moderna e responsiva para conversão de leads com sistema de login simplificado e autenticação via QR Code.

## 🚀 Funcionalidades

### Fluxo de Autenticação
1. **Tela Inicial - Identificação**
    - Campo único para entrada de dados do usuário
    - Aceita: CPF, E-mail ou CNPJ
    - Botão "Continuar" para prosseguir

2. **Tela de Senha**
    - Exibe o usuário identificado
    - Campo para senha numérica de 6 dígitos
    - Validação em tempo real

3. **Tela de QR Code**
    - Geração dinâmica de QR Code
    - Leitura via dispositivo móvel
    - Confirmação de autenticação

## 🔌 Integração com API

### Endpoint de Login
```
POST http://localhost:4000/pagbank/api/v1/login
```

**Parâmetros:**
- `username`: CPF, E-mail ou CNPJ
- `senha`: Senha numérica de 6 dígitos

**Respostas:**
- Sucesso: `{status: true}` → Redireciona para tela de QR Code
- Erro: `{status: false, msg: '<mensagem de erro>'}` → Exibe mensagem ao usuário

## 🛠️ Tecnologias Utilizadas

- HTML5/CSS3
- JavaScript (Vanilla/Framework)
- Responsividade Mobile-First
- API REST Integration

## 📱 Responsividade

Interface otimizada para:
- Desktop
- Tablets
- Smartphones

## 🎯 Objetivos de Conversão

- Simplificar processo de login
- Reduzir fricção no cadastro
- Aumentar taxa de conversão
- Melhorar experiência do usuário

## 📊 Métricas de Sucesso

- Taxa de conversão de leads
- Tempo médio de conclusão do fluxo
- Taxa de abandono por etapa
- Satisfação do usuário

## 🚦 Como Executar

1. Clone o repositório
2. Instale as dependências
3. Configure o ambiente
4. Execute o projeto localmente
5. Acesse via navegador

## 📝 Licença

Projeto proprietário - Todos os direitos reservados