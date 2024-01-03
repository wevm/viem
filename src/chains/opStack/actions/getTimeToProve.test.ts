import { beforeAll, expect, test } from 'vitest'
import { optimismClient } from '../../../../test/src/opStack.js'
import { publicClient, setBlockNumber } from '../../../../test/src/utils.js'
import { getTransactionReceipt } from '../../../actions/index.js'
import { getTimeToProve } from './getTimeToProve.js'

beforeAll(async () => {
  await setBlockNumber(18772363n)
})

test('default', async () => {
  // https://optimistic.etherscan.io/tx/0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147
  const receipt = await getTransactionReceipt(optimismClient, {
    hash: '0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147',
  })

  const time = await getTimeToProve(publicClient, {
    receipt,
    targetChain: optimismClient.chain,
  })
  expect(time).toBeDefined()
})
