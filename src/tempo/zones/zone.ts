import { ZoneId } from 'ox/tempo'
import { tempo } from '../../chains/definitions/tempo.js'
import { tempoModerato } from '../../chains/definitions/tempoModerato.js'
import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../chainConfig.js'
import * as Addresses from './Addresses.js'

export function getPortalAddress(
  chainId: number,
  zoneId: number,
): `0x${string}` {
  const address = (
    Addresses.portal as Record<number, Record<number, `0x${string}`>>
  )[chainId]?.[zoneId]
  if (!address)
    throw new Error(
      `No portal address configured for zone ${zoneId} on chain ${chainId}.`,
    )
  return address
}

type ZoneContracts = {
  messenger: Record<number, { address: `0x${string}` } | undefined>
  portal: Record<number, { address: `0x${string}` } | undefined>
}

type Override = {
  contracts?: ZoneContracts | undefined
  name: string
  rpcUrl: string
}

const overrides = {
  [tempoModerato.id]: {
    1: {
      contracts: {
        messenger: {
          [tempoModerato.id]: {
            address: Addresses.messenger[tempoModerato.id][1],
          },
        },
        portal: {
          [tempoModerato.id]: {
            address: Addresses.portal[tempoModerato.id][1],
          },
        },
      },
      name: 'Zone E',
      rpcUrl: 'https://rpc-zone-e.testnet.tempo.xyz',
    },
    6: {
      name: 'Zone A',
      rpcUrl: 'https://rpc-zone-a.testnet.tempo.xyz',
    },
    7: {
      name: 'Zone B',
      rpcUrl: 'https://rpc-zone-b.testnet.tempo.xyz',
    },
  },
} as const satisfies Record<number, Record<number, Override>>

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

    const override = (overrides as Record<number, Record<number, Override>>)[
      options.sourceId
    ]?.[id]

    return defineChain({
      ...chainConfig,
      ...(override?.contracts ? { contracts: override.contracts } : {}),
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
      supportsTransactionReplacementDetection: false,
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
