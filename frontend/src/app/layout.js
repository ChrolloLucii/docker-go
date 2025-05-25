"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import useToast from '@/components/ui/useToast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const { showToast, ToastContainer } = useToast();
  const socketRef = useRef(null);

  useEffect(() => {
    // Получаем userId из localStorage токена (JWT)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let userId = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id;
      } catch {}
    }
    if (userId && !socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000');
      socketRef.current.emit('registerUser', userId);
      socketRef.current.on('project:invited', (invite) => {
  const inviter = invite.inviter;
  let inviterName =
    inviter?.username ||
    'Пользователь';

  showToast(
    `Вас пригласили в проект! Пригласил: ${inviterName}`,
    { type: 'info' }
  );
});
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [showToast]);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
