import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/styles/header.module.css";

export default function HeaderSignUp() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.headerContent}>        <Link 
          href="/" 
          className={`${styles.logo} ${scrolled ? styles.logoScrolled : ''}`}
        >
          <span className={styles.logoIcon}>🐳</span>
          <span className={styles.logoText}>DockerGo</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/projects" className={styles.navLink}>
            Проекты
          </Link>
          <a href="#" className={styles.navLink}>
            Документация
          </a>
          <a href="#" className={styles.navLink}>
            О проекте
          </a>
          <Link href="/login" className={styles.loginButton}>
            Войти
          </Link>
        </nav>        <button 
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          ☰
        </button>
      </div>

      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <nav className={styles.mobileNav}>
          <Link href="/projects" className={styles.mobileNavLink}>
            Проекты
          </Link>
          <a href="#" className={styles.mobileNavLink}>
            Документация
          </a>
          <a href="#" className={styles.mobileNavLink}>
            О проекте
          </a>
          <Link href="/login" className={styles.mobileLoginButton}>
            Войти
          </Link>
        </nav>
      </div>
    </header>
  );
}
