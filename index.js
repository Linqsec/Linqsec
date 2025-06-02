import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import mongoose from "mongoose";
import authRoutes from "./api/auth.routes.js";
import nodemailer from 'nodemailer';
import OpenAI from 'openai';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

// MongoDB verbinden
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB verbunden!");
}).catch((err) => {
  console.error("MongoDB Fehler:", err.message);
});

// Auth-Routen
app.use("/api/auth", authRoutes);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('combined'));

// Sicherheits-Header (inkl. HSTS)
app.use(helmet({
  hsts: {
    maxAge: 60 * 60 * 24 * 30, // 30 Tage
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: false, // optional, wenn du eigene CSP setzt
}));

// E-Mail validieren
function validateEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

// 📩 Kontaktformular-Route
app.post('/api/contact', async (req, res) => {
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
      secure: parseInt(process.env.SMTP_PORT, 10) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `LinqSec Kontakt <${process.env.SMTP_USER}>`,
      to: 'linqsec@gmx.de',
      subject: 'Neue Kontaktanfrage über die Website',
      text: `Vorname: ${vorname || ''}\nNachname: ${nachname || ''}\nE-Mail: ${email}\nUnternehmen: ${unternehmen || ''}\nNachricht: ${nachricht}`
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: 'Mailversand fehlgeschlagen', details: err.message });
  }
});

// 🤖 LinqSec AI-Route (OpenAI)
app.post('/api/linqsec-ai', async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Frage fehlt oder ist ungültig.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4",
      messages: [
        {
          role: "system",
          content: "Du bist LINQSEC AI, ein deutschsprachiger, kompetenter Compliance-Assistent für Datenschutz, IT-Sicherheit und Zertifizierungsprozesse."
        },
        { role: "user", content: question }
      ],
      temperature: 0.4,
      max_tokens: 700
    });

    const answer = completion.choices?.[0]?.message?.content || "Keine Antwort erhalten.";
    res.json({ answer });

  } catch (error) {
    console.error("OpenAI API Fehler:", error);
    res.status(500).json({ error: 'Fehler beim Abrufen der KI-Antwort' });
  }
});

// Server starten
const port = 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${port} (Netzwerkzugriff aktiviert)`);
});

// 📦 Statische Dateien ganz am Ende
app.use(express.static(__dirname));
