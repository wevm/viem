import { TransactionReceipt } from 'ox'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

const client = anvil.getClient(anvil.mainnet)

// The first transaction of the pinned fork-tip block. anvil caches the fork
// block, so the receipt is deterministic and independent of the upstream.
const hash =
  '0xa94e96a83d0c8ec8726d5393b832f2973bdb16249f8c84b01672b5a150010836'

test('args: hash', async () => {
  const receipt = await Actions.transaction.getReceipt(client, { hash })
  expect(receipt).toMatchInlineSnapshot(`
    {
      "blobGasPrice": 1331338n,
      "blobGasUsed": 393216n,
      "blockHash": "0x738cc1716ea1f08adac2d4e2230aedcee2d5cd3f65d66d5d3597e05d710a3d50",
      "blockNumber": 24000000n,
      "contractAddress": null,
      "cumulativeGasUsed": 21000n,
      "effectiveGasPrice": 10030101622n,
      "from": "0x5050f69a9786f081509234f1a7f4684b5e5b76c9",
      "gasUsed": 21000n,
      "logs": [],
      "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "status": "success",
      "to": "0xff00000000000000000000000000000000008453",
      "transactionHash": "0xa94e96a83d0c8ec8726d5393b832f2973bdb16249f8c84b01672b5a150010836",
      "transactionIndex": 0,
      "type": "eip4844",
    }
  `)
})

test('behavior: decodes via chain codecs when declared', async () => {
  const chain = mainnet.extend({
    rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
    codecs: {
      transactionReceipt: {
        fromRpc: (rpc: TransactionReceipt.Rpc) =>
          TransactionReceipt.fromRpc(rpc),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  expect(await Actions.transaction.getReceipt(schemaClient, { hash })).toEqual(
    await Actions.transaction.getReceipt(client, { hash }),
  )
})

test('behavior: decodes custom properties via chain codecs', async () => {
  const chain = mainnet.extend({
    rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
    codecs: {
      transactionReceipt: {
        fromRpc: (rpc: TransactionReceipt.Rpc) => ({
          ...TransactionReceipt.fromRpc(rpc),
          custom: 'hello' as const,
        }),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const receipt = await Actions.transaction.getReceipt(schemaClient, { hash })
  expect(receipt.custom).toBe('hello')
  expect(receipt.transactionHash).toBe(hash)
})

test('error: receipt not found', async () => {
  await expect(() =>
    Actions.transaction.getReceipt(client, {
      hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TransactionReceipt.NotFoundError: Transaction receipt with hash "0x0000000000000000000000000000000000000000000000000000000000000000" could not be found. The Transaction may not be processed on a block yet.

      Version: viem@2.52.1]
    `)
})
