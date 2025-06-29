import nodemailer from 'nodemailer';

export function sendMail(name, email, message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_TO,
    subject: `Nova mensagem de ${name}`,
    text: `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`,
  };

  return transporter.sendMail(mailOptions);
}
