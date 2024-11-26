import { describe, expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { blobData, kzg } from '~test/src/kzg.js'
import { anvilMainnet, anvilSepolia } from '../../../test/src/anvil.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { celo, localhost, mainnet, optimism } from '../../chains/index.js'

import { maxUint256 } from '~viem/constants/number.js'
import { BatchCallDelegation } from '../../../contracts/generated.js'
import { getSmartAccounts_07 } from '../../../test/src/account-abstraction.js'
import { deploy } from '../../../test/src/utils.js'
import { generatePrivateKey } from '../../accounts/generatePrivateKey.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { http } from '../../clients/transports/http.js'
import {
  InvalidInputRpcError,
  MethodNotSupportedRpcError,
} from '../../errors/rpc.js'
import { signAuthorization } from '../../experimental/index.js'
import type { Hex } from '../../types/misc.js'
import type { TransactionSerializable } from '../../types/transaction.js'
import { toBlobs } from '../../utils/blob/toBlobs.js'
import { defineChain } from '../../utils/chain/defineChain.js'
import { concatHex } from '../../utils/data/concat.js'
import { hexToNumber } from '../../utils/encoding/fromHex.js'
import { stringToHex, toHex } from '../../utils/encoding/toHex.js'
import { toRlp } from '../../utils/encoding/toRlp.js'
import {
  decodeEventLog,
  encodeFunctionData,
  getAddress,
  nonceManager,
} from '../../utils/index.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import { estimateFeesPerGas } from '../public/estimateFeesPerGas.js'
import { getBalance } from '../public/getBalance.js'
import { getBlock } from '../public/getBlock.js'
import { getTransaction } from '../public/getTransaction.js'
import { getTransactionReceipt } from '../public/getTransactionReceipt.js'
import { mine } from '../test/mine.js'
import { reset } from '../test/reset.js'
import { setBalance } from '../test/setBalance.js'
import { setNextBlockBaseFeePerGas } from '../test/setNextBlockBaseFeePerGas.js'
import { setNonce } from '../test/setNonce.js'
import { sendTransaction } from './sendTransaction.js'

const client = anvilMainnet.getClient()
const clientWithAccount = anvilMainnet.getClient({
  account: accounts[0].address,
})

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

async function setup() {
  await setBalance(client, {
    address: sourceAccount.address,
    value: sourceAccount.balance,
  })
  await setBalance(client, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })
  await setNextBlockBaseFeePerGas(client, {
    baseFeePerGas: parseGwei('10'),
  })
  await mine(client, { blocks: 1 })
}

