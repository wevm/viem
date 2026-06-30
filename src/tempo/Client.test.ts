import { http } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { createClient } from 'viem/tempo'
import { tempo as tempoTokens } from 'viem/tokens'
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

  test('behavior: defaults tokens to tempo tokens', () => {
    const client = createClient()
    expect(client.tokens).toBe(tempoTokens)
  })

  test('behavior: tokens override', () => {
    const client = createClient({ tokens: [] })
    expect(client.tokens).toEqual([])
  })
})
