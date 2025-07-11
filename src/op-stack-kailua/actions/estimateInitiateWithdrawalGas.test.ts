import { expect, test } from 'vitest'
import { anvilOptimism } from '../../../test/src/anvil.js'
import { accounts } from '../../../test/src/constants.js'
import { estimateInitiateWithdrawalGas } from './estimateInitiateWithdrawalGas.js'

const optimismClient = anvilOptimism.getClient()

test('default', async () => {
  const gas = await estimateInitiateWithdrawalGas(optimismClient, {
    account: accounts[0].address,
    request: { gas: 21000n, to: accounts[0].address },
  })
  expect(gas).toBeDefined()
})
