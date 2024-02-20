import { COMP_LAZILY_SIGNATURE } from './alnico.const';
import type { Compose, GSEBundle, LazilyFn, LazilySignature } from './alnico.types';

export const gse = <T, Deps extends Record<string, unknown>>(
  initState: T | LazilySignature<T, Deps>,
  deps: Deps
): GSEBundle<T, Deps> => {
  let holdValue = initState;

  const retrieveValue = (v: T | LazilySignature<T, Deps>) =>
    isLazily<T, Deps>(v) ? v[COMP_LAZILY_SIGNATURE](deps) : v;

  return {
    get: () => {
      holdValue = retrieveValue(holdValue);

      return holdValue;
    },

    set: (newValue) => {
      holdValue = newValue;
    },

    exc: (newValue) => {
      const snapshotValue = holdValue;
      holdValue = newValue;

      return retrieveValue(snapshotValue);
    },
  };
};

export const compose: Compose = (
  initState: Record<string, unknown>,
  composers: Record<string, (deps: Record<string, unknown>, ...args: unknown[]) => unknown>,
  embed?: Record<string, unknown> &
    (LazilySignature<Record<string, unknown>, Record<string, unknown>> | {})
) => {
  const deps = Object.create(null) as Record<string, unknown>;
  const composedBundle = Object.create(null) as Record<string, unknown>;

  const proxyHandler = {
    get: (target: Record<string, unknown>, prop: string) => {
      const calculatedLazyPart = lazyEmbedPart.exc(undefined);

      for (const key in calculatedLazyPart) {
        const descriptor = {
          [key]: { get: gse(calculatedLazyPart[key], deps).get, enumerable: true },
        };

        Object.defineProperties(deps, descriptor);
        Object.defineProperties(composedBundle, descriptor);
      }

      return target[prop];
    },
  };

  const proxyDeps = new Proxy(deps, proxyHandler);
  const proxyComposedBundle = new Proxy(composedBundle, proxyHandler);

  /**
   * If there is an lazy part in embed it overwrites `undefined`
   */
  const lazyEmbedPart = gse({ ...lazily(() => undefined), ...embed }, deps);

  for (const key in initState) {
    deps[key] = gse(initState[key], proxyDeps);
  }

  for (const key in embed) {
    const descriptor = { [key]: { get: gse(embed[key], proxyDeps).get, enumerable: true } };
    Object.defineProperties(deps, descriptor);
    Object.defineProperties(composedBundle, descriptor);
  }

  const composersSnapshot = Object.assign(Object.create(null) as {}, composers);

  for (const key in composersSnapshot) {
    const composed = (...args: unknown[]) => composersSnapshot[key](proxyDeps, ...args);
    deps[key] = composed;
    composedBundle[key] = composed;
  }

  return proxyComposedBundle;
};

export const lazily = <T, Deps extends Record<string, unknown> = {}>(
  lazilyFn: LazilyFn<T, Deps>
): LazilySignature<T, Deps> => ({
  [COMP_LAZILY_SIGNATURE]: lazilyFn,
});

const isLazily = <
  T,
  Deps extends Record<string, unknown>,
  L extends LazilySignature<T, Deps> = LazilySignature<T, Deps>,
>(
  validate: T | L
): validate is L =>
  Boolean(validate && typeof validate === 'object' && COMP_LAZILY_SIGNATURE in validate);

const Comp = { compose, lazily };

export default Comp;
