import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { anvilOptimism } from '../../../test/src/anvil.js'
import { type TransactionRequestEIP1559, parseGwei } from '../../index.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { estimateL1Gas } from './estimateL1Gas.js'

const optimismClient = anvilOptimism.getClient()
const optimismClientWithAccount = anvilOptimism.getClient({ account: true })
const optimismClientWithoutChain = anvilOptimism.getClient({ chain: false })

const baseTransaction = {
  maxFeePerGas: parseGwei('100'),
  maxPriorityFeePerGas: parseGwei('1'),
  to: accounts[1].address,
  value: parseEther('0.1'),
} as const satisfies Omit<TransactionRequestEIP1559, 'from'>

test('default', async () => {
  const gas = await estimateL1Gas(optimismClientWithAccount, baseTransaction)
  expect(gas).toBe(2028n)
})

test('minimal', async () => {
  const gas = await estimateL1Gas(optimismClientWithAccount, {})
  expect(gas).toBe(1600n)
})

test('args: account', async () => {
  const gas = await estimateL1Gas(optimismClient, {
    ...baseTransaction,
    account: accounts[0].address,
  })
  expect(gas).toBe(2028n)
})

test('args: data', async () => {
  const gas = await estimateL1Gas(optimismClientWithAccount, {
    ...baseTransaction,
    data: '0x00000000000000000000000000000000000000000000000004fefa17b7240000',
  })
  expect(gas).toBe(2244n)
})

test('args: gasPriceOracleAddress', async () => {
  const gas = await estimateL1Gas(optimismClientWithAccount, {
    ...baseTransaction,
    gasPriceOracleAddress: '0x420000000000000000000000000000000000000F',
  })
  expect(gas).toBe(2028n)
})

test('args: nonce', async () => {
  const gas = await estimateL1Gas(optimismClientWithAccount, {
    ...baseTransaction,
    nonce: 69,
  })
  expect(gas).toBe(2028n)
})

test('args: nullish chain', async () => {
  const gas = await estimateL1Gas(optimismClientWithoutChain, {
    ...baseTransaction,
    account: accounts[0].address,
    chain: null,
  })
  expect(gas).toBe(2028n)
})
