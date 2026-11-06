// lib/clerk-auth-appearance.ts
// Tarjeta blanca para /sign-in y /sign-up (se pasa como prop `appearance`).
export const clerkAuthAppearance = {
    variables: {
      colorPrimary: "#22c55e",
      colorBackground: "#ffffff",
      borderRadius: "1rem",
    },
    elements: {
      rootBox: "!w-full",
      cardBox: "!w-full !max-w-full shadow-none border-0 rounded-none bg-transparent",
      card: "!w-full !max-w-full bg-transparent shadow-none border-0 rounded-none p-6",
  
      headerTitle: "!text-zinc-900 text-xl font-bold",
      headerSubtitle: "!text-zinc-500 text-sm",
      formFieldLabel: "!text-zinc-700 font-medium",
      footerActionText: "!text-zinc-500 text-sm",
      footerActionLink: "!text-green-600 hover:!text-green-700 font-semibold",
      dividerText: "!text-zinc-400 text-xs",
  
      formFieldInput:
        "!bg-zinc-100 !border-transparent !text-zinc-900 placeholder:!text-zinc-500 focus:!ring-green-500/20 focus:!border-green-500 h-11 rounded-xl",
  
      formButtonPrimary:
        "!bg-green-600 hover:!bg-green-700 !text-white font-semibold h-11 rounded-xl shadow-lg shadow-green-600/20 transition-all",
  
      socialButtonsBlockButton:
        "!border-zinc-200 !text-zinc-700 hover:!bg-zinc-50 h-11 rounded-xl",
      socialButtonsBlockButtonText: "font-medium",
  
      footer: "!bg-transparent !shadow-none border-none mt-2",
      footerAction: "!bg-transparent",
      footerPages: "hidden",
    },
  };