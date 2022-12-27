import { describe, expect, test } from 'vitest'

import { accounts, publicClient, testClient, walletClient } from '../../../test'
import { celo, localhost } from '../../chains'
import { hexToNumber, numberToHex, parseEther, parseGwei } from '../../utils'
import { getBalance, getBlock } from '..'
import { mine, setBalance } from '../test'

import { InvalidGasArgumentsError, sendTransaction } from './sendTransaction'

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
  await mine(testClient, { blocks: 1 })
}

test('sends transaction', async () => {
  await setup()

  expect(
    (
      await sendTransaction(walletClient, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
        },
      })
    ).hash,
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
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await getBalance(publicClient, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})

test('sends transaction (w/ formatter)', async () => {
  await setup()

  expect(
    (
      await sendTransaction(walletClient, {
        chain: {
          ...localhost,
          formatters: {
            transactionRequest: celo.formatters?.transactionRequest,
          },
        },
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
        },
      })
    ).hash,
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
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await getBalance(publicClient, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})

test('sends transaction w/ no value', async () => {
  await setup()

  expect(
    (
      await sendTransaction(walletClient, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
        },
      })
    ).hash,
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

describe('args: gas', () => {
  test('sends transaction', async () => {
    await setup()

    expect(
      (
        await sendTransaction(walletClient, {
          request: {
            from: sourceAccount.address,
            to: targetAccount.address,
            value: parseEther('1'),
            gas: 1_000_000n,
          },
        })
      ).hash,
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
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })

  test('sends transaction with too little gas', async () => {
    await setup()

    expect(() =>
      sendTransaction(walletClient, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
          gas: 100n,
        },
      }),
    ).rejects.toThrowError(`intrinsic gas too low`)
  })

  test('sends transaction with too much gas', async () => {
    await setup()

    await expect(() =>
      sendTransaction(walletClient, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
          gas: 100_000_000n,
        },
      }),
    ).rejects.toThrowError(`intrinsic gas too high`)
  })
})

describe('args: gasPrice', () => {
  test('sends transaction', async () => {
    await setup()

    const block = await getBlock(publicClient)

    expect(
      (
        await sendTransaction(walletClient, {
          request: {
            from: sourceAccount.address,
            to: targetAccount.address,
            value: parseEther('1'),
            gasPrice: BigInt(block.baseFeePerGas ?? 0),
          },
        })
      ).hash,
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
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })

  test('errors when gas price is less than block base fee', async () => {
    await setup()

    await testClient.request({
      method: 'anvil_setNextBlockBaseFeePerGas',
      params: [numberToHex(69n)],
    })
    await mine(testClient, { blocks: 1 })

    await expect(() =>
      sendTransaction(walletClient, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
          gasPrice: 1n,
        },
      }),
    ).rejects.toThrowError(`max fee per gas less than block base fee`)
  })

  test('errors when account has insufficient funds', async () => {
    await setup()

    const block = await getBlock(publicClient)

    await expect(() =>
      sendTransaction(walletClient, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
          gasPrice: BigInt(block.baseFeePerGas ?? 0) + parseEther('10000'),
        },
      }),
    ).rejects.toThrowError(`Insufficient funds for gas * price + value`)
  })
})

describe('args: maxFeePerGas', () => {
  test('sends transaction', async () => {
    await setup()

    const block = await getBlock(publicClient)

    expect(
      (
        await sendTransaction(walletClient, {
          request: {
            from: sourceAccount.address,
            to: targetAccount.address,
            value: parseEther('1'),
            maxFeePerGas: BigInt(block.baseFeePerGas ?? 0),
          },
        })
      ).hash,
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
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })

  test('errors when gas price is less than block base fee', async () => {
    await setup()

    await expect(() =>
      sendTransaction(walletClient, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
          maxFeePerGas: 1n,
        },
      }),
    ).rejects.toThrowError(`max fee per gas less than block base fee`)
  })

  test('errors when account has insufficient funds', async () => {
    await setup()

    const block = await getBlock(publicClient)

    await expect(() =>
      sendTransaction(walletClient, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
          maxFeePerGas: BigInt(block.baseFeePerGas ?? 0) + parseEther('10000'),
        },
      }),
    ).rejects.toThrowError(`Insufficient funds for gas * price + value`)
  })
})

describe('args: maxPriorityFeePerGas', () => {
  test('sends transaction', async () => {
    await setup()

    expect(
      (
        await sendTransaction(walletClient, {
          request: {
            from: sourceAccount.address,
            to: targetAccount.address,
            value: parseEther('1'),
            maxPriorityFeePerGas: parseGwei('1'),
          },
        })
      ).hash,
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
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })

  test('maxPriorityFeePerGas + maxFeePerGas: sends transaction', async () => {
    await setup()

    const block = await getBlock(publicClient)

    expect(
      (
        await sendTransaction(walletClient, {
          request: {
            from: sourceAccount.address,
            to: targetAccount.address,
            value: parseEther('1'),
            maxPriorityFeePerGas: parseGwei('10'),
            maxFeePerGas: BigInt(block.baseFeePerGas ?? 0) + parseGwei('10'),
          },
        })
      ).hash,
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
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })

  test('maxPriorityFeePerGas + maxFeePerGas: maxFeePerGas below baseFeePerGas + maxPriorityFeePerGas', () => {
    expect(() =>
      sendTransaction(walletClient, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
          maxPriorityFeePerGas: parseGwei('11'),
          maxFeePerGas: parseGwei('10'),
        },
      }),
    ).rejects.toThrowError(
      `maxFeePerGas cannot be less than maxPriorityFeePerGas`,
    )
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
      (
        await sendTransaction(walletClient, {
          request: {
            from: sourceAccount.address,
            to: targetAccount.address,
            value: parseEther('1'),
            nonce: hexToNumber(transactionCount),
          },
        })
      ).hash,
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
    ).toMatchInlineSnapshot('10001000000000000000000n')
    expect(
      await getBalance(publicClient, { address: sourceAccount.address }),
    ).toBeLessThan(sourceAccount.balance)
  })

  test('errors when incorrect nonce provided', () => {
    expect(() =>
      sendTransaction(walletClient, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
          nonce: 1,
        },
      }),
    ).rejects.toThrowError(`nonce too low`)
  })
})

test('insufficient funds: errors when user is out of funds', async () => {
  await setup()

  await expect(
    sendTransaction(walletClient, {
      request: {
        from: sourceAccount.address,
        to: targetAccount.address,
        value: parseEther('100000'),
      },
    }),
  ).rejects.toThrow('Insufficient funds for gas * price + value')
})

test('InvalidGasArgumentsError', () => {
  expect(new InvalidGasArgumentsError()).toMatchInlineSnapshot(`
    [InvalidGasArgumentsError: Gas values provided are invalid.

    Details: maxFeePerGas cannot be less than maxPriorityFeePerGas
    Version: viem@1.0.2]
  `)
})
