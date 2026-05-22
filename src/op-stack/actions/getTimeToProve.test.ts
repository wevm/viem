import { afterEach, expect, test, vi } from 'vitest'
import { anvilMainnet, anvilOptimism } from '~test/anvil.js'
import { getTransactionReceipt, reset } from '../../actions/index.js'

import * as getPortalVersionModule from './getPortalVersion.js'
import * as getTimeToNextGameModule from './getTimeToNextGame.js'
import * as getTimeToNextL2OutputModule from './getTimeToNextL2Output.js'
import { getTimeToProve } from './getTimeToProve.js'

const client = anvilMainnet.getClient()
const optimismClient = anvilOptimism.getClient()

afterEach(() => {
  vi.restoreAllMocks()
})

test('args: l2Timestamp', async () => {
  vi.spyOn(getPortalVersionModule, 'getPortalVersion').mockResolvedValueOnce({
    major: 3,
    minor: 0,
    patch: 0,
  })
  const spy = vi
    .spyOn(getTimeToNextGameModule, 'getTimeToNextGame')
    .mockResolvedValueOnce({
      interval: 0,
      seconds: 0,
    })

  await getTimeToProve(client, {
    disputeGameFactoryAddress: '0x0000000000000000000000000000000000000001',
    l2Timestamp: 20n,
    portalAddress: '0x0000000000000000000000000000000000000002',
    receipt: { blockNumber: 10n } as never,
  })

  expect(spy).toHaveBeenCalledWith(
    client,
    expect.objectContaining({ l2BlockNumber: 20n }),
  )
})

test('args: l2Timestamp (legacy)', async () => {
  vi.spyOn(getPortalVersionModule, 'getPortalVersion').mockResolvedValueOnce({
    major: 2,
    minor: 0,
    patch: 0,
  })
  const spy = vi
    .spyOn(getTimeToNextL2OutputModule, 'getTimeToNextL2Output')
    .mockResolvedValueOnce({
      interval: 0,
      seconds: 0,
    })

  await getTimeToProve(client, {
    l2OutputOracleAddress: '0x0000000000000000000000000000000000000001',
    l2Timestamp: 20n,
    portalAddress: '0x0000000000000000000000000000000000000002',
    receipt: { blockNumber: 10n } as never,
  })

  expect(spy).toHaveBeenCalledWith(
    client,
    expect.objectContaining({ l2BlockNumber: 20n }),
  )
})

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
