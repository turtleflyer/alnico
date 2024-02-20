'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.lazily = exports.compose = exports.gse = void 0;
const alnico_const_1 = require('./alnico.const');
const gse = (initState, deps) => {
  let holdValue = initState;
  const retrieveValue = (v) => (isLazily(v) ? v[alnico_const_1.COMP_LAZILY_SIGNATURE](deps) : v);
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
exports.gse = gse;
const compose = (initState, composers, embed) => {
  const deps = Object.create(null);
  const composedBundle = Object.create(null);
  const proxyHandler = {
    get: (target, prop) => {
      const calculatedLazyPart = lazyEmbedPart.exc(undefined);
      for (const key in calculatedLazyPart) {
        const descriptor = {
          [key]: { get: (0, exports.gse)(calculatedLazyPart[key], deps).get, enumerable: true },
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
  const lazyEmbedPart = (0, exports.gse)(
    Object.assign(
      Object.assign(
        {},
        (0, exports.lazily)(() => undefined)
      ),
      embed
    ),
    deps
  );
  for (const key in initState) {
    deps[key] = (0, exports.gse)(initState[key], proxyDeps);
  }
  for (const key in embed) {
    const descriptor = {
      [key]: { get: (0, exports.gse)(embed[key], proxyDeps).get, enumerable: true },
    };
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
exports.compose = compose;
const lazily = (lazilyFn) => ({
  [alnico_const_1.COMP_LAZILY_SIGNATURE]: lazilyFn,
});
exports.lazily = lazily;
const isLazily = (validate) =>
  Boolean(
    validate && typeof validate === 'object' && alnico_const_1.COMP_LAZILY_SIGNATURE in validate
  );
const Comp = { compose: exports.compose, lazily: exports.lazily };
exports.default = Comp;
//# sourceMappingURL=alnico.js.map
