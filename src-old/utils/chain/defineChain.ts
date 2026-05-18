import type { Chain, ChainFormatters } from '../../types/chain.js'
import type { Assign, Prettify } from '../../types/utils.js'

export type DefineChainReturnType<chain extends Chain = Chain> = Prettify<
  chain &
    (chain['extendSchema'] extends Record<string, unknown>
      ? {
          extend: <const extended extends chain['extendSchema']>(
            extended: extended,
          ) => Assign<chain, extended>
        }
      : {})
>

export function defineChain<
  formatters extends ChainFormatters,
  const chain extends Chain<formatters>,
>(chain: chain): DefineChainReturnType<Assign<Chain<undefined>, chain>> {
  const chainInstance = {
    formatters: undefined,
    fees: undefined,
    serializers: undefined,
    ...chain,
  } as Assign<Chain<undefined>, chain>

  function extend(base: typeof chainInstance) {
    type ExtendFn = (base: typeof chainInstance) => unknown
    return (fnOrExtended: ExtendFn | Record<string, unknown>) => {
      const properties = (
        typeof fnOrExtended === 'function' ? fnOrExtended(base) : fnOrExtended
      ) as (typeof chainInstance)['extendSchema']
      const combined = { ...base, ...properties }
      return Object.assign(combined, { extend: extend(combined) })
    }
  }

  return Object.assign(chainInstance, {
    extend: extend(chainInstance),
  }) as never
}

export function extendSchema<schema extends Record<string, unknown>>(): schema {
  return {} as schema
}
