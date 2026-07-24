export function formatCurrency(amount: any, currency = "ARS") {
    const value = typeof amount === "object" && amount !== null ? Number(amount) : Number(amount) || 0;
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
    }).format(value);
  }
  
  export function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  
  export function formatTime(time: string) {
    return time.substring(0, 5);
  }