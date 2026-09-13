import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createMailer } from './mailer.js';

try {
  const config = loadConfig();
  const app = createApp({
    allowedOrigins: config.allowedOrigins,
    contactRateLimitMax: config.contactRateLimitMax,
    mailer: createMailer(config.email),
    trustProxy: config.trustProxy,
  });

  app.listen(config.port, () => {
    console.log(`Servidor rodando na porta ${config.port}`);
  });
} catch (error) {
  console.error(`Falha ao iniciar a API: ${error.message}`);
  process.exitCode = 1;
}
