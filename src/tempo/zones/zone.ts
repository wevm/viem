import { ZoneId } from 'ox/tempo'
import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../chainConfig.js'

export const zone = /*#__PURE__*/ from({
  sourceId: 4217,
  rpcHost: 'tempo.xyz',
  portalAddresses: {},
})

export const zoneModerato = /*#__PURE__*/ from({
  sourceId: 42431,
  rpcHost: 'tempoxyz.dev',
  portalAddresses: {
    6: '0x7069DeC4E64Fd07334A0933eDe836C17259c9B23',
    7: '0x3F5296303400B56271b476F5A0B9cBF74350D6Ac',
  },
})

/** Creates a zone chain factory for a given Tempo network. */
export function from(options: from.Options) {
  return (id: number) => {
    const portalAddress = options.portalAddresses[id]
    if (!portalAddress)
      throw new Error(`Unknown zone ${id}: no portal address configured.`)

    const chainId = ZoneId.toChainId(id)
    const paddedId = String(id).padStart(3, '0')

    return defineChain({
      ...chainConfig,
      id: chainId,
      name: `Tempo Zone ${paddedId}`,
      contracts: {
        zonePortal: {
          address: portalAddress,
        },
      },
      nativeCurrency: {
        name: 'USD',
        symbol: 'USD',
        decimals: 6,
      },
      rpcUrls: {
        default: {
          http: [`https://rpc-zone-${paddedId}.${options.rpcHost}`],
        },
      },
      sourceId: options.sourceId,
    })
  }
}

declare namespace from {
  type Options = {
    /** Mapping of zone IDs to their ZonePortal contract addresses on the parent chain. */
    // TODO: these addresses should ideally be derived from zone id via precompile address.
    portalAddresses: Record<number, `0x${string}`>
    /** RPC hostname used to construct zone RPC URLs (e.g. `tempo.xyz`). */
    rpcHost: string
    /** Chain ID of the parent Tempo chain (e.g. `4217` for mainnet, `42431` for moderato). */
    sourceId: number
  }
}
