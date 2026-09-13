import assert from 'node:assert/strict';
import test from 'node:test';
import { loadConfig } from './config.js';

test('carrega configuração válida e valores padrão', () => {
  const config = loadConfig({
    EMAIL_USER: 'sender@gmail.com',
    EMAIL_PASS: 'app-password',
    EMAIL_TO: 'owner@example.com',
  });

  assert.equal(config.port, 5000);
  assert.equal(config.contactRateLimitMax, 5);
  assert.equal(config.trustProxy, false);
});

test('rejeita configuração sem credenciais obrigatórias', () => {
  assert.throws(
    () => loadConfig({ EMAIL_USER: 'sender@gmail.com', EMAIL_TO: 'owner@example.com' }),
    /EMAIL_PASS/,
  );
});

test('carrega as credenciais SMTP', () => {
  const config = loadConfig({
    EMAIL_USER: 'sender@gmail.com',
    EMAIL_PASS: 'app-password',
    EMAIL_TO: 'owner@example.com',
  });

  assert.deepEqual(config.email, {
    user: 'sender@gmail.com',
    pass: 'app-password',
    to: 'owner@example.com',
  });
});
