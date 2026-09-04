import { ZoneId } from 'ox/tempo'
import { Client } from 'viem'
import { tempo, tempoModerato } from 'viem/chains'
import { describe, expect, test } from 'vitest'
import { http } from './Transport.js'
import * as Zone from './Zone.js'

describe('Zone.from', () => {
  test.each([
    ['A', Zone.a, 4_217_000_006, 'https://rpc-zone-a.testnet.tempo.xyz'],
    ['B', Zone.b, 4_217_000_007, 'https://rpc-zone-b.testnet.tempo.xyz'],
  ])('defines legacy Zone %s', (name, zone, id, rpcUrl) => {
    expect(zone).toMatchObject({
      id,
      name: `Zone ${name}`,
      rpcUrls: { http: [rpcUrl] },
      sourceId: tempoModerato.id,
      supportsTransactionReplacementDetection: false,
    })
    expect(zone.contracts).toBeUndefined()
  })

  test('defines the internal mainnet zone', () => {
    expect(Zone.internal).toMatchObject({
      id: ZoneId.toChainId(1, tempo.id),
      name: 'Internal Zone',
      rpcUrls: { http: [] },
      sourceId: tempo.id,
      supportsTransactionReplacementDetection: false,
    })
    expect(Zone.internal.contracts).toBeUndefined()
  })

  test('defines the internal testnet zone', () => {
    expect(Zone.internalTestnet).toMatchObject({
      id: ZoneId.toChainId(3, tempoModerato.id),
      name: 'Internal Testnet Zone',
      rpcUrls: { http: [] },
      sourceId: tempoModerato.id,
      supportsTransactionReplacementDetection: false,
    })
    expect(Zone.internalTestnet.contracts).toBeUndefined()
  })

  test('requires a transport URL for zones without an RPC endpoint', () => {
    expect(() =>
      Client.create({ chain: Zone.internal, transport: http() }),
    ).toThrow('No URL was provided to the Transport.')
  })

  test('applies chain config over the defaults', () => {
    expect(
      Zone.from({
        id: ZoneId.toChainId(6, tempoModerato.id),
        name: 'Custom Zone',
        rpcUrls: { http: ['https://example.com'] },
        sourceId: tempoModerato.id,
        supportsTransactionReplacementDetection: true,
      }),
    ).toMatchObject({
      id: ZoneId.toChainId(6, tempoModerato.id),
      name: 'Custom Zone',
      rpcUrls: { http: ['https://example.com'] },
      sourceId: tempoModerato.id,
      supportsTransactionReplacementDetection: true,
    })
  })
})
