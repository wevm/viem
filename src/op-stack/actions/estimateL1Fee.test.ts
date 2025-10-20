import { Hex } from 'ox'
import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { anvilOptimism } from '../../../test/src/anvil.js'
import { optimism } from '../../chains/index.js'
import {
  createClient,
  http,
  type TransactionRequestEIP1559,
} from '../../index.js'
import { estimateL1Fee } from './estimateL1Fee.js'

const optimismClient = anvilOptimism.getClient()
const optimismClientWithAccount = anvilOptimism.getClient({ account: true })
const optimismClientWithoutChain = anvilOptimism.getClient({ chain: false })

const baseTransaction = {
  data: '0xdeadbeef',
  to: accounts[1].address,
} as const satisfies Omit<TransactionRequestEIP1559, 'from'>

test('default', async () => {
  const fee = await estimateL1Fee(optimismClientWithAccount, baseTransaction)
  expect(fee).toBeDefined()
})

test('minimal', async () => {
  const fee = await estimateL1Fee(optimismClientWithAccount, {})
  expect(fee).toBeDefined()
})

test('args: account', async () => {
  const fee = await estimateL1Fee(optimismClient, {
    ...baseTransaction,
    account: accounts[0].address,
  })
  expect(fee).toBeDefined()
})

test('args: data', async () => {
  const fee = await estimateL1Fee(optimismClientWithAccount, {
    ...baseTransaction,
    data: '0x00000000000000000000000000000000000000000000000004fefa17b7240000',
  })
  expect(fee).toBeDefined()
})

test('args: feePriceOracleAddress', async () => {
  const fee = await estimateL1Fee(optimismClientWithAccount, {
    ...baseTransaction,
    gasPriceOracleAddress: '0x420000000000000000000000000000000000000F',
  })
  expect(fee).toBeDefined()
})

test('args: nonce', async () => {
  const fee = await estimateL1Fee(optimismClientWithAccount, {
    ...baseTransaction,
    nonce: 69,
  })
  expect(fee).toBeDefined()
})

test('args: nullish chain', async () => {
  const fee = await estimateL1Fee(optimismClientWithoutChain, {
    ...baseTransaction,
    account: accounts[0].address,
    chain: null,
  })
  expect(fee).toBeDefined()
})

test('behavior: account with no funds', async () => {
  const optimismClient = createClient({
    chain: optimism,
    transport: http(),
  })
  const gas = await estimateL1Fee(optimismClient, {
    ...baseTransaction,
    account: Hex.random(20),
  })
  expect(gas).toBeDefined()
})
