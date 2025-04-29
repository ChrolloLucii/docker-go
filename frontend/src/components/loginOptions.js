import { FaGithub, FaGitlab, FaBitbucket } from 'react-icons/fa';

export default function LoginOptions() {
  return (
    <main className="flex flex-col items-center justify-center px-6 py-12 mx-auto max-w-md flex-grow">
      <h1 className="text-3xl font-semibold mb-10 text-center">Log in to Docker-go</h1>
      
      <div className="w-full space-y-3">
        <button 
          className="auth-btn flex items-center justify-center w-full bg-[hsl(var(--github-color))] text-white py-2.5 px-4 rounded-md font-medium"
        >
          <FaGithub className="mr-2" />
          Continue with GitHub
        </button>
        
        
        {/* Email Login Link */}
        <div className="pt-2 text-center">
          <a href="/login/email" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-[family-name:var(--font-geist-mono)]">
            Continue with Email →
          </a>
        </div>
      </div>
    </main>
  );
}
