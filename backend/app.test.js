import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { createApp } from './app.js';

const servers = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) => new Promise((resolve) => server.close(resolve)),
    ),
  );
});

const silentLogger = { info() {}, error() {} };

const startApi = async (mailer = {}, logger = silentLogger) => {
  const app = createApp({
    allowedOrigins: ['https://portfolio.example'],
    contactRateLimitMax: 100,
    logger,
    mailer: {
      sendContact: mailer.sendContact || (async () => {}),
      sendConfirmation: mailer.sendConfirmation || (async () => {}),
    },
  });
  const server = app.listen(0);
  servers.push(server);
  await new Promise((resolve) => server.once('listening', resolve));
  return `http://127.0.0.1:${server.address().port}`;
};

test('expõe um health check sem revelar tecnologia', async () => {
  const baseUrl = await startApi();
  const response = await fetch(baseUrl);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
  assert.equal(response.headers.get('x-powered-by'), null);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.ok(response.headers.get('x-content-type-options'));
  assert.ok(response.headers.get('x-request-id'));
});

test('registra cada requisição sem incluir o corpo enviado', async () => {
  const entries = [];
  const baseUrl = await startApi({}, {
    info: (entry) => entries.push(JSON.parse(entry)),
    error() {},
  });
  const response = await fetch(baseUrl, {
    headers: { origin: 'https://portfolio.example' },
  });
  await response.json();

  assert.equal(entries.length, 1);
  assert.equal(entries[0].event, 'http_request');
  assert.equal(entries[0].method, 'GET');
  assert.equal(entries[0].path, '/');
  assert.equal(entries[0].status, 200);
  assert.equal(entries[0].origin, 'https://portfolio.example');
  assert.equal(entries[0].requestId, response.headers.get('x-request-id'));
  assert.equal('body' in entries[0], false);
});

test('valida os dados antes de chamar o serviço de e-mail', async () => {
  let calls = 0;
  const baseUrl = await startApi({
    sendContact: async () => {
      calls += 1;
    },
  });
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      user_name: 'A',
      user_email: 'email-invalido',
      message: 'curta',
    }),
  });

  assert.equal(response.status, 400);
  assert.equal(calls, 0);
});

test('normaliza e envia uma mensagem válida', async () => {
  const deliveries = [];
  const baseUrl = await startApi({
    sendContact: async (contact) => deliveries.push(['contact', contact]),
    sendConfirmation: async (contact) => deliveries.push(['confirmation', contact]),
  });
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://portfolio.example',
    },
    body: JSON.stringify({
      user_name: '  Maria Silva  ',
      user_email: 'MARIA@EXAMPLE.COM',
      message: '  Gostaria de conversar sobre um projeto.  ',
    }),
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://portfolio.example');
  assert.equal(deliveries.length, 2);
  assert.deepEqual(deliveries[0][1], {
    name: 'Maria Silva',
    email: 'maria@example.com',
    message: 'Gostaria de conversar sobre um projeto.',
  });
});

test('bloqueia origens não autorizadas', async () => {
  const baseUrl = await startApi();
  const response = await fetch(baseUrl, {
    headers: { origin: 'https://malicioso.example' },
  });

  assert.equal(response.status, 403);
});

test('responde ao preflight OPTIONS para uma origem autorizada', async () => {
  const baseUrl = await startApi();
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: 'OPTIONS',
    headers: {
      origin: 'https://portfolio.example',
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type',
    },
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://portfolio.example');
  assert.match(response.headers.get('access-control-allow-methods'), /OPTIONS/);
  assert.match(response.headers.get('access-control-allow-methods'), /POST/);
  assert.match(response.headers.get('access-control-allow-headers'), /Content-Type/i);
});

test('não transforma falha da confirmação em reenvio da mensagem principal', async () => {
  let contactCalls = 0;
  const baseUrl = await startApi({
    sendContact: async () => {
      contactCalls += 1;
    },
    sendConfirmation: async () => {
      throw new Error('indisponível');
    },
  });
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      user_name: 'Maria Silva',
      user_email: 'maria@example.com',
      message: 'Uma mensagem suficientemente longa.',
    }),
  });

  assert.equal(response.status, 200);
  assert.equal(contactCalls, 1);
});
