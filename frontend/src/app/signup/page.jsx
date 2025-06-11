'use client';
import { useState } from "react";
import axios from "axios";
import { setToken } from "@/utils/tokenCookie";
import styles from "@/styles/auth.module.css";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }

    setIsLoading(true);
    
    try {
      await axios.post("/api/auth/register", { username, email, password });
      setSuccess("Регистрация успешна! Перенаправляем...");
      
      // Автоматический вход после регистрации
      setTimeout(async () => {
        try {
          const res = await axios.post("/api/auth/login", { email, password });
          setToken(res.data.token);
          window.location.href = "/projects";
        } catch (e) {
          window.location.href = "/login/email";
        }
      }, 1500);
    } catch (e) {
      setError(e.response?.data?.error || "Ошибка регистрации");
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
      
      <div className={`${styles.authContent} ${styles.authContentWide}`}>
        <div className={styles.authHeader}>
          <a href="/" className={styles.authLogo}>
            <span className={styles.logoIcon}>🐳</span>
            <span className={styles.logoText}>DockerGo</span>
          </a>
        </div>

        <div className={styles.authCard}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Создать аккаунт</h1>
            <p className={styles.cardSubtitle}>Присоединяйтесь к сообществу разработчиков</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {error && (
              <div className={styles.errorMessage}>
                <span className={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className={styles.successMessage}>
                <span className={styles.successIcon}>✅</span>
                {success}
              </div>
            )}

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.formLabel}>Имя пользователя</label>
                <input
                  id="username"
                  type="text"
                  placeholder="john_doe"
                  className={styles.formInput}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className={styles.formInput}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
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

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>Подтвердите пароль</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className={styles.formInput}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.termsSection}>
              <p className={styles.termsText}>
                Регистрируясь, вы соглашаетесь с нашими{" "}
                <a href="#" className={styles.termsLink}>Условиями использования</a>
                {" "}и{" "}
                <a href="#" className={styles.termsLink}>Политикой конфиденциальности</a>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className={styles.authButton}
            >
              {isLoading ? (
                <span className={styles.buttonLoading}>
                  <span className={styles.spinner}></span>
                  Создание аккаунта...
                </span>
              ) : success ? (
                <span className={styles.buttonLoading}>
                  <span className={styles.successIcon}>✅</span>
                  Перенаправляем...
                </span>
              ) : (
                "Создать аккаунт"
              )}
            </button>
          </form>

          <div className={styles.authFooter}>
            <p className={styles.footerText}>
              Уже есть аккаунт?{" "}
              <a href="/login/email" className={styles.footerLink}>
                Войти
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}