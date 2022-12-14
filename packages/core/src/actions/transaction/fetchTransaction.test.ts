import { assertType, describe, expect, test } from 'vitest'

import {
  accounts,
  initialBlockNumber,
  publicClient,
  testClient,
  walletClient,
} from '../../../test'
import { etherToValue } from '../../utils'
import { fetchBlock } from '../block'
import { sendTransaction } from '../transaction'
import { mine } from '../test'
import { setBalance } from '../test/setBalance'
import { TransactionNotFoundError, fetchTransaction } from './fetchTransaction'
import type { Address, Transaction } from '../../types'
import { createPublicClient, http } from '../../clients'
import { celo } from '../../chains'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

test('fetches transaction', async () => {
  await setBalance(testClient, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })

  await sendTransaction(walletClient, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('1'),
    },
  })

  await mine(testClient, { blocks: 1 })

  const transaction = await fetchTransaction(publicClient, {
    blockTag: 'latest',
    index: 0,
  })
  assertType<Transaction>(transaction)
  expect(Object.keys(transaction)).toMatchInlineSnapshot(`
    [
      "hash",
      "nonce",
      "blockHash",
      "blockNumber",
      "transactionIndex",
      "from",
      "to",
      "value",
      "gasPrice",
      "gas",
      "input",
      "v",
      "r",
      "s",
      "type",
      "accessList",
      "maxPriorityFeePerGas",
      "maxFeePerGas",
      "chainId",
    ]
  `)
  expect(transaction.type).toMatchInlineSnapshot('"eip1559"')
  expect(transaction.from).toMatchInlineSnapshot(
    '"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"',
  )
  expect(transaction.gas).toBeDefined()
  expect(transaction.transactionIndex).toMatchInlineSnapshot('0')
  expect(transaction.to).toMatchInlineSnapshot(
    '"0x70997970c51812dc3a010c7d01b50e0d17dc79c8"',
  )
  expect(transaction.value).toMatchInlineSnapshot('1000000000000000000n')
})

test('fetches transaction (legacy)', async () => {
  const block = await fetchBlock(publicClient)

  await setBalance(testClient, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })

  await sendTransaction(walletClient, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('1'),
      gasPrice: BigInt(block.baseFeePerGas ?? 0),
    },
  })

  await mine(testClient, { blocks: 1 })

  const transaction = await fetchTransaction(publicClient, {
    blockTag: 'latest',
    index: 0,
  })
  expect(Object.keys(transaction)).toMatchInlineSnapshot(`
    [
      "hash",
      "nonce",
      "blockHash",
      "blockNumber",
      "transactionIndex",
      "from",
      "to",
      "value",
      "gasPrice",
      "gas",
      "input",
      "v",
      "r",
      "s",
      "type",
      "chainId",
    ]
  `)
  expect(transaction.type).toMatchInlineSnapshot('"legacy"')
  expect(transaction.from).toMatchInlineSnapshot(
    '"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"',
  )
  expect(transaction.gas).toBeDefined()
  expect(transaction.transactionIndex).toMatchInlineSnapshot('0')
  expect(transaction.to).toMatchInlineSnapshot(
    '"0x70997970c51812dc3a010c7d01b50e0d17dc79c8"',
  )
  expect(transaction.value).toMatchInlineSnapshot('1000000000000000000n')
})

test('fetches transaction (eip2930)', async () => {
  const block = await fetchBlock(publicClient)

  await setBalance(testClient, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })

  await sendTransaction(walletClient, {
    request: {
      accessList: [{ address: targetAccount.address, storageKeys: [] }],
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('1'),
      gasPrice: BigInt(block.baseFeePerGas ?? 0),
    },
  })

  await mine(testClient, { blocks: 1 })

  const transaction = await fetchTransaction(publicClient, {
    blockTag: 'latest',
    index: 0,
  })
  expect(Object.keys(transaction)).toMatchInlineSnapshot(`
    [
      "hash",
      "nonce",
      "blockHash",
      "blockNumber",
      "transactionIndex",
      "from",
      "to",
      "value",
      "gasPrice",
      "gas",
      "input",
      "v",
      "r",
      "s",
      "type",
      "accessList",
      "chainId",
    ]
  `)
  expect(transaction.type).toMatchInlineSnapshot('"eip2930"')
  expect(transaction.from).toMatchInlineSnapshot(
    '"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"',
  )
  expect(transaction.gas).toBeDefined()
  expect(transaction.transactionIndex).toMatchInlineSnapshot('0')
  expect(transaction.to).toMatchInlineSnapshot(
    '"0x70997970c51812dc3a010c7d01b50e0d17dc79c8"',
  )
  expect(transaction.value).toMatchInlineSnapshot('1000000000000000000n')
})

test('chain w/ custom block type', async () => {
  const client = createPublicClient(
    http({
      chain: celo,
    }),
  )

  const transaction = await fetchTransaction(client, {
    blockNumber: 16628100n,
    index: 0,
  })
  assertType<
    Transaction & {
      feeCurrency: Address | null
      gatewayFee: bigint | null
      gatewayFeeRecipient: Address | null
    }
  >(transaction)
  expect(transaction).toMatchInlineSnapshot(`
    {
      "blockHash": "0x740371d30b3cee9d687f72e3409ba6447eceda7de86bc38b0fa84493114b510b",
      "blockNumber": 16628100n,
      "ethCompatible": false,
      "feeCurrency": null,
      "from": "0x045d685d23e8aa34dc408a66fb408f20dc84d785",
      "gas": 1527520n,
      "gasPrice": "0xb2cb8b7e",
      "gatewayFee": 0n,
      "gatewayFeeRecipient": null,
      "hash": "0x55678b68cc086d5b9739bb28748b492db030d001d9eb59001cc2d1f7a3305d17",
      "input": "0x389ec778",
      "nonce": 697201,
      "r": "0xf507fb8fa33ffd05a7f26c980bbb8271aa113affc8f192feba87abe26549bda1",
      "s": "0x7971c7b15ab4475ce6256da0bdf62ca1d1e491be8a03fe7637289f98c166f521",
      "to": "0xb86d682b1b6bf20d8d54f55c48f848b9487dec37",
      "transactionIndex": 0,
      "type": "legacy",
      "v": 84475n,
      "value": 0n,
    }
  `)
})

