import express from 'express';
import { register, login, resetPassword, getProfile } from './auth.controller.js';
import { verifyToken, requireRole } from './middleware/auth.middleware.js';

const router = express.Router();

// Registrierung
router.post('/register', register);
// Login
router.post('/login', login);
// Passwort-Reset (E-Mail-Link)
router.post('/reset', resetPassword);
// Profil anzeigen (nur eingeloggte User)
router.get('/profile', verifyToken, getProfile);

export default router;
