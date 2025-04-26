import { useState } from "react";
import { FaGithub } from "react-icons/fa";
export default function SignUpOptions() {
  const [planType, setPlanType] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const renderStep1 = () => (
    <main className="flex flex-col items-center justify-center px-6 py-6 mx-auto min-w-md flex-grow">
<div className="w-full max-w-lg p-6 bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-[#252525] shadow-sm"><div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold mb-2">
            Your First Project
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            is just a sign-up away.
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Plan Type</p>
          <div className="grid gap-3">
            <label
            htmlFor="personal"
            className={`flex items-center w-full px-4 py-3 border rounded-md cursor-pointer ${
              planType === "personal"
                ? "border-gray-400 dark:border-gray-500"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <input
              type="radio"
              name="planType"
              id="personal"
              value="personal"
              checked={planType === "personal"}
              onChange={() => setPlanType("personal")}
              className="mr-3 accent-black dark:accent-white"
            />
            <span>I'm working on personal projects</span>
            <span className="ml-4 px-2 py-0.5 bg-gray-100 dark:bg-[#8f8f8f] text-xs rounded font-bold">
              Hobby
            </span>
            </label>
          </div>
        </div>
        {planType && (
          <div className="mb-6 animate-fade-in">
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/40 transition font-bold bg-transparent"
              placeholder="Enter your name"
              autoFocus
            />
          </div>
        )}

          <button
            className="
              w-full py-3 rounded-lg font-bold text-sm transition
              bg-black text-black
              dark:bg-white dark:text-black
              hover:bg-gray-100 hover:text-black
              dark:hover:bg-gray-200 dark:hover:text-black
              disabled:bg-[#1a1a1a] disabled:text-[#8a8a8a] disabled:cursor-not-allowed
              disabled:hover:bg-[#1a1a1a] disabled:hover:text-[#8a8a8a]
              hover:cursor-pointer
            "
            disabled={!planType || !name.trim()}
            onClick={() => setStep(2)}
            type="button"
          >
            Continue
          </button> 

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          By joining, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>
        </p>
      </div>
    </main>
  );
  const renderStep2 = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Let's connect your Git provider.
      </h2>
     <div className="w-full space-y-3">
             <button 
               className="auth-btn flex items-center justify-center w-full bg-[hsl(var(--github-color))] text-white py-2.5 px-4 rounded-md font-medium"
             >
               <FaGithub className="mr-2" />
               Continue with GitHub
             </button>
             
             
             {/* Email Login Link */}
             <div className="pt-2 text-center">
               <button 
               className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-[family-name:var(--font-geist-mono)]"
                 onClick={() => setStep(3)}
                 >
                 Continue with Email →
                 
               </button>
             </div>
    </div>
    </div>
  );
  const renderStep3 = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Enter your email
      </h2>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full max-w-xs border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-black/40 transition font-bold bg-transparent"
        placeholder="you@example.com"
        autoFocus
      />
      <button
        className="
          w-full max-w-xs py-3 rounded-lg font-bold text-base transition
          bg-black text-black
              dark:bg-white dark:text-black
              hover:bg-gray-100 hover:text-black
              dark:hover:bg-gray-200 dark:hover:text-black
              disabled:bg-[#1a1a1a] disabled:text-[#8a8a8a] disabled:cursor-not-allowed
              disabled:hover:bg-[#1a1a1a] disabled:hover:text-[#8a8a8a]
              hover:cursor-pointer
        "
        disabled={!email.trim()}
        onClick={() => setStep(4)}
      >
        Finish
      </button>
    </div>
  );
  const renderStep4 = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Enter the code from your email
      </h2>
      <div className="flex gap-3 mb-4">
        {[0,1,2,3,4,5].map(i => (
          <input
            key={i}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[i] || ""}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, "");
              let newOtp = otp.split("");
              newOtp[i] = val;
              setOtp(newOtp.join("").slice(0,6));
              // Автофокус на следующий
              if (val && i < 5) {
                const next = document.getElementById(`otp-input-${i+1}`);
                if (next) next.focus();
              }
            }}
            onKeyDown={e => {
              if (e.key === "Backspace" && !otp[i] && i > 0) {
                const prev = document.getElementById(`otp-input-${i-1}`);
                if (prev) prev.focus();
              }
            }}
            id={`otp-input-${i}`}
            className="w-12 h-14 text-2xl text-center border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:border-black dark:focus:border-white outline-none transition-all font-mono bg-transparent shadow-sm"
            style={{letterSpacing: "0.1em"}}
            autoFocus={i === 0}
          />
        ))}
      </div>
      <button
        className="
          w-full max-w-xs py-3 rounded-lg font-bold text-base transition
          bg-black text-black
          dark:bg-white dark:text-black
          hover:bg-gray-100 hover:text-black
          dark:hover:bg-gray-200 dark:hover:text-black
          disabled:bg-[#1a1a1a] disabled:text-[#8a8a8a] disabled:cursor-not-allowed
        "
        disabled={otp.length !== 6}
      >
        Confirm
      </button>
    </div>
  );

  return (
    <main className="flex flex-col items-center justify-center px-6 py-6 mx-auto min-w-md flex-grow">
      <div className="w-full max-w-lg p-6 bg-white dark:bg-[#0a0a0a] rounded-lg border border-gray-200 dark:border-[#252525] shadow-sm">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </main>
  );
}