import type { Address } from 'abitype'

import { assertType, describe, expect, it, test } from 'vitest'

import { accounts, forkBlockNumber } from '~test/src/constants.js'
import { publicClient, testClient, walletClient } from '~test/src/utils.js'
import { celo } from '../../chains/index.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { wait } from '../../utils/wait.js'
import { getBlock } from './getBlock.js'
import { getTransaction } from './getTransaction.js'
import { getTransactionReceipt } from './getTransactionReceipt.js'

test('gets transaction receipt', async () => {
  const transaction = await getTransaction(publicClient, {
    blockNumber: forkBlockNumber - 1n,
    index: 0,
  })
  const receipt = await getTransactionReceipt(publicClient, {
    hash: transaction.hash,
  })
  assertType<TransactionReceipt>(receipt)
  expect(receipt).toMatchInlineSnapshot(`
    {
      "blockHash": "0xb932f77cf770d1d1c8f861153eec1e990f5d56b6ffdb4ac06aef3cca51ef37d4",
      "blockNumber": 16280769n,
      "contractAddress": null,
      "cumulativeGasUsed": 21000n,
      "effectiveGasPrice": 33427926161n,
      "from": "0x043022ef9fca1066024d19d681e2ccf44ff90de3",
      "gasUsed": 21000n,
      "logs": [],
      "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "status": "success",
      "to": "0x318a5fb4f1604fc46375a1db9a9018b6e423b345",
      "transactionHash": "0xbf7d27700d053765c9638d3b9d39eb3c56bfc48377583e8be483d61f9f18a871",
      "transactionIndex": 0,
      "type": "legacy",
    }
  `)
})

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
    await mine(testClient, { blocks: 1 })
    await wait(500)

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
