import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Importe ambas as funções
import { sendMail, sendConfirmationEmail } from './mailer.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {res.send('API está rodando...'); });
app.post('/api/contact', async (req, res) => {
    const { user_name, user_email, message } = req.body;

    try {
        await sendMail(user_name, user_email, message);
        await sendConfirmationEmail(user_name, user_email);
        res.status(200).json({ message: 'Mensagem enviada com sucesso!' });
    } catch (err) {
        console.error('Erro detalhado:', err);
        res.status(500).json({ error: 'Erro ao enviar e-mail.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));