// lib/clerk-appearance.ts
// Apariencia GLOBAL (la usa el <ClerkProvider> del layout).
// Solo activa la capa CSS de Clerk para que las clases de Tailwind v4 ganen.
// Los estilos de login/registro viven en lib/clerk-auth-appearance.ts.
export const clerkAppearance = {
  cssLayerName: "clerk",
};