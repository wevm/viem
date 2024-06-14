import { expect, test } from 'vitest'
import {
  anvilMainnet,
  anvilOptimism,
  anvilOptimismSepolia,
  anvilSepolia,
} from '../../../test/src/anvil.js'
import { getTransactionReceipt, reset } from '../../actions/index.js'

import { getTimeToProve } from './getTimeToProve.js'

const client = anvilMainnet.getClient()
const sepoliaClient = anvilSepolia.getClient()
const optimismClient = anvilOptimism.getClient()
const optimismSepoliaClient = anvilOptimismSepolia.getClient()

test('default', async () => {
  await reset(sepoliaClient, {
    blockNumber: 5528129n,
    jsonRpcUrl: anvilSepolia.forkUrl,
  })

  // https://sepolia-optimism.etherscan.io/tx/0x0cb90819569b229748c16caa26c9991fb8674581824d31dc9339228bb4e77731
  const receipt = await getTransactionReceipt(optimismSepoliaClient, {
    hash: '0x0cb90819569b229748c16caa26c9991fb8674581824d31dc9339228bb4e77731',
  })

  const time = await getTimeToProve(sepoliaClient, {
    receipt,
    targetChain: optimismSepoliaClient.chain,
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
