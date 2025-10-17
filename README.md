# 📬 Portfolio Contact Backend

Este é o backend do meu portfólio, responsável por receber os dados do formulário de contato e enviar e-mails usando **Node.js**, **Express** e **Resend**.

---

## 🚀 Tecnologias

- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web minimalista
- **Resend** - Serviço de envio de e-mails
- **Dotenv** - Gerenciamento de variáveis de ambiente
- **CORS** - Middleware para habilitar Cross-Origin Resource Sharing

---

## 📥 Instalação

```bash
git clone https://github.com/KayoWeiber/portfolio-contact-backend.git
cd portfolio-contact-backend/backend
npm install
```

---

## ⚙️ Configuração

Crie um arquivo `.env` na pasta `backend/` com as seguintes variáveis:

```env
RESEND_API_KEY=sua_chave_api_do_resend
EMAIL_RECEIVER=seu_email@exemplo.com
PORT=5000
```

### Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `RESEND_API_KEY` | Chave de API do Resend para envio de e-mails | ✅ Sim |
| `EMAIL_RECEIVER` | E-mail que receberá as mensagens de contato | ✅ Sim |
| `PORT` | Porta em que o servidor irá rodar (padrão: 5000) | ❌ Não |

---

## 🚀 Executando o Projeto

### Modo de Desenvolvimento

```bash
npm run dev
```

### Modo de Produção

```bash
npm start
```

O servidor estará disponível em `http://localhost:5000`

---

## 📡 API Endpoints

### `GET /`

Verifica se a API está funcionando.

**Resposta:**
```
API está rodando...
```

---

### `POST /api/contact`

Envia uma mensagem de contato através do formulário.

**Body (JSON):**
```json
{
  "user_name": "João Silva",
  "user_email": "joao@exemplo.com",
  "message": "Olá! Gostaria de conversar sobre um projeto."
}
```

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `user_name` | string | Nome do usuário | ✅ Sim |
| `user_email` | string | E-mail do usuário | ✅ Sim |
| `message` | string | Mensagem de contato | ✅ Sim |

**Resposta de Sucesso (200):**
```json
{
  "message": "Mensagem enviada com sucesso!"
}
```

**Resposta de Erro (500):**
```json
{
  "error": "Erro ao enviar e-mail."
}
```

**Comportamento:**
1. Envia um e-mail para o proprietário do portfólio com os dados do formulário
2. Envia um e-mail de confirmação automático para o usuário que enviou a mensagem

---

## 📧 Funcionalidades de E-mail

### E-mail para o Proprietário
Quando uma mensagem é enviada, o proprietário do portfólio recebe um e-mail com:
- Nome do remetente
- E-mail do remetente (configurado como reply-to)
- Mensagem enviada

### E-mail de Confirmação
O usuário que envia a mensagem recebe automaticamente um e-mail de confirmação informando que a mensagem foi recebida.

---

## 🛠️ Estrutura do Projeto

```
portfolio-contact-backend/
├── backend/
│   ├── server.js       # Configuração do servidor Express
│   ├── mailer.js       # Lógica de envio de e-mails
│   ├── package.json    # Dependências do projeto
│   └── .env           # Variáveis de ambiente (não versionado)
├── LICENSE
└── README.md
```

---

## 🔒 Segurança

- As variáveis sensíveis (API keys, e-mails) são armazenadas em arquivo `.env`
- CORS configurado para aceitar requisições de origens específicas
- Validação de presença da API key ao iniciar o servidor

---

## 📝 Exemplo de Uso com Fetch

```javascript
const sendContactForm = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_name: 'João Silva',
        user_email: 'joao@exemplo.com',
        message: 'Olá! Gostaria de conversar sobre um projeto.'
      })
    });

    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
};
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

## 📄 Licença

Este projeto está sob a licença especificada no arquivo [LICENSE](LICENSE).

---

## 👨‍💻 Autor

**Kayo Weiber**

- GitHub: [@KayoWeiber](https://github.com/KayoWeiber)

---

## 🐛 Problemas Conhecidos

Se você encontrar algum problema, por favor abra uma issue no repositório do GitHub
