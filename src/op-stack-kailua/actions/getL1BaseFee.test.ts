import { expect, test } from 'vitest'

import { anvilOptimism } from '../../../test/src/anvil.js'
import { getL1BaseFee } from './getL1BaseFee.js'

const optimismClient = anvilOptimism.getClient()
const optimismClientWithAccount = anvilOptimism.getClient({ account: true })
const optimismClientWithoutChain = anvilOptimism.getClient({ chain: false })

test('default', async () => {
  const baseFee = await getL1BaseFee(optimismClient)
  expect(baseFee >= 0).toBeTruthy()
})

test('withAccount', async () => {
  const baseFee = await getL1BaseFee(optimismClientWithAccount, {})
  expect(baseFee >= 0).toBeTruthy()
})

test('args: gasPriceOracleAddress', async () => {
  const baseFee = await getL1BaseFee(optimismClient, {
    gasPriceOracleAddress: '0x420000000000000000000000000000000000000F',
  })
  expect(baseFee >= 0).toBeTruthy()
})

test('args: nonce', async () => {
  const baseFee = await getL1BaseFee(optimismClient)
  expect(baseFee >= 0).toBeTruthy()
})

test('args: nullish chain', async () => {
  const baseFee = await getL1BaseFee(optimismClientWithoutChain, {
    chain: null,
  })
  expect(baseFee >= 0).toBeTruthy()
})
