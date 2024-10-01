import type { ErrorType } from '../../errors/utils.js'
import type { Prettify } from '../../types/utils.js'

export type DefineFormatterErrorType = ErrorType

export function defineFormatter<type extends string, parameters, returnType>(
  type: type,
  format: (_: parameters) => returnType,
) {
  return <
    parametersOverride,
    returnTypeOverride,
    exclude extends (keyof parameters | keyof parametersOverride)[] = [],
  >({
    exclude,
    format: overrides,
  }: {
    exclude?: exclude | undefined
    format: (_: parametersOverride) => returnTypeOverride
  }) => {
    return {
      exclude,
      format: (args: parametersOverride) => {
        const formatted = format(args as any)
        if (exclude) {
          for (const key of exclude) {
            delete (formatted as any)[key]
          }
        }
        return {
          ...formatted,
          ...overrides(args),
        } as Prettify<returnTypeOverride> & {
          [_key in exclude[number]]: never
        }
      },
      type,
    }
  }
}
