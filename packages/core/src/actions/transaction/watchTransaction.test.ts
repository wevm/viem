import { expect, test } from 'vitest'

import { accounts, publicClient, testClient, walletClient } from '../../../test'
import { wait } from '../../utils/wait'
import type { OnProcessedData } from './watchTransaction'
import { watchTransaction } from './watchTransaction'
import { etherToValue, gweiToValue, hexToNumber } from '../../utils'
import { sendTransaction } from './sendTransaction'
import { mine } from '../test'
import { fetchBlock } from '../block'
import { fetchTransaction } from './fetchTransaction'
import { Address } from '../../types'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

test('watches for processed transactions', async () => {
  const { hash } = await sendTransaction(walletClient, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('1'),
    },
  })

  let receipt = {} as OnProcessedData
  const unwatch = watchTransaction(publicClient, {
    hash,
    onProcessed(receipt_) {
      receipt = receipt_
    },
  })
  await wait(1000)
  await mine(testClient, { blocks: 1 })
  await wait(1000)
  unwatch()
  expect(receipt).toBeDefined()
}, 10_000)

test.only('watches for replaced transactions', async () => {
  await mine(testClient, { blocks: 10 })
  await testClient.request({ method: 'evm_setIntervalMining', params: [99] })

  const nonce = hexToNumber(
    (await publicClient.request({
      method: 'eth_getTransactionCount',
      params: [sourceAccount.address, 'latest'],
    })) ?? '0x0',
  )

  const { hash } = await sendTransaction(walletClient, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('1'),
      maxFeePerGas: gweiToValue('10'),
      nonce,
    },
  })

  let receipt: OnProcessedData | null = null
  const unwatch = watchTransaction(publicClient, {
    hash,
    onProcessed(receipt_) {
      receipt = receipt_
    },
  })

  await wait(100)

  // speed up
  await sendTransaction(walletClient, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('1'),
      nonce,
      maxFeePerGas: gweiToValue('20'),
    },
  })

  await wait(1000)
  await mine(testClient, { blocks: 1 })
  await wait(2000)
  unwatch()
  expect(receipt !== null).toBeTruthy()
}, 10_000)

test('watches for replaced transactions (skipped blocks)', async () => {
  await mine(testClient, { blocks: 10 })
  await testClient.request({ method: 'evm_setIntervalMining', params: [99] })

  const nonce = hexToNumber(
    (await publicClient.request({
      method: 'eth_getTransactionCount',
      params: [sourceAccount.address, 'latest'],
    })) ?? '0x0',
  )

  const { hash } = await sendTransaction(walletClient, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('1'),
      maxFeePerGas: gweiToValue('10'),
      nonce,
    },
  })

  let receipt: OnProcessedData | null = null
  const unwatch = watchTransaction(publicClient, {
    hash,
    onProcessed(receipt_) {
      receipt = receipt_
    },
  })

  await wait(100)

  // speed up
  await sendTransaction(walletClient, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('1'),
      nonce,
      maxFeePerGas: gweiToValue('20'),
    },
  })

  await wait(1000)
  await mine(testClient, { blocks: 5 })
  await wait(3000)
  unwatch()
  expect(receipt !== null).toBeTruthy()
}, 10_000)
