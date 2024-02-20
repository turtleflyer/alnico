export type IsEqual<T1, T2> = (<G1>() => G1 extends T1 ? 1 : 2) extends <G2>() => G2 extends T2
  ? 1
  : 2
  ? true
  : false;

export type IsTrue<T extends true> = T;
