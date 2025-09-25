const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Load from .env
require('dotenv').config();
const YOUR_EMAIL = process.env.CONTACT_EMAIL;
const APP_PASSWORD = process.env.APP_PASSWORD;

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!email || !message) {
    console.warn('❗ Lipsesc emailul sau mesajul');
    return res.status(400).json({ error: 'Email și mesaj obligatorii' });
  }

  console.log('📩 [FORMULAR TRIMIS]');
  console.log({ name, email, message });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: YOUR_EMAIL,
        pass: APP_PASSWORD,
      },
      debug: true, // loguri detaliate
    });

    const mailOptions = {
      from: `"${name || 'Anonim'}" <${email}>`,
      to: YOUR_EMAIL,
      subject: `Mesaj nou prin formularul de contact`,
      text: `De la: ${name || 'Anonim'}\nEmail: ${email}\n\nMesaj:\n${message}`,
    };

    console.log('📨 Trimit email către:', YOUR_EMAIL);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email trimis cu succes!');
    console.log('📬 Info:', info);

    res.status(200).json({ message: 'Mesaj trimis cu succes' });
  } catch (err) {
    console.error('❌ Eroare la trimiterea emailului:', err);
    res.status(500).json({ error: 'Eroare la trimiterea emailului' });
  }
});

module.exports = router;
