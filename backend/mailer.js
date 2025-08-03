import nodemailer from 'nodemailer';

// Defina o transporter fora das funções para reutilizá-lo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Função para enviar o email de contato PARA VOCÊ
export const sendMail = (name, email, message) => {
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_TO,
    subject: `Nova mensagem de ${name}`,
    text: `Nome: ${name}\nEmail: ${email}\nMensagem:\n${message}`,
  };
  return transporter.sendMail(mailOptions);
};

// Nova função para enviar o email de confirmação PARA O USUÁRIO
export const sendConfirmationEmail = (userName, userEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Seu email
    to: userEmail, // O email do usuário
    subject: 'Recebemos sua mensagem!',
    html: `
            <p>Olá, ${userName}!</p>
            <p>Obrigado por entrar em contato. Eu recebi sua mensagem e responderei em breve.</p>
            <p>Atenciosamente,</p>
            <p>Kayo Weiber</p>
        `,
  };
  return transporter.sendMail(mailOptions);
};