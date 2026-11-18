// Minimal client for the WHO ICD-11 API (task T-022, docs/04 → "WHO ICD-11 API").
// Register a free API client at https://icd.who.int/icdapi and put the credentials in apps/api/.env.
// Everything this module returns is WHO's own wording; it is stored as-is (CC BY-ND 3.0 IGO).
//
// Endpoints taken from the official docs (https://icd.who.int/docs/icd-api/APIDoc-Version2/):
//   token:  https://icdaccessmanagement.who.int/connect/token   (OAuth2 client_credentials)
//   search: https://id.who.int/icd/release/11/{release}/mms/search?q=…
//   entity: the entity URI itself — "these URIs are actually the endpoints of our API"
// Every call needs the `API-Version: v2` header; `Accept-Language` picks the language layer.

import { env } from '../../config/env';

const TOKEN_URL = 'https://icdaccessmanagement.who.int/connect/token';
const ID_BASE = 'https://id.who.int';

export const ICD_LANGUAGES = ['ar', 'fr', 'en'] as const;
export type IcdLanguage = (typeof ICD_LANGUAGES)[number];

export interface IcdSearchHit {
  // Entity URI as returned by the search endpoint, normalized to https. It identifies the
  // entity in `sourceRef` *and* is the endpoint used to fetch it.
  id: string;
}

export interface EntityTexts {
  titles: Partial<Record<IcdLanguage, string>>;
  definitions: Partial<Record<IcdLanguage, string>>;
}

interface TokenResponse {
  access_token?: unknown;
  expires_in?: unknown;
}

// ICD-11 hands out http:// URIs; https avoids a redirect. A bare id means a foundation entity.
export function toEntityUri(value: string): string {
  if (value.startsWith('http://')) {
    return `https://${value.slice('http://'.length)}`;
  }
  if (value.startsWith('https://')) {
    return value;
  }
  return `${ID_BASE}/icd/entity/${value}`;
}

// Entity URI → request path ("https://id.who.int/icd/entity/257068234" → "/icd/entity/257068234").
function toPath(uri: string): string {
  try {
    return new URL(uri).pathname;
  } catch {
    return uri;
  }
}

// ICD-11 returns localized strings as `{ "@language": "en", "@value": "…" }` (or a plain string).
function localizedText(value: unknown): string | undefined {
  const raw =
    typeof value === 'string'
      ? value
      : value !== null && typeof value === 'object' && '@value' in value
        ? (value as { '@value'?: unknown })['@value']
        : undefined;
  return typeof raw === 'string' && raw.trim() !== '' ? raw : undefined;
}

export interface Icd11Client {
  search(query: string): Promise<IcdSearchHit[]>;
  entityTexts(id: string): Promise<EntityTexts>;
}

export function createIcd11Client(): Icd11Client {
  let token: string | null = null;
  let expiresAt = 0;

  async function getToken(): Promise<string> {
    if (token !== null && Date.now() < expiresAt) {
      return token;
    }
    if (env.icd11ClientId === '' || env.icd11ClientSecret === '') {
      throw new Error(
        'ICD11_CLIENT_ID / ICD11_CLIENT_SECRET are missing. Register a free key at https://icd.who.int/icdapi and add both to apps/api/.env.',
      );
    }

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.icd11ClientId,
        client_secret: env.icd11ClientSecret,
        scope: 'icdapi_access',
        grant_type: 'client_credentials',
      }),
    });
    if (!response.ok) {
      throw new Error(`ICD-11 token request failed: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as TokenResponse;
    if (typeof payload.access_token !== 'string') {
      throw new Error('ICD-11 token response contained no access_token');
    }

    token = payload.access_token;
    const lifetime = typeof payload.expires_in === 'number' ? payload.expires_in : 3600;
    expiresAt = Date.now() + lifetime * 1000 - 30_000;
    return token;
  }

  async function getJson<T>(path: string, language: IcdLanguage): Promise<T> {
    const bearer = await getToken();
    const response = await fetch(`${ID_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${bearer}`,
        Accept: 'application/json',
        'Accept-Language': language,
        'API-Version': 'v2',
      },
    });
    if (!response.ok) {
      throw new Error(`ICD-11 request failed: ${response.status} ${response.statusText} (${path})`);
    }
    return (await response.json()) as T;
  }

  async function search(query: string): Promise<IcdSearchHit[]> {
    const path = `/icd/release/11/${env.icd11Release}/mms/search?q=${encodeURIComponent(query)}`;
    const payload = await getJson<{ destinationEntities?: unknown }>(path, 'en');
    const entities = Array.isArray(payload.destinationEntities) ? payload.destinationEntities : [];

    const hits: IcdSearchHit[] = [];
    for (const entity of entities) {
      const record = entity as { id?: unknown };
      if (typeof record.id !== 'string' || record.id === '') continue;
      hits.push({ id: toEntityUri(record.id) });
    }
    return hits;
  }

  // One request per language: the API localizes `title`/`definition` from `Accept-Language`.
  async function entityTexts(id: string): Promise<EntityTexts> {
    const titles: Partial<Record<IcdLanguage, string>> = {};
    const definitions: Partial<Record<IcdLanguage, string>> = {};
    const path = toPath(id);

    for (const language of ICD_LANGUAGES) {
      const payload = await getJson<{ title?: unknown; definition?: unknown }>(path, language);

      const title = localizedText(payload.title);
      if (title !== undefined) {
        titles[language] = title;
      }
      const definition = localizedText(payload.definition);
      if (definition !== undefined) {
        definitions[language] = definition;
      }
    }

    return { titles, definitions };
  }

  return { search, entityTexts };
}
