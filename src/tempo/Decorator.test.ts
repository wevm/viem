import { createClient, http } from 'viem'
import { tempo, tempoLocalnet, tempoModerato } from 'viem/chains'
import { tempoActions } from 'viem/tempo'
import { describe, expect, test } from 'vitest'

describe('decorator', () => {
  const client2 = createClient({
    chain: tempoLocalnet,
    transport: http(),
  }).extend(tempoActions())

  test('behavior: attaches `tempo` chain by default', () => {
    const client = createClient({
      transport: http(),
    }).extend(tempoActions())
    expect(client.chain).toBe(tempo)
    // resolves transport URL from the attached chain
    expect(client.transport.url).toBe('https://rpc.tempo.xyz')
  })

  test('behavior: attaches `tempoModerato` chain for testnet', () => {
    const client = createClient({
      transport: http(),
    }).extend(tempoActions({ testnet: true }))
    expect(client.chain).toBe(tempoModerato)
    // resolves transport URL from the attached chain
    expect(client.transport.url).toBe('https://rpc.moderato.tempo.xyz')
  })

  test('behavior: preserves explicitly provided chain', () => {
    const client = createClient({
      chain: tempoLocalnet,
      transport: http(),
    }).extend(tempoActions({ testnet: true }))
    expect(client.chain).toBe(tempoLocalnet)
  })

  test('default', async () => {
    expect(Object.keys(client2)).toMatchInlineSnapshot(`
      [
        "account",
        "batch",
        "cacheTime",
        "ccipRead",
        "chain",
        "dataSuffix",
        "key",
        "name",
        "pollingInterval",
        "request",
        "transport",
        "type",
        "uid",
        "extend",
        "accessKey",
        "amm",
        "channel",
        "dex",
        "faucet",
        "nonce",
        "fee",
        "policy",
        "receivePolicy",
        "reward",
        "simulate",
        "token",
        "validator",
        "virtualAddress",
        "zone",
      ]
    `)
  })
})
