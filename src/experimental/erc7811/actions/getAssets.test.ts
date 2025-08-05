import { expect, test } from 'vitest'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import { erc7811Actions } from '../decorators/erc7811.js'
import { getAssets } from './getAssets.js'

const client = createClient({
  transport: http('https://base-sepolia-int.rpc.ithaca.xyz'),
}).extend(erc7811Actions())

test('default', async () => {
  const response = await getAssets(client, {
    account: '0x0000000000000000000000000000000000000001',
  })

  expect(response).toMatchInlineSnapshot(`
    {
      "0": [
        {
          "balance": 62244088441921005n,
          "chainIds": [
            84532,
            11155420,
          ],
          "type": "native",
        },
        {
          "address": "0x88238d346cfb2391203f4f33b90f5ecce22b4165",
          "balance": 0n,
          "chainIds": [
            84532,
            11155420,
          ],
          "metadata": {
            "decimals": 18,
            "name": "Exp2",
            "symbol": "EXP2",
          },
          "type": "erc20",
        },
        {
          "address": "0xaf3b0a5b4becc4fa1dfafe74580efa19a2ea49fa",
          "balance": 0n,
          "chainIds": [
            84532,
            11155420,
          ],
          "metadata": {
            "decimals": 18,
            "name": "Exp",
            "symbol": "EXP",
          },
          "type": "erc20",
        },
        {
          "address": "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
          "balance": 14052301n,
          "chainIds": [
            84532,
          ],
          "metadata": {
            "decimals": 6,
            "name": "USDC",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
        {
          "address": "0x5fd84259d66cd46123540766be93dfe6d43130d7",
          "balance": 10n,
          "chainIds": [
            11155420,
          ],
          "metadata": {
            "decimals": 6,
            "name": "USDC",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
      ],
      "11155420": [
        {
          "balance": 21928000000000001n,
          "type": "native",
        },
        {
          "address": "0xaf3b0a5b4becc4fa1dfafe74580efa19a2ea49fa",
          "balance": 0n,
          "metadata": {
            "decimals": 18,
            "name": "Exp",
            "symbol": "EXP",
          },
          "type": "erc20",
        },
        {
          "address": "0x88238d346cfb2391203f4f33b90f5ecce22b4165",
          "balance": 0n,
          "metadata": {
            "decimals": 18,
            "name": "Exp2",
            "symbol": "EXP2",
          },
          "type": "erc20",
        },
        {
          "address": "0x5fd84259d66cd46123540766be93dfe6d43130d7",
          "balance": 10n,
          "metadata": {
            "decimals": 6,
            "name": "USDC",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
      ],
      "84532": [
        {
          "balance": 40316088441921004n,
          "type": "native",
        },
        {
          "address": "0x88238d346cfb2391203f4f33b90f5ecce22b4165",
          "balance": 0n,
          "metadata": {
            "decimals": 18,
            "name": "Exp2",
            "symbol": "EXP2",
          },
          "type": "erc20",
        },
        {
          "address": "0xaf3b0a5b4becc4fa1dfafe74580efa19a2ea49fa",
          "balance": 0n,
          "metadata": {
            "decimals": 18,
            "name": "Exp",
            "symbol": "EXP",
          },
          "type": "erc20",
        },
        {
          "address": "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
          "balance": 14052301n,
          "metadata": {
            "decimals": 6,
            "name": "USDC",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
      ],
    }
  `)
})

test('args: aggregate (false)', async () => {
  const response = await getAssets(client, {
    account: '0x0000000000000000000000000000000000000000',
    aggregate: false,
  })

  expect(response).toMatchInlineSnapshot(`
    {
      "11155420": [
        {
          "balance": 1718025577846131060569n,
          "type": "native",
        },
        {
          "address": "0xaf3b0a5b4becc4fa1dfafe74580efa19a2ea49fa",
          "balance": 350000000000000000000n,
          "metadata": {
            "decimals": 18,
            "name": "Exp",
            "symbol": "EXP",
          },
          "type": "erc20",
        },
        {
          "address": "0x88238d346cfb2391203f4f33b90f5ecce22b4165",
          "balance": 0n,
          "metadata": {
            "decimals": 18,
            "name": "Exp2",
            "symbol": "EXP2",
          },
          "type": "erc20",
        },
        {
          "address": "0x5fd84259d66cd46123540766be93dfe6d43130d7",
          "balance": 0n,
          "metadata": {
            "decimals": 6,
            "name": "USDC",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
      ],
      "84532": [
        {
          "balance": 1073410503297107533613n,
          "type": "native",
        },
        {
          "address": "0x88238d346cfb2391203f4f33b90f5ecce22b4165",
          "balance": 2900n,
          "metadata": {
            "decimals": 18,
            "name": "Exp2",
            "symbol": "EXP2",
          },
          "type": "erc20",
        },
        {
          "address": "0xaf3b0a5b4becc4fa1dfafe74580efa19a2ea49fa",
          "balance": 150000000000000000000n,
          "metadata": {
            "decimals": 18,
            "name": "Exp",
            "symbol": "EXP",
          },
          "type": "erc20",
        },
        {
          "address": "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
          "balance": 0n,
          "metadata": {
            "decimals": 6,
            "name": "USDC",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
      ],
    }
  `)
})

