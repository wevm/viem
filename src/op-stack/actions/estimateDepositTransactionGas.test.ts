import { beforeAll, expect, test } from 'vitest'
import { accounts } from '../../../test/src/constants.js'
import {
  publicClient,
  setBlockNumber,
  testClient,
} from '../../../test/src/utils.js'
import { setBalance } from '../../actions/index.js'
import { parseEther } from '../../index.js'
import { base } from '../../op-stack/chains.js'
import { estimateDepositTransactionGas } from './estimateDepositTransactionGas.js'

beforeAll(async () => {
  await setBlockNumber(18136086n)
  await setBalance(testClient, {
    address: accounts[0].address,
    value: parseEther('10000'),
  })
})

test('default', async () => {
  const gas = await estimateDepositTransactionGas(publicClient, {
    account: accounts[0].address,
    request: { gas: 21000n, to: accounts[0].address },
    targetChain: base,
  })
  expect(gas).toBeDefined()
})
