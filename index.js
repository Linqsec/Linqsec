require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post('/api/linqsec-ai', async (req, res) => {
  const { question } = req.body;
  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'llama3.2:latest',
      prompt: question,
      stream: false
    });
    res.json({ answer: response.data.response });
  } catch (error) {
    res.status(500).json({ error: 'KI-Antwort fehlgeschlagen', details: error.message });
  }
});

console.log("Express-App initialisiert");
// HSTS Header setzen (empfohlen: erst mit kleinem maxAge testen)
app.use(
  helmet.hsts({
    maxAge: 60 * 60 * 24 * 365, // 30 Tage in Sekunden, später ggf. erhöhen
    includeSubDomains: true,
    preload: true
  })
);

// Sehr offene CSP für Entwicklung
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["*", "data:", "blob:", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["*", "data:", "blob:", "'unsafe-inline'"],
      scriptSrc: ["*", "data:", "blob:", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["*", "data:", "blob:", "'unsafe-inline'"],
      fontSrc: ["*", "data:", "blob:", "'unsafe-inline'"],
      connectSrc: ["*", "data:", "blob:", "'unsafe-inline'"],
      objectSrc: ["*", "data:", "blob:", "'unsafe-inline'"],
      upgradeInsecureRequests: [],
    },
    reportOnly: false // enforced mode!
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

// Ollama-Proxy-Endpunkt für KI-Chat
const fetch = require('node-fetch'); // Stelle sicher, dass node-fetch installiert ist

app.post('/api/linqsec-ai', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Frage fehlt.' });
  try {
    const systemPrompt = "Du bist ein freundlicher, hilfsbereiter Compliance-Berater für Unternehmen. Deine Antworten sind klar, praxisnah und berücksichtigen Datenschutz, IT-Sicherheit und rechtliche Vorgaben. Sprich die Nutzer höflich an und biete konkrete, umsetzbare Hilfestellung.";
    const ollamaRes = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:latest',
        prompt: `${systemPrompt}\n\nNutzerfrage: ${question}`,
        stream: false
      })
    });
    const data = await ollamaRes.json();
    res.json({ answer: data.response });
  } catch (err) {
    res.status(500).json({ error: 'Ollama-Proxy-Fehler', details: err.message });
  }
});

// Statische Dateien GANZ AM ENDE, nach allen API-Routen:
app.use(express.static(__dirname));

// Server starten
const port = 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${port} (Netzwerkzugriff aktiviert)`);
});