test('args: aggregate (function)', async () => {
  const response = await getAssets(client, {
    account: '0x0000000000000000000000000000000000000000',
    aggregate: (asset) => JSON.stringify(asset.metadata),
  })

  expect(response).toMatchInlineSnapshot(`
    {
      "0": [
        {
          "balance": 2791436081143238594182n,
          "chainIds": [
            84532,
            11155420,
          ],
          "type": "native",
        },
        {
          "address": "0x88238d346cfb2391203f4f33b90f5ecce22b4165",
          "balance": 2900n,
          "chainIds": [
            84532,
            11155420,
          ],
          "metadata": {
            "decimals": 18,
            "name": "Exp2",
            "symbol": "EXP2",
          },
          "type": "erc20",
        },
        {
          "address": "0xaf3b0a5b4becc4fa1dfafe74580efa19a2ea49fa",
          "balance": 500000000000000000000n,
          "chainIds": [
            84532,
            11155420,
          ],
          "metadata": {
            "decimals": 18,
            "name": "Exp",
            "symbol": "EXP",
          },
          "type": "erc20",
        },
        {
          "address": "0x5fd84259d66cd46123540766be93dfe6d43130d7",
          "balance": 0n,
          "chainIds": [
            84532,
            11155420,
          ],
          "metadata": {
            "decimals": 6,
            "name": "USDC",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
      ],
      "11155420": [
        {
          "balance": 1718025577846131060569n,
          "type": "native",
        },
        {
          "address": "0xaf3b0a5b4becc4fa1dfafe74580efa19a2ea49fa",
          "balance": 350000000000000000000n,
          "metadata": {
            "decimals": 18,
            "name": "Exp",
            "symbol": "EXP",
          },
          "type": "erc20",
        },
        {
          "address": "0x88238d346cfb2391203f4f33b90f5ecce22b4165",
          "balance": 0n,
          "metadata": {
            "decimals": 18,
            "name": "Exp2",
            "symbol": "EXP2",
          },
          "type": "erc20",
        },
        {
          "address": "0x5fd84259d66cd46123540766be93dfe6d43130d7",
          "balance": 0n,
          "metadata": {
            "decimals": 6,
            "name": "USDC",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
      ],
      "84532": [
        {
          "balance": 1073410503297107533613n,
          "type": "native",
        },
        {
          "address": "0x88238d346cfb2391203f4f33b90f5ecce22b4165",
          "balance": 2900n,
          "metadata": {
            "decimals": 18,
            "name": "Exp2",
            "symbol": "EXP2",
          },
          "type": "erc20",
        },
        {
          "address": "0xaf3b0a5b4becc4fa1dfafe74580efa19a2ea49fa",
          "balance": 150000000000000000000n,
          "metadata": {
            "decimals": 18,
            "name": "Exp",
            "symbol": "EXP",
          },
          "type": "erc20",
        },
        {
          "address": "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
          "balance": 0n,
          "metadata": {
            "decimals": 6,
            "name": "USDC",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
      ],
    }
  `)
})

