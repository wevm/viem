import { afterEach, expect, test, vi } from 'vitest'
import { anvilMainnet, anvilOptimism } from '~test/anvil.js'
import { getTransactionReceipt, reset } from '../../actions/index.js'

import * as getWithdrawalsModule from '../utils/getWithdrawals.js'
import * as getPortalVersionModule from './getPortalVersion.js'
import * as waitForNextGameModule from './waitForNextGame.js'
import * as waitForNextL2OutputModule from './waitForNextL2Output.js'
import { waitToProve } from './waitToProve.js'

const client = anvilMainnet.getClient()
const optimismClient = anvilOptimism.getClient()

const withdrawal = {
  data: '0x',
  gasLimit: 0n,
  nonce: 0n,
  sender: '0x0000000000000000000000000000000000000001',
  target: '0x0000000000000000000000000000000000000002',
  value: 0n,
  withdrawalHash:
    '0x0000000000000000000000000000000000000000000000000000000000000003',
} as const

afterEach(() => {
  vi.restoreAllMocks()
})

test('args: l2Timestamp', async () => {
  vi.spyOn(getWithdrawalsModule, 'getWithdrawals').mockReturnValueOnce([
    withdrawal,
  ])
  vi.spyOn(getPortalVersionModule, 'getPortalVersion').mockResolvedValueOnce({
    major: 3,
    minor: 0,
    patch: 0,
  })
  const spy = vi
    .spyOn(waitForNextGameModule, 'waitForNextGame')
    .mockResolvedValueOnce({
      extraData: '0x',
      index: 1n,
      l2BlockNumber: 20n,
      metadata: '0x',
      rootClaim:
        '0x0000000000000000000000000000000000000000000000000000000000000004',
      timestamp: 0n,
      usesSuperRoots: true,
    })

  await waitToProve(client, {
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
  vi.spyOn(getWithdrawalsModule, 'getWithdrawals').mockReturnValueOnce([
    withdrawal,
  ])
  vi.spyOn(getPortalVersionModule, 'getPortalVersion').mockResolvedValueOnce({
    major: 2,
    minor: 0,
    patch: 0,
  })
  const spy = vi
    .spyOn(waitForNextL2OutputModule, 'waitForNextL2Output')
    .mockResolvedValueOnce({
      l2BlockNumber: 20n,
      outputIndex: 1n,
      outputRoot:
        '0x0000000000000000000000000000000000000000000000000000000000000004',
      timestamp: 0n,
    })

  await waitToProve(client, {
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

  const output = await waitToProve(client, {
    gameLimit: 10,
    receipt,
    targetChain: optimismClient.chain,
  })
  expect(output).toBeDefined()
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

  const output = await waitToProve(client, {
    receipt,
    targetChain: optimismClient.chain,
  })
  expect(output).toMatchInlineSnapshot(`
    {
      "game": {
        "extraData": "0x",
        "index": 4529n,
        "l2BlockNumber": 113389063n,
        "metadata": "0x",
        "rootClaim": "0xdc3b54fd33b5d8a60f275ca83c74b625e3942be5b70b2f7f0b9cadd869eb7b1a",
        "timestamp": 1702377887n,
        "usesSuperRoots": false,
      },
      "output": {
        "l2BlockNumber": 113389063n,
        "outputIndex": 4529n,
        "outputRoot": "0xdc3b54fd33b5d8a60f275ca83c74b625e3942be5b70b2f7f0b9cadd869eb7b1a",
        "timestamp": 1702377887n,
      },
      "withdrawal": {
        "data": "0xd764ad0b0001000000000000000000000000000000000000000000000000000000002d49000000000000000000000000420000000000000000000000000000000000001000000000000000000000000099c9fc46f92e8a1c0dec1b1747d010903e884be1000000000000000000000000000000000000000000000000002e2f6e5e148000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000a41635f5fd000000000000000000000000bcce5f55dfda11600e48e91598ad0f8645466142000000000000000000000000bcce5f55dfda11600e48e91598ad0f8645466142000000000000000000000000000000000000000000000000002e2f6e5e1480000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "gasLimit": 287624n,
        "nonce": 1766847064778384329583297500742918515827483896875618958121606201292631369n,
        "sender": "0x4200000000000000000000000000000000000007",
        "target": "0x25ace71c97B33Cc4729CF772ae268934F7ab5fA1",
        "value": 13000000000000000n,
        "withdrawalHash": "0x178f1e0216fb50bef160eb8af7d1d98000026a84371cef4a13d8d79996cc8589",
      },
    }
  `)
})
