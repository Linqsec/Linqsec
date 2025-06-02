import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Token fehlt!' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Token ungültig!' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.userRole !== role) return res.status(403).json({ message: 'Keine Berechtigung!' });
    next();
  };
}