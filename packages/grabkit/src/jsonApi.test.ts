import { describe, expect, it } from 'vitest';

import { denormaliseDocument, serialiseBody } from './jsonApi';
import GrabkitValidationError from './GrabkitValidationError';

describe('jsonApi', () => {
  it('denormalises a single resource with merged included relationships', () => {
    const document = {
      data: {
        type: 'users',
        id: '1',
        attributes: { name: 'Leo' },
        relationships: {
          favourite_games: {
            data: [{ type: 'games', id: '3' }],
          },
        },
      },
      included: [
        {
          type: 'games',
          id: '3',
          attributes: { title: 'Red Dead Redemption II' },
        },
      ],
    };

    const { data } = denormaliseDocument(document, 'none');

    expect(data).toEqual({
      type: 'users',
      id: '1',
      name: 'Leo',
      favourite_games: [
        {
          type: 'games',
          id: '3',
          title: 'Red Dead Redemption II',
        },
      ],
    });
  });

  it('camelCases consolidated keys when casing is camelCase', () => {
    const document = {
      data: {
        type: 'users',
        id: '1',
        attributes: { first_name: 'Leo' },
        relationships: {
          favourite_games: {
            data: [{ type: 'games', id: '3' }],
          },
        },
      },
      included: [
        {
          type: 'games',
          id: '3',
          attributes: { game_title: 'RDR2' },
        },
      ],
    };

    const { data } = denormaliseDocument(document, 'camelCase');

    expect(data).toEqual({
      type: 'users',
      id: '1',
      firstName: 'Leo',
      favouriteGames: [
        {
          type: 'games',
          id: '3',
          gameTitle: 'RDR2',
        },
      ],
    });
  });

  it('serialises a flat write body into a JSON:API envelope', () => {
    const wire = serialiseBody({ type: 'users', name: 'Leo' }, 'none');

    expect(wire).toEqual({
      data: {
        type: 'users',
        attributes: { name: 'Leo' },
      },
    });
  });

  it('throws GrabkitValidationError when type is missing on write', () => {
    expect(() => serialiseBody({ name: 'Leo' }, 'none')).toThrow(GrabkitValidationError);
  });
});
