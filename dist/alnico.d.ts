import type { Compose, LazilyFn, LazilyWithDeps } from './alnico.types';
export declare const gse: <T, Deps extends Record<string, unknown>>(
  initState: T | LazilyWithDeps<T, Deps>,
  deps: Deps
) => {
  get: () => T;
  set: (newValue: T | LazilyWithDeps<T, Deps>) => void;
  exc: (newValue: T | LazilyWithDeps<T, Deps>) => T;
};
export declare const compose: Compose;
export declare const lazily: <T, Deps extends Record<string, unknown> = {}>(
  lazilyFn: LazilyFn<T, Deps>
) => LazilyWithDeps<T, Deps>;
declare const Comp: {
  compose: Compose;
  lazily: <T, Deps extends Record<string, unknown> = {}>(
    lazilyFn: LazilyFn<T, Deps>
  ) => LazilyWithDeps<T, Deps>;
};
export default Comp;
