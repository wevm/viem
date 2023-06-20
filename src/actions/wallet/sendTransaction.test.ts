import { describe, expect, test, vi } from 'vitest'

import { accounts, localHttpUrl } from '../../_test/constants.js'
import {
  anvilChain,
  publicClient,
  testClient,
  walletClient,
  walletClientWithAccount,
} from '../../_test/utils.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { celo, localhost, mainnet, optimism } from '../../chains.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { http } from '../../clients/transports/http.js'
import { type Hex } from '../../types/misc.js'
import { type TransactionSerializable } from '../../types/transaction.js'
import { defineChain } from '../../utils/chain.js'
import { concatHex } from '../../utils/data/concat.js'
import { hexToNumber } from '../../utils/encoding/fromHex.js'
import { toHex } from '../../utils/encoding/toHex.js'
import { toRlp } from '../../utils/encoding/toRlp.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import { getBalance } from '../public/getBalance.js'
import { getBlock } from '../public/getBlock.js'
import { getTransaction } from '../public/getTransaction.js'
import { mine } from '../test/mine.js'
import { setBalance } from '../test/setBalance.js'
import { setNextBlockBaseFeePerGas } from '../test/setNextBlockBaseFeePerGas.js'
import { sendTransaction } from './sendTransaction.js'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

async function setup() {
  await setBalance(testClient, {
    address: sourceAccount.address,
    value: sourceAccount.balance,
  })
  await setBalance(testClient, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })
  await setNextBlockBaseFeePerGas(testClient, {
    baseFeePerGas: parseGwei('10'),
  })
  await mine(testClient, { blocks: 1 })
}

