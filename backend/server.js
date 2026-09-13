import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createMailer } from './mailer.js';

let server;

try {
  const config = loadConfig();
  const app = createApp({
    allowedOrigins: config.allowedOrigins,
    contactRateLimitMax: config.contactRateLimitMax,
    mailer: createMailer(config.email),
    trustProxy: config.trustProxy,
  });

  server = app.listen(config.port);

  server.once('listening', () => {
    console.log(`Servidor rodando na porta ${config.port}`);
  });

  server.once('error', (error) => {
    console.error(`Erro no servidor HTTP: ${error.message}`);
    process.exitCode = 1;
  });
} catch (error) {
  console.error(`Falha ao iniciar a API: ${error.message}`);
  process.exitCode = 1;
}

const shutdown = (signal) => {
  if (!server) return;

  console.log(`${signal} recebido. Encerrando o servidor...`);
  server.close((error) => {
    if (error) {
      console.error(`Falha ao encerrar o servidor: ${error.message}`);
      process.exitCode = 1;
    }
  });
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
