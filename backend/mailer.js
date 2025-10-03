import { Resend } from 'resend';
import dotenv from "dotenv";

dotenv.config();

if (!process.env.RESEND_API_KEY) {
  console.error("❌ ERRO: A variável de ambiente RESEND_API_KEY é obrigatória.");
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

const fromEmail = 'onboarding@resend.dev';


export const sendMail = async (name, email, message) => {
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: process.env.EMAIL_RECEIVER, 
      reply_to: email,              
      subject: `Nova mensagem de ${name} através do site`,
      text: `Nome: ${name}\nEmail: ${email}\nMensagem:\n${message}`,
    });

    if (error) {
      console.error("Erro retornado pelo Resend:", error);
      throw new Error(error.message);
    }
    
    console.log("E-mail de contato enviado com sucesso:", data);
    return data;

  } catch (error) {
    console.error("Falha ao enviar e-mail de contato:", error);
    throw error;
  }
};


export const sendConfirmationEmail = async (userName, userEmail) => {
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: 'Recebemos sua mensagem!',
      html: `
        <p>Olá, ${userName}!</p>
        <p>Obrigado por entrar em contato. Eu recebi sua mensagem e responderei em breve.</p>
        <p>Atenciosamente,</p>
        <p>Kayo Weiber</p>
      `,
    });

    if (error) {
      console.error("Erro retornado pelo Resend:", error);
      throw new Error(error.message);
    }
    
    console.log("E-mail de confirmação enviado com sucesso:", data);
    return data;

  } catch (error) {
    console.error("Falha ao enviar e-mail de confirmação:", error);
    throw error;
  }
};