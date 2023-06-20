import type { Assign, Prettify } from '../../types/utils.js'

export function defineFormatter<TParameters, TReturnType>(
  format: (args: TParameters) => TReturnType,
) {
  return <TOverrideParameters, TOverrideReturnType>(
    overrides: (args: TOverrideParameters) => TOverrideReturnType,
  ) => {
    return (args: TParameters & TOverrideParameters) =>
      ({
        ...format(args),
        ...overrides(args),
      }) as Prettify<Assign<TReturnType, TOverrideReturnType>>
  }
}
