import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

const required = (environment, key) => {
  const value = environment[key]?.trim();

  if (!value) {
    throw new Error(`A variável de ambiente ${key} é obrigatória.`);
  }

  return value;
};

const positiveInteger = (value, fallback, key) => {
  if (value === undefined || value === '') return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${key} deve ser um número inteiro positivo.`);
  }

  return parsed;
};

const parseTrustProxy = (value) => {
  if (!value) return false;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return positiveInteger(value, false, 'TRUST_PROXY');
};

export const loadConfig = (environment = process.env) => {
  const user = required(environment, 'EMAIL_USER');
  const to = required(environment, 'EMAIL_TO');

  if (!EMAIL_PATTERN.test(user)) {
    throw new Error('EMAIL_USER deve conter um e-mail válido.');
  }

  if (!EMAIL_PATTERN.test(to)) {
    throw new Error('EMAIL_TO deve conter um e-mail válido.');
  }

  const allowedOrigins = (
    environment.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    throw new Error('CORS_ALLOWED_ORIGINS deve conter ao menos uma origem.');
  }

  return {
    port: positiveInteger(environment.PORT, 5000, 'PORT'),
    trustProxy: parseTrustProxy(environment.TRUST_PROXY),
    contactRateLimitMax: positiveInteger(
      environment.CONTACT_RATE_LIMIT_MAX,
      5,
      'CONTACT_RATE_LIMIT_MAX',
    ),
    allowedOrigins,
    email: {
      user,
      pass: required(environment, 'EMAIL_PASS'),
      to,
    },
  };
};
