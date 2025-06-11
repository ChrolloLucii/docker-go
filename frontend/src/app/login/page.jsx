'use client';
import { useState } from "react";
import styles from "@/styles/auth.module.css";

export default function LoginPage() {
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
            <h1 className={styles.cardTitle}>Выберите способ входа</h1>
            <p className={styles.cardSubtitle}>Войдите в свою учетную запись</p>
          </div>

          <div className={styles.authOptions}>
            <a href="/login/email" className={styles.authOption}>
              <div className={styles.optionIcon}>📧</div>
              <div className={styles.optionContent}>
                <h3 className={styles.optionTitle}>Войти по Email</h3>
                <p className={styles.optionDescription}>Используйте ваш email и пароль</p>
              </div>
              <div className={styles.optionArrow}>→</div>
            </a>

            <div className={styles.divider}>
              <span className={styles.dividerText}>или</span>
            </div>

            <button className={`${styles.authOption} ${styles.githubOption}`} disabled>
              <div className={styles.optionIcon}>🐙</div>
              <div className={styles.optionContent}>
                <h3 className={styles.optionTitle}>Войти через GitHub</h3>
                <p className={styles.optionDescription}>Скоро будет доступно</p>
              </div>
              <div className={styles.optionArrow}>→</div>
            </button>
          </div>

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