/**
 * Input sanitization and normalization utilities.
 * Ensures all data passing through API endpoints is cleansed of malicious inputs,
 * HTML tags, control characters, and normalized to standard formats.
 */

/**
 * Strips HTML tags, trims whitespace, removes control characters, and caps string length.
 */
export function sanitizeText(val: unknown, maxLen = 1000): string {
  if (typeof val !== "string") return "";
  return (
    val
      .replace(/<[^>]*>/g, "") // Strip HTML tags
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Strip ASCII control characters except \t and \n
      .trim()
      .slice(0, maxLen)
  );
}

/**
 * Normalizes email address to lowercase, trimmed, and length capped at 255.
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase().slice(0, 255);
}

/**
 * Strips whitespace, brackets, hyphens and normalizes 10-digit Indian numbers to E.164 (+91).
 */
export function sanitizePhone(phone: unknown): string {
  if (typeof phone !== "string") return "";
  const cleaned = phone.replace(/[\s()\-.]/g, "").trim();
  if (/^\d{10}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }
  return cleaned.slice(0, 20);
}

/**
 * Validates and formats date to ISO YYYY-MM-DD. Returns empty string if invalid.
 */
export function sanitizeDate(dateStr: unknown): string {
  if (typeof dateStr !== "string") return "";
  const trimmed = dateStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return "";
  const d = new Date(`${trimmed}T00:00:00Z`);
  if (!Number.isFinite(d.getTime())) return "";
  return trimmed;
}

/**
 * Recursively sanitizes plain objects and arrays.
 * Handles strings, numbers, booleans, arrays, and nested objects.
 */
export function sanitizeObject<T = unknown>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === "string") {
    return sanitizeText(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof input === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      const sanitizedKey = sanitizeText(key, 100);
      if (typeof value === "string") {
        if (key.toLowerCase().includes("email")) {
          result[sanitizedKey] = sanitizeEmail(value);
        } else if (key.toLowerCase().includes("phone") || key.toLowerCase().includes("mobile")) {
          result[sanitizedKey] = sanitizePhone(value);
        } else if (key.toLowerCase().includes("date") || key === "checkIn" || key === "checkOut") {
          result[sanitizedKey] = sanitizeDate(value) || sanitizeText(value);
        } else {
          result[sanitizedKey] = sanitizeText(value, 4000);
        }
      } else {
        result[sanitizedKey] = sanitizeObject(value);
      }
    }
    return result as T;
  }

  return input;
}
