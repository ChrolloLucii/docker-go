import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { users } from "../data/users.js";

const JWT_SECRET = process.env.JWT_SECRET || "replace_me";

export async function register({ username, email, password }) {
  if (!username || !email || !password) {
    throw { status: 400, message: "Все поля необходимо заполнить" };
  }
  if (users.find(u => u.email === email)) {
    throw { status: 400, message: "Email занят" };
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), username, email, passwordHash };
  users.push(user);
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export async function login({ email, password }) {
  const user = users.find(u => u.email === email);
  if (!user) throw { status: 401, message: "Invalid credentials" };
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw { status: 401, message: "Invalid credentials" };
  const payload = { id: user.id, email: user.email };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  return token;
}