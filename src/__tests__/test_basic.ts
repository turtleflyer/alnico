/* eslint-disable @typescript-eslint/no-unused-vars */
import { gse } from '../alnico';
import type { BuildDeps, GSEBundle } from '../alnico.types';
import Comp, { compose, lazily, type MethodComposer } from '../index';
import type { IsEqual, IsTrue } from './__assets__/test.types';

describe('test types, identity and minimum functionality', () => {
  test('primitive types are correct', () => {
    const gs1: GSEBundle<number, {}> = gse(1, {});

    // @ts-expect-error
    const gs2: GSEBundle<string> = gse(1);

    const composer1: MethodComposer<
      'bar',
      { a: number; b: string },
      { foo: () => number; bar: (p: string) => boolean }
    > = ({ a, b, foo, bar }, p) => true;

    const composer2: MethodComposer<
      'bar',
      { a: number; b: string },
      { foo: () => number; bar: (p: string) => boolean }
    > = ({ a, b }, p) => true;

    const composer3: MethodComposer<
      'bar',
      { a: number; b: string },
      { foo: () => number; bar: (p: string) => boolean }
    > = () => true;

    // @ts-expect-error
    const composer4: MethodComposer<
      'bar',
      { a: number; b: string },
      { foo: () => number; bar: (p: string) => boolean }
      // @ts-expect-error
    > = (_, p1, p2) => true;

    const composer5: MethodComposer<
      'bar',
      { a: number; b: string },
      { foo: () => number; bar: (p: string) => boolean }
      // @ts-expect-error
    > = (_, p) => 1;

    const composer6: MethodComposer<
      'foo',
      { a: number; b: string },
      { foo: () => number; bar: (p: string) => boolean }
    > = () => 1;

    // @ts-expect-error
    const composer7: MethodComposer<
      'foo',
      { a: number; b: string },
      { foo: () => number; bar: (p: string) => boolean }
      // @ts-expect-error
    > = (_, p) => 1;

    const composer8: MethodComposer<
      'bar',
      { a: number; b: string },
      { foo: () => number; bar: (p: string) => boolean },
      { c: number; m: (p: boolean) => string }
    > = ({ a, b, foo, bar, c, m }, p) => true;

    const composer9: MethodComposer<
      'bar',
      { a: number; b: string },
      { foo: () => number; bar: (p: string) => boolean },
      { c: number; m: (p: boolean) => string }
    > = ({ a, b, c, m }, p) => true;

    const composer10: MethodComposer<
      'bar',
      { a: number; b: string },
      { foo: () => number; bar: (p: string) => boolean },
      { c: number; m: (p: boolean) => string }
    > = () => true;

    // @ts-expect-error
    const composer11: MethodComposer<
      'bar',
      { a: number; b: string },
      { foo: () => number; bar: (p: string) => boolean },
      { c: number; m: (p: boolean) => string }
      // @ts-expect-error
    > = (_, p1, p2) => true;

    const composer12: MethodComposer<
      'bar',
      { a: number; b: string },
      { foo: () => number; bar: (p: string) => boolean },
      { c: number; m: (p: boolean) => string }
      // @ts-expect-error
    > = (_, p) => 1;

    const composer13: MethodComposer<
      'foo',
      { a: number; b: string },
      { foo: () => number; bar: (p: string) => boolean },
      { c: number; m: (p: boolean) => string }
    > = () => 1;

    // @ts-expect-error
    const composer14: MethodComposer<
      'foo',
      { a: number; b: string },
      { foo: () => number; bar: (p: string) => boolean },
      { c: number; m: (p: boolean) => string }
      // @ts-expect-error
    > = (_, p) => 1;

    const symbolK = Symbol();

    const composer15: MethodComposer<
      'foo',
      // @ts-expect-error
      { [symbolK]: number; b: string },
      { foo: () => number; bar: (p: string) => boolean },
      { c: number; m: (p: boolean) => string }
    > = (_) => 1;

    const composer16: MethodComposer<
      typeof symbolK,
      { a: number; b: string },
      // @ts-expect-error
      { [symbolK]: () => number; bar: (p: string) => boolean },
      { c: number; m: (p: boolean) => string }
    > = (_) => 1;

    const composer17: MethodComposer<
      'foo',
      { a: number; b: string },
      { foo: () => number; bar: (p: string) => boolean },
      // @ts-expect-error
      { [symbolK]: number; m: (p: boolean) => string }
    > = (_) => 1;
  });

  test('implied types are correct', () => {
    const gs11 = gse(1, {});
    const gs12 = gse(1, { foo: 10 });
    const gs21 = gse(['a'], {});
    const gs22 = gse(['a'], { foo: 10 });
    const gs31 = gse(['a'] as const, {});
    const gs32 = gse(['a'] as const, { foo: 10 });
    const gs41 = gse(['a'] as string | string[], {});
    const gs42 = gse(['a'] as string | string[], { foo: 10 });

    const comp1 = compose(
      { a: 0 },

      {
        meth1: () => {},
        meth2: (_, x: string) => {},
        meth3: ({ a: { get } }) => get(),
      }
    );

    const comp2 = compose(
      { a: 0, b: 'bb' },

      {
        meth1: ({ c1 }) => c1(),
        meth2: (_, x: string) => {},
        meth3: ({ b: { get }, c2 }, x: number) => get() || c2(x),
      },

      { c1: () => null, c2: (x: number) => `${x}`, c3: ['a'] }
    );

    const comp3 = compose<
      { a: number; b: number | string },
      {
        meth1: () => void;
        meth2: (x: string) => void;
        meth3: (x: string | string[]) => number | number[] | string;
      }
    >(
      { a: 0, b: 'bb' },

      {
        meth1: () => {},
        meth2: (_, x) => {},
        meth3: ({ b: { get } }) => get(),
      }
    );

    const comp4 = compose<
      { a: number; b: number | string },
      {
        meth1: () => void;
        meth2: (x: string) => void;
        meth3: (x: string | string[]) => number | number[] | string;
      },
      { c: number | number[] }
    >(
      { a: 0, b: 'bb' },

      {
        meth1: () => {},
        meth2: (_, x) => {},
        meth3: ({ b: { get }, c }) => get() || c,
      },

      { c: [3] }
    );

    const comp5 = compose<
      {
        a: number;
        b: number | string;
      },
      {
        meth1: () => void;
        meth2: (x: string) => void;
        meth3: (x: number) => number | number[] | string;
      },
      { c1: () => void; c2: (x: number) => string; c3: string[] }
    >(
      { a: 0, b: 'bb' },

      {
        meth1: ({ c1 }) => c1(),
        meth2: (_, x) => {},
        meth3: ({ b: { get }, c2 }, x) => get() || c2(x),
      },

      { c1: () => null, c2: (x) => `${x}`, c3: ['a'] }
    );

    type TestCase1 = [
      IsTrue<IsEqual<typeof gs11, GSEBundle<number, {}>>>,
      IsTrue<IsEqual<typeof gs12, GSEBundle<number, { foo: number }>>>,
      IsTrue<IsEqual<typeof gs21, GSEBundle<string[], {}>>>,
      IsTrue<IsEqual<typeof gs22, GSEBundle<string[], { foo: number }>>>,
      IsTrue<IsEqual<typeof gs31, GSEBundle<readonly ['a'], {}>>>,
      IsTrue<IsEqual<typeof gs32, GSEBundle<readonly ['a'], { foo: number }>>>,
      IsTrue<IsEqual<typeof gs41, GSEBundle<string | string[], {}>>>,
      IsTrue<IsEqual<typeof gs42, GSEBundle<string | string[], { foo: number }>>>,

      IsTrue<
        IsEqual<
          typeof comp1,
          Readonly<{ meth1: () => void; meth2: (x: string) => void; meth3: () => number }>
        >
      >,

      IsTrue<
        IsEqual<
          typeof comp2,
          Readonly<{
            meth1: () => null;
            meth2: (x: string) => void;
            meth3: (x: number) => string;
            c1: () => null;
            c2: (x: number) => string;
            c3: string[];
          }>
        >
      >,

      IsTrue<
        IsEqual<
          typeof comp3,
          Readonly<{
            meth1: () => void;
            meth2: (x: string) => void;
            meth3: (x: string | string[]) => number | number[] | string;
          }>
        >
      >,

      IsTrue<
        IsEqual<
          typeof comp4,
          Readonly<{
            meth1: () => void;
            meth2: (x: string) => void;
            meth3: (x: string | string[]) => number | number[] | string;
            c: number | number[];
          }>
        >
      >,

      IsTrue<
        IsEqual<
          typeof comp5,
          Readonly<{
            meth1: () => void;
            meth2: (x: string) => void;
            meth3: (x: number) => number | number[] | string;
            c1: () => void;
            c2: (x: number) => string;
            c3: string[];
          }>
        >
      >,
    ];

    compose<
      { a: number },
      { meth1: () => void; meth2: (x: string) => void; meth3: () => number },
      { b: string }
    >(
      { a: 0 },

      {
        meth1: () => {},

        meth2: ({ a, b, meth1, meth2, meth3 }, x: string) => {
          type TestCase2 = [
            IsTrue<
              IsEqual<
                typeof a,
                GSEBundle<
                  number,
                  {
                    a: GSEBundle<
                      number,
                      BuildDeps<
                        { a: number },
                        { meth1: () => void; meth2: (x: string) => void; meth3: () => number },
                        { b: string }
                      >
                    >;

                    meth1: () => void;
                    meth2: (x: string) => void;
                    meth3: () => number;
                    b: string;
                  }
                >
              >
            >,

            IsTrue<IsEqual<typeof b, string>>,
            IsTrue<IsEqual<typeof meth1, () => void>>,
            IsTrue<IsEqual<typeof meth2, (x: string) => void>>,
            IsTrue<IsEqual<typeof meth3, () => number>>,
          ];
        },

        meth3: ({ a: { get } }) => get(),
      },

      { b: 'foo' }
    );
  });

  test('default import instances match methods imported individually', () => {
    expect(Comp.compose).toBe(compose);
    expect(Comp.lazily).toBe(lazily);
  });

  test('getter-setter wrapper works correctly', () => {
    const a = gse(1, {});

    expect(a.get()).toBe(1);

    a.set(2);

    expect(a.get()).toBe(2);

    () => {
      // @ts-expect-error
      a.set(true);
    };
  });

  test('simple composing works correctly', () => {
    const { incA, addToA, getA } = compose(
      { a: 0 },

      {
        incA: ({ a }) => {
          a.set(a.get() + 1);
        },

        addToA: ({ a }, toAdd: number) => {
          a.set(a.get() + toAdd);
        },

        getA: ({ a: { get } }) => get(),
      }
    );

    expect(getA()).toBe(0);

    incA();

    expect(getA()).toBe(1);

    addToA(9);

    expect(getA()).toBe(10);
  });

  test('composing using deriving methods works correctly', () => {
    const { incA, addToA, getA } = compose<
      { a: number },
      { incA: () => void; addToA: (toAdd: number) => void; getA: () => number }
    >(
      { a: 0 },

      {
        incA: ({ addToA }) => {
          addToA(1);
        },

        addToA: ({ a }, toAdd) => {
          a.set(a.get() + toAdd);
        },

        getA: ({ a: { get } }) => get(),
      }
    );

    expect(getA()).toBe(0);

    incA();

    expect(getA()).toBe(1);

    addToA(9);

    expect(getA()).toBe(10);
  });

  test('composing with embed works correctly', () => {
    const { incA, getA, b } = compose(
      { a: 5 },

      {
        incA: ({ a, b }) => {
          a.set(a.get() + b);
        },

        getA: ({ a: { get } }) => get(),
      },

      { b: 7 }
    );

    expect(getA()).toBe(5);
    expect(b).toBe(7);

    incA();

    expect(getA()).toBe(12);
    expect(b).toBe(7);
  });

  test('embedded methods get returned', () => {
    const withEmbeddedMethods = compose(
      { v: 3 },

      {
        getVMultipliedWithSum: ({ v, multipleOn10, x }) => multipleOn10(v.get()) + x,

        setV: ({ v }, n: number) => v.set(n),
      },

      { multipleOn10: (n: number) => n * 10, x: 22 }
    );

    expect(withEmbeddedMethods.getVMultipliedWithSum()).toBe(52);

    withEmbeddedMethods.setV(50);

    expect(withEmbeddedMethods.getVMultipliedWithSum()).toBe(522);
    expect(withEmbeddedMethods.multipleOn10(2)).toBe(20);
    expect(withEmbeddedMethods.x).toBe(22);
  });

  test('composing with advanced type of embed works correctly', () => {
    const { incA, getA } = compose<
      { a: number },
      { incA: () => void; getA: () => number },
      { sum: (p1: number, p2: number) => number }
    >(
      { a: 0 },

      {
        incA: ({ a, sum }) => {
          a.set(sum(a.get(), 1));
        },

        getA: ({ a: { get } }) => get(),
      },

      { sum: (p1, p2) => p1 + p2 }
    );

    expect(getA()).toBe(0);

    incA();

    expect(getA()).toBe(1);
  });
});
