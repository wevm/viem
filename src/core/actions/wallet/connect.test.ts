import { Provider } from 'ox'
import { describe, expect, test } from 'vitest'
import { Actions, Client, custom } from 'viem'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const client = anvil.getWalletClient(anvil.mainnet)

test('default', async () => {
  expect(await Actions.wallet.connect(client)).toMatchInlineSnapshot(`
    {
      "accounts": [
        {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "capabilities": {},
        },
      ],
    }
  `)
})

test('behavior: with capabilities', async () => {
  const response = await Actions.wallet.connect(client, {
    capabilities: {
      signInWithEthereum: { chainId: 1, nonce: 'abcd1234' },
    },
  })
  expect(response).toMatchInlineSnapshot(`
    {
      "accounts": [
        {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "capabilities": {
            "signInWithEthereum": {
              "chainId": 1,
              "nonce": "abcd1234",
            },
          },
        },
      ],
    }
  `)
})

describe('behavior: eth_requestAccounts fallback', () => {
  function getFallbackClient() {
    return Client.create({
      transport: custom(
        Provider.from({
          async request({ method }: any) {
            if (method === 'eth_requestAccounts')
              return [constants.accounts[0].address]
            throw new Provider.UnsupportedMethodError()
          },
        }),
      ),
    })
  }

  test('default', async () => {
    const client = getFallbackClient()
    expect(await Actions.wallet.connect(client)).toMatchInlineSnapshot(`
      {
        "accounts": [
          {
            "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            "capabilities": {},
          },
        ],
      }
    `)
  })

  test('behavior: with capabilities', async () => {
    const client = getFallbackClient()
    await expect(
      Actions.wallet.connect(client, {
        capabilities: {
          signInWithEthereum: { chainId: 1, nonce: 'abcd1234' },
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Provider.UnsupportedMethodError: The provider does not support the requested method.]`,
    )
  })
})
