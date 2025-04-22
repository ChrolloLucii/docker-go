'use client';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useState } from "react";
import clsx from "clsx";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setError("");
    try {
      const res = await axios.post("/api/auth/login", data);
      alert("Успешный вход!");
    } catch (e) {
      setError(e.response?.data?.error || "Ошибка входа");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="bg-white/90 dark:bg-black/80 rounded-xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Вход</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input
            {...register("email")}
            placeholder="Email"
            className={clsx("input", errors.email && "border-red-500")}
            autoComplete="email"
          />
          {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          <input
            {...register("password")}
            type="password"
            placeholder="Пароль"
            className={clsx("input", errors.password && "border-red-500")}
            autoComplete="current-password"
          />
          {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white rounded-lg py-2 font-semibold hover:bg-gray-800 transition"
          >
            Войти
          </button>
          {error && <div className="text-red-500 text-center">{error}</div>}
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          Нет аккаунта? <a href="/register" className="underline">Зарегистрироваться</a>
        </div>
      </div>
    </div>
  );
}