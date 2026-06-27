import { describe, expect, test } from 'vitest'
import { client, usdc } from '~test/token.js'
import { getMetadata } from './getMetadata.js'

// Dai Stablecoin: an ERC-20 not declared on the chain's `tokens` config.
const dai = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

describe('getMetadata', () => {
  test('default', async () => {
    const metadata = await getMetadata(client, { token: usdc })
    expect(metadata).toMatchInlineSnapshot(`
      {
        "decimals": 6,
        "name": "USD Coin",
        "symbol": "USDC",
      }
    `)
  })

  test('token: resolves metadata from chain tokens', async () => {
    const metadata = await getMetadata(client, { token: 'usdc' })
    expect(metadata).toMatchInlineSnapshot(`
      {
        "decimals": 6,
        "name": "USD Coin",
        "symbol": "USDC",
      }
    `)
  })

  test('fetch: reads metadata from an undeclared token contract', async () => {
    const metadata = await getMetadata(client, { token: dai })
    expect(metadata).toMatchInlineSnapshot(`
      {
        "decimals": 18,
        "name": "Dai Stablecoin",
        "symbol": "DAI",
      }
    `)
  })

  test('decimals: override takes precedence over chain config', async () => {
    const metadata = await getMetadata(client, { decimals: 2, token: 'usdc' })
    expect(metadata.decimals).toBe(2)
  })
})
