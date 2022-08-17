import { expect, test } from 'vitest'

import {
  accountProvider,
  accounts,
  networkProvider,
  testProvider,
  walletProvider,
} from '../../../test/utils'
import { etherToValue, gweiToValue, numberToHex } from '../../utils'
import { fetchBalance } from '../public/fetchBalance'
import { fetchBlock } from '../public/fetchBlock'
import { mine } from '../test'
import { setBalance } from '../test/setBalance'

import { sendTransaction } from './sendTransaction'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

async function setup() {
  await setBalance(testProvider, {
    address: sourceAccount.address,
    value: sourceAccount.balance,
  })
  await setBalance(testProvider, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })
  await mine(testProvider, { blocks: 1 })
}

test('sends transaction', async () => {
  await setup()

  expect(
    (
      await sendTransaction(accountProvider, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: etherToValue('1'),
        },
      })
    ).hash,
  ).toBeDefined()

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  await mine(testProvider, { blocks: 1 })

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})

test('value: sends transaction w/ no value', async () => {
  await setup()

  expect(
    (
      await sendTransaction(accountProvider, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
        },
      })
    ).hash,
  ).toBeDefined()

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  await mine(testProvider, { blocks: 1 })

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})

test('gas: sends transaction', async () => {
  await setup()

  expect(
    (
      await sendTransaction(accountProvider, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: etherToValue('1'),
          gas: 1_000_000n,
        },
      })
    ).hash,
  ).toBeDefined()

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  await mine(testProvider, { blocks: 1 })

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})

test('gas: sends transaction with too little gas', async () => {
  await setup()

  expect(
    (
      await sendTransaction(accountProvider, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: etherToValue('1'),
          gas: 100n,
        },
      })
    ).hash,
  ).toBeDefined()

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  await mine(testProvider, { blocks: 1 })

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
})

test('gas: sends transaction with too much gas', async () => {
  await setup()

  await expect(() =>
    sendTransaction(accountProvider, {
      request: {
        from: sourceAccount.address,
        to: targetAccount.address,
        value: etherToValue('1'),
        gas: 100_000_000n,
      },
    }),
  ).rejects.toThrowError(`intrinsic gas too high`)
})

test('gasPrice: sends transaction', async () => {
  await setup()

  const block = await fetchBlock(networkProvider)

  expect(
    (
      await sendTransaction(accountProvider, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: etherToValue('1'),
          gasPrice: BigInt(block.baseFeePerGas ?? 0),
        },
      })
    ).hash,
  ).toBeDefined()

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  await mine(testProvider, { blocks: 1 })

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})

test('gasPrice: errors when gas price is less than block base fee', async () => {
  await setup()

  await testProvider.request({
    method: 'anvil_setNextBlockBaseFeePerGas',
    params: [numberToHex(69n)],
  })
  await mine(testProvider, { blocks: 1 })

  await expect(() =>
    sendTransaction(accountProvider, {
      request: {
        from: sourceAccount.address,
        to: targetAccount.address,
        value: etherToValue('1'),
        gasPrice: 1n,
      },
    }),
  ).rejects.toThrowError(`max fee per gas less than block base fee`)
})

test('gasPrice: errors when account has insufficient funds', async () => {
  await setup()

  const block = await fetchBlock(networkProvider)

  await expect(() =>
    sendTransaction(accountProvider, {
      request: {
        from: sourceAccount.address,
        to: targetAccount.address,
        value: etherToValue('1'),
        gasPrice: BigInt(block.baseFeePerGas ?? 0) + etherToValue('10000'),
      },
    }),
  ).rejects.toThrowError(`Insufficient funds for gas * price + value`)
})

test('maxFeePerGas: sends transaction', async () => {
  await setup()

  const block = await fetchBlock(networkProvider)

  expect(
    (
      await sendTransaction(accountProvider, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: etherToValue('1'),
          maxFeePerGas: BigInt(block.baseFeePerGas ?? 0),
        },
      })
    ).hash,
  ).toBeDefined()

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  await mine(testProvider, { blocks: 1 })

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})

