import { expect, test } from 'vitest'
import { Actions } from 'viem'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const client = anvil.getWalletClient(anvil.mainnet)

test('default', async () => {
  const assets = await Actions.wallet.getAssets(client, {
    account: constants.accounts[0].address,
  })
  expect(assets).toMatchInlineSnapshot(`
    {
      "0": [
        {
          "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          "balance": 100000000n,
          "chainIds": [
            1,
          ],
          "metadata": {
            "decimals": 6,
            "name": "USD Coin",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
        {
          "address": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
          "balance": 1n,
          "chainIds": [
            1,
          ],
          "metadata": {
            "name": "Bored Ape",
            "symbol": "BAYC",
            "tokenId": 8888n,
          },
          "type": "erc721",
        },
        {
          "address": "0x0000000000000000000000000000000000001155",
          "balance": 100n,
          "chainIds": [
            1,
          ],
          "metadata": {},
          "type": {
            "custom": "erc1155",
          },
        },
        {
          "balance": 1500000000000000000n,
          "chainIds": [
            1,
            8453,
          ],
          "type": "native",
        },
        {
          "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
          "balance": 50000000n,
          "chainIds": [
            8453,
          ],
          "metadata": {
            "decimals": 6,
            "name": "USD Coin",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
      ],
      "1": [
        {
          "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          "balance": 100000000n,
          "metadata": {
            "decimals": 6,
            "name": "USD Coin",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
        {
          "address": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
          "balance": 1n,
          "metadata": {
            "name": "Bored Ape",
            "symbol": "BAYC",
            "tokenId": 8888n,
          },
          "type": "erc721",
        },
        {
          "address": "0x0000000000000000000000000000000000001155",
          "balance": 100n,
          "metadata": {},
          "type": {
            "custom": "erc1155",
          },
        },
        {
          "balance": 1000000000000000000n,
          "type": "native",
        },
      ],
      "8453": [
        {
          "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
          "balance": 50000000n,
          "metadata": {
            "decimals": 6,
            "name": "USD Coin",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
        {
          "balance": 500000000000000000n,
          "type": "native",
        },
      ],
    }
  `)
})

test('behavior: client account', async () => {
  const client = anvil.getWalletClient(anvil.mainnet, {
    account: constants.accounts[0].address,
  })
  const assets = await Actions.wallet.getAssets(client)
  expect(assets[1]).toBeDefined()
})

test('behavior: aggregate: false', async () => {
  const assets = await Actions.wallet.getAssets(client, {
    account: constants.accounts[0].address,
    aggregate: false,
  })
  expect(assets).toMatchInlineSnapshot(`
    {
      "1": [
        {
          "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          "balance": 100000000n,
          "metadata": {
            "decimals": 6,
            "name": "USD Coin",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
        {
          "address": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
          "balance": 1n,
          "metadata": {
            "name": "Bored Ape",
            "symbol": "BAYC",
            "tokenId": 8888n,
          },
          "type": "erc721",
        },
        {
          "address": "0x0000000000000000000000000000000000001155",
          "balance": 100n,
          "metadata": {},
          "type": {
            "custom": "erc1155",
          },
        },
        {
          "balance": 1000000000000000000n,
          "type": "native",
        },
      ],
      "8453": [
        {
          "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
          "balance": 50000000n,
          "metadata": {
            "decimals": 6,
            "name": "USD Coin",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
        {
          "balance": 500000000000000000n,
          "type": "native",
        },
      ],
    }
  `)
})

test('behavior: aggregate: function', async () => {
  const assets = await Actions.wallet.getAssets(client, {
    account: constants.accounts[0].address,
    aggregate: (asset) =>
      asset.type === 'erc20'
        ? asset.metadata.symbol
        : JSON.stringify(asset.type),
  })
  expect(assets[0]).toMatchInlineSnapshot(`
    [
      {
        "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
        "balance": 150000000n,
        "chainIds": [
          1,
          8453,
        ],
        "metadata": {
          "decimals": 6,
          "name": "USD Coin",
          "symbol": "USDC",
        },
        "type": "erc20",
      },
      {
        "address": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
        "balance": 1n,
        "chainIds": [
          1,
        ],
        "metadata": {
          "name": "Bored Ape",
          "symbol": "BAYC",
          "tokenId": 8888n,
        },
        "type": "erc721",
      },
      {
        "address": "0x0000000000000000000000000000000000001155",
        "balance": 100n,
        "chainIds": [
          1,
        ],
        "metadata": {},
        "type": {
          "custom": "erc1155",
        },
      },
      {
        "balance": 1500000000000000000n,
        "chainIds": [
          1,
          8453,
        ],
        "type": "native",
      },
    ]
  `)
})

test('behavior: chainIds filter', async () => {
  const assets = await Actions.wallet.getAssets(client, {
    account: constants.accounts[0].address,
    chainIds: [8453],
  })
  expect(assets).toMatchInlineSnapshot(`
    {
      "0": [
        {
          "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
          "balance": 50000000n,
          "chainIds": [
            8453,
          ],
          "metadata": {
            "decimals": 6,
            "name": "USD Coin",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
        {
          "balance": 500000000000000000n,
          "chainIds": [
            8453,
          ],
          "type": "native",
        },
      ],
      "8453": [
        {
          "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
          "balance": 50000000n,
          "metadata": {
            "decimals": 6,
            "name": "USD Coin",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
        {
          "balance": 500000000000000000n,
          "type": "native",
        },
      ],
    }
  `)
})

test('behavior: assetTypes filter', async () => {
  const assets = await Actions.wallet.getAssets(client, {
    account: constants.accounts[0].address,
    assetTypes: ['erc20'],
  })
  expect(assets).toMatchInlineSnapshot(`
    {
      "0": [
        {
          "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          "balance": 100000000n,
          "chainIds": [
            1,
          ],
          "metadata": {
            "decimals": 6,
            "name": "USD Coin",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
        {
          "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
          "balance": 50000000n,
          "chainIds": [
            8453,
          ],
          "metadata": {
            "decimals": 6,
            "name": "USD Coin",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
      ],
      "1": [
        {
          "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          "balance": 100000000n,
          "metadata": {
            "decimals": 6,
            "name": "USD Coin",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
      ],
      "8453": [
        {
          "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
          "balance": 50000000n,
          "metadata": {
            "decimals": 6,
            "name": "USD Coin",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
      ],
    }
  `)
})

test('error: no account', async () => {
  await expect(Actions.wallet.getAssets(client)).rejects
    .toThrowErrorMatchingInlineSnapshot(`
    [Account.NotFoundError: Could not find an Account to execute with this Action.

    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Version: viem@2.52.1]
  `)
})
