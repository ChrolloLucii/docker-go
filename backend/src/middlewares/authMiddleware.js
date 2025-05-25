import jwt from 'jsonwebtoken';
import db from '../models/index.js';

export default async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.User.findByPk(payload.id);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      username: user?.username
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid Token' });
  }
}