require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const nodemailer = require('nodemailer');
// Initialisiere OpenAI-Client
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const response = await client.responses.create({
    model: "gpt-4.1",
    input: "Du bist ein empathischer, sehr kompetenter Compliance Berater und führst Unternehmen professionell durch den Compliance_Prozess bis zum Audit.",
});

console.log(response.output_text);
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("Express-App initialisiert");
// HSTS Header setzen (empfohlen: erst mit kleinem maxAge testen)
app.use(
  helmet.hsts({
    maxAge: 60 * 60 * 24 * 365, // 30 Tage in Sekunden, später ggf. erhöhen
    includeSubDomains: true,
    preload: true
  })
);

app.use(
  helmet({
    xXssProtection: false // Deaktiviert den Header
  })
);

app.use(morgan('combined'));
// express.json() und express.urlencoded() wurden bereits oben initialisiert
// Für Entwicklung: Erlaube alle CORS-Anfragen
app.use(cors());

function validateEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

app.post('/api/contact', async (req, res) => {
  // Akzeptiere sowohl 'nachricht' als auch 'message' als Nachrichtenfeld
  let { vorname, nachname, email, unternehmen, nachricht, message, dsgvoZustimmung } = req.body;
  if (!nachricht && message) nachricht = message;
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Ungültige E-Mail-Adresse.' });
  }
  if (!nachricht || typeof nachricht !== 'string' || nachricht.trim().length === 0) {
    return res.status(400).json({ error: 'Nachricht darf nicht leer sein.' });
  }
  if (dsgvoZustimmung !== true && dsgvoZustimmung !== 'true') {
    return res.status(400).json({ error: 'DSGVO-Zustimmung erforderlich.' });
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: parseInt(process.env.SMTP_PORT, 10) === 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    const mailOptions = {
      from: `LinqSec Kontakt <${process.env.SMTP_USER}>`,
      to: 'linqsec@gmx.de',
      subject: 'Neue Kontaktanfrage über gmx.de',
      text: `Vorname: ${vorname}\nNachname: ${nachname}\nE-Mail: ${email}\nUnternehmen: ${unternehmen}\nNachricht: ${nachricht}`
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Mailversand fehlgeschlagen', details: err.message });
  }

});

// Statische Dateien GANZ AM ENDE, nach allen API-Routen:
app.use(express.static(__dirname));

// Server starten
const port = 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${port} (Netzwerkzugriff aktiviert)`);
});
