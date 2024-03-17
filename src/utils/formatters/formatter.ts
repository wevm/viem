import type { ErrorType } from '../../errors/utils.js'
import type { Assign, Prettify } from '../../types/utils.js'

export type DefineFormatterErrorType = ErrorType

export function defineFormatter<TType extends string, TParameters, TReturnType>(
  type: TType,
  format: (_: TParameters) => TReturnType,
) {
  return <
    TOverrideParameters,
    TOverrideReturnType,
    TExclude extends (keyof TParameters | keyof TOverrideParameters)[] = [],
  >({
    exclude,
    format: overrides,
  }: {
    exclude?: TExclude | undefined
    format: (_: TOverrideParameters) => TOverrideReturnType
  }) => {
    return {
      exclude,
      format: (args: Assign<TParameters, TOverrideParameters>) => {
        const formatted = format(args as any)
        if (exclude) {
          for (const key of exclude) {
            delete (formatted as any)[key]
          }
        }
        return {
          ...formatted,
          ...overrides(args),
        } as Prettify<Assign<TReturnType, TOverrideReturnType>> & {
          [_key in TExclude[number]]: never
        }
      },
      type,
    }
  }
}
