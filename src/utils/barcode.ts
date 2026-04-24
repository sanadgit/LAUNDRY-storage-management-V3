export const extractTicketNumberFromScan = (raw: string) => {
  const value = String(raw ?? '').trim();
  if (!value) return '';

  try {
    const url = new URL(value);
    const fromQuery =
      url.searchParams.get('blanket') ||
      url.searchParams.get('blanket_number') ||
      url.searchParams.get('invoice') ||
      url.searchParams.get('ticket') ||
      url.searchParams.get('n') ||
      url.searchParams.get('number');
    if (fromQuery) {
      const normalizedQuery = fromQuery.trim();
      if (normalizedQuery) return normalizedQuery;
    }
  } catch {
    // raw barcode text, continue with normalization
  }

  // Many CODE39 stickers include '*' wrappers and extra symbols around the invoice.
  const code39Stripped = value.replace(/^\*+|\*+$/g, '').trim();
  const edgeTrimmed = code39Stripped.replace(/^[^0-9A-Za-z]+|[^0-9A-Za-z]+$/g, '');
  const compact = edgeTrimmed.replace(/\s+/g, '');
  if (!compact) return '';

  // If the code is primarily numeric, prefer clean digits.
  const hasLetters = /[A-Za-z]/.test(compact);
  if (!hasLetters) {
    const digits = compact.replace(/\D+/g, '');
    if (digits) return digits;
  }

  // Keep a safe alphanumeric token for mixed-format invoice numbers.
  const token = compact.replace(/[^0-9A-Za-z_-]/g, '');
  return token || compact;
};
