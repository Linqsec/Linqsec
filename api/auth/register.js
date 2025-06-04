// /api/auth/register.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Nur POST erlaubt.' });
  }

  const { email, password, name, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-Mail und Passwort sind erforderlich.' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });

    if (error) {
      console.error('❌ Supabase-Fehler:', error);
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json({ message: 'Registrierung erfolgreich.', user: data.user });
  } catch (err) {
    console.error('❌ Serverfehler:', err);
    res.status(500).json({ message: 'Interner Serverfehler.' });
  }
}
