/* eslint-disable @typescript-eslint/no-unused-vars */
import { gse } from '../alnico';
import type { GSEBundle, LazilyWithDeps } from '../alnico.types';
import Comp, { compose, lazily, type BuildDeps, type MethodComposer } from '../index';
import type { IsEqual, IsTrue } from './__assets__/test.types';

describe('test types, identity and minimum functionality', () => {
  test('defined types are correct', () => {
    type D01 = BuildDeps<{ a: number; b: string }, { foo: () => number }>;
    type D02 = BuildDeps<{ a: number; b: string }, { foo: () => number }, {}>;
    type M01 = MethodComposer<{ a: number; b: () => string }, (p: string) => number>;
    type M02 = MethodComposer<{ a: number; b: () => string }, (p: string) => number, 'foo'>;

    type Test1 = [
      IsTrue<
        IsEqual<
          D01,
          {
            a: {
              get: () => number;

              set: (
                newValue:
                  | number
                  | LazilyWithDeps<
                      number,
                      BuildDeps<{ a: number; b: string }, { foo: () => number }>
                    >
              ) => void;

              exc: (
                newValue:
                  | number
                  | LazilyWithDeps<
                      number,
                      BuildDeps<{ a: number; b: string }, { foo: () => number }>
                    >
              ) => number;
            };

            b: {
              get: () => string;

              set: (
                newValue:
                  | string
                  | LazilyWithDeps<
                      string,
                      BuildDeps<{ a: number; b: string }, { foo: () => number }>
                    >
              ) => void;

              exc: (
                newValue:
                  | string
                  | LazilyWithDeps<
                      string,
                      BuildDeps<{ a: number; b: string }, { foo: () => number }>
                    >
              ) => string;
            };

            foo: () => number;
          }
        >
      >,

      IsTrue<
        IsEqual<
          D02,
          {
            a: {
              get: () => number;

              set: (
                newValue:
                  | number
                  | LazilyWithDeps<
                      number,
                      BuildDeps<{ a: number; b: string }, { foo: () => number }>
                    >
              ) => void;

              exc: (
                newValue:
                  | number
                  | LazilyWithDeps<
                      number,
                      BuildDeps<{ a: number; b: string }, { foo: () => number }>
                    >
              ) => number;
            };

            b: {
              get: () => string;
              set: (
                newValue:
                  | string
                  | LazilyWithDeps<
                      string,
                      BuildDeps<{ a: number; b: string }, { foo: () => number }>
                    >
              ) => void;

              exc: (
                newValue:
                  | string
                  | LazilyWithDeps<
                      string,
                      BuildDeps<{ a: number; b: string }, { foo: () => number }>
                    >
              ) => string;
            };

            foo: () => number;
          }
        >
      >,

      IsTrue<IsEqual<M01, (deps: { a: number; b: () => string }, p: string) => number>>,

      IsTrue<
        IsEqual<
          M02,
          (deps: { a: number; b: () => string; foo: (p: string) => number }, p: string) => number
        >
      >,
    ];
  });

  test('primitive types works with implementation', () => {
    const gs1: GSEBundle<number, {}> = gse(1, {});

    // @ts-expect-error
    const gs2: GSEBundle<string> = gse(1);

    const composer01: MethodComposer<
      BuildDeps<{ a: number; b: string }, { foo: () => number }>,
      (p: string) => boolean,
      'bar'
    > = ({ a, b, foo, bar }, p) => true;

    const composer02: MethodComposer<
      BuildDeps<{ a: number; b: string }, { foo: () => number }>,
      (p: string) => boolean
    > = ({ a, b, foo }, p) => true;

    const composer03: MethodComposer<
      BuildDeps<{ a: number; b: string }, { foo: () => number }>,
      (p: string) => boolean
      // @ts-expect-error
    > = ({ a, b, foo, bar }, p) => true;

    const composer04: MethodComposer<
      {
        a: number;
        b: () => string;
      },
      () => number
    > = () => 1;

    const composer05: MethodComposer<
      {
        a: number;
        b: () => string;
      },
      () => number
    > = ({ a, b }) => 1;

    const composer06: MethodComposer<
      {
        a: number;
        b: () => string;
      },
      () => number
    > = ({
      a,
      b,
      // @ts-expect-error
      c,
    }) => 1;

    const composer07: MethodComposer<
      { a: number; b: () => string },
      () => number
      // @ts-expect-error
    > = () => 'a';

    // @ts-expect-error
    const composer08: MethodComposer<
      { a: number; b: () => string },
      () => number
      // @ts-expect-error
    > = (_, p) => 1;

    const composer09: MethodComposer<
      {
        a: number;
        b: () => string;
      },
      (p: string) => boolean
    > = (_, p) => true;

    const composer10: MethodComposer<
      { a: number; b: () => string },
      (p: string) => boolean
      // @ts-expect-error
    > = (_, p) => 1;

    // @ts-expect-error
    const composer11: MethodComposer<
      { a: number; b: () => string },
      (p: string) => boolean
      // @ts-expect-error
    > = (_, p1, p2) => true;

    const symbolK = Symbol();

    const composer12: MethodComposer<
      // @ts-expect-error
      { [symbolK]: number; b: () => number },
      () => number
    > = (_) => 1;

    const composer13: MethodComposer<
      { b: () => number },
      () => number,
      // @ts-expect-error
      typeof symbolK
    > = (_) => 1;

    const composer14: MethodComposer<
      // @ts-expect-error
      BuildDeps<{ a: number; b: string }, { [symbolK]: () => string }>,
      () => number
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
      IsTrue<
        IsEqual<
          typeof gs11,
          {
            get: () => number;
            set: (newValue: number | LazilyWithDeps<number, {}>) => void;
            exc: (newValue: number | LazilyWithDeps<number, {}>) => number;
          }
        >
      >,

      IsTrue<
        IsEqual<
          typeof gs12,
          {
            get: () => number;
            set: (newValue: number | LazilyWithDeps<number, { foo: number }>) => void;
            exc: (newValue: number | LazilyWithDeps<number, { foo: number }>) => number;
          }
        >
      >,

      IsTrue<
        IsEqual<
          typeof gs21,
          {
            get: () => string[];
            set: (newValue: string[] | LazilyWithDeps<string[], {}>) => void;
            exc: (newValue: string[] | LazilyWithDeps<string[], {}>) => string[];
          }
        >
      >,

      IsTrue<
        IsEqual<
          typeof gs22,
          {
            get: () => string[];
            set: (newValue: string[] | LazilyWithDeps<string[], { foo: number }>) => void;
            exc: (newValue: string[] | LazilyWithDeps<string[], { foo: number }>) => string[];
          }
        >
      >,

      IsTrue<
        IsEqual<
          typeof gs31,
          {
            get: () => readonly ['a'];
            set: (newValue: readonly ['a'] | LazilyWithDeps<readonly ['a'], {}>) => void;
            exc: (newValue: readonly ['a'] | LazilyWithDeps<readonly ['a'], {}>) => readonly ['a'];
          }
        >
      >,

      IsTrue<
        IsEqual<
          typeof gs32,
          {
            get: () => readonly ['a'];

            set: (
              newValue: readonly ['a'] | LazilyWithDeps<readonly ['a'], { foo: number }>
            ) => void;

            exc: (
              newValue: readonly ['a'] | LazilyWithDeps<readonly ['a'], { foo: number }>
            ) => readonly ['a'];
          }
        >
      >,

      IsTrue<
        IsEqual<
          typeof gs41,
          {
            get: () => string | string[];
            set: (newValue: string | string[] | LazilyWithDeps<string | string[], {}>) => void;
            exc: (
              newValue: string | string[] | LazilyWithDeps<string | string[], {}>
            ) => string | string[];
          }
        >
      >,

      IsTrue<
        IsEqual<
          typeof gs42,
          {
            get: () => string | string[];

            set: (
              newValue: string | string[] | LazilyWithDeps<string | string[], { foo: number }>
            ) => void;

            exc: (
              newValue: string | string[] | LazilyWithDeps<string | string[], { foo: number }>
            ) => string | string[];
          }
        >
      >,

      IsTrue<
        IsEqual<
          typeof comp1,
          { meth1: () => void; meth2: (x: string) => void; meth3: () => number }
        >
      >,

      IsTrue<
        IsEqual<
          typeof comp2,
          {
            meth1: () => null;
            meth2: (x: string) => void;
            meth3: (x: number) => string;
            c1: () => null;
            c2: (x: number) => string;
            c3: string[];
          }
        >
      >,

      IsTrue<
        IsEqual<
          typeof comp3,
          {
            meth1: () => void;
            meth2: (x: string) => void;
            meth3: (x: string | string[]) => number | number[] | string;
          }
        >
      >,

      IsTrue<
        IsEqual<
          typeof comp4,
          {
            meth1: () => void;
            meth2: (x: string) => void;
            meth3: (x: string | string[]) => number | number[] | string;
            c: number | number[];
          }
        >
      >,

      IsTrue<
        IsEqual<
          typeof comp5,
          {
            meth1: () => void;
            meth2: (x: string) => void;
            meth3: (x: number) => number | number[] | string;
            c1: () => void;
            c2: (x: number) => string;
            c3: string[];
          }
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
                {
                  get: () => number;

                  set: (
                    newValue:
                      | number
                      | LazilyWithDeps<
                          number,
                          {
                            a: GSEBundle<
                              number,
                              BuildDeps<
                                { a: number },
                                {
                                  meth1: () => void;
                                  meth2: (x: string) => void;
                                  meth3: () => number;
                                },
                                { b: string }
                              >
                            >;
                            meth1: () => void;
                            meth2: (x: string) => void;
                            meth3: () => number;
                            b: string;
                          }
                        >
                  ) => void;

                  exc: (
                    newValue:
                      | number
                      | LazilyWithDeps<
                          number,
                          {
                            a: GSEBundle<
                              number,
                              BuildDeps<
                                { a: number },
                                {
                                  meth1: () => void;
                                  meth2: (x: string) => void;
                                  meth3: () => number;
                                },
                                { b: string }
                              >
                            >;

                            meth1: () => void;
                            meth2: (x: string) => void;
                            meth3: () => number;
                            b: string;
                          }
                        >
                  ) => number;
                }
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

    expect(a.exc(4)).toBe(2);

    expect(a.get()).toBe(4);

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
