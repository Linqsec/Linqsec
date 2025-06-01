import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Only POST requests allowed');
  }

  const { vorname, nachname, email, unternehmen, nachricht, dsgvoZustimmung } = req.body;

  if (!email || !nachricht || (dsgvoZustimmung !== true && dsgvoZustimmung !== 'true')) {
    return res.status(400).json({ error: 'Alle Felder erforderlich.' });
  }

  const isValidEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  if (!isValidEmail) {
    return res.status(400).json({ error: 'Ungültige E-Mail-Adresse.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: false, // GMX Port 587 → TLS → false
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ Interne Mail an LinqSec
    const mailOptions = {
      from: `"LinqSec Kontakt" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'Neue Kontaktanfrage über die Website',
      text: `Vorname: ${vorname || ''}\nNachname: ${nachname || ''}\nE-Mail: ${email}\nUnternehmen: ${unternehmen || ''}\nNachricht:\n${nachricht}`
    };

    await transporter.sendMail(mailOptions);

    // ✉️ Bestätigungsmail an Absender (wird NICHT awaited, damit Antwort schnell kommt)
    const confirmOptions = {
      from: `LinqSec <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Ihre Anfrage bei LinqSec',
      text: `Hallo ${vorname || 'und guten Tag'},\n\nvielen Dank für Ihre Nachricht an LinqSec. Wir haben Ihre Anfrage erhalten und melden uns schnellstmöglich bei Ihnen.\n\nIhre Nachricht:\n"${nachricht}"\n\nFreundliche Grüße\nIhr LinqSec Team`
    };

    transporter.sendMail(confirmOptions).catch(err => {
      console.warn('⚠️ Bestätigungsmail fehlgeschlagen:', err.message);
    });

    // ✅ Antwort an Frontend
    res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌ Mailversand fehlgeschlagen:', err);
    res.status(500).json({ error: 'Mailversand fehlgeschlagen', details: err.message });
  }
}

