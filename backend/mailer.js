import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();

console.log("USER:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS ? "OK" : "MISSING");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

transporter.verify()
  .then(() => console.log("SMTP conectado com sucesso ✅"))
  .catch((err) => console.error("Erro no SMTP ❌", err));

export const sendMail = (name, email, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: process.env.EMAIL_USER, 
    replyTo: email,               
    subject: `Nova mensagem de ${name}`,
    text: `Nome: ${name}\nEmail: ${email}\nMensagem:\n${message}`,
  };

  return transporter.sendMail(mailOptions);
};

export const sendConfirmationEmail = (userName, userEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: userEmail,                
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
