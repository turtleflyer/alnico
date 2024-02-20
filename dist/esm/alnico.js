import { COMP_LAZILY_SIGNATURE } from './alnico.const';
export const gse = (initState, deps) => {
  let holdValue = initState;
  const retrieveValue = (v) => (isLazily(v) ? v[COMP_LAZILY_SIGNATURE](deps) : v);
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
export const compose = (initState, composers, embed) => {
  const deps = Object.create(null);
  const composedBundle = Object.create(null);
  const proxyHandler = {
    get: (target, prop) => {
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
  const lazyEmbedPart = gse(
    Object.assign(
      Object.assign(
        {},
        lazily(() => undefined)
      ),
      embed
    ),
    deps
  );
  for (const key in initState) {
    deps[key] = gse(initState[key], proxyDeps);
  }
  for (const key in embed) {
    const descriptor = { [key]: { get: gse(embed[key], proxyDeps).get, enumerable: true } };
    Object.defineProperties(deps, descriptor);
    Object.defineProperties(composedBundle, descriptor);
  }
  const composersSnapshot = Object.assign(Object.create(null), composers);
  for (const key in composersSnapshot) {
    const composed = (...args) => composersSnapshot[key](proxyDeps, ...args);
    deps[key] = composed;
    composedBundle[key] = composed;
  }
  return proxyComposedBundle;
};
export const lazily = (lazilyFn) => ({
  [COMP_LAZILY_SIGNATURE]: lazilyFn,
});
const isLazily = (validate) =>
  Boolean(validate && typeof validate === 'object' && COMP_LAZILY_SIGNATURE in validate);
const Comp = { compose, lazily };
export default Comp;
//# sourceMappingURL=alnico.js.map
