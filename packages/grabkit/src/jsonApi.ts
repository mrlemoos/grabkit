import type Casing from './Casing';
import { callerKeyFromWireKey, transformKeysDeep, wireKeyFromCallerKey } from './Casing';
import GrabkitValidationError from './GrabkitValidationError';
import type SuccessMeta from './SuccessMeta';

interface JsonApiIdentifier {
  type: string;
  id: string;
}

interface JsonApiResource {
  type: string;
  id?: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, { data?: JsonApiIdentifier | JsonApiIdentifier[] | null }>;
}

interface JsonApiDocument {
  data?: JsonApiResource | JsonApiResource[] | null;
  included?: JsonApiResource[];
  meta?: Record<string, unknown>;
  links?: Record<string, unknown>;
}

function includedIndex(included: JsonApiResource[] = []): Map<string, JsonApiResource> {
  const index = new Map<string, JsonApiResource>();

  for (const resource of included) {
    if (resource.id !== undefined) {
      index.set(`${resource.type}:${resource.id}`, resource);
    }
  }

  return index;
}

function isIdentifierOrResource(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && 'type' in value && 'id' in value;
}

function isRelationshipValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0 && value.every(isIdentifierOrResource);
  }

  return isIdentifierOrResource(value);
}

function extractIdentifier(value: unknown): JsonApiIdentifier {
  const record = value as Record<string, unknown>;
  return { type: String(record.type), id: String(record.id) };
}

function denormaliseResource(
  resource: JsonApiResource,
  index: Map<string, JsonApiResource>,
  casing: Casing,
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    type: resource.type,
  };

  if (resource.id !== undefined) {
    result.id = resource.id;
  }

  if (resource.attributes) {
    for (const [key, value] of Object.entries(resource.attributes)) {
      result[callerKeyFromWireKey(key, casing)] = value;
    }
  }

  if (resource.relationships) {
    for (const [relationshipKey, relationship] of Object.entries(resource.relationships)) {
      if (relationship.data === null || relationship.data === undefined) {
        continue;
      }

      const links = Array.isArray(relationship.data) ? relationship.data : [relationship.data];
      const resolved = links.map((link) => {
        const match = index.get(`${link.type}:${link.id}`);

        if (match) {
          return denormaliseResource(match, index, casing);
        }

        return { type: link.type, id: link.id };
      });

      const key = callerKeyFromWireKey(relationshipKey, casing);
      result[key] = Array.isArray(relationship.data) ? resolved : resolved[0];
    }
  }

  return result;
}

export function denormaliseDocument(document: JsonApiDocument, casing: Casing): {
  data: Record<string, unknown> | Record<string, unknown>[] | null;
  meta: SuccessMeta;
} {
  const index = includedIndex(document.included);
  const statusMeta: SuccessMeta = {
    statusCode: 0,
  };

  if (document.meta !== undefined) {
    statusMeta.meta = document.meta;
  }

  if (document.links !== undefined) {
    statusMeta.links = document.links;
  }

  if (document.data === null || document.data === undefined) {
    return { data: null, meta: statusMeta };
  }

  if (Array.isArray(document.data)) {
    return {
      data: document.data.map((resource) => denormaliseResource(resource, index, casing)),
      meta: statusMeta,
    };
  }

  return {
    data: denormaliseResource(document.data, index, casing),
    meta: statusMeta,
  };
}

export function isJsonApiDocument(value: unknown): value is JsonApiDocument {
  return value !== null && typeof value === 'object' && 'data' in value;
}

export function serialiseBody(body: Record<string, unknown>, casing: Casing): Record<string, unknown> {
  const type = body.type;

  if (typeof type !== 'string' || type.length === 0) {
    throw new GrabkitValidationError("Grabkit: write body requires a string 'type' field in JSON:API mode.");
  }

  const wireBody =
    casing === 'none'
      ? body
      : (transformKeysDeep(body, (key) => wireKeyFromCallerKey(key, casing)) as Record<string, unknown>);

  const { type: wireType, id, ...rest } = wireBody;
  const attributes: Record<string, unknown> = {};
  const relationships: Record<string, { data: JsonApiIdentifier | JsonApiIdentifier[] }> = {};

  for (const [key, value] of Object.entries(rest)) {
    if (isRelationshipValue(value)) {
      if (Array.isArray(value)) {
        relationships[key] = { data: value.map(extractIdentifier) };
      } else {
        relationships[key] = { data: extractIdentifier(value) };
      }
    } else {
      attributes[key] = value;
    }
  }

  const data: JsonApiResource = {
    type: String(wireType),
    attributes,
  };

  if (id !== undefined) {
    data.id = String(id);
  }

  if (Object.keys(relationships).length > 0) {
    data.relationships = relationships;
  }

  return { data };
}

export function applyCasingToData(data: unknown, casing: Casing): unknown {
  if (casing === 'none') {
    return data;
  }

  return transformKeysDeep(data, (key) => callerKeyFromWireKey(key, casing));
}
