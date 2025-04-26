'use client';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useState } from "react";
import clsx from "clsx";
import LoginOptions from "@/components/loginOptions";
import HeaderSignUp from "@/components/headerSignUp";
import SignUp from "@/components/signUp";
import Footer from "@/components/footer";
import SignUpOptions from "@/components/signUpOptions";
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
    <div>
    <div className="min-h-screen flex flex-col bg-background text-foreground">
     <HeaderSignUp/>
     <SignUpOptions/>
     </div>
     <Footer/>
    </div>
  );
}