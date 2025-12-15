import { expect, test } from 'vitest'
import { anvilOptimism } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { parseGwei, type TransactionRequestEIP1559 } from '../../index.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { estimateOperatorFee } from './estimateOperatorFee.js'

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
  const fee = await estimateOperatorFee(
    optimismClientWithAccount,
    baseTransaction,
  )
  expect(fee).toBeDefined()
})

test('minimal', async () => {
  const fee = await estimateOperatorFee(optimismClientWithAccount, {})
  expect(fee).toBeDefined()
})

test('args: account', async () => {
  const fee = await estimateOperatorFee(optimismClient, {
    ...baseTransaction,
    account: accounts[0].address,
  })
  expect(fee).toBeDefined()
})

test('args: data', async () => {
  const fee = await estimateOperatorFee(optimismClientWithAccount, {
    ...baseTransaction,
    data: '0x00000000000000000000000000000000000000000000000004fefa17b7240000',
  })
  expect(fee).toBeDefined()
})

test('args: l1BlockAddress', async () => {
  const fee = await estimateOperatorFee(optimismClientWithAccount, {
    ...baseTransaction,
    l1BlockAddress: '0x4200000000000000000000000000000000000015',
  })
  expect(fee).toBeDefined()
})

test('args: nonce', async () => {
  const fee = await estimateOperatorFee(optimismClientWithAccount, {
    ...baseTransaction,
    nonce: 69,
  })
  expect(fee).toBeDefined()
})

test('args: nullish chain', async () => {
  const fee = await estimateOperatorFee(optimismClientWithoutChain, {
    ...baseTransaction,
    account: accounts[0].address,
    chain: null,
  })
  expect(fee).toBeDefined()
})
