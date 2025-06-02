import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './user.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'Alle Felder erforderlich!' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'E-Mail bereits registriert!' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash, role });
    await user.save();
    res.status(201).json({ message: 'Registrierung erfolgreich!' });
  } catch (e) {
    res.status(500).json({ message: 'Fehler bei Registrierung', error: e.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Ungültige Zugangsdaten!' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Ungültige Zugangsdaten!' });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: 'Fehler beim Login', error: e.message });
  }
}

export async function resetPassword(req, res) {
  // Für Demo: Nur Erfolgsmeldung, echte Implementierung benötigt E-Mail-Versand
  res.json({ message: 'Falls registriert, haben wir einen Link zum Zurücksetzen geschickt.' });
}

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User nicht gefunden' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: 'Fehler beim Laden des Profils', error: e.message });
  }
}
