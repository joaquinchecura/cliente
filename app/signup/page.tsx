import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Crear Cuenta</h1>
          <p className="text-slate-500">Unite a Cultiva</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <SignUp 
            routing="path"
            path="/signup"
            fallbackRedirectUrl="/completar"
            signInUrl="/login"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                card: 'shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
              }
            }}
          />
        </div>

        <a 
          href="/login"
          className="block text-center text-sm text-slate-500 mt-6 hover:text-slate-700"
        >
          ← Ya tengo cuenta
        </a>
      </div>
    </div>
  )
}