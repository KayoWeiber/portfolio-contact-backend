import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Importe ambas as funções
import { sendMail, sendConfirmationEmail } from './mailer.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/contact', async (req, res) => {
    const { user_name, user_email, message } = req.body;

    try {
        // 1. Envia o email de contato para você
        await sendMail(user_name, user_email, message);

        // 2. Envia o email de confirmação para o usuário
        await sendConfirmationEmail(user_name, user_email);

        res.status(200).json({ message: 'Mensagem enviada com sucesso!' });
    } catch (err) {
        console.error('Erro detalhado:', err);
        res.status(500).json({ error: 'Erro ao enviar e-mail.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));