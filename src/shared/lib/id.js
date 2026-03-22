const fallbackId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buffer = new Uint32Array(4);
    crypto.getRandomValues(buffer);
    return Array.from(buffer, (value) => value.toString(36)).join('');
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
};

// Prefer secure random identifiers to avoid predictable client-side ids.
export const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return fallbackId();
};
