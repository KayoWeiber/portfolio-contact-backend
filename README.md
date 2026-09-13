# Portfolio Contact Backend

API do formulário de contato do portfólio, construída com Node.js, Express e Nodemailer.

## Requisitos

- Node.js 20 ou superior
- Uma conta Gmail com verificação em duas etapas
- Uma senha de app do Google para autenticação SMTP

## Instalação

```bash
git clone https://github.com/KayoWeiber/portfolio-contact-backend.git
cd portfolio-contact-backend
npm --prefix backend install
```

Ao abrir a pasta no VS Code, o terminal integrado inicia automaticamente em `backend/`.
Também é possível executar todos os comandos abaixo diretamente da raiz do repositório.

## Configuração

Copie `backend/.env.example` para `backend/.env` e preencha:

```env
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-do-google
EMAIL_TO=email-que-recebera-as-mensagens@exemplo.com
PORT=5000
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://seu-portfolio.com
CONTACT_RATE_LIMIT_MAX=5
TRUST_PROXY=false
```

`EMAIL_USER` é a conta Gmail usada para enviar, `EMAIL_PASS` é a senha de app dessa conta e
`EMAIL_TO` é o endereço que receberá as mensagens do formulário. Não utilize a senha normal
da conta Google. Informe em `CORS_ALLOWED_ORIGINS` apenas as URLs exatas que devem acessar a
API, separadas por vírgula.

Se a hospedagem utilizar um proxy reverso, configure `TRUST_PROXY` conforme a quantidade de
proxies confiáveis entre o cliente e o Express (geralmente `1`). Não habilite essa opção sem
conhecer a topologia da hospedagem, pois o limite de requisições depende do IP do cliente.

> Nunca publique o arquivo `.env` nem reutilize a senha de app em outros serviços.

## Execução

Na raiz do repositório:

```bash
npm run dev
npm start
npm test
npm run audit
```

Dentro de `backend/`, os comandos equivalentes são `npm run dev`, `npm start`, `npm test` e
`npm audit`.

## Endpoints

### `GET /`

Health check:

```json
{ "status": "ok" }
```

### `POST /api/contact`

```json
{
  "user_name": "João Silva",
  "user_email": "joao@exemplo.com",
  "message": "Olá! Gostaria de conversar sobre um projeto."
}
```

Regras dos campos:

- `user_name`: texto entre 2 e 100 caracteres;
- `user_email`: endereço válido com até 254 caracteres;
- `message`: texto entre 10 e 5000 caracteres.

Respostas possíveis: `200` para envio concluído, `400` para dados ou JSON inválidos, `403`
para origem não permitida, `413` para corpo maior que 10 KB, `429` para excesso de envios e
`502` quando o provedor de e-mail não aceitar a mensagem.

## Proteções implementadas

- lista explícita de origens CORS;
- limite configurável de envios por IP a cada 15 minutos;
- validação, normalização e limites para todos os campos;
- limite de 10 KB para o corpo JSON;
- cabeçalhos HTTP de segurança com Helmet;
- respostas sem cache e sem identificação do Express;
- escape do nome inserido no HTML da confirmação;
- validação das variáveis de ambiente antes de abrir a porta;
- erros externos não expostos ao cliente;
- testes automatizados sem envio de e-mails reais.

## Estrutura

```text
backend/
├── app.js          # Middlewares, rotas e tratamento de erros
├── config.js       # Leitura e validação do ambiente
├── mailer.js       # Integração SMTP isolada com o Nodemailer
├── server.js       # Composição e inicialização do servidor
├── validation.js   # Validação dos dados de contato
├── *.test.js       # Testes automatizados
├── .env.example    # Modelo de configuração segura
└── package.json
```

## Licença

[MIT](LICENSE)
