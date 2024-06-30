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
    TOverride extends boolean = true,
    TExclude extends (keyof TParameters | keyof TOverrideParameters)[] = [],
  >({
    exclude,
    override: _,
    format: overrides,
  }: {
    exclude?: TExclude | undefined
    override?: TOverride | undefined
    format: (_: TOverrideParameters) => TOverrideReturnType
  }) => {
    return {
      exclude,
      format: (
        args: TOverride extends true
          ? Assign<TParameters, TOverrideParameters>
          : TOverrideParameters,
      ) => {
        const formatted = format(args as any)
        if (exclude) {
          for (const key of exclude) {
            delete (formatted as any)[key]
          }
        }
        return {
          ...formatted,
          ...overrides(args),
        } as Prettify<
          TOverride extends true
            ? Assign<TReturnType, TOverrideReturnType>
            : TOverrideReturnType
        > & {
          [_key in TExclude[number]]: never
        }
      },
      type,
    }
  }
}
