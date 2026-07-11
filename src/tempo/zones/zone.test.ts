import { ZoneId } from 'ox/tempo'
import { tempo, tempoModerato } from 'viem/chains'
import { describe, expect, test } from 'vitest'
import {
  from,
  getPortalAddress,
  portalAddresses,
  zone,
  zoneModerato,
} from './zone.js'

describe('getPortalAddress', () => {
  test('returns a configured portal address', () => {
    expect(getPortalAddress(tempoModerato.id, 7)).toBe(
      portalAddresses[tempoModerato.id][7],
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
    expect(zoneModerato(6)).toMatchObject({
      id: ZoneId.toChainId(6),
      name: 'Zone A',
      rpcUrls: {
        default: { http: ['https://rpc-zone-a.testnet.tempo.xyz'] },
      },
      sourceId: tempoModerato.id,
    })
  })

  test('builds default zone metadata', () => {
    expect(zone(8)).toMatchObject({
      id: ZoneId.toChainId(8),
      name: 'Tempo Zone 008',
      rpcUrls: {
        default: { http: ['https://rpc-zone-008.tempo.xyz'] },
      },
      sourceId: tempo.id,
    })
  })

  test('builds a custom zone factory', () => {
    expect(from({ rpcHost: 'example.com', sourceId: 1 })(123)).toMatchObject({
      id: ZoneId.toChainId(123),
      name: 'Tempo Zone 123',
      rpcUrls: {
        default: { http: ['https://rpc-zone-123.example.com'] },
      },
      sourceId: 1,
    })
  })
})
