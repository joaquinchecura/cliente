import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">C</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Cultiva</h1>
          <p className="text-zinc-400 mt-1">Tu gimnasio, tu app</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          <SignIn
            routing="hash"
            forceRedirectUrl="/"
            signUpForceRedirectUrl="/completar-perfil"
            appearance={{
              elements: {
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                card: "bg-transparent shadow-none",
                headerTitle: "text-white",
                headerSubtitle: "text-zinc-400",
                socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700",
                formFieldLabel: "text-zinc-400",
                formFieldInput: "bg-zinc-950 border-zinc-800 text-white",
                footerActionLink: "text-blue-400 hover:text-blue-300",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}