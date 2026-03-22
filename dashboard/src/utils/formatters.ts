/**
 * Formats a phone number into Uzbekistan format: +998 XX XXX XX XX
 */
export function formatPhoneNumber(value: string): string {
  // Clear non-digits
  const cleaned = value.replace(/\D/g, '');
  
  // Always ensure it starts with 998 for formatting
  const finalCleaned = cleaned;
  if (finalCleaned.length > 0 && !finalCleaned.startsWith('998')) {
    // If user starts typing without 998, we can prepend it if it's a 9-digit local number
    if (finalCleaned.length <= 9) {
      // finalCleaned = '998' + finalCleaned; // Maybe too aggressive? Let's just format what we have
    }
  }

  // Handle +998 XX XXX XX XX
  if (finalCleaned.length > 0) {
    let res = '+' + finalCleaned.substring(0, 3);
    if (finalCleaned.length > 3) res += ' ' + finalCleaned.substring(3, 5);
    if (finalCleaned.length > 5) res += ' ' + finalCleaned.substring(5, 8);
    if (finalCleaned.length > 8) res += ' ' + finalCleaned.substring(8, 10);
    if (finalCleaned.length > 10) res += ' ' + finalCleaned.substring(10, 12);
    return res;
  }

  return finalCleaned ? '+' + finalCleaned : '';
}

/**
 * Strips formatting to send to backend
 */
export function unformatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  return '+' + cleaned;
}
