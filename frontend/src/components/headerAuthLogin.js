import { useEffect, useState } from "react";
import Link from "next/link";
export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
 
      <a
        href="/"
        className="fixed left-6 top-6 z-50 inline-flex no-underline"
        aria-label="Logo"
        style={{ transition: "all 0.2s" }}
      >
        <span
          className="triangle-logo"
          style={{
            borderLeftWidth: scrolled ? 7 : 10,
            borderRightWidth: scrolled ? 7 : 10,
            borderBottomWidth: scrolled ? 12 : 17,
            transition: "all 0.2s, border-bottom-color 0.3s ease"
          }}
        />
      </a>
      <header className="flex items-center justify-end h-16 px-4 md:px-6 bg-white dark:bg-black shadow-md">
        <nav className="flex items-center space-x-6">
        <a
            href="/signup"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
          >
            Sign Up
          </a>
          <a
            href="/contact"
            className="text-sm font-semibold text-white dark:text-black hover:text-black dark:hover:text-white transition-colors bg-black dark:bg-white rounded-lg px-3 py-2"
          >
            Contact
          </a>
          
        </nav>
      </header>
    </>
  );
}