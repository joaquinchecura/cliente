import { dark } from "@clerk/themes";

export const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#22c55e", // Verde
    colorBackground: "#18181b", // Zinc-900 (Fondo de la tarjeta)
    colorText: "#fafafa", // Blanco puro para textos
    colorTextSecondary: "#a1a1aa", // Gris claro para subtítulos
    colorInputBackground: "#09090b", // Zinc-950 (Fondo de los inputs)
    colorInputText: "#ffffff",
    colorNeutral: "#ffffff", // Forzamos los textos neutros a blanco
    borderRadius: "0.75rem",
    fontFamily: "var(--font-sans)",
  },
  elements: {
    // Contenedores
    rootBox: "w-full flex justify-center",
    cardBox: "w-full shadow-none bg-transparent",
    card: "bg-zinc-900/90 backdrop-blur-md border border-zinc-800 shadow-2xl shadow-black/50 p-6 rounded-2xl w-full",
    header: "text-center mb-6",
    
    // Textos
    headerTitle: "text-white text-lg font-semibold",
    headerSubtitle: "text-zinc-400 text-sm",
    logoBox: "hidden",

    // Formulario
    formFieldLabel: "text-sm font-medium !text-zinc-300 mb-1.5 block",
    formFieldInput: "w-full h-10 px-3 rounded-lg !bg-zinc-950 !border-zinc-800 !text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all",
    formFieldInputShowPasswordButton: "text-zinc-400 hover:text-white",
    formFieldErrorText: "text-xs text-red-400 mt-1",

    // Botón principal
    formButtonPrimary: "w-full h-10 mt-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-green-500/20 active:scale-[0.98]",

    // BOTONES SOCIALES (Arreglados para que se vean)
    socialButtonsBlockButton: "w-full h-10 !bg-zinc-800 !border-zinc-700 rounded-lg !text-white hover:!bg-zinc-700 transition-all duration-200 flex items-center justify-center gap-2",
    socialButtonsBlockButtonText: "text-sm font-medium !text-zinc-300",
    
    // Divisores
    dividerLine: "bg-zinc-800",
    dividerText: "text-xs !text-zinc-500",
    
    // Footer
    footer: "mt-6 pt-4 border-t border-zinc-800",
    footerActionText: "text-sm !text-zinc-400",
    footerActionLink: "text-sm font-semibold text-green-500 hover:text-green-400 transition-colors",

    // Otros
    formResendCodeLink: "text-green-500 hover:text-green-400 text-sm",
    identityPreview: "bg-zinc-950 border-zinc-800 rounded-lg p-3 text-sm text-white",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-green-500 hover:text-green-400",
    passwordFieldInput: "w-full h-10 px-3 rounded-lg !bg-zinc-950 !border-zinc-800 !text-white",
    passwordFieldHintText: "text-xs !text-zinc-500",
    formFieldWarningText: "text-xs text-amber-400",
  },
};