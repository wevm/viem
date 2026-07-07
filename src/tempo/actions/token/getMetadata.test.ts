import * as TokenId from 'ox/tempo/TokenId'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Actions } from 'viem/tempo'

const client = tempo.getClient({ feeToken: tempo.pathUsd })

describe('getMetadata', () => {
  test('default', async () => {
    const metadata = await Actions.token.getMetadata(client, {
      token: tempo.alphaUsd,
    })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "currency": "USD",
        "decimals": 6,
        "logoURI": "",
        "name": "AlphaUSD",
        "paused": false,
        "quoteToken": "0x20C0000000000000000000000000000000000000",
        "supplyCap": 340282366920938463463374607431768211455n,
        "symbol": "AlphaUSD",
        "totalSupply": 202914184810805067765n,
        "transferPolicyId": 1n,
      }
    `)
  })

  test('behavior: custom token (address)', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Test USD',
      symbol: 'TUSD',
    })

    const metadata = await Actions.token.getMetadata(client, { token })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "currency": "USD",
        "decimals": 6,
        "logoURI": "",
        "name": "Test USD",
        "paused": false,
        "quoteToken": "0x20C0000000000000000000000000000000000000",
        "supplyCap": 340282366920938463463374607431768211455n,
        "symbol": "TUSD",
        "totalSupply": 0n,
        "transferPolicyId": 1n,
      }
    `)
  })

  test('behavior: quote token', async () => {
    const idMetadata = await Actions.token.getMetadata(client, {
      token: TokenId.fromAddress(tempo.pathUsd),
    })

    expect(idMetadata).toMatchInlineSnapshot(`
      {
        "currency": "USD",
        "decimals": 6,
        "logoURI": "",
        "name": "pathUSD",
        "symbol": "pathUSD",
        "totalSupply": 184467440737095516150n,
      }
    `)

    const addressMetadata = await Actions.token.getMetadata(client, {
      token: tempo.pathUsd,
    })

    expect(addressMetadata).toMatchInlineSnapshot(`
      {
        "currency": "USD",
        "decimals": 6,
        "logoURI": "",
        "name": "pathUSD",
        "symbol": "pathUSD",
        "totalSupply": 184467440737095516150n,
      }
    `)
  })

  test('behavior: custom token (id)', async () => {
    const token = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Test USD',
      symbol: 'TUSD',
    })

    const metadata = await Actions.token.getMetadata(client, {
      token: token.tokenId,
    })

    expect(metadata).toMatchInlineSnapshot(`
      {
        "currency": "USD",
        "decimals": 6,
        "logoURI": "",
        "name": "Test USD",
        "paused": false,
        "quoteToken": "0x20C0000000000000000000000000000000000000",
        "supplyCap": 340282366920938463463374607431768211455n,
        "symbol": "TUSD",
        "totalSupply": 0n,
        "transferPolicyId": 1n,
      }
    `)
  })

  test('behavior: custom token with logo URI', async () => {
    const logoURI = 'https://example.com/test-usd.svg'
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      logoURI,
      name: 'Logo USD',
      symbol: 'LUSD',
    })

    const metadata = await Actions.token.getMetadata(client, { token })
    expect(metadata.logoURI).toBe(logoURI)
  })
})
