import { ZoneId } from 'ox/tempo'
import { tempo, tempoModerato } from 'viem/chains'
import { describe, expect, test } from 'vitest'
import {
  from,
  getPortalAddress,
  messengerAddresses,
  portalAddresses,
  zone,
  zoneModerato,
} from './zone.js'

describe('getPortalAddress', () => {
  test('returns a configured portal address', () => {
    expect(getPortalAddress(tempoModerato.id, 1)).toBe(
      portalAddresses[tempoModerato.id][1],
    )
  })

  test('throws for an unknown zone', () => {
    expect(() => getPortalAddress(tempoModerato.id, 8)).toThrow(
      `No portal address configured for zone 8 on chain ${tempoModerato.id}.`,
    )
  })
})

describe('from', () => {
  test('uses zone metadata overrides', () => {
    expect(zoneModerato(1)).toMatchObject({
      contracts: {
        messenger: {
          [tempoModerato.id]: {
            address: messengerAddresses[tempoModerato.id][1],
          },
        },
        portal: {
          [tempoModerato.id]: {
            address: portalAddresses[tempoModerato.id][1],
          },
        },
      },
      id: ZoneId.toChainId(1),
      name: 'Zone E',
      rpcUrls: {
        default: { http: ['https://rpc-zone-e.testnet.tempo.xyz'] },
      },
      sourceId: tempoModerato.id,
      supportsTransactionReplacementDetection: false,
    })
    expect(zoneModerato(6)).toMatchObject({
      id: ZoneId.toChainId(6),
      name: 'Zone A',
      rpcUrls: {
        default: { http: ['https://rpc-zone-a.testnet.tempo.xyz'] },
      },
      sourceId: tempoModerato.id,
      supportsTransactionReplacementDetection: false,
    })
  })

  test('builds default zone metadata', () => {
    expect(zone(1)).toMatchObject({
      id: ZoneId.toChainId(1),
      name: 'Tempo Zone 001',
      rpcUrls: {
        default: { http: ['https://rpc-zone-001.tempo.xyz'] },
      },
      sourceId: tempo.id,
      supportsTransactionReplacementDetection: false,
    })
  })

  test('builds a custom zone factory', () => {
    expect(from({ rpcHost: 'example.com', sourceId: 1 })(6)).toMatchObject({
      id: ZoneId.toChainId(6),
      name: 'Tempo Zone 006',
      rpcUrls: {
        default: { http: ['https://rpc-zone-006.example.com'] },
      },
      sourceId: 1,
      supportsTransactionReplacementDetection: false,
    })
  })
})
