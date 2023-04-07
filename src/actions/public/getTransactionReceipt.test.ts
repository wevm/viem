import { assertType, describe, expect, it, test } from 'vitest'

import {
  accounts,
  publicClient,
  testClient,
  walletClient,
} from '../../_test/index.js'
import { celo } from '../../chains.js'
import { createPublicClient, http } from '../../clients/index.js'
import type { Address, TransactionReceipt } from '../../types/index.js'
import { parseEther, parseGwei } from '../../utils/index.js'
import { wait } from '../../utils/wait.js'
import { mine } from '../test/index.js'
import { getBlock, sendTransaction } from '../index.js'

import { getTransaction } from './getTransaction.js'
import { getTransactionReceipt } from './getTransactionReceipt.js'

test(
  'gets transaction receipt',
  async () => {
    const receipt = await getTransactionReceipt(publicClient, {
      hash: '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b',
    })
    assertType<TransactionReceipt>(receipt)
    expect(receipt).toMatchInlineSnapshot(`
    {
      "blockHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
      "blockNumber": 15131999n,
      "contractAddress": null,
      "cumulativeGasUsed": 5814407n,
      "effectiveGasPrice": 11789405161n,
      "from": "0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e",
      "gasUsed": 37976n,
      "logs": [
        {
          "address": "0x15d4c048f83bd7e37d49ea4c83a07267ec4203da",
          "blockHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
          "blockNumber": 15131999n,
          "data": "0x0000000000000000000000000000000000000000000000000000002b3b6fb3d0",
          "logIndex": 108n,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x000000000000000000000000a00f99bc38b1ecda1fd70eaa1cd31d576a9f46b0",
            "0x000000000000000000000000f16e9b0d03470827a95cdfd0cb8a8a3b46969b91",
          ],
          "transactionHash": "0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b",
          "transactionIndex": 69n,
        },
        {
          "address": "0x15d4c048f83bd7e37d49ea4c83a07267ec4203da",
          "blockHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
          "blockNumber": 15131999n,
          "data": "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffd4c4904c2f",
          "logIndex": 109n,
          "removed": false,
          "topics": [
            "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
            "0x000000000000000000000000a00f99bc38b1ecda1fd70eaa1cd31d576a9f46b0",
            "0x000000000000000000000000a152f8bb749c55e9943a3a0a3111d18ee2b3f94e",
          ],
          "transactionHash": "0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b",
          "transactionIndex": 69n,
        },
      ],
      "logsBloom": "0x08000000000000000000000000000000000000000000000000001000002000000000000000000000000000000000000000000000080000000000000000200000000000000000000000000008400000000000000000000000000000000000100000000000000000000040000008000000000004000000000000000010000000000000000000000000000000000000000000000000000000000000000000000004020000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000002090000000000000000000000000000000000000000000000000000000000000",
      "status": "success",
      "to": "0x15d4c048f83bd7e37d49ea4c83a07267ec4203da",
      "transactionHash": "0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b",
      "transactionIndex": 69,
      "type": "eip1559",
    }
  `)
  },
  { retry: 3 },
)

test('chain w/ custom block type', async () => {
  const client = createPublicClient({
    chain: celo,
    transport: http(),
  })
  const receipt = await getTransactionReceipt(client, {
    hash: '0xe47fce1dffbe8e94e8f7c23b0af18160fbc19a1e80e9cb107cafe0856dd4a3f7',
  })

  assertType<
    TransactionReceipt & {
      feeCurrency: Address | null
      gatewayFee: bigint | null
      gatewayFeeRecipient: Address | null
    }
  >(receipt)
  expect(receipt).toMatchInlineSnapshot(`
    {
      "blockHash": "0xfc279eb47ec9edbd7cb5c6affa4b3367daff930085d532d3cc4a1e004da46bd9",
      "blockNumber": 17582734n,
      "contractAddress": null,
      "cumulativeGasUsed": 1765686n,
      "effectiveGasPrice": 5000000001n,
      "feeCurrency": undefined,
      "from": "0x0372cffb61f23703efae601b1962efee825204bc",
      "gasUsed": 245109n,
      "gatewayFee": null,
      "gatewayFeeRecipient": undefined,
      "logs": [],
      "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "status": "reverted",
      "to": "0x865340af8e50eaf0acec9ebc789b2b425c7e0193",
      "transactionHash": "0xe47fce1dffbe8e94e8f7c23b0af18160fbc19a1e80e9cb107cafe0856dd4a3f7",
      "transactionIndex": 4,
      "type": "legacy",
    }
  `)
})

describe('e2e', () => {
  const sourceAccount = accounts[0]
  const targetAccount = accounts[1]

  it('gets transaction receipt', async () => {
    const block = await getBlock(publicClient)

    const maxFeePerGas = block.baseFeePerGas! + parseGwei('10')
    const maxPriorityFeePerGas = parseGwei('10')

    const hash = await sendTransaction(walletClient, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas,
      maxPriorityFeePerGas,
    })

    expect(await getTransaction(publicClient, { hash })).toBeDefined()
    await expect(() =>
      getTransactionReceipt(publicClient, {
        hash,
      }),
    ).rejects.toThrowError('Transaction receipt with hash')

    mine(testClient, { blocks: 1 })
    await wait(0)

    const {
      blockHash,
      blockNumber,
      effectiveGasPrice,
      transactionHash,
      ...receipt
    } = await getTransactionReceipt(publicClient, {
      hash,
    })

    expect(blockHash).toBeDefined()
    expect(blockNumber).toBeDefined()
    expect(effectiveGasPrice).toBeDefined()
    expect(transactionHash).toBeDefined()
    expect(receipt).toMatchInlineSnapshot(`
      {
        "contractAddress": null,
        "cumulativeGasUsed": 21000n,
        "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "gasUsed": 21000n,
        "logs": [],
        "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "status": "success",
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "transactionIndex": 0,
        "type": "eip1559",
      }
    `)
  })
})

test('throws if transaction not found', async () => {
  await expect(
    getTransactionReceipt(publicClient, {
      hash: '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98a',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "Transaction receipt with hash \\"0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98a\\" could not be found. The Transaction may not be processed on a block yet.

    Version: viem@1.0.2"
  `)
})
