/* eslint-disable @typescript-eslint/no-unused-vars */
import { compose } from '../index';
import type { IsEqual, IsTrue } from './__assets__/test.types';

describe('test advanced types and edge cases with types', () => {
  test('generic types passed to composer work correctly', () => {
    const genericFn1 = <S extends string>(initValue: S) =>
      compose<{ value: S }, { getValue: () => S }>(
        { value: initValue },

        {
          getValue: ({ value }) => {
            const toReturn = value.get();
            type TestCase1 = IsTrue<IsEqual<typeof toReturn, S>>;

            return toReturn;
          },
        }
      );

    const composed1 = genericFn1('abc');

    type TestCase2 = IsTrue<IsEqual<typeof composed1.getValue, () => 'abc'>>;

    expect(composed1.getValue()).toBe('abc');

    const genericFn2 = <S extends string>(initValue: S) =>
      compose<{}, { getValue: () => S }, { value: S }>(
        {},

        {
          getValue: ({ value }) => {
            type TestCase3 = IsTrue<IsEqual<typeof value, S>>;

            return value;
          },
        },

        { value: initValue }
      );

    const composed2 = genericFn1('cde');

    type TestCase4 = IsTrue<IsEqual<typeof composed2.getValue, () => 'cde'>>;

    expect(composed2.getValue()).toBe('cde');
  });

  test('init values of undefined type are allowed', () => {
    const { getUndefined1 } = compose<{ und: undefined }, { getUndefined1: () => undefined }>(
      { und: undefined },

      {
        getUndefined1({ und }) {
          und.set(undefined);

          return und.get();
        },
      }
    );

    expect(getUndefined1()).toBe(undefined);

    const { getUndefined2 } = compose<
      { und: object | undefined },
      { getUndefined2: () => undefined }
    >(
      { und: {} },

      {
        getUndefined2({ und }) {
          const v = und.get();
          und.set(undefined);

          return v ? undefined : v;
        },
      }
    );

    expect(getUndefined2()).toBe(undefined);

    const { getUndefined3 } = compose<{}, { getUndefined3: () => undefined }, { und: undefined }>(
      {},

      {
        getUndefined3({ und }) {
          return und;
        },
      },

      { und: undefined }
    );

    expect(getUndefined3()).toBe(undefined);

    const { getUndefined4 } = compose<
      {},
      { getUndefined4: () => undefined },
      { und: object | undefined }
    >(
      {},

      {
        getUndefined4({ und }) {
          return und ? undefined : und;
        },
      },

      { und: {} }
    );

    expect(getUndefined4()).toBe(undefined);
  });

  test('init values of null type are allowed', () => {
    const { getNull1 } = compose<{ nul: null }, { getNull1: () => null }>(
      { nul: null },

      {
        getNull1({ nul }) {
          nul.set(null);

          return nul.get();
        },
      }
    );

    expect(getNull1()).toBe(null);

    const { getNull2 } = compose<{ nul: object | null }, { getNull2: () => null }>(
      { nul: {} },

      {
        getNull2({ nul }) {
          const v = nul.get();
          nul.set(null);

          return v ? null : v;
        },
      }
    );

    expect(getNull2()).toBe(null);

    const { getNull3 } = compose<{}, { getNull3: () => null }, { nul: null }>(
      {},

      {
        getNull3({ nul }) {
          return nul;
        },
      },

      { nul: null }
    );

    expect(getNull3()).toBe(null);

    const { getNull4 } = compose<{}, { getNull4: () => null }, { nul: object | null }>(
      {},

      {
        getNull4({ nul }) {
          return nul ? null : nul;
        },
      },

      { nul: {} }
    );

    expect(getNull4()).toBe(null);
  });

  test('init values of undefined and null type are allowed', () => {
    const { getNullOrUndefined1 } = compose<
      { nulOrUnd: undefined | null },
      { getNullOrUndefined1: () => undefined | null }
    >(
      { nulOrUnd: undefined },

      {
        getNullOrUndefined1({ nulOrUnd }) {
          nulOrUnd.set(undefined);

          return nulOrUnd.get();
        },
      }
    );

    expect(getNullOrUndefined1()).toBe(undefined);

    const { getNullOrUndefined2 } = compose<
      { nulOrUnd: object | undefined | null },
      { getNullOrUndefined2: () => undefined | null }
    >(
      { nulOrUnd: {} },

      {
        getNullOrUndefined2({ nulOrUnd }) {
          const v = nulOrUnd.get();
          nulOrUnd.set(undefined);

          return v ? undefined : v;
        },
      }
    );

    expect(getNullOrUndefined2()).toBe(undefined);

    const { getNullOrUndefined3 } = compose<
      {},
      { getNullOrUndefined3: () => undefined | null },
      { nulOrUnd: undefined | null }
    >(
      {},

      {
        getNullOrUndefined3({ nulOrUnd }) {
          return nulOrUnd;
        },
      },

      { nulOrUnd: undefined }
    );

    expect(getNullOrUndefined3()).toBe(undefined);

    const { getNullOrUndefined4 } = compose<
      {},
      { getNullOrUndefined4: () => undefined | null },
      { nulOrUnd: object | undefined | null }
    >(
      {},

      {
        getNullOrUndefined4({ nulOrUnd }) {
          return nulOrUnd ? undefined : nulOrUnd;
        },
      },

      { nulOrUnd: {} }
    );

    expect(getNullOrUndefined4()).toBe(undefined);
  });
});
