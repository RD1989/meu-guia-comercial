/**
 * Sanitiza números de telefone e gera links seguros e padronizados para o WhatsApp.
 */
export function cleanPhoneNumber(phone?: string | null): string {
  if (!phone) return "";
  
  // Remove todos os caracteres não numéricos
  let digits = phone.replace(/\D/g, "");

  // Se começar com 0, remove o zero inicial (ex: 011999998888 -> 11999998888)
  if (digits.startsWith("0")) {
    digits = digits.substring(1);
  }

  // Se tiver 10 ou 11 dígitos (formato padrão do Brasil com DDD), adiciona DDI 55
  if (digits.length === 10 || digits.length === 11) {
    digits = "55" + digits;
  }

  return digits;
}

/**
 * Retorna URL completa pronta para abertura de conversa no WhatsApp.
 */
export function formatWhatsAppUrl(phone?: string | null, message?: string): string {
  const cleaned = cleanPhoneNumber(phone);
  if (!cleaned) return "#";

  const baseUrl = `https://wa.me/${cleaned}`;
  if (message && message.trim().length > 0) {
    return `${baseUrl}?text=${encodeURIComponent(message.trim())}`;
  }

  return baseUrl;
}
