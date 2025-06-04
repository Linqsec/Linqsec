// /api/auth/login.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Nur POST erlaubt.' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-Mail und Passwort erforderlich.' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Supabase-Login-Fehler:', error.message);
      return res.status(401).json({ message: 'Login fehlgeschlagen: ' + error.message });
    }

    // Optional: Session oder Token zurückgeben
    res.status(200).json({
      message: 'Login erfolgreich',
      session: data.session,
      user: data.user
    });
  } catch (err) {
    console.error('❌ Serverfehler:', err.message);
    res.status(500).json({ message: 'Serverfehler beim Login' });
  }
}