test('sends transaction', async () => {
  await setup()

  expect(
    await getBalance(client, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await getBalance(client, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  expect(
    await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
    }),
  ).toBeDefined()

  await mine(client, { blocks: 1 })

  expect(
    await getBalance(client, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await getBalance(client, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})

test('sends transaction (w/ formatter)', async () => {
  await setup()

  const chain = defineChain({
    ...localhost,
    id: 1,
    formatters: {
      transactionRequest: celo.formatters!.transactionRequest,
    },
    serializers: undefined,
  })

  expect(
    await getBalance(client, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await getBalance(client, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  expect(
    await sendTransaction(client, {
      chain,
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
    }),
  ).toBeDefined()

  await mine(client, { blocks: 1 })

  expect(
    await getBalance(client, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await getBalance(client, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})

test('sends transaction (w/ serializer)', async () => {
  await setup()

  await reset(client, {
    blockNumber: anvilMainnet.forkBlockNumber,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })

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

  const chain = defineChain({
    ...localhost,
    id: 1,
    serializers: {
      transaction: serializer,
    },
  })

  await expect(() =>
    sendTransaction(client, {
      chain,
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
    }),
  ).rejects.toThrowError()

  expect(serializer).toReturnWith(
    '0x08f301820297843b9aca008502ae1107ec825208809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0',
  )
})

// TODO: This test is flaky. Need to figure out how to mitigate.
test.skip('sends transaction w/ no value', async () => {
  await setup()

  expect(
    await getBalance(client, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await getBalance(client, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  expect(
    await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
    }),
  ).toBeDefined()

  await mine(client, { blocks: 1 })

  expect(
    await getBalance(client, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await getBalance(client, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})

test('client chain mismatch', async () => {
  const client = createWalletClient({
    chain: celo,
    transport: http(anvilMainnet.rpcUrl.http),
  })
  await expect(() =>
    sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [TransactionExecutionError: The current chain of the wallet (id: 1) does not match the target chain for the transaction (id: 42220 – Celo).

    Current Chain ID:  1
    Expected Chain ID: 42220 – Celo
     
    Request Arguments:
      from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:     0x70997970c51812dc3a010c7d01b50e0d17dc79c8
      value:  1 ETH

    Version: viem@x.y.z]
  `)
})

test('inferred account', async () => {
  await setup()

  expect(
    await sendTransaction(clientWithAccount, {
      to: targetAccount.address,
      value: parseEther('1'),
      gas: 1_000_000n,
    }),
  ).toBeDefined()
})

test('no chain', async () => {
  const client = createWalletClient({
    transport: http(anvilMainnet.rpcUrl.http),
  })
  await expect(() =>
    // @ts-expect-error
    sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [TransactionExecutionError: No chain was provided to the request.
    Please provide a chain with the \`chain\` argument on the Action, or by supplying a \`chain\` to WalletClient.

    Request Arguments:
      from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:     0x70997970c51812dc3a010c7d01b50e0d17dc79c8
      value:  1 ETH

    Version: viem@x.y.z]
  `)
})

describe('args: gas', () => {
  test('sends transaction', async () => {
    await setup()

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    expect(
      await sendTransaction(client, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        gas: 1_000_000n,
      }),
    ).toBeDefined()

    await mine(client, { blocks: 1 })

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })
})

describe('args: gasPrice', () => {
  test('sends transaction', async () => {
    await setup()

    const block = await getBlock(client)

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    expect(
      await sendTransaction(client, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        gasPrice: BigInt((block.baseFeePerGas ?? 0n) * 2n),
      }),
    ).toBeDefined()

    await mine(client, { blocks: 1 })

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })

  test('errors when account has insufficient funds', async () => {
    await setup()

    const block = await getBlock(client)

    await expect(() =>
      sendTransaction(client, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        gasPrice: BigInt(block.baseFeePerGas ?? 0) + parseEther('10000'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [TransactionExecutionError: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

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
      Version: viem@x.y.z]
    `,
    )
  })
})

describe('args: maxFeePerGas', () => {
  test('sends transaction', async () => {
    await setup()

    const block = await getBlock(client)

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    const hash = await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: BigInt((block.baseFeePerGas ?? 0n) * 2n),
    })
    expect(hash).toBeDefined()

    await mine(client, { blocks: 1 })

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)

    const transaction = await getTransaction(client, { hash })
    expect(transaction.maxFeePerGas).toBe(
      BigInt((block.baseFeePerGas ?? 0n) * 2n),
    )
  })

  test('errors when account has insufficient funds', async () => {
    await setup()

    const block = await getBlock(client)

    await expect(() =>
      sendTransaction(client, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        maxFeePerGas: BigInt(block.baseFeePerGas ?? 0) + parseEther('10000'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [TransactionExecutionError: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

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
      Version: viem@x.y.z]
    `,
    )
  })
})

describe('args: maxPriorityFeePerGas', () => {
  test('sends transaction', async () => {
    await setup()

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    expect(
      await sendTransaction(client, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        maxPriorityFeePerGas: parseGwei('1'),
      }),
    ).toBeDefined()

    await mine(client, { blocks: 1 })

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })

  test('maxPriorityFeePerGas + maxFeePerGas: sends transaction', async () => {
    await setup()

    const block = await getBlock(client)

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    expect(
      await sendTransaction(client, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        maxPriorityFeePerGas: parseGwei('10'),
        maxFeePerGas: BigInt(block.baseFeePerGas ?? 0) + parseGwei('10'),
      }),
    ).toBeDefined()

    await mine(client, { blocks: 1 })

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })
})

describe('args: nonce', () => {
  test('sends transaction', async () => {
    await setup()

    const transactionCount = (await client.request({
      method: 'eth_getTransactionCount',
      params: [sourceAccount.address, 'latest'],
    }))!

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    expect(
      await sendTransaction(client, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        nonce: hexToNumber(transactionCount),
      }),
    ).toBeDefined()

    await mine(client, { blocks: 1 })

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })
})

describe('args: chain', async () => {
  test('default', async () => {
    expect(
      await sendTransaction(client, {
        chain: anvilMainnet.chain,
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
      }),
    ).toBeDefined
  })

  test('nullish', async () => {
    expect(
      await sendTransaction(client, {
        chain: null,
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
      }),
    ).toBeDefined
  })

  test('chain mismatch', async () => {
    await expect(() =>
      sendTransaction(client, {
        chain: optimism,
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TransactionExecutionError: The current chain of the wallet (id: 1) does not match the target chain for the transaction (id: 10 – OP Mainnet).

      Current Chain ID:  1
      Expected Chain ID: 10 – OP Mainnet
       
      Request Arguments:
        chain:  OP Mainnet (id: 10)
        from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:     0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:  1 ETH

      Version: viem@x.y.z]
    `)
  })

  test('behavior: transport supports `wallet_sendTransaction`', async () => {
    await setup()

    const request = client.request
    client.request = (parameters: any) => {
      if (parameters.method === 'eth_sendTransaction')
        throw new InvalidInputRpcError(new Error())
      return request(parameters)
    }

    expect(
      await sendTransaction(client, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: 0n,
      }),
    ).toBeDefined()
  })

  test("behavior: transport doesn't support `wallet_sendTransaction` so the original error is rethrown", async () => {
    // Using a new client to reset the cached info about wallet_sendTransaction
    // being supported.
    const client = anvilMainnet.getClient()
    await setup()

    const originalError = new InvalidInputRpcError(new Error())

    const request = client.request
    client.request = async (parameters: any) => {
      if (parameters.method === 'eth_sendTransaction') throw originalError
      if (parameters.method === 'wallet_sendTransaction')
        throw new MethodNotSupportedRpcError(new Error())
      return request(parameters)
    }

    await expect(() =>
      sendTransaction(client, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: 0n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TransactionExecutionError: Missing or invalid parameters.
      Double check you have provided the correct parameters.

      Request Arguments:
        from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:     0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:  0 ETH

      Version: viem@x.y.z]
    `)
  })

  test('behavior: nullish account', async () => {
    await setup()

    expect(
      await sendTransaction(client, {
        account: null,
        to: targetAccount.address,
        value: 0n,
      }),
    ).toBeDefined()
  })
})

describe('local account', () => {
  test('default', async () => {
    await setup()

    const fees = await estimateFeesPerGas(client)

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    const hash = await sendTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(hash).toBeDefined()

    await mine(client, { blocks: 1 })

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)

    const transaction = await getTransaction(client, { hash })
    expect(transaction.maxFeePerGas).toBe(fees.maxFeePerGas)
    expect(transaction.maxPriorityFeePerGas).toBe(fees.maxPriorityFeePerGas)
    expect(transaction.gas).toBe(21000n)
  })

  test('sends transaction w/ no value', async () => {
    await setup()

    expect(
      await sendTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
      }),
    ).toBeDefined()

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    await mine(client, { blocks: 1 })

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })

  test('args: gas', async () => {
    await setup()

    const hash = await sendTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
      gas: 1_000_000n,
    })

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    await mine(client, { blocks: 1 })

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)

    const transaction = await getTransaction(client, { hash })
    expect(transaction.gas).toBe(1_000_000n)
  })

  test('args: chain', async () => {
    await setup()

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    const hash = await sendTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chain: mainnet,
      to: targetAccount.address,
      value: parseEther('1'),
    })

    await mine(client, { blocks: 1 })

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)

    const transaction = await getTransaction(client, { hash })
    expect(transaction.chainId).toBe(1)
  })

  test('args: chain (nullish)', async () => {
    await setup()

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toMatchInlineSnapshot('10000000000000000000000n')

    const hash = await sendTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chain: null,
      to: targetAccount.address,
      value: parseEther('1'),
    })

    await mine(client, { blocks: 1 })

    expect(
      await getBalance(client, { address: targetAccount.address }),
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(client, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)

    const transaction = await getTransaction(client, { hash })
    expect(transaction.chainId).toBe(1)
  })

  describe('args: maxFeePerGas', () => {
    test('sends transaction', async () => {
      await setup()

      const fees = await estimateFeesPerGas(client)

      expect(
        await getBalance(client, { address: targetAccount.address }),
      ).toMatchInlineSnapshot('10000000000000000000000n')
      expect(
        await getBalance(client, { address: sourceAccount.address }),
      ).toMatchInlineSnapshot('10000000000000000000000n')

      const hash = await sendTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        value: parseEther('1'),
        maxFeePerGas: fees.maxFeePerGas,
      })
      expect(hash).toBeDefined()

      await mine(client, { blocks: 1 })

      expect(
        await getBalance(client, { address: targetAccount.address }),
      ).toMatchInlineSnapshot('10001000000000000000000n')
      expect(
        await getBalance(client, { address: sourceAccount.address }),
      ).toBeLessThan(sourceAccount.balance)

      const transaction = await getTransaction(client, { hash })
      expect(transaction.maxFeePerGas).toBe(fees.maxFeePerGas)
    })

    test('errors when account has insufficient funds', async () => {
      await setup()

      const block = await getBlock(client)

      await expect(() =>
        sendTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          to: targetAccount.address,
          value: parseEther('1'),
          maxFeePerGas: BigInt(block.baseFeePerGas ?? 0) + parseEther('10000'),
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `
        [TransactionExecutionError: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

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
        Version: viem@x.y.z]
      `,
      )
    })
  })

  test('args: authorizationList', async () => {
    const authority = privateKeyToAccount(accounts[9].privateKey)
    const recipient = privateKeyToAccount(generatePrivateKey())

    const balance_recipient = await getBalance(client, {
      address: recipient.address,
    })

    const { contractAddress } = await deploy(client, {
      abi: BatchCallDelegation.abi,
      bytecode: BatchCallDelegation.bytecode.object,
    })

    const authorization = await signAuthorization(client, {
      account: authority,
      contractAddress: contractAddress!,
    })

    const hash = await sendTransaction(client, {
      account: authority,
      authorizationList: [authorization],
      data: encodeFunctionData({
        abi: BatchCallDelegation.abi,
        functionName: 'execute',
        args: [
          [
            {
              to: recipient.address,
              data: '0x',
              value: parseEther('1'),
            },
          ],
        ],
      }),
      to: authority.address,
    })
    expect(hash).toBeDefined()

    await mine(client, { blocks: 1 })

    const receipt = await getTransactionReceipt(client, { hash })
    const log = receipt.logs[0]
    expect(getAddress(log.address)).toBe(authority.address)
    expect(
      decodeEventLog({
        abi: BatchCallDelegation.abi,
        ...log,
      }),
    ).toEqual({
      args: {
        data: '0x',
        to: recipient.address,
        value: parseEther('1'),
      },
      eventName: 'CallEmitted',
    })

    expect(
      await getBalance(client, {
        address: recipient.address,
      }),
    ).toBe(balance_recipient + parseEther('1'))
  })

  test('args: authorizationList (delegate)', async () => {
    const delegate = privateKeyToAccount(accounts[0].privateKey)
    const authority = privateKeyToAccount(accounts[9].privateKey)
    const recipient = privateKeyToAccount(generatePrivateKey())

    const balance_authority = await getBalance(client, {
      address: authority.address,
    })
    const balance_recipient = await getBalance(client, {
      address: recipient.address,
    })

    const { contractAddress } = await deploy(client, {
      abi: BatchCallDelegation.abi,
      bytecode: BatchCallDelegation.bytecode.object,
    })

    const authorization = await signAuthorization(client, {
      account: authority,
      contractAddress: contractAddress!,
      delegate,
    })

    const hash = await sendTransaction(client, {
      account: delegate,
      authorizationList: [authorization],
      data: encodeFunctionData({
        abi: BatchCallDelegation.abi,
        functionName: 'execute',
        args: [
          [
            {
              to: recipient.address,
              data: '0x',
              value: parseEther('1'),
            },
          ],
        ],
      }),
      to: authority.address,
    })
    expect(hash).toBeDefined()

    await mine(client, { blocks: 1 })

    const receipt = await getTransactionReceipt(client, { hash })
    const log = receipt.logs[0]
    expect(getAddress(log.address)).toBe(authority.address)
    expect(
      decodeEventLog({
        abi: BatchCallDelegation.abi,
        ...log,
      }),
    ).toEqual({
      args: {
        data: '0x',
        to: recipient.address,
        value: parseEther('1'),
      },
      eventName: 'CallEmitted',
    })

    expect(
      await getBalance(client, {
        address: recipient.address,
      }),
    ).toBe(balance_recipient + parseEther('1'))
    expect(
      await getBalance(client, {
        address: authority.address,
      }),
    ).toBe(balance_authority - parseEther('1'))
  })

  test('args: authorizationList (cross-chain)', async () => {
    const delegate = privateKeyToAccount(accounts[0].privateKey)
    const authority = privateKeyToAccount(generatePrivateKey())
    const recipient = privateKeyToAccount(generatePrivateKey())

    const client_sepolia = anvilSepolia.getClient({ account: delegate })

    // deploy on mainnet
    const { contractAddress, hash } = await deploy(client, {
      abi: BatchCallDelegation.abi,
      bytecode: BatchCallDelegation.bytecode.object,
    })

    const { nonce } = await getTransaction(client, { hash })

    // deploy on sepolia
    await setNonce(client_sepolia, { address: delegate.address, nonce })
    await deploy(client_sepolia, {
      abi: BatchCallDelegation.abi,
      bytecode: BatchCallDelegation.bytecode.object,
    })

    // sign authorization with `0` chain id (all chains)
    const authorization = await signAuthorization(client, {
      account: authority,
      chainId: 0,
      contractAddress: contractAddress!,
      delegate,
    })

    const args = {
      account: delegate,
      authorizationList: [authorization],
      data: encodeFunctionData({
        abi: BatchCallDelegation.abi,
        functionName: 'execute',
        args: [
          [
            {
              to: recipient.address,
              data: '0x',
              value: 0n,
            },
          ],
        ],
      }),
      to: authority.address,
    } as const

    // execute transactions on mainnet and sepolia
    const hash_mainnet = await sendTransaction(client, args)
    const hash_sepolia = await sendTransaction(client_sepolia, args)

    await mine(client, { blocks: 1 })
    await mine(client_sepolia, { blocks: 1 })

    // check if receipts contain logs
    const receipt_mainnet = await getTransactionReceipt(client, {
      hash: hash_mainnet,
    })
    const receipt_sepolia = await getTransactionReceipt(client_sepolia, {
      hash: hash_sepolia,
    })

    expect(receipt_mainnet.logs.length).toBeGreaterThan(0)
    expect(receipt_sepolia.logs.length).toBeGreaterThan(0)
  })

  test('args: blobs', async () => {
    const blobs = toBlobs({
      data: stringToHex(blobData),
    })
    const hash = await sendTransaction(client, {
      account: privateKeyToAccount(accounts[0].privateKey),
      blobs,
      kzg,
      maxFeePerBlobGas: parseGwei('30'),
      to: '0x0000000000000000000000000000000000000000',
    })
    expect(hash).toBeDefined()
  })

  describe('args: maxPriorityFeePerGas', () => {
    test('sends transaction', async () => {
      await setup()

      const hash = await sendTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        value: parseEther('1'),
        maxPriorityFeePerGas: parseGwei('5'),
      })
      expect(hash).toBeDefined()

      await mine(client, { blocks: 1 })

      expect(
        await getBalance(client, { address: targetAccount.address }),
      ).toMatchInlineSnapshot('10001000000000000000000n')
      expect(
        await getBalance(client, { address: sourceAccount.address }),
      ).toBeLessThan(sourceAccount.balance)

      const transaction = await getTransaction(client, { hash })
      expect(transaction.maxPriorityFeePerGas).toBe(parseGwei('5'))
    })

    test('maxPriorityFeePerGas + maxFeePerGas: sends transaction', async () => {
      await setup()

      const block = await getBlock(client)

      expect(
        await getBalance(client, { address: targetAccount.address }),
      ).toMatchInlineSnapshot('10000000000000000000000n')
      expect(
        await getBalance(client, { address: sourceAccount.address }),
      ).toMatchInlineSnapshot('10000000000000000000000n')

      const hash = await sendTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        value: parseEther('1'),
        maxPriorityFeePerGas: parseGwei('10'),
        maxFeePerGas: BigInt(block.baseFeePerGas ?? 0) + parseGwei('10'),
      })
      expect(hash).toBeDefined()

      await mine(client, { blocks: 1 })

      expect(
        await getBalance(client, { address: targetAccount.address }),
      ).toMatchInlineSnapshot('10001000000000000000000n')
      expect(
        await getBalance(client, { address: sourceAccount.address }),
      ).toBeLessThan(sourceAccount.balance)

      const transaction = await getTransaction(client, { hash })
      expect(transaction.maxPriorityFeePerGas).toBe(parseGwei('10'))
      expect(transaction.maxFeePerGas).toBe(
        BigInt(block.baseFeePerGas ?? 0) + parseGwei('10'),
      )
    })
  })

  describe('args: nonce', () => {
    test('sends transaction', async () => {
      await setup()

      const transactionCount = (await client.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'pending'],
      }))!

      expect(
        await getBalance(client, { address: targetAccount.address }),
      ).toMatchInlineSnapshot('10000000000000000000000n')
      expect(
        await getBalance(client, { address: sourceAccount.address }),
      ).toMatchInlineSnapshot('10000000000000000000000n')

      const hash = await sendTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        value: parseEther('1'),
        nonce: hexToNumber(transactionCount),
      })
      expect(hash).toBeDefined()

      await mine(client, { blocks: 1 })

      expect(
        await getBalance(client, { address: targetAccount.address }),
      ).toMatchInlineSnapshot('10001000000000000000000n')
      expect(
        await getBalance(client, { address: sourceAccount.address }),
      ).toBeLessThan(sourceAccount.balance)

      const transaction = await getTransaction(client, { hash })
      expect(transaction.nonce).toBe(hexToNumber(transactionCount))
    })
  })

  describe('behavior: nonceManager', async () => {
    test('default', async () => {
      await setup()

      const account_1 = privateKeyToAccount(sourceAccount.privateKey, {
        nonceManager,
      })
      const account_2 = privateKeyToAccount(targetAccount.privateKey, {
        nonceManager,
      })

      const [hash_1, hash_2, hash_3, hash_4, hash_5] = await Promise.all([
        sendTransaction(client, {
          account: account_1,
          to: targetAccount.address,
          value: parseEther('1'),
        }),
        sendTransaction(client, {
          account: account_2,
          to: targetAccount.address,
          value: parseEther('1'),
        }),
        sendTransaction(client, {
          account: account_1,
          to: targetAccount.address,
          value: parseEther('1'),
        }),
        sendTransaction(client, {
          account: account_1,
          to: targetAccount.address,
          value: parseEther('1'),
        }),
        sendTransaction(client, {
          account: account_2,
          to: targetAccount.address,
          value: parseEther('1'),
        }),
      ])

      expect((await getTransaction(client, { hash: hash_1 })).nonce).toBe(683)
      expect((await getTransaction(client, { hash: hash_2 })).nonce).toBe(112)
      expect((await getTransaction(client, { hash: hash_3 })).nonce).toBe(684)
      expect((await getTransaction(client, { hash: hash_4 })).nonce).toBe(685)
      expect((await getTransaction(client, { hash: hash_5 })).nonce).toBe(113)

      const hash_6 = await sendTransaction(client, {
        account: account_1,
        to: targetAccount.address,
        value: parseEther('1'),
      })
      const hash_7 = await sendTransaction(client, {
        account: account_1,
        to: targetAccount.address,
        value: parseEther('1'),
      })

      expect((await getTransaction(client, { hash: hash_6 })).nonce).toBe(686)
      expect((await getTransaction(client, { hash: hash_7 })).nonce).toBe(687)
    })
  })
})

