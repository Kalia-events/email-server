const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Configurar transportador de Outlook
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.OUTLOOK_EMAIL,
    pass: process.env.OUTLOOK_PASSWORD,
  },
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Email Server funcionando correctamente' });
});

// Ruta para enviar emails
app.post('/send-emails', async (req, res) => {
  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ error: 'Se requiere un array de emails' });
    }

    console.log(`[v0] Procesando ${emails.length} emails`);

    const results = [];

    for (const emailData of emails) {
      try {
        console.log(`[v0] Enviando correo a ${emailData.to}`);

        await transporter.sendMail({
          from: process.env.OUTLOOK_EMAIL,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
        });

        console.log(`[v0] Correo enviado exitosamente a ${emailData.to}`);
        results.push({
          email: emailData.to,
          status: 'success',
          message: 'Correo enviado con éxito',
        });
      } catch (error) {
        console.error(`[v0] Error al enviar correo a ${emailData.to}:`, error.message);
        results.push({
          email: emailData.to,
          status: 'failed',
          message: `Error: ${error.message}`,
        });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('[v0] Error general:', error);
    res.status(500).json({ error: 'Error al procesar los emails' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[v0] Email Server ejecutándose en puerto ${PORT}`);
});
