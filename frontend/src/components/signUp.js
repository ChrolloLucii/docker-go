import Link from "next/link";
export default function SignUp() {
    return (
      <footer className="py-6 w-full text-center text-sm">
          
          <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline font-[family-name:var(--font-geist-mono)]" >
          Нет аккаунта?{" "} Зарегестрируйтесь!
          </Link>
      </footer>
    );
  }