test('sends transaction', async () => {
  await setup()

  expect(
    await getBalance(publicClient, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await getBalance(publicClient, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  expect(
    await sendTransaction(walletClient, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
    }),
  ).toBeDefined()

  await mine(testClient, { blocks: 1 })

  expect(
    await getBalance(publicClient, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await getBalance(publicClient, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})

test('sends transaction (w/ formatter)', async () => {
  await setup()

  const chain = defineChain(
    {
      ...localhost,
      id: 1,
    },
    {
      formatters: {
        transactionRequest: celo.formatters!.transactionRequest,
      },
    },
  )

  expect(
    await getBalance(publicClient, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await getBalance(publicClient, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  expect(
    await sendTransaction(walletClient, {
      chain,
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
    }),
  ).toBeDefined()

  await mine(testClient, { blocks: 1 })

  expect(
    await getBalance(publicClient, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await getBalance(publicClient, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})

test('sends transaction (w/ serializer)', async () => {
  await setup()

  const serializer = vi.fn(
    (
      txn: TransactionSerializable & {
        additionalField?: Hex
      },
    ) => {
      const {
        chainId,
        nonce,
        gas,
        to,
        value,
        additionalField,
        maxFeePerGas,
        maxPriorityFeePerGas,
        data,
      } = txn

      const serializedTransaction = [
        chainId ? toHex(chainId) : '0x',
        nonce ? toHex(nonce) : '0x',
        maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : '0x',
        maxFeePerGas ? toHex(maxFeePerGas) : '0x',
        gas ? toHex(gas) : '0x',
        additionalField ?? '0x',
        to ?? '0x',
        value ? toHex(value) : '0x',
        data ?? '0x',
        [],
      ]

      return concatHex(['0x08', toRlp(serializedTransaction)])
    },
  )

  const chain = defineChain(
    { ...localhost, id: 1 },
    {
      serializers: {
        transaction: serializer,
      },
    },
  )

  await expect(() =>
    sendTransaction(walletClient, {
      chain,
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
    }),
  ).rejects.toThrowError()

  expect(serializer).toReturnWith(
    '0x08f3018201798459682f00850324a9a700825208809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0',
  )
})

// TODO: This test is flaky. Need to figure out how to mitigate.
test.skip('sends transaction w/ no value', async () => {
  await setup()

  expect(
    await getBalance(publicClient, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await getBalance(publicClient, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  expect(
    await sendTransaction(walletClient, {
      account: sourceAccount.address,
      to: targetAccount.address,
    }),
  ).toBeDefined()

  await mine(testClient, { blocks: 1 })

  expect(
    await getBalance(publicClient, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await getBalance(publicClient, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})

test('client chain mismatch', async () => {
  const walletClient = createWalletClient({
    chain: celo,
    transport: http(localHttpUrl),
  })
  await expect(() =>
    sendTransaction(walletClient, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "The current chain of the wallet (id: 1) does not match the target chain for the transaction (id: 42220 – Celo).

    Current Chain ID:  1
    Expected Chain ID: 42220 – Celo
     
    Request Arguments:
      from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:     0x70997970c51812dc3a010c7d01b50e0d17dc79c8
      value:  1 ETH

    Version: viem@1.0.2"
  `)
})

test('inferred account', async () => {
  await setup()

  expect(
    await sendTransaction(walletClientWithAccount, {
      to: targetAccount.address,
      value: parseEther('1'),
      gas: 1_000_000n,
    }),
  ).toBeDefined()
})

test('no chain', async () => {
  const walletClient = createWalletClient({
    transport: http(localHttpUrl),
  })
  await expect(() =>
    // @ts-expect-error
    sendTransaction(walletClient, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "No chain was provided to the request.
    Please provide a chain with the \`chain\` argument on the Action, or by supplying a \`chain\` to WalletClient.

    Request Arguments:
      from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:     0x70997970c51812dc3a010c7d01b50e0d17dc79c8
      value:  1 ETH

    Version: viem@1.0.2"
  `)
})

describe('args: gas', () => {
  test('sends transaction', async () => {
    await setup()

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    expect(
      await sendTransaction(walletClient, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        gas: 1_000_000n,
      }),
    ).toBeDefined()

    await mine(testClient, { blocks: 1 })

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })
})

describe('args: gasPrice', () => {
  test('sends transaction', async () => {
    await setup()

    const block = await getBlock(publicClient)

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    expect(
      await sendTransaction(walletClient, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        gasPrice: BigInt(block.baseFeePerGas ?? 0),
      }),
    ).toBeDefined()

    await mine(testClient, { blocks: 1 })

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })

  test('errors when account has insufficient funds', async () => {
    await setup()

    const block = await getBlock(publicClient)

    await expect(() =>
      sendTransaction(walletClient, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        gasPrice: BigInt(block.baseFeePerGas ?? 0) + parseEther('10000'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      "The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

      This error could arise when the account does not have enough funds to:
       - pay for the total gas fee,
       - pay for the value to send.
       
      The cost of the transaction is calculated as \`gas * gas fee + value\`, where:
       - \`gas\` is the amount of gas needed for transaction to execute,
       - \`gas fee\` is the gas fee,
       - \`value\` is the amount of ether to send to the recipient.
       
      Request Arguments:
        from:      0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:        0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:     1 ETH
        gasPrice:  10000000000010 gwei

      Details: Insufficient funds for gas * price + value
      Version: viem@1.0.2"
    `,
    )
  })
})

describe('args: maxFeePerGas', () => {
  test('sends transaction', async () => {
    await setup()

    const block = await getBlock(publicClient)

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    const hash = await sendTransaction(walletClient, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: BigInt(block.baseFeePerGas ?? 0),
    })
    expect(hash).toBeDefined()

    await mine(testClient, { blocks: 1 })

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)

    const transaction = await getTransaction(publicClient, { hash })
    expect(transaction.maxFeePerGas).toBe(block.baseFeePerGas!)
  })

  test('errors when account has insufficient funds', async () => {
    await setup()

    const block = await getBlock(publicClient)

    await expect(() =>
      sendTransaction(walletClient, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        maxFeePerGas: BigInt(block.baseFeePerGas ?? 0) + parseEther('10000'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      "The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

      This error could arise when the account does not have enough funds to:
       - pay for the total gas fee,
       - pay for the value to send.
       
      The cost of the transaction is calculated as \`gas * gas fee + value\`, where:
       - \`gas\` is the amount of gas needed for transaction to execute,
       - \`gas fee\` is the gas fee,
       - \`value\` is the amount of ether to send to the recipient.
       
      Request Arguments:
        from:          0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:            0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:         1 ETH
        maxFeePerGas:  10000000000010 gwei

      Details: Insufficient funds for gas * price + value
      Version: viem@1.0.2"
    `,
    )
  })
})

describe('args: maxPriorityFeePerGas', () => {
  test('sends transaction', async () => {
    await setup()

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    expect(
      await sendTransaction(walletClient, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        maxPriorityFeePerGas: parseGwei('1'),
      }),
    ).toBeDefined()

    await mine(testClient, { blocks: 1 })

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })

  test('maxPriorityFeePerGas + maxFeePerGas: sends transaction', async () => {
    await setup()

    const block = await getBlock(publicClient)

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    expect(
      await sendTransaction(walletClient, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        maxPriorityFeePerGas: parseGwei('10'),
        maxFeePerGas: BigInt(block.baseFeePerGas ?? 0) + parseGwei('10'),
      }),
    ).toBeDefined()

    await mine(testClient, { blocks: 1 })

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })
})

describe('args: nonce', () => {
  test('sends transaction', async () => {
    await setup()

    const transactionCount = (await publicClient.request({
      method: 'eth_getTransactionCount',
      params: [sourceAccount.address, 'latest'],
    }))!

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    expect(
      await sendTransaction(walletClient, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        nonce: hexToNumber(transactionCount),
      }),
    ).toBeDefined()

    await mine(testClient, { blocks: 1 })

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })
})

describe('args: chain', async () => {
  test('default', async () => {
    expect(
      await sendTransaction(walletClient, {
        chain: anvilChain,
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
      }),
    ).toBeDefined
  })

  test('nullish', async () => {
    expect(
      await sendTransaction(walletClient, {
        chain: null,
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
      }),
    ).toBeDefined
  })

  test('chain mismatch', async () => {
    await expect(() =>
      sendTransaction(walletClient, {
        chain: optimism,
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The current chain of the wallet (id: 1) does not match the target chain for the transaction (id: 10 – Optimism).

      Current Chain ID:  1
      Expected Chain ID: 10 – Optimism
       
      Request Arguments:
        chain:  Optimism (id: 10)
        from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:     0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:  1 ETH

      Version: viem@1.0.2"
    `)
  })
})

describe('local account', () => {
  test('default', async () => {
    await setup()

    const block = await getBlock(publicClient)

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    const hash = await sendTransaction(walletClient, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(hash).toBeDefined()

    await mine(testClient, { blocks: 1 })

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)

    const transaction = await getTransaction(publicClient, { hash })
    expect(transaction.maxFeePerGas).toBe(
      // 1.2x base fee + 1.5 gwei tip
      (block.baseFeePerGas! * 120n) / 100n + parseGwei('1.5'),
    )
    expect(transaction.gas).toBe(21000n)
  })

  test('sends transaction w/ no value', async () => {
    await setup()

    expect(
      await sendTransaction(walletClient, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
      }),
    ).toBeDefined()

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    await mine(testClient, { blocks: 1 })

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })

  test('args: gas', async () => {
    await setup()

    const hash = await sendTransaction(walletClient, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
      gas: 1_000_000n,
    })

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    await mine(testClient, { blocks: 1 })

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)

    const transaction = await getTransaction(publicClient, { hash })
    expect(transaction.gas).toBe(1_000_000n)
  })

  test('args: chain', async () => {
    await setup()

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    const hash = await sendTransaction(walletClient, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chain: mainnet,
      to: targetAccount.address,
      value: parseEther('1'),
    })

    await mine(testClient, { blocks: 1 })

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)

    const transaction = await getTransaction(publicClient, { hash })
    expect(transaction.chainId).toBe(1)
  })

  test('args: chain (nullish)', async () => {
    await setup()

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    const hash = await sendTransaction(walletClient, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chain: null,
      to: targetAccount.address,
      value: parseEther('1'),
    })

    await mine(testClient, { blocks: 1 })

    expect(
      await getBalance(publicClient, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)

    const transaction = await getTransaction(publicClient, { hash })
    expect(transaction.chainId).toBe(1)
  })

  describe('args: maxFeePerGas', () => {
    test('sends transaction', async () => {
      await setup()

      const block = await getBlock(publicClient)

      expect(
        await getBalance(publicClient, { address: targetAccount.address }),
      ).toMatchInlineSnapshot('10000000000000000000000n')
      expect(
        await getBalance(publicClient, { address: sourceAccount.address }),
      ).toMatchInlineSnapshot('10000000000000000000000n')

      const hash = await sendTransaction(walletClient, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        value: parseEther('1'),
        maxFeePerGas: BigInt(block.baseFeePerGas ?? 0),
      })
      expect(hash).toBeDefined()

      await mine(testClient, { blocks: 1 })

      expect(
        await getBalance(publicClient, { address: targetAccount.address }),
      ).toMatchInlineSnapshot('10001000000000000000000n')
      expect(
        await getBalance(publicClient, { address: sourceAccount.address }),
      ).toBeLessThan(sourceAccount.balance)

      const transaction = await getTransaction(publicClient, { hash })
      expect(transaction.maxFeePerGas).toBe(block.baseFeePerGas!)
    })

    test('errors when account has insufficient funds', async () => {
      await setup()

      const block = await getBlock(publicClient)

      await expect(() =>
        sendTransaction(walletClient, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          to: targetAccount.address,
          value: parseEther('1'),
          maxFeePerGas: BigInt(block.baseFeePerGas ?? 0) + parseEther('10000'),
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `
        "The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

        This error could arise when the account does not have enough funds to:
         - pay for the total gas fee,
         - pay for the value to send.
         
        The cost of the transaction is calculated as \`gas * gas fee + value\`, where:
         - \`gas\` is the amount of gas needed for transaction to execute,
         - \`gas fee\` is the gas fee,
         - \`value\` is the amount of ether to send to the recipient.
         
        Request Arguments:
          from:          0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
          to:            0x70997970c51812dc3a010c7d01b50e0d17dc79c8
          value:         1 ETH
          maxFeePerGas:  10000000000010 gwei

        Details: Insufficient funds for gas * price + value
        Version: viem@1.0.2"
      `,
      )
    })
  })

  describe('args: maxPriorityFeePerGas', () => {
    test('sends transaction', async () => {
      await setup()

      expect(
        await getBalance(publicClient, { address: targetAccount.address }),
      ).toMatchInlineSnapshot('10000000000000000000000n')
      expect(
        await getBalance(publicClient, { address: sourceAccount.address }),
      ).toMatchInlineSnapshot('10000000000000000000000n')

      const hash = await sendTransaction(walletClient, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        value: parseEther('1'),
        maxPriorityFeePerGas: parseGwei('5'),
      })
      expect(hash).toBeDefined()

      await mine(testClient, { blocks: 1 })

      expect(
        await getBalance(publicClient, { address: targetAccount.address }),
      ).toMatchInlineSnapshot('10001000000000000000000n')
      expect(
        await getBalance(publicClient, { address: sourceAccount.address }),
      ).toBeLessThan(sourceAccount.balance)

      const transaction = await getTransaction(publicClient, { hash })
      expect(transaction.maxPriorityFeePerGas).toBe(parseGwei('5'))
    })

    test('maxPriorityFeePerGas + maxFeePerGas: sends transaction', async () => {
      await setup()

      const block = await getBlock(publicClient)

      expect(
        await getBalance(publicClient, { address: targetAccount.address }),
      ).toMatchInlineSnapshot('10000000000000000000000n')
      expect(
        await getBalance(publicClient, { address: sourceAccount.address }),
      ).toMatchInlineSnapshot('10000000000000000000000n')

      const hash = await sendTransaction(walletClient, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        value: parseEther('1'),
        maxPriorityFeePerGas: parseGwei('10'),
        maxFeePerGas: BigInt(block.baseFeePerGas ?? 0) + parseGwei('10'),
      })
      expect(hash).toBeDefined()

      await mine(testClient, { blocks: 1 })

      expect(
        await getBalance(publicClient, { address: targetAccount.address }),
      ).toMatchInlineSnapshot('10001000000000000000000n')
      expect(
        await getBalance(publicClient, { address: sourceAccount.address }),
      ).toBeLessThan(sourceAccount.balance)

      const transaction = await getTransaction(publicClient, { hash })
      expect(transaction.maxPriorityFeePerGas).toBe(parseGwei('10'))
      expect(transaction.maxFeePerGas).toBe(
        BigInt(block.baseFeePerGas ?? 0) + parseGwei('10'),
      )
    })
  })

  describe('args: nonce', () => {
    test('sends transaction', async () => {
      await setup()

      const transactionCount = (await publicClient.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'pending'],
      }))!

      expect(
        await getBalance(publicClient, { address: targetAccount.address }),
      ).toMatchInlineSnapshot('10000000000000000000000n')
      expect(
        await getBalance(publicClient, { address: sourceAccount.address }),
      ).toMatchInlineSnapshot('10000000000000000000000n')

      const hash = await sendTransaction(walletClient, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        value: parseEther('1'),
        nonce: hexToNumber(transactionCount),
      })
      expect(hash).toBeDefined()

      await mine(testClient, { blocks: 1 })

      expect(
        await getBalance(publicClient, { address: targetAccount.address }),
      ).toMatchInlineSnapshot('10001000000000000000000n')
      expect(
        await getBalance(publicClient, { address: sourceAccount.address }),
      ).toBeLessThan(sourceAccount.balance)

      const transaction = await getTransaction(publicClient, { hash })
      expect(transaction.nonce).toBe(hexToNumber(transactionCount))
    })
  })
})

describe('errors', () => {
  test('no account', async () => {
    await expect(() =>
      // @ts-expect-error
      sendTransaction(walletClient, {
        to: targetAccount.address,
        value: parseEther('1'),
        maxFeePerGas: 2n ** 256n - 1n + 1n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Could not find an Account to execute with this Action.
      Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the WalletClient.

      Docs: https://viem.sh/docs/actions/wallet/sendTransaction.html#account
      Version: viem@1.0.2"
    `)
  })

  test('fee cap too high', async () => {
    await setup()

    await expect(() =>
      sendTransaction(walletClient, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        maxFeePerGas: 2n ** 256n - 1n + 1n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Request Arguments:
        from:          0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:            0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:         1 ETH
        maxFeePerGas:  115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei

      Version: viem@1.0.2"
    `)
  })

  test('gas too low', async () => {
    await setup()

    await expect(() =>
      sendTransaction(walletClient, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        gas: 100n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The amount of gas (100) provided for the transaction is too low.

      Request Arguments:
        from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:     0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:  1 ETH
        gas:    100

      Details: intrinsic gas too low
      Version: viem@1.0.2"
    `)
  })

  test('gas too high', async () => {
    await setup()

    await expect(() =>
      sendTransaction(walletClient, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        gas: 100_000_000n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The amount of gas (100000000) provided for the transaction exceeds the limit allowed for the block.

      Request Arguments:
        from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:     0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:  1 ETH
        gas:    100000000

      Details: intrinsic gas too high
      Version: viem@1.0.2"
    `)
  })

  test('gas fee is less than block base fee', async () => {
    await setup()

    await expect(() =>
      sendTransaction(walletClient, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        maxFeePerGas: 1n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      "The fee cap (\`maxFeePerGas\` = 0.000000001 gwei) cannot be lower than the block base fee.

      Request Arguments:
        from:          0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:            0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:         1 ETH
        maxFeePerGas:  0.000000001 gwei

      Details: max fee per gas less than block base fee
      Version: viem@1.0.2"
    `,
    )
  })

  test('nonce too low', async () => {
    await expect(() =>
      sendTransaction(walletClient, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        nonce: 1,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Nonce provided for the transaction (1) is lower than the current nonce of the account.
      Try increasing the nonce or find the latest nonce with \`getTransactionCount\`.

      Request Arguments:
        from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:     0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:  1 ETH
        nonce:  1

      Details: nonce too low
      Version: viem@1.0.2"
    `)
  })

  test('insufficient funds', async () => {
    await setup()

    await expect(() =>
      sendTransaction(walletClient, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('100000'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

      This error could arise when the account does not have enough funds to:
       - pay for the total gas fee,
       - pay for the value to send.
       
      The cost of the transaction is calculated as \`gas * gas fee + value\`, where:
       - \`gas\` is the amount of gas needed for transaction to execute,
       - \`gas fee\` is the gas fee,
       - \`value\` is the amount of ether to send to the recipient.
       
      Request Arguments:
        from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:     0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:  100000 ETH

      Details: Insufficient funds for gas * price + value
      Version: viem@1.0.2"
    `)
  })

  test('tip higher than fee cap', async () => {
    await expect(() =>
      sendTransaction(walletClient, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        maxPriorityFeePerGas: parseGwei('11'),
        maxFeePerGas: parseGwei('10'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      "The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).

      Request Arguments:
        from:                  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:                    0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:                 1 ETH
        maxFeePerGas:          10 gwei
        maxPriorityFeePerGas:  11 gwei

      Version: viem@1.0.2"
    `,
    )
  })
})
