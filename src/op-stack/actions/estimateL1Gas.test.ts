import { Hex } from 'ox'
import { expect, test } from 'vitest'
import { anvilOptimism } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { optimism } from '../../chains/index.js'
import {
  createClient,
  http,
  type TransactionRequestEIP1559,
} from '../../index.js'
import { estimateL1Gas } from './estimateL1Gas.js'

const optimismClient = anvilOptimism.getClient()
const optimismClientWithAccount = anvilOptimism.getClient({ account: true })
const optimismClientWithoutChain = anvilOptimism.getClient({ chain: false })

const baseTransaction = {
  data: '0xdeadbeef',
  to: accounts[1].address,
} as const satisfies Omit<TransactionRequestEIP1559, 'from'>

test('default', async () => {
  const gas = await estimateL1Gas(optimismClientWithAccount, baseTransaction)
  expect(gas).toBe(1600n)
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
  expect(gas).toBe(1600n)
})

test('args: data', async () => {
  const gas = await estimateL1Gas(optimismClientWithAccount, {
    ...baseTransaction,
    data: '0x00000000000000000000000000000000000000000000000004fefa17b7240000',
  })
  expect(gas).toBe(1600n)
})

test('args: gasPriceOracleAddress', async () => {
  const gas = await estimateL1Gas(optimismClientWithAccount, {
    ...baseTransaction,
    gasPriceOracleAddress: '0x420000000000000000000000000000000000000F',
  })
  expect(gas).toBe(1600n)
})

test('args: nonce', async () => {
  const gas = await estimateL1Gas(optimismClientWithAccount, {
    ...baseTransaction,
    nonce: 69,
  })
  expect(gas).toBe(1600n)
})

test('args: nullish chain', async () => {
  const gas = await estimateL1Gas(optimismClientWithoutChain, {
    ...baseTransaction,
    account: accounts[0].address,
    chain: null,
  })
  expect(gas).toBe(1600n)
})

test('behavior: account with no funds', async () => {
  const optimismClient = createClient({
    chain: optimism,
    transport: http(),
  })
  const gas = await estimateL1Gas(optimismClient, {
    ...baseTransaction,
    account: Hex.random(20),
  })
  expect(gas).toBeDefined()
})
