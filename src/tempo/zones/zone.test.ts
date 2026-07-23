import { tempo, tempoModerato } from 'viem/chains'
import { ZoneId } from 'viem/tempo'
import {
  Abis,
  from,
  getPortalAddress,
  portalAddresses,
  zone,
  zoneModerato,
} from 'viem/tempo/zones'
import { describe, expect, test } from 'vitest'

test('exports the zone factory ABI', () => {
  expect(Abis.zoneFactory.map(({ name, type }) => ({ name, type })))
    .toMatchInlineSnapshot(`
      [
        {
          "name": "ZoneCreated",
          "type": "event",
        },
        {
          "name": "ZoneCreated",
          "type": "event",
        },
        {
          "name": "createZone",
          "type": "function",
        },
        {
          "name": "createZone",
          "type": "function",
        },
        {
          "name": "verifier",
          "type": "function",
        },
      ]
    `)
})

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
      rpcUrls: { http: 'https://rpc-zone-a.testnet.tempo.xyz' },
      sourceId: tempoModerato.id,
      supportsTransactionReplacementDetection: false,
    })
    expect(zoneModerato(7)).toMatchObject({
      id: ZoneId.toChainId(7),
      name: 'Zone B',
      rpcUrls: { http: 'https://rpc-zone-b.testnet.tempo.xyz' },
      sourceId: tempoModerato.id,
      supportsTransactionReplacementDetection: false,
    })
  })

  test('does not apply testnet overrides on mainnet', () => {
    expect(zone(6)).toMatchObject({
      id: ZoneId.toChainId(6),
      name: 'Tempo Zone 006',
      rpcUrls: { http: 'https://rpc-zone-006.tempo.xyz' },
      sourceId: tempo.id,
      supportsTransactionReplacementDetection: false,
    })
  })

  test('does not apply testnet overrides on custom factories', () => {
    expect(from({ rpcHost: 'example.com', sourceId: 1 })(6)).toMatchObject({
      id: ZoneId.toChainId(6),
      name: 'Tempo Zone 006',
      rpcUrls: { http: 'https://rpc-zone-006.example.com' },
      sourceId: 1,
      supportsTransactionReplacementDetection: false,
    })
  })

  test('builds default zone metadata', () => {
    expect(zone(8)).toMatchObject({
      id: ZoneId.toChainId(8),
      name: 'Tempo Zone 008',
      rpcUrls: { http: 'https://rpc-zone-008.tempo.xyz' },
      sourceId: tempo.id,
      supportsTransactionReplacementDetection: false,
    })
  })

  test('builds a custom zone factory', () => {
    expect(from({ rpcHost: 'example.com', sourceId: 1 })(123)).toMatchObject({
      id: ZoneId.toChainId(123),
      name: 'Tempo Zone 123',
      rpcUrls: { http: 'https://rpc-zone-123.example.com' },
      sourceId: 1,
      supportsTransactionReplacementDetection: false,
    })
  })
})
