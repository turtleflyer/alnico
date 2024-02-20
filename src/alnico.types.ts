import { COMP_LAZILY_SIGNATURE } from './alnico.const';

export type GSEBundle<T, Deps extends BlankRecord> = {
  readonly get: () => T;
  readonly set: (newValue: T | LazilySignature<T, Deps>) => void;
  readonly exc: (newValue: T | LazilySignature<T, Deps>) => T;
};

export type LazilySignature<T, Deps extends BlankRecord> = {
  readonly [COMP_LAZILY_SIGNATURE]: LazilyFn<T, Deps>;
};

export type LazilyFn<T, Deps extends BlankRecord> = {} extends Deps ? () => T : (deps: Deps) => T;

export type MethodComposer<
  K extends keyof Methods,
  InitState extends BlankRecord,
  Methods extends MethodsOnly,
  Embed extends BlankRecord = {},
> = (
  deps: BuildDeps<InitState, Methods, Embed>,
  ...args: Parameters<Methods[K]>
) => ReturnType<Methods[K]>;

export type BuildDeps<
  InitState extends BlankRecord,
  Methods extends MethodsOnly,
  Embed extends BlankRecord,
> = Normalize<
  {
    [K in keyof InitState]: GSEBundle<InitState[K], BuildDeps<InitState, Methods, Embed>>;
  } & Methods &
    Embed
>;

export type StateBundle<InitState extends BlankRecord, Deps extends BlankRecord> = {
  [K in keyof InitState]: GSEBundle<InitState[K], Deps>;
};

export type BuildComposers<
  Methods extends Record<string, (...args: any) => unknown>,
  Deps extends Methods,
> = {
  [P in keyof Methods]: (deps: Deps, ...args: Parameters<Methods[P]>) => ReturnType<Methods[P]>;
};

export type Compose = {
  <
    /**
     * DisallowVagueRecord prevents of the use next overload for implicating of types when there are
     * no explicit definitions in the generic declaration part
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
                [K in keyof InitState]: { get: () => InitState[K] };
              } & Methods &
                Embed
            >
          >,
        ]
  ): Readonly<Normalize<Methods & Embed>>;

  <
    InitState extends BlankRecord,
    Comp extends RestrictSymbolsFromProperties<
      Record<
        string,
        (
          deps: StateBundle<InitState, Deps> & Embed & Record<string, (...args: any) => unknown>,
          ...args: any
        ) => unknown
      >
    >,
    Embed extends BlankRecord = {},
    Deps extends BlankRecord = BuildDeps<
      InitState,
      {
        [K in keyof Comp]: Comp[K] extends (_: any, ...args: infer A) => infer R
          ? (...args: A) => R
          : never;
      } & MethodsOnly,
      Embed
    >,
  >(
    initState: EnhanceRecWithLazilyDepsAlt<InitState, Deps>,
    composers: Comp,
    ...embed: {} extends Embed ? [] : [EnhanceRecWithLazilyDepsAlt<Embed, Deps>]
  ): Readonly<
    Normalize<
      {
        [K in keyof Comp]: Comp[K] extends (_: any, ...args: infer A) => infer R
          ? (...args: A) => R
          : never;
      } & Embed
    >
  >;
};

export type BlankRecord = RestrictSymbolsFromProperties<Record<string, unknown>>;

type MethodsOnly = RestrictSymbolsFromProperties<Record<string, (...args: never) => unknown>>;

type DisallowVagueRecord<R> = string extends keyof R ? never : unknown;

type RestrictSymbolsFromProperties<R extends Record<string, unknown>> = R & Record<symbol, never>;

export type EnhanceStateWithLazily<State extends BlankRecord, Deps extends BlankRecord> = {
  [K in keyof State]: State[K] | LazilySignature<State[K], Deps>;
};

export type BreakRecWithLazily<
  Rec extends BlankRecord,
  Deps extends BlankRecord,
  I extends (keyof Rec)[] = BreakUnion<keyof Rec> & (keyof Rec)[],
> = I extends any
  ? { [K in I[0]]: Rec[K] | LazilySignature<Rec[K], Deps> } & ([I[1]] extends [never]
      ? unknown
      : LazilySignature<{ [K in I[1]]: Rec[K] | LazilySignature<Rec[K], Deps> }, Deps>)
  : never;

type EnhanceRecWithLazilyDepsAlt<Rec extends BlankRecord, Deps extends BlankRecord> = {
  [K in keyof Rec]: Rec[K] | LazilySignature<Rec[K], {}> | LazilySignature<Rec[K], Deps>;
};

type Normalize<T> = T extends any ? { [K in keyof T]: T[K] } : never;

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
