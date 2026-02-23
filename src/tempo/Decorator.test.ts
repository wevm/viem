import { createClient, http } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { tempoActions } from 'viem/tempo'
import { describe, expect, test } from 'vitest'

describe('decorator', () => {
  const client2 = createClient({
    chain: tempoLocalnet,
    transport: http(),
  }).extend(tempoActions())

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
        "dex",
        "faucet",
        "nonce",
        "fee",
        "policy",
        "reward",
        "token",
        "validator",
      ]
    `)
  })
})