test('args: chainIds', async () => {
  const response = await getAssets(client, {
    account: '0x0000000000000000000000000000000000000000',
    chainIds: [84532],
  })

  expect(response).toMatchInlineSnapshot(`
    {
      "0": [
        {
          "balance": 1073410503297107533613n,
          "chainIds": [
            84532,
          ],
          "type": "native",
        },
        {
          "address": "0x88238d346cfb2391203f4f33b90f5ecce22b4165",
          "balance": 2900n,
          "chainIds": [
            84532,
          ],
          "metadata": {
            "decimals": 18,
            "name": "Exp2",
            "symbol": "EXP2",
          },
          "type": "erc20",
        },
        {
          "address": "0xaf3b0a5b4becc4fa1dfafe74580efa19a2ea49fa",
          "balance": 150000000000000000000n,
          "chainIds": [
            84532,
          ],
          "metadata": {
            "decimals": 18,
            "name": "Exp",
            "symbol": "EXP",
          },
          "type": "erc20",
        },
        {
          "address": "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
          "balance": 0n,
          "chainIds": [
            84532,
          ],
          "metadata": {
            "decimals": 6,
            "name": "USDC",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
      ],
      "84532": [
        {
          "balance": 1073410503297107533613n,
          "type": "native",
        },
        {
          "address": "0x88238d346cfb2391203f4f33b90f5ecce22b4165",
          "balance": 2900n,
          "metadata": {
            "decimals": 18,
            "name": "Exp2",
            "symbol": "EXP2",
          },
          "type": "erc20",
        },
        {
          "address": "0xaf3b0a5b4becc4fa1dfafe74580efa19a2ea49fa",
          "balance": 150000000000000000000n,
          "metadata": {
            "decimals": 18,
            "name": "Exp",
            "symbol": "EXP",
          },
          "type": "erc20",
        },
        {
          "address": "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
          "balance": 0n,
          "metadata": {
            "decimals": 6,
            "name": "USDC",
            "symbol": "USDC",
          },
          "type": "erc20",
        },
      ],
    }
  `)
})

test('args: assetTypes', async () => {
  const response = await getAssets(client, {
    account: '0x0000000000000000000000000000000000000000',
    assetTypes: ['native'],
  })

  expect(response).toMatchInlineSnapshot(`
    {
      "0": [
        {
          "balance": 2791436081143238594182n,
          "chainIds": [
            84532,
            11155420,
          ],
          "type": "native",
        },
      ],
      "11155420": [
        {
          "balance": 1718025577846131060569n,
          "type": "native",
        },
      ],
      "84532": [
        {
          "balance": 1073410503297107533613n,
          "type": "native",
        },
      ],
    }
  `)
})

test('behavior: erc721 assets with tokenId', async () => {
  const mockClient = createClient({
    transport: http('https://mock.example.com'),
  })
  ;(mockClient.request as any) = async ({ method }: { method: string }) => {
    if (method === 'wallet_getAssets') {
      return {
        '1': [
          {
            address: '0x1234567890123456789012345678901234567890',
            balance: '0x1',
            type: 'erc721',
            metadata: {
              name: 'Test NFT',
              symbol: 'TNFT',
              tokenId: '0x7b', // hex for 123
              tokenUri: 'https://example.com/token/123',
            },
          },
        ],
      }
    }
    throw new Error('Unexpected method')
  }

  const response = await getAssets(mockClient, {
    account: '0x0000000000000000000000000000000000000001',
    aggregate: false,
  })

  expect(response).toMatchInlineSnapshot(`
    {
      "1": [
        {
          "address": "0x1234567890123456789012345678901234567890",
          "balance": 1n,
          "metadata": {
            "name": "Test NFT",
            "symbol": "TNFT",
            "tokenId": 123n,
            "tokenUri": "https://example.com/token/123",
          },
          "type": "erc721",
        },
      ],
    }
  `)
})

test('behavior: custom asset types', async () => {
  const mockClient = createClient({
    transport: http('https://mock.example.com'),
  })

  // Mock the request method to return custom asset types
  ;(mockClient.request as any) = async ({ method }: { method: string }) => {
    if (method === 'wallet_getAssets') {
      return {
        '1': [
          {
            address: '0x1234567890123456789012345678901234567890',
            balance: '0xa',
            type: 'custom-token-type',
            metadata: {
              customProperty: 'customValue',
            },
          },
        ],
      }
    }
    throw new Error('Unexpected method')
  }

  const response = await getAssets(mockClient, {
    account: '0x0000000000000000000000000000000000000001',
    aggregate: false,
  })

  expect(response).toMatchInlineSnapshot(`
    {
      "1": [
        {
          "address": "0x1234567890123456789012345678901234567890",
          "balance": 10n,
          "metadata": {
            "customProperty": "customValue",
          },
          "type": {
            "custom": "custom-token-type",
          },
        },
      ],
    }
  `)
})

test('error: account not found', async () => {
  await expect(() => getAssets(client, {} as any)).rejects.toThrowError(
    AccountNotFoundError,
  )
})
