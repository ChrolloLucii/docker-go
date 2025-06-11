'use client';
import { useState } from "react";
import axios from "axios";
import { setToken } from "@/utils/tokenCookie";
import styles from "@/styles/auth.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      setToken(res.data.token);
      window.location.href = "/projects";
    } catch (e) {
      setError(e.response?.data?.error || "Ошибка входа");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBackground}>
        <div className={styles.authGrid}></div>
        <div className={styles.authGlow}></div>
      </div>
      
      <div className={styles.authContent}>
        <div className={styles.authHeader}>
          <a href="/" className={styles.authLogo}>
            <span className={styles.logoIcon}>🐳</span>
            <span className={styles.logoText}>DockerGo</span>
          </a>
        </div>

        <div className={styles.authCard}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Добро пожаловать</h1>
            <p className={styles.cardSubtitle}>Войдите в свою учетную запись</p>
          </div>

          <form onSubmit={onSubmit} className={styles.authForm}>
            {error && (
              <div className={styles.errorMessage}>
                <span className={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Email</label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                className={styles.formInput}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>Пароль</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={styles.formInput}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.authButton}
            >
              {isLoading ? (
                <span className={styles.buttonLoading}>
                  <span className={styles.spinner}></span>
                  Вход...
                </span>
              ) : (
                "Войти"
              )}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p className={styles.footerText}>
              Нет аккаунта?{" "}
              <a href="/signup" className={styles.footerLink}>
                Зарегистрироваться
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}