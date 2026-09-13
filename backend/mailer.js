import nodemailer from 'nodemailer';

const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
  );

export const createMailer = ({ user, pass, to }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
  const from = `Portfolio <${user}>`;

  return {
    sendContact({ name, email, message }) {
      return transporter.sendMail({
        from,
        to,
        replyTo: email,
        subject: `Nova mensagem de ${name} pelo site`,
        text: `Nome: ${name}\nE-mail: ${email}\nMensagem:\n${message}`,
      });
    },

    sendConfirmation({ name, email }) {
      const safeName = escapeHtml(name);

      return transporter.sendMail({
        from,
        to: email,
        subject: 'Recebemos sua mensagem!',
        html: `
          <p>Olá, ${safeName}!</p>
          <p>Obrigado por entrar em contato. Recebi sua mensagem e responderei em breve.</p>
          <p>Atenciosamente,</p>
          <p>Kayo Weiber</p>
        `,
      });
    },
  };
};
