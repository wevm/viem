export type NonNegativeNumber<TNumber extends number | bigint> =
  `${TNumber}` extends `-${string}` ? never : TNumber
