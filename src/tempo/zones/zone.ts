import { ZoneId } from 'ox/tempo'

import * as Chain from '../../core/Chain.js'
import { tempo } from '../../chains/definitions/tempo.js'
import { tempoModerato } from '../../chains/definitions/tempoModerato.js'
import { chainConfig } from '../chainConfig.js'
import * as Addresses from './Addresses.js'

type ZoneContracts = {
  /** Parent-chain messenger contracts keyed by source chain ID. */
  messenger: Record<number, Chain.Chain.Contract | undefined>
  /** Parent-chain portal contracts keyed by source chain ID. */
  portal: Record<number, Chain.Chain.Contract | undefined>
}

/** Returns the portal address for a zone on a Tempo chain. */
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

/** Zone chain factory for Tempo mainnet. */
export const zone = /*#__PURE__*/ from({
  sourceId: tempo.id,
  rpcHost: 'tempo.xyz',
})

/** Zone chain factory for Tempo Moderato (testnet). */
export const zoneModerato = /*#__PURE__*/ from({
  sourceId: tempoModerato.id,
  rpcHost: 'tempoxyz.dev',
  overrides: {
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
})

/** Creates a zone chain factory for a given Tempo network. */
export function from(options: from.Options) {
  return (id: number) => {
    const chainId = ZoneId.toChainId(id)
    const paddedId = String(id).padStart(3, '0')

    const override = options.overrides?.[id]

    return Chain.from({
      ...chainConfig,
      contracts: {
        ...chainConfig.contracts,
        ...override?.contracts,
      },
      id: chainId,
      name: override?.name ?? `Tempo Zone ${paddedId}`,
      nativeCurrency: {
        name: 'USD',
        symbol: 'USD',
        decimals: 6,
      },
      rpcUrls: {
        http:
          override?.rpcUrl ?? `https://rpc-zone-${paddedId}.${options.rpcHost}`,
      },
      sourceId: options.sourceId,
      supportsTransactionReplacementDetection: false,
    })
  }
}

export declare namespace from {
  type Override = {
    /** Parent-chain contracts used by the Zone. */
    contracts?: ZoneContracts | undefined
    /** Human-readable Zone name. */
    name: string
    /** Zone RPC URL. */
    rpcUrl: string
  }

  type Options = {
    /** Zone name and RPC URL overrides, keyed by zone ID. */
    overrides?: Record<number, Override> | undefined
    /** RPC hostname used to construct zone RPC URLs (e.g. `tempo.xyz`). */
    rpcHost: string
    /** Chain ID of the parent Tempo chain (e.g. `4217` for mainnet, `42431` for moderato). */
    sourceId: number
  }
}
