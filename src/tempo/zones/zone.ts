import { ZoneId } from 'ox/tempo'
import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../chainConfig.js'

function from(options: {
  sourceId: number
  rpcHost: string
  portalAddresses: Record<number, `0x${string}`>
}) {
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

export const zone = from({
  sourceId: 4217,
  rpcHost: 'tempo.xyz',
  portalAddresses: {},
})

export const zoneModerato = from({
  sourceId: 42431,
  rpcHost: 'tempoxyz.dev',
  portalAddresses: {
    6: '0x7069DeC4E64Fd07334A0933eDe836C17259c9B23',
    7: '0x3F5296303400B56271b476F5A0B9cBF74350D6Ac',
  },
})
