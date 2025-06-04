import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("Нет заголовка авторизации");
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log("Неправильный формат токена");
    return res.status(401).json({ error: "Malformed token" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "1234");
    req.user = payload;
    console.log("Пользователь авторизован:", payload);
    next();
  } catch (e) {
    console.log("Ошибка валидации токена:", e.message);
    return res.status(403).json({ error: "Invalid token" });
  }
}