/** Key convention applied to consolidated object keys. Values (e.g. JSON:API `type` strings) are never transformed. */
type Casing = 'none' | 'snake_case' | 'camelCase' | 'kebab-case' | 'PascalCase';

export default Casing;

function splitWords(key: string): string[] {
  if (key.includes('_')) {
    return key.split('_').filter(Boolean);
  }

  if (key.includes('-')) {
    return key.split('-').filter(Boolean);
  }

  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean);
}

function joinWords(words: string[], format: Exclude<Casing, 'none'>): string {
  const lower = words.map((word) => word.toLowerCase());

  switch (format) {
    case 'snake_case':
      return lower.join('_');
    case 'kebab-case':
      return lower.join('-');
    case 'camelCase':
      return lower[0] + lower.slice(1).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    case 'PascalCase':
      return lower.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  }
}

export function transformKey(key: string, casing: Casing): string {
  if (casing === 'none') {
    return key;
  }

  return joinWords(splitWords(key), casing);
}

/** Wire JSON:API attribute keys are assumed snake_case when casing is enabled. */
export function wireKeyFromCallerKey(key: string, casing: Casing): string {
  if (casing === 'none') {
    return key;
  }

  return joinWords(splitWords(key), 'snake_case');
}

export function callerKeyFromWireKey(key: string, casing: Casing): string {
  return transformKey(key, casing);
}

export function transformKeysDeep(value: unknown, transform: (key: string) => string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => transformKeysDeep(item, transform));
  }

  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const [key, nested] of Object.entries(record)) {
      result[transform(key)] = transformKeysDeep(nested, transform);
    }

    return result;
  }

  return value;
}
