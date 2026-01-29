import { expect, test } from 'vitest'
import { anvilMainnet, anvilOptimism } from '../../../test/src/anvil.js'
import { getTransactionReceipt, reset } from '../../actions/index.js'

import { getTimeToProve } from './getTimeToProve.js'

const client = anvilMainnet.getClient()
const optimismClient = anvilOptimism.getClient()

test('default', async () => {
  await reset(optimismClient, {
    blockNumber: 119830071n,
    jsonRpcUrl: anvilOptimism.forkUrl,
  })
  await reset(client, {
    blockNumber: 21892012n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })

  // https://optimistic.etherscan.io/tx/0x3107023b21569799804933e8fbf564d9b89d547b06ab64ffb8b3b671dfc76a85
  const receipt = await getTransactionReceipt(optimismClient, {
    hash: '0x3107023b21569799804933e8fbf564d9b89d547b06ab64ffb8b3b671dfc76a85',
  })

  const time = await getTimeToProve(client, {
    receipt,
    targetChain: optimismClient.chain,
  })

  expect(time).toBeDefined()
})

test('legacy (portal v2)', async () => {
  await reset(client, {
    blockNumber: 18772363n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })

  // https://optimistic.etherscan.io/tx/0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147
  const receipt = await getTransactionReceipt(optimismClient, {
    hash: '0x7b5cedccfaf9abe6ce3d07982f57bcb9176313b019ff0fc602a0b70342fe3147',
  })

  const time = await getTimeToProve(client, {
    receipt,
    targetChain: optimismClient.chain,
  })
  expect(time).toBeDefined()
})
