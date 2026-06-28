import { z } from 'ox/zod'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'

const client = anvil.getClient(anvil.mainnet)

// The first transaction of the pinned fork-tip block. anvil caches the fork
// block, so the receipt is deterministic and independent of the upstream.
const hash =
  '0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926'

test('args: hash', async () => {
  const receipt = await Actions.transaction.getReceipt(client, { hash })
  expect(receipt).toMatchInlineSnapshot(`
      {
        "blobGasPrice": undefined,
        "blobGasUsed": undefined,
        "blockHash": "0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d",
        "blockNumber": 22263623n,
        "contractAddress": null,
        "cumulativeGasUsed": 1382131n,
        "effectiveGasPrice": 13319389978n,
        "from": "0xe2da046340e00264c4f0443243a0565007ae08ac",
        "gasUsed": 1382131n,
        "logs": [
          {
            "address": "0xd5ec14a83b7d95be1e2ac12523e2dee12cbeea6c",
            "blockHash": "0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d",
            "blockNumber": 22263623n,
            "blockTimestamp": 1744590299n,
            "data": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000016d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013dbc900d764ad0b0001000000000000000000000000000000000000000000000000000000003fa200000000000000000000000039b7f514c199e4beb1739576a2dbd4de7414981b000000000000000000000000dfca0a882ef7793485b3d052142b60647e82009e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f424000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000024fbde929b07c6dbd483eda927d8e13634724c68fd853f116c13471489fef6b26ed91874550000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
            "logIndex": 0,
            "removed": false,
            "topics": [
              "0xb3813568d9991fc951961fcb4c784893574240a28925604d09fc577c55bb7c32",
              "0x0000000000000000000000000a42a81d18b1766d15695ffc7c1920a62b7e821b",
              "0x0000000000000000000000004200000000000000000000000000000000000007",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
            ],
            "transactionHash": "0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926",
            "transactionIndex": 0,
          },
          {
            "address": "0xf931a81d18b1766d15695ffc7c1920a62b7e710a",
            "blockHash": "0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d",
            "blockNumber": 22263623n,
            "blockTimestamp": 1744590299n,
            "data": "0x00000000000000000000000039b7f514c199e4beb1739576a2dbd4de7414981b00000000000000000000000000000000000000000000000000000000000000800001000000000000000000000000000000000000000000000000000000003fa200000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000000000000000024fbde929b07c6dbd483eda927d8e13634724c68fd853f116c13471489fef6b26ed918745500000000000000000000000000000000000000000000000000000000",
            "logIndex": 1,
            "removed": false,
            "topics": [
              "0xcb0f7ffd78f9aee47a248fae8db181db6eee833039123e026dcbff529522e52a",
              "0x000000000000000000000000dfca0a882ef7793485b3d052142b60647e82009e",
            ],
            "transactionHash": "0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926",
            "transactionIndex": 0,
          },
          {
            "address": "0xf931a81d18b1766d15695ffc7c1920a62b7e710a",
            "blockHash": "0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d",
            "blockNumber": 22263623n,
            "blockTimestamp": 1744590299n,
            "data": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "logIndex": 2,
            "removed": false,
            "topics": [
              "0x8ebb2ec2465bdb2a06a66fc37a0963af8a2a6a1479d81d56fdb8cbb98096d546",
              "0x00000000000000000000000039b7f514c199e4beb1739576a2dbd4de7414981b",
            ],
            "transactionHash": "0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926",
            "transactionIndex": 0,
          },
          {
            "address": "0x39b7f514c199e4beb1739576a2dbd4de7414981b",
            "blockHash": "0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d",
            "blockNumber": 22263623n,
            "blockTimestamp": 1744590299n,
            "data": "0x07c6dbd483eda927d8e13634724c68fd853f116c13471489fef6b26ed9187455",
            "logIndex": 3,
            "removed": false,
            "topics": [
              "0xd8f3e639501c4b5e551a948a2930f1215556bcde417c94d45746a8ec6418366f",
            ],
            "transactionHash": "0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926",
            "transactionIndex": 0,
          },
        ],
        "logsBloom": "0x00000000000000000010000001800000000000000000000000000000000000000000000008000000020080100004008000000000000000080000100000004000000000000000000040000002204800008400000000000000000000040000000000000000020000000000004800000800000800000000000000000000000000000020000000000000000000000000000000000040000001000000000100000000000000000000000000000000000000000008000000000000000000000004000000000000000000000000000008020000000000000000000000000000000020000000000000000000000000002000000000000000080000000000000000000000",
        "status": "success",
        "to": "0x39b7f514c199e4beb1739576a2dbd4de7414981b",
        "transactionHash": "0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926",
        "transactionIndex": 0,
        "type": "eip1559",
      }
    `)
})

test('behavior: decodes via chain schema when declared', async () => {
  const chain = mainnet.extend({
    rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
    schema: {
      transactionReceipt: {
        fromRpc: z.TransactionReceipt.TransactionReceipt,
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  expect(await Actions.transaction.getReceipt(schemaClient, { hash })).toEqual(
    await Actions.transaction.getReceipt(client, { hash }),
  )
})

test('behavior: decodes custom properties via chain schema', async () => {
  const chain = mainnet.extend({
    rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
    schema: {
      transactionReceipt: {
        fromRpc: z.pipe(
          z.TransactionReceipt.TransactionReceipt,
          z.transform((receipt) => ({
            ...receipt,
            custom: 'hello' as const,
          })),
        ),
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
