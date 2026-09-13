const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;

const cleanText = (value) => (typeof value === 'string' ? value.trim() : '');

export const validateContact = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'O corpo da requisição deve ser um objeto JSON.' };
  }

  const name = cleanText(body.user_name);
  const email = cleanText(body.user_email).toLowerCase();
  const message = cleanText(body.message);

  if (name.length < 2 || name.length > 100 || CONTROL_CHARACTERS.test(name)) {
    return { error: 'Informe um nome válido com até 100 caracteres.' };
  }

  if (email.length > 254 || !EMAIL_PATTERN.test(email) || CONTROL_CHARACTERS.test(email)) {
    return { error: 'Informe um endereço de e-mail válido.' };
  }

  if (message.length < 10 || message.length > 5000) {
    return { error: 'A mensagem deve ter entre 10 e 5000 caracteres.' };
  }

  return { value: { name, email, message } };
};
