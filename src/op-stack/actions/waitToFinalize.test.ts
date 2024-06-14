import { beforeAll, test, vi } from 'vitest'
import { anvilMainnet, anvilOptimism } from '../../../test/src/anvil.js'
import { getTransactionReceipt, reset } from '../../actions/index.js'

import { getWithdrawals, optimism } from '../../op-stack/index.js'
import { waitToFinalize } from './waitToFinalize.js'

const client = anvilMainnet.getClient()
const optimismClient = anvilOptimism.getClient()

beforeAll(async () => {
  await reset(client, {
    blockNumber: 18770525n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })
})

test('default', async () => {
  const receipt = await getTransactionReceipt(optimismClient, {
    hash: '0x9a2f4283636ddeb9ac32382961b22c177c9e86dd3b283735c154f897b1a7ff4a',
  })

  const [withdrawal] = getWithdrawals(receipt)

  vi.setSystemTime(new Date(1702993989000))

  await waitToFinalize(client, {
    ...withdrawal!,
    targetChain: optimism,
  })

  vi.useRealTimers()
}, 20000)

test('ready to finalize', async () => {
  const receipt = await getTransactionReceipt(optimismClient, {
    hash: '0x9a2f4283636ddeb9ac32382961b22c177c9e86dd3b283735c154f897b1a7ff4a',
  })

  const [withdrawal] = getWithdrawals(receipt)

  vi.setSystemTime(new Date(1702993991000))

  await waitToFinalize(client, {
    ...withdrawal!,
    targetChain: optimism,
  })

  vi.useRealTimers()
}, 20000)
