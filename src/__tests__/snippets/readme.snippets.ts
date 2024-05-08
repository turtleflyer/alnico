import { compose, lazily } from '../..';
describe('snippets (from readme)', () => {
  test('readme snippet 1', () => {
    const { incCount, resetCount, curCount } = compose<
      { count: number },
      { incCount: () => void; resetCount: () => void; curCount: () => number }
    >(
      { count: 0 },

      {
        incCount: ({ count }) => {
          count.set(count.get() + 1);
        },

        resetCount: ({ count }) => {
          count.set(0);
        },

        curCount: ({ count }) => count.get(),
      }
    );

    expect(curCount()).toBe(0);
    incCount();
    expect(curCount()).toBe(1);
    incCount();
    expect(curCount()).toBe(2);
    incCount();
    expect(curCount()).toBe(3);
    resetCount();
    expect(curCount()).toBe(0);
  });

  test('readme snippet 2', () => {
    const { incCount, resetCount, curCount } = compose<
      { count: number },
      { incCount: (inc?: number) => void; resetCount: () => void; curCount: () => number },
      { max: number }
    >(
      { count: 0 },

      {
        incCount: ({ count, max }, inc = 1) => {
          count.set(Math.min(count.get() + inc, max));
        },

        resetCount: ({ count }) => {
          count.set(0);
        },

        curCount: ({ count }) => count.get(),
      },

      { max: 30 }
    );

    expect(curCount()).toBe(0);
    incCount();
    expect(curCount()).toBe(1);
    incCount(2);
    expect(curCount()).toBe(3);
    incCount(20);
    expect(curCount()).toBe(23);
    incCount(11);
    expect(curCount()).toBe(30);
    resetCount();
    expect(curCount()).toBe(0);
  });

  test('readme snippet 3', () => {
    const { fibonacci } = compose<
      { mem: number[] },
      { fibonacci: (p: number) => number; next: (p: number) => number }
    >(
      {
        mem: lazily(() => {
          throw Error('Unexpected access');
        }),
      },

      {
        fibonacci({ next, mem }, p) {
          mem.set([]);

          return next(p);
        },

        next({ next, mem }, p) {
          if (p <= 1) return p;

          if (p in mem.get()) return mem.get()[p];

          const result = next(p - 1) + next(p - 2);
          mem.get()[p] = result;

          return result;
        },
      }
    );

    expect(fibonacci(5)).toBe(5);
    expect(fibonacci(8)).toBe(21);
    expect(fibonacci(1)).toBe(1);
    expect(fibonacci(0)).toBe(0);
  });

  test('readme snippet 4', () => {
    const { incCount, resetCount, curCount } = compose<
      { count: number },
      { incCount: (inc?: number) => void; resetCount: () => void; curCount: () => number },
      { max: number }
    >(
      { count: 0 },

      {
        incCount: ({ count, max, resetCount }, inc = 1) => {
          const newCount = count.get() + inc;
          newCount > max ? resetCount() : count.set(newCount);

          return count.get();
        },

        resetCount: ({ count }) => {
          count.set(0);
        },

        curCount: ({ count }) => count.get(),
      },

      { max: 30 }
    );

    expect(curCount()).toBe(0);
    incCount();
    expect(curCount()).toBe(1);
    incCount(2);
    expect(curCount()).toBe(3);
    incCount(20);
    expect(curCount()).toBe(23);
    incCount(11);
    expect(curCount()).toBe(0);
    incCount(11);
    expect(curCount()).toBe(11);
    resetCount();
    expect(curCount()).toBe(0);
  });

  test('readme snippet 5', () => {
    const { getState, setState } = compose<
      { v1: number; v2: number },
      {
        calcV2: () => number;
        getState: () => { v1: number; v2: number };
        setState: (f: number) => void;
      },
      { multiply: number; expensiveCalc: (factor: number) => number }
    >(
      {
        v1: 10,

        /**
         * Since the `calcV2` method (which depends on the `multiply` variable from the embedded
         * part) isn't defined until the composition is complete (therefore unknown at the
         * beginning), we initialize `v2` lazily.
         */
        v2: lazily(({ calcV2 }) => calcV2()),
      },

      {
        /**
         * We define the method to reuse it in two places. Note that it depends on the embedded
         * part, which is expected to be injected as an option.
         */
        calcV2: ({ v1, multiply }) => v1.get() * multiply,
        getState: ({ v1, v2 }) => ({ v1: v1.get(), v2: v2.get() }),

        setState: ({ v1, v2 }, f) => {
          // It's too expensive to calculate if there's a chance the value will never be requested
          v1.set(lazily(({ expensiveCalc }) => expensiveCalc(f)));

          // If we call `calcV2` right away, it undermines our effort to set `v1` lazily
          v2.set(lazily(({ calcV2 }) => calcV2()));
        },
      },

      /**
       * The embedded part serves to hold injected dependencies when `compose` is used inside a
       * factory function.
       */
      {
        // `multiply` is assumed to be an injected parameter
        multiply: 3,

        // This method is injected too
        expensiveCalc,
      }
    );

    wasCalculationMade();
    expect(wasCalculationMade()).toBe(false);
    expect(getState()).toEqual({ v1: 10, v2: 30 });
    expect(wasCalculationMade()).toBe(false);
    setState(5);
    expect(wasCalculationMade()).toBe(false);
    expect(getState()).toEqual({ v1: 5, v2: 15 });
    expect(wasCalculationMade()).toBe(true);
    setState(8); // Nothing was calculated
    expect(wasCalculationMade()).toBe(false);
    setState(10);
    expect(wasCalculationMade()).toBe(false);
    expect(getState()).toEqual({ v1: 55, v2: 165 });
    expect(wasCalculationMade()).toBe(true);
  });

  test('readme snippet 6', () => {
    const { minOf3, minOf5 } = compose<
      { v1: number; v2: number },
      { min: () => number; setVs: (v1: number, v2: number) => void },
      {
        base: number;
        levelUp: (v: number) => number;
        minOf3: (v1: number, v2: number, v3: number) => number;
        minOf5: (v1: number, v2: number, v3: number, v4: number, v5: number) => number;
      }
    >(
      {
        /**
         * `lazily` here prevents executing the methods without prior initialization of variables
         * `v1` and `v2`.
         */
        v1: lazily(() => {
          throw new Error('The value must be set');
        }),

        v2: lazily(() => {
          throw new Error('The value must be set');
        }),
      },

      {
        min: ({ v1, v2 }) => (v1.get() > v2.get() ? v2.get() : v1.get()),

        setVs: ({ v1: { set: setV1 }, v2: { set: setV2 } }, v1, v2) => {
          setV1(v1);
          setV2(v2);
        },
      },

      {
        base: 50,

        // `levelUp` depends on methods and `base` which is another embedded variable
        levelUp: lazily(({ setVs, min, base }) => (v) => {
          setVs(base, v);

          return min();
        }),

        /**
         * The result of the following `lazily` execution is 2 more embedded methods that we emit
         * using the spreading syntax.
         */
        ...lazily(({ min, setVs, levelUp }) => ({
          minOf3: (v1, v2, v3) => {
            setVs(v1, v2);
            setVs(min(), v3);

            return levelUp(min());
          },

          /**
           * `minOf5` depends on `minOf3`. Both are results of the same lazy execution. We can use
           * `lazily` inside it making sure that `minOf3` is already defined at the moment.
           */
          minOf5: lazily(
            ({ minOf3, levelUp }) =>
              (v1, v2, v3, v4, v5) =>
                levelUp(minOf3(minOf3(v1, v2, v3), v4, v5))
          ),
        })),
      }
    );

    expect(minOf3(20, 5, 15)).toBe(5);
    expect(minOf3(60, 55, 80)).toBe(50);
    expect(minOf5(120, 60, 70, 80, 65)).toBe(50);
    expect(minOf5(120, 80, 75, 54, 33)).toBe(33);
  });

  test('readme snippet x', () => {
    const { incCount, resetCount, curCount } = compose(
      { count: 0 },

      {
        incCount: ({ count, max }, inc = 1) => {
          count.set(Math.min(count.get() + inc, max));
        },

        resetCount: ({ count }) => {
          count.set(0);
        },

        curCount: ({ count }) => count.get(),
      },

      { max: 3 }
    );

    expect(curCount()).toBe(0);
    incCount();
    expect(curCount()).toBe(1);
    incCount();
    expect(curCount()).toBe(2);
    incCount();
    expect(curCount()).toBe(3);
    incCount();
    expect(curCount()).toBe(3);
    resetCount();
    expect(curCount()).toBe(0);
  });
});

const { expensiveCalc, wasCalculationMade } = compose(
  { calculationMade: false },

  {
    expensiveCalc: ({ calculationMade }, factor: number) => {
      if (factor <= 1) return factor;

      let n1 = 0;
      let n2 = 1;

      for (let i = 2; i <= factor; i++) {
        [n1, n2] = [n2, n1 + n2];
      }

      calculationMade.set(true);

      return n2;
    },

    wasCalculationMade: ({ calculationMade }) => calculationMade.exc(false),
  }
);
