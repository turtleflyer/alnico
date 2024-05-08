/* eslint-disable @typescript-eslint/no-unused-vars */
import { gse } from '../alnico';
import type { BuildDeps, LazilyWithDeps } from '../alnico.types';
import { compose, lazily } from '../index';
import type { IsEqual, IsTrue } from './__assets__/test.types';

describe('test lazy scenarios', () => {
  test('lazy initializing in init part works correctly', () => {
    let beenRan = false;

    const makeWithLazyInit = () =>
      compose(
        {
          v: lazily(() => {
            beenRan = true;

            return 3;
          }),
        },

        {
          getVMultipliedWithSum: ({ v, multipleOn10, x }) => multipleOn10(v.get()) + x,

          setV: ({ v }, n: number) => v.set(n),

          multipleOn100: ({ multipleOn10 }, n: number) => multipleOn10(multipleOn10(n)),
        },

        { multipleOn10: (n: number) => n * 10, x: 22 }
      );

    const withLazyInit1 = makeWithLazyInit();

    expect(beenRan).toBe(false);
    expect(withLazyInit1.multipleOn10(3)).toBe(30);
    expect(withLazyInit1.multipleOn100(5)).toBe(500);
    expect(withLazyInit1.x).toBe(22);
    expect(beenRan).toBe(false);
    expect(withLazyInit1.getVMultipliedWithSum()).toBe(52);
    expect(beenRan).toBe(true);

    beenRan = false;

    expect(withLazyInit1.getVMultipliedWithSum()).toBe(52);
    expect(beenRan).toBe(false);

    withLazyInit1.setV(50);
    beenRan = false;

    expect(withLazyInit1.getVMultipliedWithSum()).toBe(522);
    expect(beenRan).toBe(false);

    const withLazyInit2 = makeWithLazyInit();

    expect(beenRan).toBe(false);
    withLazyInit2.setV(50);

    expect(withLazyInit2.getVMultipliedWithSum()).toBe(522);
    expect(beenRan).toBe(false);

    compose<
      { v: number },
      {
        getVMultipliedWithSum: () => number;
        setV: (n: number) => void;
        multipleOn100: (n: number) => number;
      },
      { multipleOn10: (n: number) => number; x: number }
    >(
      {
        v: lazily(() => {
          beenRan = true;

          return 3;
        }),
      },

      {
        getVMultipliedWithSum: ({ v, multipleOn10, x }) => multipleOn10(v.get()) + x,

        setV: ({ v }, n) => v.set(n),

        multipleOn100: ({ multipleOn10 }, n) => multipleOn10(multipleOn10(n)),
      },

      { multipleOn10: (n) => n * 10, x: 22 }
    );

    compose<
      { v: number },
      {
        getVMultipliedWithSum: () => number;
        setV: (n: number) => void;
      }
    >(
      {
        v: lazily(() => {
          beenRan = true;

          return 3;
        }),
      },

      {
        getVMultipliedWithSum: ({ v }) => v.get() * 10 + 22,

        setV: ({ v }, n) => v.set(n),
      }
    );
  });

  test('lazy initializing in init part works correctly with predefined deps', () => {
    let beenRan = false;

    const makeWithLazyInit = () =>
      compose<
        { v: number },
        {
          getVMultipliedWithSum: () => number;
          setV: (n: number) => void;
          multipleOn100: (n: number) => number;
        },
        { multipleOn10: (n: number) => number; x: number }
      >(
        {
          v: lazily((param) => {
            type TestCase1 = IsTrue<
              IsEqual<
                typeof param,
                {
                  v: {
                    get: () => number;

                    set: (
                      newValue:
                        | number
                        | LazilyWithDeps<
                            number,
                            BuildDeps<
                              { v: number },
                              {
                                getVMultipliedWithSum: () => number;
                                setV: (n: number) => void;
                                multipleOn100: (n: number) => number;
                              },
                              { multipleOn10: (n: number) => number; x: number }
                            >
                          >
                    ) => void;

                    exc: (
                      newValue:
                        | number
                        | LazilyWithDeps<
                            number,
                            BuildDeps<
                              { v: number },
                              {
                                getVMultipliedWithSum: () => number;
                                setV: (n: number) => void;
                                multipleOn100: (n: number) => number;
                              },
                              { multipleOn10: (n: number) => number; x: number }
                            >
                          >
                    ) => number;
                  };

                  getVMultipliedWithSum: () => number;
                  setV: (n: number) => void;
                  multipleOn100: (n: number) => number;
                  multipleOn10: (n: number) => number;
                  x: number;
                }
              >
            >;

            const { multipleOn100, multipleOn10, getVMultipliedWithSum } = param;
            beenRan = true;

            return multipleOn100(multipleOn10(85) + 11);
          }),
        },

        {
          getVMultipliedWithSum: ({ v, multipleOn10, x }) => multipleOn10(v.get()) + x,

          setV: ({ v }, n) => v.set(n),

          multipleOn100: ({ multipleOn10 }, n) => multipleOn10(multipleOn10(n)),
        },

        { multipleOn10: (n) => n * 10, x: 55 }
      );

    const withLazyInit1 = makeWithLazyInit();

    expect(beenRan).toBe(false);
    expect(withLazyInit1.multipleOn10(3)).toBe(30);
    expect(withLazyInit1.multipleOn100(5)).toBe(500);
    expect(withLazyInit1.x).toBe(55);
    expect(beenRan).toBe(false);
    expect(withLazyInit1.getVMultipliedWithSum()).toBe(861055);
    expect(beenRan).toBe(true);

    beenRan = false;

    expect(withLazyInit1.getVMultipliedWithSum()).toBe(861055);
    expect(beenRan).toBe(false);

    withLazyInit1.setV(50);
    beenRan = false;

    expect(withLazyInit1.getVMultipliedWithSum()).toBe(555);
    expect(beenRan).toBe(false);

    const withLazyInit2 = makeWithLazyInit();

    expect(beenRan).toBe(false);
    withLazyInit2.setV(50);

    expect(withLazyInit2.getVMultipliedWithSum()).toBe(555);
    expect(beenRan).toBe(false);
  });

  test('lazy initializing in embed part works correctly', () => {
    let beenRan = false;

    const makeWithLazyInit = () =>
      compose(
        { v: 3 },

        {
          getVMultipliedWithSum: ({ v, multipleOn10, x }) => multipleOn10(v.get()) + x,

          setV: ({ v }, n: number) => v.set(n),

          multipleOn100: ({ multipleOn10 }, n: number) => multipleOn10(multipleOn10(n)),
        },

        {
          multipleOn10: (n: number) => n * 10,

          x: lazily(() => {
            beenRan = true;

            return 22;
          }),
        }
      );

    const withLazyInit1 = makeWithLazyInit();

    expect(beenRan).toBe(false);
    expect(withLazyInit1.multipleOn100(5)).toBe(500);
    expect(withLazyInit1.multipleOn10(3)).toBe(30);
    expect(beenRan).toBe(false);
    expect(withLazyInit1.x).toBe(22);
    expect(beenRan).toBe(true);

    beenRan = false;

    expect(withLazyInit1.x).toBe(22);
    expect(withLazyInit1.getVMultipliedWithSum()).toBe(52);
    expect(beenRan).toBe(false);

    withLazyInit1.setV(50);

    expect(withLazyInit1.getVMultipliedWithSum()).toBe(522);
    expect(beenRan).toBe(false);

    const withLazyInit2 = makeWithLazyInit();
    beenRan = false;

    expect(beenRan).toBe(false);
    expect(withLazyInit2.getVMultipliedWithSum()).toBe(52);
    expect(beenRan).toBe(true);

    beenRan = false;
    withLazyInit2.setV(50);

    expect(withLazyInit2.x).toBe(22);
    expect(withLazyInit2.getVMultipliedWithSum()).toBe(522);
    expect(beenRan).toBe(false);

    compose<
      { v: number },
      {
        getVMultipliedWithSum: () => number;
        setV: (n: number) => void;
        multipleOn100: (n: number) => number;
      },
      { multipleOn10: (n: number) => number; x: number }
    >(
      { v: 3 },

      {
        getVMultipliedWithSum: ({ v, multipleOn10, x }) => multipleOn10(v.get()) + x,

        setV: ({ v }, n) => v.set(n),

        multipleOn100: ({ multipleOn10 }, n) => multipleOn10(multipleOn10(n)),
      },

      {
        multipleOn10: (n) => n * 10,

        x: lazily(() => {
          beenRan = true;

          return 22;
        }),
      }
    );
  });

  test('lazy initializing with generic works correctly', () => {
    <V extends number>(initializer: () => V) =>
      compose<{ value: V }, { multiple: (x: number) => number }>(
        { value: lazily(initializer) },

        {
          multiple({ value }, x) {
            return x * value.get();
          },
        }
      );

    <V extends number>(initializer: () => V) =>
      compose<{}, { multiple: (x: number) => number }, { value: V }>(
        {},

        {
          multiple({ value }, x) {
            return x * value;
          },
        },

        { value: lazily(initializer) }
      );
  });

  test('getters and setters can be initialized with values computed lazily', () => {
    let beenRan = false;

    const a = gse(
      lazily(() => {
        beenRan = true;

        return 3;
      }),

      {}
    );

    expect(beenRan).toBe(false);
    expect(a.get()).toBe(3);
    expect(beenRan).toBe(true);

    beenRan = false;

    expect(a.get()).toBe(3);
    expect(beenRan).toBe(false);
  });

  test('getters and setters can be initialized with values computed lazily with predefined deps', () => {
    let beenRan = false;

    const a = gse<number, { foo: number; bar: (x: number) => number }>(
      lazily((param) => {
        type TestCase1 = IsTrue<IsEqual<typeof param, { foo: number; bar: (x: number) => number }>>;

        const { bar, foo } = param;
        beenRan = true;

        return bar(foo);
      }),

      { foo: 11, bar: (x: number) => x + 7 }
    );

    expect(beenRan).toBe(false);
    expect(a.get()).toBe(18);
    expect(beenRan).toBe(true);

    beenRan = false;

    expect(a.get()).toBe(18);
    expect(beenRan).toBe(false);
  });

  test('getters and setters accept values computed lazily', () => {
    let beenRan = false;

    const a = gse(3, {});

    expect(beenRan).toBe(false);
    expect(a.get()).toBe(3);
    expect(beenRan).toBe(false);

    beenRan = false;

    a.set(
      lazily(() => {
        beenRan = true;

        return 5;
      })
    );

    expect(beenRan).toBe(false);
    expect(a.get()).toBe(5);
    expect(beenRan).toBe(true);

    beenRan = false;
    expect(a.get()).toBe(5);
    expect(beenRan).toBe(false);
  });

  test('getters and setters accept values computed lazily with predefined deps', () => {
    let beenRan = false;

    const a = gse<number, { foo: number; bar: (x: number) => number }>(12, {
      foo: 45,
      bar: (x: number) => x + 77,
    });

    expect(beenRan).toBe(false);
    expect(a.get()).toBe(12);
    expect(beenRan).toBe(false);

    beenRan = false;

    a.set(
      lazily((param) => {
        type TestCase1 = IsTrue<IsEqual<typeof param, { foo: number; bar: (x: number) => number }>>;

        const { bar, foo } = param;
        beenRan = true;

        return bar(foo);
      })
    );

    expect(beenRan).toBe(false);
    expect(a.get()).toBe(122);
    expect(beenRan).toBe(true);

    beenRan = false;
    expect(a.get()).toBe(122);
    expect(beenRan).toBe(false);
  });

  test('getters and setters inside composition accept values computed lazily', () => {
    let beenRan = false;

    const { passToA, readA } = compose<
      { a: number },
      { passToA: (newV: number | LazilyWithDeps<number, any>) => void; readA: () => number }
    >(
      { a: 3 },

      {
        passToA({ a }, newV) {
          a.set(newV);
        },

        readA({ a }) {
          return a.get();
        },
      }
    );

    expect(beenRan).toBe(false);
    expect(readA()).toBe(3);
    expect(beenRan).toBe(false);

    beenRan = false;

    passToA(
      lazily(() => {
        beenRan = true;

        return 5;
      })
    );

    expect(beenRan).toBe(false);
    expect(readA()).toBe(5);
    expect(beenRan).toBe(true);

    beenRan = false;
    expect(readA()).toBe(5);
    expect(beenRan).toBe(false);
  });

  test('getters and setters inside composition accept values computed lazily with predefined deps', () => {
    let beenRan = false;

    const { passToA, readA } = compose<
      { a: number },
      {
        passToA: (newV: number | true) => void;
        readA: () => number;
      }
    >(
      { a: 34 },

      {
        passToA({ a }, newV) {
          a.set(
            newV === true
              ? lazily((param) => {
                  const { passToA, readA } = param;
                  passToA(90);
                  beenRan = true;

                  return readA() + 88;
                })
              : newV
          );
        },

        readA({ a }) {
          return a.get();
        },
      }
    );

    expect(beenRan).toBe(false);
    expect(readA()).toBe(34);
    expect(beenRan).toBe(false);

    beenRan = false;

    passToA(true);

    expect(beenRan).toBe(false);
    expect(readA()).toBe(178);
    expect(beenRan).toBe(true);

    beenRan = false;
    expect(readA()).toBe(178);
    expect(beenRan).toBe(false);

    const { m2 } = compose<{ v: number }, { m1: () => number; m2: (x: number) => number }>(
      { v: 13 },

      {
        m1() {
          return 123;
        },

        m2({ v }, x) {
          const toReturn = v.get() * x;

          v.set(
            lazily((param) => {
              type TestCase2 = IsTrue<
                IsEqual<
                  typeof param,
                  {
                    v: {
                      get: () => number;

                      set: (
                        newValue:
                          | number
                          | LazilyWithDeps<
                              number,
                              BuildDeps<
                                { v: number },
                                { m1: () => number; m2: (x: number) => number },
                                {}
                              >
                            >
                      ) => void;

                      exc: (
                        newValue:
                          | number
                          | LazilyWithDeps<
                              number,
                              BuildDeps<
                                { v: number },
                                { m1: () => number; m2: (x: number) => number },
                                {}
                              >
                            >
                      ) => number;
                    };

                    m1: () => number;
                    m2: (x: number) => number;
                  }
                >
              >;

              const { m1 } = param;
              beenRan = true;

              return m1() * 10;
            })
          );

          return toReturn;
        },
      }
    );

    beenRan = false;
    expect(m2(5)).toBe(65);
    expect(beenRan).toBe(false);

    beenRan = false;
    expect(m2(2)).toBe(2460);
    expect(beenRan).toBe(true);
  });

  test('init state can be calculated lazily with the use of deps', () => {
    let beenRan = false;

    const { passToA, readA, c } = compose<
      { a: number },
      { passToA: (newV: number) => void; readA: () => number },
      { c: number }
    >(
      {
        a: lazily(({ c }) => {
          beenRan = true;

          return c;
        }),
      },

      {
        passToA({ a }, newV) {
          a.set(newV);
        },

        readA({ a }) {
          return a.get();
        },
      },

      { c: 5 }
    );

    expect(beenRan).toBe(false);
    expect(readA()).toBe(5);
    expect(c).toBe(5);
    expect(beenRan).toBe(true);

    beenRan = false;

    passToA(33);

    expect(beenRan).toBe(false);
    expect(readA()).toBe(33);
    expect(c).toBe(5);
    expect(beenRan).toBe(false);
  });

  test('it is allowed to spread lazily calculated values in embedded part (checking types)', () => {
    compose<{ aaa: 111 }, { bb: () => 22 }, { c: 3; d: 4; e: 5; f: 6; g: 7; h: 8; i: 9 }>(
      { aaa: 111 },

      {
        bb: () => 22,
      },

      { c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9 }
    );

    compose<{ aaa: 111 }, { bb: () => 22 }, { c: 3; d: 4; e: 5; f: 6; g: 7; h: 8; i: 9 }>(
      { aaa: 111 },

      {
        bb: () => 22,
      },

      { c: 3, f: 6, g: 7, i: 9, ...lazily(({ bb }) => ({ d: 4, e: 5, h: 8 })) }
    );

    compose<{ aaa: 111 }, { bb: () => 22 }, { c: 3; d: 4; e: 5; f: 6; g: 7; h: 8; i: 9 }>(
      { aaa: 111 },

      {
        bb: () => 22,
      },

      { ...lazily(({ aaa, bb }) => ({ c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9 })) }
    );

    compose<{ aaa: 111 }, { bb: () => 22 }, { c: 3; d: 4; e: 5; f: 6; g: 7; h: 8; i: 9 }>(
      { aaa: 111 },

      {
        bb: () => 22,
      },

      //@ts-expect-error
      { c: 3, f: 6, g: 7, i: 9, ...lazily(() => ({ d: 4, h: 8 })) }
    );
  });

  test('it is allowed to spread lazily calculated values in embedded part (variant 1)', () => {
    let beenRan = false;

    const { min, setVs, minOf3, minOf4 } = compose<
      { v1: number; v2: number },
      { min: () => string; setVs: (v1: number, v2: number) => void },
      {
        base: number;
        abs: (v: number) => number;
        minOf3: (v1: number, v2: number, v3: number) => number;
        minOf4: (v1: number, v2: number, v3: number, v4: number) => number;
      }
    >(
      {
        v1: lazily(() => {
          throw new Error('The value must be set');
        }),

        v2: lazily(() => {
          throw new Error('The value must be set');
        }),
      },

      {
        min({ v1, v2 }) {
          return `${v1.get() > v2.get() ? v2.get() : v1.get()}`;
        },

        setVs({ v1: { set: setV1 }, v2: { set: setV2 } }, v1, v2) {
          setV1(v1);
          setV2(v2);
        },
      },

      {
        base: 50,
        abs: (v) => (v < 0 ? -v : v),

        ...lazily((deps) => {
          beenRan = true;

          return {
            minOf3: (v1, v2, v3) => {
              deps.setVs(deps.abs(v1), deps.abs(v2));
              deps.setVs(parseInt(deps.min()), deps.abs(v3));
              deps.setVs(parseInt(deps.min()), deps.base);

              return parseInt(deps.min());
            },

            minOf4: (v1, v2, v3, v4) => deps.minOf3(deps.minOf3(v1, v2, v3), v4, deps.base),
          };
        }),
      }
    );

    expect(() => min()).toThrow();
    expect(beenRan).toBe(true);

    beenRan = false;
    setVs(-5, 3);
    expect(beenRan).toBe(false);
    expect(min()).toBe('-5');
    expect(minOf3(54, -66, 10)).toBe(10);
    expect(minOf4(-88, 455, -133, 75)).toBe(50);
  });

  test('it is allowed to spread lazily calculated values in embedded part (variant 2)', () => {
    let beenRan1 = false;
    let beenRan2 = false;
    let beenRan3 = false;

    const methods = compose<
      { v1: number; v2: number },
      { min: () => string; setVs: (v1: number, v2: number) => void },
      {
        base: number;
        abs: (v: number) => number;
        minOf3: (v1: number, v2: number, v3: number) => number;
        minOf4: (v1: number, v2: number, v3: number, v4: number) => number;
      }
    >(
      {
        v1: lazily(() => {
          throw new Error('The value must be set');
        }),

        v2: lazily(() => {
          throw new Error('The value must be set');
        }),
      },

      {
        min({ v1, v2 }) {
          return `${v1.get() > v2.get() ? v2.get() : v1.get()}`;
        },

        setVs({ v1: { set: setV1 }, v2: { set: setV2 } }, v1, v2) {
          setV1(v1);
          setV2(v2);
        },
      },

      {
        base: 50,
        abs: (v) => (v < 0 ? -v : v),

        ...lazily(() => {
          beenRan1 = true;

          return {
            minOf3: lazily(({ setVs, abs, min, base }) => {
              beenRan2 = true;

              return (v1, v2, v3) => {
                setVs(abs(v1), abs(v2));
                setVs(parseInt(min()), abs(v3));
                setVs(parseInt(min()), base);

                return parseInt(min());
              };
            }),

            minOf4: lazily(({ minOf3, base }) => {
              beenRan3 = true;

              return (v1, v2, v3, v4) => minOf3(minOf3(v1, v2, v3), v4, base);
            }),
          };
        }),
      }
    );

    methods.setVs(-5, 3);
    expect(beenRan1).toBe(true);
    expect(beenRan2).toBe(false);
    expect(beenRan3).toBe(false);

    beenRan1 = false;
    beenRan2 = false;
    beenRan3 = false;
    expect(methods.min()).toBe('-5');
    expect(beenRan1).toBe(false);
    expect(beenRan2).toBe(false);
    expect(beenRan3).toBe(false);

    expect(methods.minOf3(54, -66, 10)).toBe(10);
    expect(beenRan1).toBe(false);
    expect(beenRan2).toBe(true);
    expect(beenRan3).toBe(false);

    beenRan1 = false;
    beenRan2 = false;
    beenRan3 = false;
    expect(methods.minOf4(-88, 455, -133, 75)).toBe(50);
    expect(beenRan1).toBe(false);
    expect(beenRan2).toBe(false);
    expect(beenRan3).toBe(true);
  });

  test('exc method with lazy value works correctly', () => {
    let beenRan = false;
    let captureV = 1000;

    const { meth } = compose<{ a: number }, { meth: (x: number) => void }>(
      {
        a: lazily(({ a }) => {
          beenRan = true;
          captureV = a.get();

          return 11;
        }),
      },

      {
        meth: ({ a }, x) => {
          return a.exc(x);
        },
      }
    );

    expect(meth(35)).toBe(11);
    expect(beenRan).toBe(true);
    expect(captureV).toBe(35);

    beenRan = false;
    captureV = 2000;
    expect(meth(56)).toBe(35);
    expect(beenRan).toBe(false);
    expect(captureV).toBe(2000);
  });
});
