"use client";
import HeaderSignUp from "@/components/headerSignUp";
export default function Home() {
  return (
    <div>
      <HeaderSignUp/>
    <div className="min-h-screen flex flex-col items-center justify-center dark:bg-black bg-white ">
      
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-xl p-10 max-w-xl w-full flex flex-col items-center gap-6 glass animate-pop">
          <h1 className="text-4xl font-extrabold dark:text-white text-black text-center mb-2 tracking-tight">
            Добро пожаловать в <span className="dark:text-white/70 text-black/70">DockerGo</span>
          </h1>
          <p className="dark:text-gray-200 text-black text-lg text-center mb-4">
            Учись писать Dockerfile, проверяй себя и проходи задания.<br />
            Всё в одном лаконичном онлайн-редакторе.
          </p>
          <a
            href="/projects"
            className="mt-2 px-8 py-3 rounded-xl bg-white text-black font-semibold text-lg shadow-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
          >
            Начать
          </a>
        </div>
      </main>
      <footer className="w-full text-center text-gray-500 py-6 text-sm">
        &copy; {new Date().getFullYear()} DockerGo. Powered by Next.js.
      </footer>
      <style jsx global>{`
        body {
          background: #000;
        }
        .glass {
          box-shadow: 0 8px 32px 0 rgba(0,0,0,0.37);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .animate-fadein {
          animation: fadein 1s;
        }
        .animate-pop {
          animation: popin 0.7s cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(-10px);}
          to { opacity: 1; transform: none;}
        }
        @keyframes popin {
          0% { opacity: 0; transform: scale(0.95);}
          100% { opacity: 1; transform: scale(1);}
        }
      `}</style>
    </div>
    </div>
  );
}