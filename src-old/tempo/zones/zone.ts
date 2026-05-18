import { ZoneId } from 'ox/tempo'
import { tempo } from '../../chains/definitions/tempo.js'
import { tempoModerato } from '../../chains/definitions/tempoModerato.js'
import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../chainConfig.js'

export const portalAddresses = {
  [tempoModerato.id]: {
    6: '0x7069DeC4E64Fd07334A0933eDe836C17259c9B23',
    7: '0x3F5296303400B56271b476F5A0B9cBF74350D6Ac',
  },
} as const satisfies Record<number, Record<number, `0x${string}`>>

export function getPortalAddress(
  chainId: number,
  zoneId: number,
): `0x${string}` {
  const address = (
    portalAddresses as Record<number, Record<number, `0x${string}`>>
  )[chainId]?.[zoneId]
  if (!address)
    throw new Error(
      `No portal address configured for zone ${zoneId} on chain ${chainId}.`,
    )
  return address
}

type Override = {
  name: string
  rpcUrl: string
}

const overrides = {
  6: {
    name: 'Zone A',
    rpcUrl: 'https://rpc-zone-a.testnet.tempo.xyz',
  },
  7: {
    name: 'Zone B',
    rpcUrl: 'https://rpc-zone-b.testnet.tempo.xyz',
  },
} as const satisfies Record<number, Override>

export const zone = /*#__PURE__*/ from({
  sourceId: tempo.id,
  rpcHost: 'tempo.xyz',
})

export const zoneModerato = /*#__PURE__*/ from({
  sourceId: tempoModerato.id,
  rpcHost: 'tempoxyz.dev',
})

/** Creates a zone chain factory for a given Tempo network. */
export function from(options: from.Options) {
  return (id: number) => {
    const chainId = ZoneId.toChainId(id)
    const paddedId = String(id).padStart(3, '0')

    const override = (overrides as Record<number, Override>)[id]

    return defineChain({
      ...chainConfig,
      id: chainId,
      name: override?.name ?? `Tempo Zone ${paddedId}`,
      nativeCurrency: {
        name: 'USD',
        symbol: 'USD',
        decimals: 6,
      },
      rpcUrls: {
        default: {
          http: [
            override?.rpcUrl ??
              `https://rpc-zone-${paddedId}.${options.rpcHost}`,
          ],
        },
      },
      sourceId: options.sourceId,
    })
  }
}

declare namespace from {
  type Options = {
    /** RPC hostname used to construct zone RPC URLs (e.g. `tempo.xyz`). */
    rpcHost: string
    /** Chain ID of the parent Tempo chain (e.g. `4217` for mainnet, `42431` for moderato). */
    sourceId: number
  }
}
