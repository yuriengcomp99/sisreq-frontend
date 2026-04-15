export function formatDate(date: string | Date) {
    if (!date) return "-"
  
    const parsedDate = new Date(date)
  
    if (isNaN(parsedDate.getTime())) return "-"
  
    return parsedDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }
  
  export function formatDateFull(date: string | Date) {
    if (!date) return "-"
  
    const parsedDate = new Date(date)
  
    return parsedDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }
  
  export function formatNumber(value: number) {
    if (value === null || value === undefined) return "0"
  
    return new Intl.NumberFormat("pt-BR").format(value)
  }
  
  export function formatCurrency(value: number) {
    if (value === null || value === undefined) return "R$ 0,00"
  
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }