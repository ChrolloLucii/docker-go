'use client';
import { useState } from "react";
import axios from "axios";
import { setToken } from "@/utils/tokenCookie";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      // Сохраняем токен в cookie
      setToken(res.data.token);
      window.location.href = "/projects"; // или dashboard
    } catch (e) {
      setError(e.response?.data?.error || "Ошибка входа");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <form onSubmit={onSubmit} className="bg-white dark:bg-black p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 px-3 py-2 border rounded"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 px-3 py-2 border rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button
          type="submit"
          className="w-full py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Login
        </button>
      </form>
    </div>
  );
}