test('maxFeePerGas: errors when gas price is less than block base fee', async () => {
  await setup()

  await expect(() =>
    sendTransaction(accountProvider, {
      request: {
        from: sourceAccount.address,
        to: targetAccount.address,
        value: etherToValue('1'),
        maxFeePerGas: 1n,
      },
    }),
  ).rejects.toThrowError(`max fee per gas less than block base fee`)
})

test('maxFeePerGas: errors when account has insufficient funds', async () => {
  await setup()

  const block = await fetchBlock(networkProvider)

  await expect(() =>
    sendTransaction(accountProvider, {
      request: {
        from: sourceAccount.address,
        to: targetAccount.address,
        value: etherToValue('1'),
        maxFeePerGas: BigInt(block.baseFeePerGas ?? 0) + etherToValue('10000'),
      },
    }),
  ).rejects.toThrowError(`Insufficient funds for gas * price + value`)
})

test('maxPriorityFeePerGas: sends transaction', async () => {
  await setup()

  expect(
    (
      await sendTransaction(accountProvider, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: etherToValue('1'),
          maxPriorityFeePerGas: gweiToValue('1'),
        },
      })
    ).hash,
  ).toBeDefined()

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  await mine(testProvider, { blocks: 1 })

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})

test('maxPriorityFeePerGas + maxFeePerGas: sends transaction', async () => {
  await setup()

  const block = await fetchBlock(networkProvider)

  expect(
    (
      await sendTransaction(accountProvider, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: etherToValue('1'),
          maxPriorityFeePerGas: gweiToValue('10'),
          maxFeePerGas: BigInt(block.baseFeePerGas ?? 0) + gweiToValue('10'),
        },
      })
    ).hash,
  ).toBeDefined()

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  await mine(testProvider, { blocks: 1 })

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})

test('maxPriorityFeePerGas + maxFeePerGas: maxFeePerGas below baseFeePerGas + maxPriorityFeePerGas', () => {
  expect(() =>
    sendTransaction(accountProvider, {
      request: {
        from: sourceAccount.address,
        to: targetAccount.address,
        value: etherToValue('1'),
        maxPriorityFeePerGas: gweiToValue('11'),
        maxFeePerGas: gweiToValue('10'),
      },
    }),
  ).rejects.toThrowError(
    `maxFeePerGas cannot be less than maxPriorityFeePerGas`,
  )
})

test('nonce: sends transaction', async () => {
  await setup()

  const transactionCount = (await networkProvider.request({
    method: 'eth_getTransactionCount',
    params: [sourceAccount.address, 'latest'],
  }))!

  expect(
    (
      await sendTransaction(accountProvider, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: etherToValue('1'),
          nonce: BigInt(transactionCount),
        },
      })
    ).hash,
  ).toBeDefined()

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toMatchInlineSnapshot('10000000000000000000000n')

  await mine(testProvider, { blocks: 1 })

  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10001000000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})

test('nonce: errors when incorrect nonce provided', () => {
  expect(() =>
    sendTransaction(accountProvider, {
      request: {
        from: sourceAccount.address,
        to: targetAccount.address,
        value: etherToValue('1'),
        nonce: 1n,
      },
    }),
  ).rejects.toThrowError(`nonce too low`)
})

test('insufficient funds: errors when user is out of funds', async () => {
  await setup()

  await expect(
    sendTransaction(accountProvider, {
      request: {
        from: sourceAccount.address,
        to: targetAccount.address,
        value: etherToValue('100000'),
      },
    }),
  ).rejects.toThrow('Insufficient funds for gas * price + value')
})

// eslint-disable-next-line prettier/prettier
;[walletProvider, networkProvider].forEach((provider) => {
  test(`invalid provider: errors when not an accountProvider (${
    provider!.id
  })`, async () => {
    await setup()

    await expect(
      // @ts-expect-error – testing for JS consumers
      sendTransaction(provider!, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: etherToValue('1'),
        },
      }),
    ).rejects.toThrow(`Invalid provider of type "${provider?.type}" provided`)
  })
})
