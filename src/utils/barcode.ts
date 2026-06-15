export const isAipLinkOrderUrl = (raw: string) => {
  const value = String(raw ?? '').trim();
  if (!value) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname.toLowerCase() === 'view.aiplink.net' &&
      /^\/order\/[a-z0-9_-]+\/[a-z0-9]+\/?$/i.test(url.pathname)
    );
  } catch {
    return false;
  }
};

export const extractTicketNumberFromScan = (raw: string) => {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  if (isAipLinkOrderUrl(value)) return '';

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

  // OCR / text payload variants like:
  //   "Order:M35427", "JOB ORDER M35427", "Invoice #M35427"
  const labeledMatch = value.match(
    /(?:order|invoice|ticket|job\s*order)\s*[:#\-]?\s*([A-Za-z]{0,3}\d{3,})/i
  );
  if (labeledMatch?.[1]) return labeledMatch[1].trim();

  // Normalize common CODE39 wrappers and punctuation noise.
  // Example real sticker payload can look like: "* I $ M35427 *"
  const normalized = value.replace(/\*/g, ' ').replace(/\s+/g, ' ').trim();

  // Prefer mixed tokens with letters+digits (e.g. M35427).
  // This avoids returning noisy prefixes like "IM35427".
  const strongMixedTokens = normalized.match(/\b[A-Za-z]{1,3}\d{3,}\b/g);
  if (strongMixedTokens?.length) {
    return strongMixedTokens[0].trim();
  }

  // Fallback: split by non-alphanumeric and pick best candidate token.
  const splitTokens = normalized.split(/[^0-9A-Za-z]+/).filter(Boolean);
  const splitMixed = splitTokens.find((token) => /^[A-Za-z]{1,3}\d{3,}$/.test(token));
  if (splitMixed) return splitMixed.trim();

  const compact = normalized.replace(/^[^0-9A-Za-z]+|[^0-9A-Za-z]+$/g, '').replace(/\s+/g, '');
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
