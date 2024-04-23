import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'
import {
  optimismClient,
  optimismSepoliaClient,
} from '../../../test/src/opStack.js'
import { sepoliaClient, setBlockNumber } from '../../../test/src/utils.js'
import { getTransactionReceipt, reset } from '../../actions/index.js'

import { getTimeToProve } from './getTimeToProve.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  await reset(sepoliaClient, {
    blockNumber: 5528129n,
    jsonRpcUrl: sepoliaClient.chain.rpcUrls.default.http[0],
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
  await setBlockNumber(client, 18772363n)

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
