import type { Chain, ChainFormatters } from '../../types/chain.js'
import type { Assign, ExactPartial, Prettify } from '../../types/utils.js'

type ExtendedProperties<chain extends Chain = Chain> = Prettify<
  chain['extendSchema'] extends Record<string, unknown>
    ? chain['extendSchema']
    : { [key: string]: unknown }
>

export type DefineChainReturnType<chain extends Chain = Chain> = Prettify<
  chain & {
    extend: <
      const extended extends ExtendedProperties<chain> & ExactPartial<Chain>,
    >(
      extended: extended,
    ) => Assign<chain, extended>
  }
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
      ) as ExtendedProperties
      for (const key in chainInstance) delete properties[key]
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
