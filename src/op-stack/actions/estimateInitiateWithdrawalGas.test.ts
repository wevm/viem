import { expect, test } from 'vitest'
import { accounts } from '../../../test/src/constants.js'
import { optimismClient } from '../../../test/src/opStack.js'
import { estimateInitiateWithdrawalGas } from './estimateInitiateWithdrawalGas.js'

test('default', async () => {
  const gas = await estimateInitiateWithdrawalGas(optimismClient, {
    account: accounts[0].address,
    request: { gas: 21000n, to: accounts[0].address },
  })
  expect(gas).toBeDefined()
})