describe('args: hash', () => {
  test('fetches transaction by hash', async () => {
    const { hash } = await sendTransaction(walletClient, {
      request: {
        from: sourceAccount.address,
        to: targetAccount.address,
        value: etherToValue('3'),
      },
    })

    await mine(testClient, { blocks: 1 })

    const transaction = await fetchTransaction(publicClient, {
      hash,
    })
    expect(transaction.from).toMatchInlineSnapshot(
      '"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"',
    )
    expect(transaction.gas).toBeDefined()
    expect(transaction.transactionIndex).toMatchInlineSnapshot('0')
    expect(transaction.to).toMatchInlineSnapshot(
      '"0x70997970c51812dc3a010c7d01b50e0d17dc79c8"',
    )
    expect(transaction.value).toMatchInlineSnapshot('3000000000000000000n')
  })

  test('throws if transaction not found', async () => {
    await expect(
      fetchTransaction(publicClient, {
        hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
      }),
    ).rejects.toThrowError(
      'Transaction with hash "0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d" could not be found.',
    )
  })
})

describe('args: blockHash', () => {
  test('blockHash: fetches transaction by block hash & index', async () => {
    const { hash: blockHash } = await fetchBlock(publicClient, {
      blockNumber: initialBlockNumber - 69n,
    })

    if (!blockHash) throw new Error('no block hash found')
    const transaction = await fetchTransaction(publicClient, {
      blockHash,
      index: 5,
    })
    expect(transaction.from).toMatchInlineSnapshot(
      '"0xd4bddf5e3d0435d7a6214a0b949c7bb58621f37c"',
    )
    expect(transaction.gas).toMatchInlineSnapshot('250000n')
    expect(transaction.transactionIndex).toMatchInlineSnapshot('5')
    expect(transaction.to).toMatchInlineSnapshot(
      '"0x3845badade8e6dff049820680d1f14bd3903a5d0"',
    )
    expect(transaction.value).toMatchInlineSnapshot('0n')
  }, 10000)

  test('blockHash: throws if transaction not found', async () => {
    const { hash: blockHash } = await fetchBlock(publicClient, {
      blockNumber: initialBlockNumber - 69n,
    })
    if (!blockHash) throw new Error('no block hash found')

    await expect(
      fetchTransaction(publicClient, {
        blockHash,
        index: 420,
      }),
    ).rejects.toThrowError('Transaction at block hash')
  })
})

describe('args: blockNumber', () => {
  test('fetches transaction by block number & index', async () => {
    const transaction = await fetchTransaction(publicClient, {
      blockNumber: initialBlockNumber - 420n,
      index: 5,
    })
    expect(transaction.from).toMatchInlineSnapshot(
      '"0xc937580291f30d7d25174df96b31f9649d346d9c"',
    )
    expect(transaction.gas).toMatchInlineSnapshot('62230n')
    expect(transaction.transactionIndex).toMatchInlineSnapshot('5')
    expect(transaction.to).toMatchInlineSnapshot(
      '"0xdac17f958d2ee523a2206206994597c13d831ec7"',
    )
    expect(transaction.value).toMatchInlineSnapshot('0n')
  }, 10000)

  test('throws if transaction not found', async () => {
    await expect(
      fetchTransaction(publicClient, {
        blockNumber: initialBlockNumber - 420n,
        index: 420,
      }),
    ).rejects.toThrowError(
      'Transaction at block number "15131580" at index "420" could not be found.',
    )
  })
})

describe('TransactionNotFoundError', () => {
  test('no args', async () => {
    expect(new TransactionNotFoundError({})).toMatchInlineSnapshot(`
      [TransactionNotFoundError: Transaction could not be found.

      Details: transaction not found
      Version: viem@1.0.2]
    `)
  })

  test('blockHash', async () => {
    expect(new TransactionNotFoundError({ blockHash: '0x123', index: 420 }))
      .toMatchInlineSnapshot(`
        [TransactionNotFoundError: Transaction at block hash "0x123" at index "420" could not be found.

        Details: transaction not found
        Version: viem@1.0.2]
      `)
  })

  test('blockTag', async () => {
    expect(new TransactionNotFoundError({ blockTag: 'latest', index: 420 }))
      .toMatchInlineSnapshot(`
        [TransactionNotFoundError: Transaction at block time "latest" at index "420" could not be found.

        Details: transaction not found
        Version: viem@1.0.2]
      `)
  })

  test('blockNumber', async () => {
    expect(new TransactionNotFoundError({ blockNumber: 42069n, index: 420 }))
      .toMatchInlineSnapshot(`
        [TransactionNotFoundError: Transaction at block number "42069" at index "420" could not be found.

        Details: transaction not found
        Version: viem@1.0.2]
      `)
  })

  test('hash', async () => {
    expect(new TransactionNotFoundError({ hash: '0x123' }))
      .toMatchInlineSnapshot(`
        [TransactionNotFoundError: Transaction with hash "0x123" could not be found.

        Details: transaction not found
        Version: viem@1.0.2]
      `)
  })
})
