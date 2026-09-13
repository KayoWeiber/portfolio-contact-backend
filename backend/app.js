import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { validateContact } from './validation.js';

export const createApp = ({
  allowedOrigins,
  contactRateLimitMax = 5,
  logger = console,
  mailer,
  trustProxy = false,
}) => {
  const app = express();
  const allowedOriginSet = new Set(allowedOrigins);

  app.disable('x-powered-by');
  app.set('trust proxy', trustProxy);
  app.use((request, response, next) => {
    const startedAt = process.hrtime.bigint();
    const requestId = randomUUID();

    response.setHeader('X-Request-Id', requestId);
    response.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      logger.info(
        JSON.stringify({
          event: 'http_request',
          timestamp: new Date().toISOString(),
          requestId,
          method: request.method,
          path: request.path,
          status: response.statusCode,
          durationMs: Number(durationMs.toFixed(2)),
          ip: request.ip,
          origin: request.get('origin') || null,
          userAgent: request.get('user-agent') || null,
        }),
      );
    });

    next();
  });
  app.use(helmet());
  app.use((_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use(
    cors({
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
      exposedHeaders: ['X-Request-Id'],
      maxAge: 86400,
      origin(origin, callback) {
        if (!origin || allowedOriginSet.has(origin)) return callback(null, true);
        const error = new Error('Origem não permitida pelo CORS.');
        error.status = 403;
        return callback(error);
      },
    }),
  );
  app.use(express.json({ limit: '10kb', strict: true }));

  app.get('/', (_request, response) => {
    response.status(200).json({ status: 'ok' });
  });

  const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: contactRateLimitMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
  });

  app.post('/api/contact', contactLimiter, async (request, response) => {
    const validation = validateContact(request.body);
    if (validation.error) {
      return response.status(400).json({ error: validation.error });
    }

    try {
      await mailer.sendContact(validation.value);
    } catch (error) {
      logger.error('Falha ao enviar a mensagem de contato:', error.message);
      return response.status(502).json({ error: 'Não foi possível enviar a mensagem.' });
    }

    try {
      await mailer.sendConfirmation(validation.value);
    } catch (error) {
      // A mensagem principal já foi entregue; responder com erro faria o cliente reenviá-la.
      logger.error('Falha ao enviar a confirmação:', error.message);
    }

    return response.status(200).json({ message: 'Mensagem enviada com sucesso!' });
  });

  app.use((_request, response) => {
    response.status(404).json({ error: 'Rota não encontrada.' });
  });

  app.use((error, _request, response, _next) => {
    if (error.type === 'entity.too.large') {
      return response.status(413).json({ error: 'Corpo da requisição muito grande.' });
    }

    if (error instanceof SyntaxError && error.status === 400) {
      return response.status(400).json({ error: 'JSON inválido.' });
    }

    const status = Number.isInteger(error.status) ? error.status : 500;
    if (status >= 500) logger.error('Erro interno da API:', error.message);
    return response.status(status).json({
      error: status === 403 ? error.message : 'Erro interno do servidor.',
    });
  });

  return app;
};
