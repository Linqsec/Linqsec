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
      host: process.env.SMTP_HOST, // mail.gmx.net
      port: parseInt(process.env.SMTP_PORT, 10), // 587
      secure: false, // TLS → false für Port 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"LinqSec Kontakt" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // also linqsec@gmx.net
      subject: 'Neue Kontaktanfrage über die Website',
      text: `Vorname: ${vorname || ''}\nNachname: ${nachname || ''}\nE-Mail: ${email}\nUnternehmen: ${unternehmen || ''}\nNachricht:\n${nachricht}`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });

  } catch (err) {
    console.error('Mailversand fehlgeschlagen:', err);
    res.status(500).json({ error: 'Mailversand fehlgeschlagen', details: err.message });
  }
}
