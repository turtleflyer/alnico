import type { Compose, GSEBundle, LazilyFn, LazilySignature } from './alnico.types';
export declare const gse: <T, Deps extends Record<string, unknown>>(
  initState: T | LazilySignature<T, Deps>,
  deps: Deps
) => GSEBundle<T, Deps>;
export declare const compose: Compose;
export declare const lazily: <T, Deps extends Record<string, unknown> = {}>(
  lazilyFn: LazilyFn<T, Deps>
) => LazilySignature<T, Deps>;
declare const Comp: {
  compose: Compose;
  lazily: <T, Deps extends Record<string, unknown> = {}>(
    lazilyFn: LazilyFn<T, Deps>
  ) => LazilySignature<T, Deps>;
};
export default Comp;
