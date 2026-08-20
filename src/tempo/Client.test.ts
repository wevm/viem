import { http } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { createClient, Multisig } from 'viem/tempo'
import { tokens } from 'viem/tokens'
import { describe, expect, test } from 'vitest'

import { tempo, tempoTestnet } from './Chain.js'

describe('createClient', () => {
  test('default', () => {
    const client = createClient()

    // Defaults to tempo mainnet + http transport.
    expect(client.chain).toEqual(tempo)
    expect(client.transport.type).toBe('http')

    // Decorated with publicActions, walletActions, and tempoActions.
    expect(typeof client.getBalance).toBe('function') // public
    expect(typeof client.sendTransaction).toBe('function') // wallet
    expect(typeof client.token).toBe('object') // tempo
    expect(typeof client.amm).toBe('object') // tempo
  })

  test('behavior: defaults tokens to the tempo set', () => {
    const client = createClient()
    expect(client.tokens).toBe(tokens.tempo)
  })

  test('behavior: tokens override', () => {
    const client = createClient({ tokens: [] })
    expect(client.tokens).toEqual([])
  })

  test('behavior: testnet', () => {
    const client = createClient({ testnet: true })
    expect(client.chain).toEqual(tempoTestnet)
  })

  test('behavior: chain override', () => {
    const client = createClient({ chain: tempoLocalnet })
    expect(client.chain).toEqual(tempoLocalnet)
  })

  test('behavior: chain overrides testnet', () => {
    const client = createClient({ chain: tempoLocalnet, testnet: true })
    expect(client.chain).toEqual(tempoLocalnet)
  })

  test('behavior: transport override', () => {
    const client = createClient({
      transport: http('https://example.com'),
    })
    expect(client.transport.url).toBe('https://example.com')
  })

  test('behavior: feeToken extended on chain', () => {
    const client = createClient({
      feeToken: '0x20c0000000000000000000000000000000000001',
    })
    expect(client.chain.id).toBe(tempo.id)
    expect((client.chain as { feeToken?: string }).feeToken).toBe(
      '0x20c0000000000000000000000000000000000001',
    )
  })

  test('behavior: feeToken extended on testnet chain', () => {
    const client = createClient({
      feeToken: '0x20c0000000000000000000000000000000000001',
      testnet: true,
    })
    expect(client.chain.id).toBe(tempoTestnet.id)
    expect((client.chain as { feeToken?: string }).feeToken).toBe(
      '0x20c0000000000000000000000000000000000001',
    )
  })

  test('behavior: multisig operation store resolution', async () => {
    const id = `0x${'aa'.repeat(32)}` as const
    const configuredStore = Multisig.Store.from({
      source: {
        compareAndSet: async () => true,
        get: async () => {
          throw new Error('Configured store used.')
        },
      },
    })
    const explicitStore = Multisig.Store.from({
      source: {
        compareAndSet: async () => true,
        get: async () => {
          throw new Error('Explicit store used.')
        },
      },
    })
    const client = createClient({
      experimental_multisig: true,
      transport: http('http://localhost'),
    })
    const configuredClient = createClient({
      experimental_multisig: { store: configuredStore },
      transport: http('http://localhost'),
    })

    await expect(client.multisig.getOperation({ id })).resolves.toBeNull()
    await expect(
      configuredClient.multisig.getOperation({ id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Configured store used.]`,
    )
    await expect(
      client.multisig.getOperation({ id, store: explicitStore }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Explicit store used.]`,
    )
    expect(client.transport.type).toMatchInlineSnapshot(`"http"`)
  })
})
