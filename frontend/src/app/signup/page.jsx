'use client';
import { useState } from "react";
import axios from "axios";
import HeaderSignUp from "@/components/headerSignUp";
import Footer from "@/components/footer";
export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post("/api/auth/register", { username, email, password });
      setSuccess("Регистрация успешна! Теперь войдите.");
      setUsername(""); setEmail(""); setPassword("");
    } catch (e) {
      setError(e.response?.data?.error || "Ошибка регистрации");
    }
  };

  return (
    <div>
      <HeaderSignUp />
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 border border-white/10 rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-2">Регистрация</h2>
        <input
          type="text"
          placeholder="Имя пользователя"
          className="px-3 py-2 rounded bg-black text-white border border-white/20 focus:outline-none"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="px-3 py-2 rounded bg-black text-white border border-white/20 focus:outline-none"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          className="px-3 py-2 rounded bg-black text-white border border-white/20 focus:outline-none"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 rounded bg-white text-black font-semibold hover:bg-gray-100 transition"
        >
          Зарегистрироваться
        </button>
        {error && <div className="text-red-500 text-center">{error}</div>}
        {success && <div className="text-green-500 text-center">{success}</div>}
      </form>
      <a href="/login" className="mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm font-[family-name:var(--font-geist-mono)]">Уже есть аккаунт? Войти</a>
    </div>
    <Footer />
</div>
  );
}