describe('smart account', async () => {
  const [account] = await getSmartAccounts_07()

  test('default', async () => {
    await expect(() =>
      sendTransaction(client, {
        account,
        to: targetAccount.address,
        value: parseEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [AccountTypeNotSupportedError: Account type "smart" is not supported.

      Consider using the \`sendUserOperation\` Action instead.

      Docs: https://viem.sh/docs/actions/bundler/sendUserOperation
      Version: viem@x.y.z]
    `)
  })
})

describe('errors', () => {
  test('no account', async () => {
    await expect(() =>
      // @ts-expect-error
      sendTransaction(client, {
        to: targetAccount.address,
        value: parseEther('1'),
        maxFeePerGas: maxUint256 + 1n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [AccountNotFoundError: Could not find an Account to execute with this Action.
      Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

      Docs: https://viem.sh/docs/actions/wallet/sendTransaction
      Version: viem@x.y.z]
    `)
  })

  test('fee cap too high', async () => {
    await setup()

    await expect(() =>
      sendTransaction(client, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        maxFeePerGas: maxUint256 + 1n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TransactionExecutionError: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Request Arguments:
        from:          0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:            0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:         1 ETH
        maxFeePerGas:  115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei

      Version: viem@x.y.z]
    `)
  })

  test('gas too low', async () => {
    await setup()

    await expect(() =>
      sendTransaction(client, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        gas: 100n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TransactionExecutionError: The amount of gas (100) provided for the transaction is too low.

      Request Arguments:
        from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:     0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:  1 ETH
        gas:    100

      Details: intrinsic gas too low
      Version: viem@x.y.z]
    `)
  })

  test('gas too high', async () => {
    await setup()

    await expect(() =>
      sendTransaction(client, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        gas: 100_000_000n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TransactionExecutionError: The amount of gas (100000000) provided for the transaction exceeds the limit allowed for the block.

      Request Arguments:
        from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:     0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:  1 ETH
        gas:    100000000

      Details: intrinsic gas too high -- tx.gas_limit > env.block.gas_limit
      Version: viem@x.y.z]
    `)
  })

  test('gas fee is less than block base fee', async () => {
    await setup()

    await expect(() =>
      sendTransaction(client, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        maxFeePerGas: 1n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [TransactionExecutionError: The fee cap (\`maxFeePerGas\` = 0.000000001 gwei) cannot be lower than the block base fee.

      Request Arguments:
        from:          0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:            0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:         1 ETH
        maxFeePerGas:  0.000000001 gwei

      Details: max fee per gas less than block base fee
      Version: viem@x.y.z]
    `,
    )
  })

  test.skip('nonce too low', async () => {
    await expect(() =>
      sendTransaction(client, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        nonce: 1,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TransactionExecutionError: Nonce provided for the transaction (1) is lower than the current nonce of the account.
      Try increasing the nonce or find the latest nonce with \`getTransactionCount\`.

      Request Arguments:
        from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:     0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:  1 ETH
        nonce:  1

      Details: nonce too low
      Version: viem@x.y.z]
    `)
  })

  test('insufficient funds', async () => {
    await setup()

    await expect(() =>
      sendTransaction(client, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('100000'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TransactionExecutionError: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

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
      Version: viem@x.y.z]
    `)
  })

  test('tip higher than fee cap', async () => {
    await expect(() =>
      sendTransaction(client, {
        account: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('1'),
        maxPriorityFeePerGas: parseGwei('11'),
        maxFeePerGas: parseGwei('10'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [TransactionExecutionError: The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).

      Request Arguments:
        from:                  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
        to:                    0x70997970c51812dc3a010c7d01b50e0d17dc79c8
        value:                 1 ETH
        maxFeePerGas:          10 gwei
        maxPriorityFeePerGas:  11 gwei

      Version: viem@x.y.z]
    `,
    )
  })

  test('error: cannot infer `to` from `authorizationList`', async () => {
    await expect(() =>
      sendTransaction(client, {
        account: sourceAccount.address,
        authorizationList: [
          {
            chainId: 1,
            nonce: 0,
            contractAddress: '0x0000000000000000000000000000000000000000',
          },
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [TransactionExecutionError: \`to\` is required. Could not infer from \`authorizationList\`.

      Request Arguments:
        from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Version: viem@x.y.z]
    `,
    )
  })

  test('error: unsupported account type', async () => {
    await expect(() =>
      sendTransaction(client, {
        // @ts-expect-error
        account: {
          address: '0x0000000000000000000000000000000000000000',
          type: 'foo',
        },
        to: '0x0000000000000000000000000000000000000000',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [AccountTypeNotSupportedError: Account type "foo" is not supported.

      Docs: https://viem.sh/docs/actions/wallet/sendTransaction
      Version: viem@x.y.z]
    `,
    )
  })
})

test('https://github.com/wevm/viem/issues/2721', async () => {
  const delegate = privateKeyToAccount(generatePrivateKey())
  const authority = privateKeyToAccount(generatePrivateKey())
  const recipient = privateKeyToAccount(generatePrivateKey())

  await setBalance(client, {
    address: delegate.address,
    value: parseEther('100'),
  })
  await setBalance(client, {
    address: authority.address,
    value: parseEther('100'),
  })

  const { contractAddress } = await deploy(client, {
    abi: BatchCallDelegation.abi,
    bytecode: BatchCallDelegation.bytecode.object,
  })

  const authorization = await signAuthorization(client, {
    account: authority,
    contractAddress: contractAddress!,
  })

  const hash = await sendTransaction(client, {
    account: delegate,
    authorizationList: [authorization],
    data: encodeFunctionData({
      abi: BatchCallDelegation.abi,
      functionName: 'execute',
      args: [
        [
          {
            to: recipient.address,
            data: '0x',
            value: parseEther('1'),
          },
        ],
      ],
    }),
    to: authority.address,
  })
  expect(hash).toBeDefined()
})
