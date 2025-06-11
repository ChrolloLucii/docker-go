"use client";
import HeaderSignUp from "@/components/headerSignUp";
import styles from "@/styles/home.module.css";

export default function Home() {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.backgroundEffects}>
        <div className={styles.gridPattern}></div>
        <div className={styles.glowOrb}></div>
        <div className={styles.glowOrb}></div>
        <div className={styles.floatingElements}>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
          <div className={styles.floatingElement}></div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <HeaderSignUp />
        
        <main className={styles.mainContent}>
          <div className={styles.heroSection}>            <div className={styles.logoSection}>
              <span className={styles.logoIcon}>🐳</span>
              <h1 className={styles.logoText}>DockerGo</h1>
            </div>
              <h2 className={styles.heroTitle}>
              Добро пожаловать в DockerGo
            </h2>
            
            <p className={styles.heroSubtitle}>
              Учись писать Dockerfile, проверяй себя и проходи задания.
              Всё в одном лаконичном онлайн-редакторе.
            </p>            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>⚡</div>
                <h3 className={styles.featureTitle}>Совместное редактирование</h3>
                <p className={styles.featureDescription}>
                  Редактируйте файлы с преподавателями или друзьями
                </p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🔍</div>
                <h3 className={styles.featureTitle}>Проверка кода</h3>
                <p className={styles.featureDescription}>
                  Мгновенная валидация ваших Dockerfile
                </p>
              </div>
            </div>            <a href="/projects" className={styles.ctaButton}>
              Начать
              <span className={styles.ctaArrow}>→</span>
            </a>
          </div>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <p className={styles.footerText}>
              &copy; {new Date().getFullYear()} DockerGo. Powered by Next.js
            </p>
            <div className={styles.footerLinks}>
              <a href="#" className={styles.footerLink}>О проекте</a>
              <a href="#" className={styles.footerLink}>Документация</a>
              <a href="#" className={styles.footerLink}>Поддержка</a>
              <a href="#" className={styles.footerLink}>GitHub</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}