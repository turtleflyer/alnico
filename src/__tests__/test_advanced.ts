/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import alnico, { compose, lazily } from '../index';

describe('test restrictions and advanced edge cases', () => {
  test('default import is identical as method imported separately', () => {
    const { compose: composeFromDefImport, lazily: lazilyFromDefImport } = alnico;

    expect(compose).toBe(composeFromDefImport);
    expect(lazily).toBe(lazilyFromDefImport);
  });

  test('symbols in init part are not allowed', () => {
    const symbolK = Symbol();

    const composeWithSymbol1 = compose(
      // @ts-expect-error
      { [symbolK]: 1 },

      {
        // @ts-expect-error
        get: ({ [symbolK]: s }) => s.get(),
      },

      { foo: 2 }
    );

    expect(composeWithSymbol1.foo).toBe(2);
    // @ts-expect-error
    expect(() => composeWithSymbol1.get()).toThrow();

    // @ts-expect-error
    const composeWithSymbol2 = compose(
      { [symbolK]: 1 },

      {
        // @ts-expect-error
        get: ({ [symbolK]: s }) => s.get(),
      }
    );

    // @ts-expect-error
    expect(() => composeWithSymbol2.get()).toThrow();

    // @ts-expect-error
    compose<{ [symbolK]: number }, { get: () => number }, { foo: number }>(
      { [symbolK]: 1 },

      {
        // @ts-expect-error
        get: ({ [symbolK]: s }) => s.get(),
      },

      { foo: 2 }
    );

    // @ts-expect-error
    compose<{ [symbolK]: number }, { get: () => number }>(
      { [symbolK]: 1 },

      {
        // @ts-expect-error
        get: ({ [symbolK]: s }) => s.get(),
      }
    );
  });

  test('symbols in composers part are not allowed', () => {
    const symbolK = Symbol();

    const composeWithSymbol1 = compose(
      { bar: 1 },

      {
        // @ts-expect-error
        [symbolK]: ({ bar }) => bar.get(),
      },

      { foo: 2 }
    );

    expect(composeWithSymbol1.foo).toBe(2);
    // @ts-expect-error
    expect(() => composeWithSymbol1[symbolK]()).toThrow();

    // @ts-expect-error
    const composeWithSymbol2 = compose(
      { bar: 1 },

      {
        // @ts-expect-error
        [symbolK]: ({ bar }) => bar.get(),
      }
    );

    // @ts-expect-error
    expect(() => composeWithSymbol2[symbolK]()).toThrow();

    // @ts-expect-error
    compose<{ bar: number }, { [symbolK]: () => number }, { foo: number }>(
      { bar: 1 },

      {
        [symbolK]: ({ bar }) => bar.get(),
      },

      { foo: 2 }
    );

    // @ts-expect-error
    compose<{ bar: number }, { [symbolK]: () => number }>(
      { bar: 1 },

      {
        [symbolK]: ({ bar }) => bar.get(),
      }
    );
  });

  test('symbols in embed part are not allowed', () => {
    const symbolK = Symbol();

    const composeWithSymbol = compose(
      { bar: 1 },

      {
        // @ts-expect-error
        get: ({ bar }) => bar.get(),
      },

      // @ts-expect-error
      { [symbolK]: 3 }
    );

    expect(composeWithSymbol[symbolK]).toBeUndefined();
    // @ts-expect-error
    expect(composeWithSymbol.get()).toBe(1);

    // @ts-expect-error
    compose<{ bar: number }, { get: () => number }, { [symbolK]: number }>(
      { bar: 1 },

      {
        get: ({ bar }) => bar.get(),
      },

      { [symbolK]: 3 }
    );
  });

  test('recursion works correctly', () => {
    const withRecursion = compose<
      { level: number; depth: number },
      { addTensMultiplied: (x: number) => number; setDepth: (depthToSet: number) => void }
    >(
      {
        level: 0,
        depth: 5,
      },

      {
        setDepth({ depth }, depthToSet) {
          depth.set(depthToSet);
        },

        addTensMultiplied({ depth, level, addTensMultiplied }, x) {
          if (depth.get() === level.get()) {
            level.set(0);

            return x;
          }

          level.set(level.get() + 1);

          return addTensMultiplied(x + 10);
        },
      }
    );

    expect(withRecursion.addTensMultiplied(4)).toBe(54);

    withRecursion.setDepth(10);

    expect(withRecursion.addTensMultiplied(10)).toBe(110);
  });

  test('omitting the declared parts must cause errors', () => {
    // @ts-expect-error
    compose<{ foo: 1 }, { bar: () => 2 }, { zzz: 3 }>({ foo: 1 }, { bar: () => 2 });

    // @ts-expect-error
    compose<{ foo: 1 }, { bar: () => 2 }>({ foo: 1 });

    // @ts-expect-error
    compose<{ foo: 1 }, { bar: () => 2 }, { zzz: 3 }>({ foo: 1 }, undefined, { zzz: 3 });
  });
});
