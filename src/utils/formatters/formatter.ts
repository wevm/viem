import type { ErrorType } from '../../errors/utils.js'
import type { Prettify } from '../../types/utils.js'

export type DefineFormatterErrorType = ErrorType

export function defineFormatter<type extends string, parameters, returnType>(
  type: type,
  format: (args: parameters, action?: string | undefined) => returnType,
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
    format: (
      args: parametersOverride,
      action?: string | undefined,
    ) => returnTypeOverride
  }) => {
    return {
      exclude,
      format: (args: parametersOverride, action?: string | undefined) => {
        const formatted = format(args as any, action)
        if (exclude) {
          for (const key of exclude) {
            delete (formatted as any)[key]
          }
        }
        return {
          ...formatted,
          ...overrides(args, action),
        } as Prettify<returnTypeOverride> & {
          [_key in exclude[number]]: never
        }
      },
      type,
    }
  }
}
