import { COMP_LAZILY_SIGNATURE } from './alnico.const';
type BlankRecord = RestrictSymbolsFromProperties<Record<string, unknown>>;
type MethodsOnly = RestrictSymbolsFromProperties<Record<string, (...args: never) => unknown>>;
export type LazilyFn<T, Deps extends BlankRecord> = {} extends Deps ? () => T : (deps: Deps) => T;
export type LazilyWithDeps<T, Deps extends BlankRecord> = {
  [COMP_LAZILY_SIGNATURE]: LazilyFn<T, Deps>;
};
type EnhanceStateWithLazily<State extends BlankRecord, Deps extends BlankRecord> = {
  [K in keyof State]: State[K] | LazilyWithDeps<State[K], Deps>;
};
type EnhanceRecWithLazilyDepsAlt<Rec extends BlankRecord, Deps extends BlankRecord> = {
  [K in keyof Rec]: Rec[K] | LazilyWithDeps<Rec[K], {}> | LazilyWithDeps<Rec[K], Deps>;
};
export type GSEBundle<T, Deps extends BlankRecord> = {
  get: () => T;
  set: (newValue: T | LazilyWithDeps<T, Normalize<Deps>>) => void;
  exc: (newValue: T | LazilyWithDeps<T, Normalize<Deps>>) => T;
};
export type BuildDeps<
  InitState extends BlankRecord,
  Methods extends MethodsOnly,
  Embed extends BlankRecord = {},
> = Normalize<_BuildDeps<InitState, Methods, Embed>>;
type _BuildDeps<
  InitState extends BlankRecord,
  Methods extends MethodsOnly,
  Embed extends BlankRecord,
> = {
  [K in keyof InitState]: Normalize<GSEBundle<InitState[K], _BuildDeps<InitState, Methods, Embed>>>;
} & Methods &
  Embed;
type BuildComposers<Methods extends MethodsOnly, Deps extends Methods> = {
  [P in keyof Methods]: (deps: Deps, ...args: Parameters<Methods[P]>) => ReturnType<Methods[P]>;
};
type StateBundle<InitState extends BlankRecord, Deps extends BlankRecord> = {
  [K in keyof InitState]: Normalize<GSEBundle<InitState[K], Deps>>;
};
export type Compose = {
  <
    /**
     * `DisallowVagueRecord` prevents of the use following overload for implicating of types when
     * there are no explicit definitions in the generic declaration part
     */
    InitState extends BlankRecord & DisallowVagueRecord<Methods>,
    Methods extends MethodsOnly,
    Embed extends BlankRecord = {},
    Deps extends BuildDeps<InitState, Methods, Embed> = BuildDeps<InitState, Methods, Embed>,
  >(
    initState: EnhanceStateWithLazily<InitState, Deps>,
    composers: BuildComposers<Methods, Deps>,
    ...embed: {} extends Embed
      ? []
      : [
          BreakRecWithLazily<
            Embed,
            Normalize<
              {
                [K in keyof InitState]: Normalize<GSEBundle<InitState[K], Deps>>;
              } & Methods &
                Embed
            >
          >,
        ]
  ): Normalize<Methods & Embed>;
  /**
   * Following overload is for the use of the `compose` functions wanting to infer parameter types
   * from the passing parameters
   */
  <
    InitState extends BlankRecord,
    Comp extends RestrictSymbolsFromProperties<
      Record<
        string,
        (
          deps: Normalize<StateBundle<InitState, Deps> & Embed> &
            Record<string, (...args: any) => unknown>,
          ...args: any
        ) => unknown
      >
    >,
    Embed extends BlankRecord = {},
    Methods = {
      [K in keyof Comp]: Comp[K] extends (_: any, ...args: infer A) => infer R
        ? (...args: A) => R
        : never;
    },
    Deps extends BlankRecord = BuildDeps<InitState, Methods & MethodsOnly, Embed>,
  >(
    initState: EnhanceRecWithLazilyDepsAlt<InitState, Deps>,
    composers: Comp,
    ...embed: {} extends Embed ? [] : [EnhanceRecWithLazilyDepsAlt<Embed, Deps>]
  ): Normalize<Methods & Embed>;
};
export type MethodComposer<
  Deps extends BlankRecord,
  Method extends (...args: never) => unknown,
  SelfKey extends string = never,
> = (
  deps: Normalize<Deps & Record<SelfKey, Method>>,
  ...args: Parameters<Method>
) => ReturnType<Method>;
type Normalize<T> = T extends any
  ? {
      [K in keyof T]: T[K];
    }
  : never;
type RestrictSymbolsFromProperties<R extends Record<string, unknown>> = R & Record<symbol, never>;
type DisallowVagueRecord<R> = string extends keyof R ? never : unknown;
type BreakRecWithLazily<
  Rec extends BlankRecord,
  Deps extends BlankRecord,
  I extends (keyof Rec)[] = BreakUnion<keyof Rec> & (keyof Rec)[],
> = I extends any
  ? {
      [K in I[0]]: Rec[K] | LazilyWithDeps<Rec[K], Deps>;
    } & ([I[1]] extends [never]
      ? unknown
      : LazilyWithDeps<
          {
            [K in I[1]]: Rec[K] | LazilyWithDeps<Rec[K], Deps>;
          },
          Deps
        >)
  : never;
type BreakUnion<T, Pass extends [unknown, unknown] = [never, never]> = [T, any] extends [
  infer TT,
  any,
]
  ? T extends any
    ? Exclude<TT, T> extends infer E
      ? [Pass extends any ? [Pass[0] | T, Pass[1]] | [Pass[0], Pass[1] | T] : never] extends [
          infer NextPass,
        ]
        ? [E] extends [never]
          ? NextPass
          : BreakUnion<E, NextPass & [unknown, unknown]>
        : never
      : never
    : never
  : never;
export {};
