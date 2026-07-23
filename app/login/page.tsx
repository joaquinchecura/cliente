import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">C</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Cultiva</h1>
          <p className="text-slate-500 mt-1">Tu gimnasio, tu app</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <SignIn 
            routing="path"
            path="/login"
            fallbackRedirectUrl="/home"
            signUpUrl="/signup"
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

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 mb-2">¿Primera vez?</p>
          <a 
            href="/signup"
            className="text-blue-600 font-medium hover:underline"
          >
            Crear cuenta
          </a>
        </div>
      </div>
    </div>
  )
}