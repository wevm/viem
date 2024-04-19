import { expect, test } from 'vitest'

import {
  getZksyncMockProvider,
  zkSyncClientLocalNode,
} from '~test/src/zksync.js'
import { createPublicClient } from '~viem/clients/createPublicClient.js'
import { custom } from '~viem/clients/transports/custom.js'
import type { EIP1193RequestFn } from '~viem/types/eip1193.js'
import * as mockData from '../../../test/src/zksyncMockData.js'
import { type Fee, estimateFee } from '../actions/estimateFee.js'
import { type MessageProof, getLogProof } from '../actions/getLogProof.js'
import {
  type TransactionDetails,
  getTransactionDetails,
} from '../actions/getTransactionDetails.js'
import { publicActionsL2 } from './publicL2.js'

const zkSyncClient_ = zkSyncClientLocalNode.extend(publicActionsL2())

const mockReturnData = async (method: string) => {
  if (method === 'zks_L1ChainId') return mockData.mockChainId
  if (method === 'zks_estimateFee') return mockData.mockFeeValues
  if (method === 'zks_getAllAccountBalances')
    return mockData.mockAccountBalances
  if (method === 'zks_getBaseTokenL1Address')
    return mockData.mockBaseTokenL1Address
  if (method === 'zks_getBlockDetails') return mockData.mockBlockDetails
  if (method === 'zks_getBridgehubContract') return mockData.mockAddress
  if (method === 'zks_getBridgeContracts') return mockData.mockAddresses
  if (method === 'zks_getL1BatchBlockRange') return mockData.mockRange
  if (method === 'zks_getL1BatchDetails') return mockData.mockDetails
  if (method === 'zks_L1BatchNumber') return 1
  if (method === 'zks_getL2ToL1LogProof') return mockData.mockProofValues
  if (method === 'zks_getMainContract') return mockData.mockMainContractAddress
  if (method === 'zks_getRawBlockTransactions')
    return mockData.mockRawBlockTransaction
  if (method === 'zks_getTestnetPaymaster')
    return mockData.mockTestnetPaymasterAddress
  if (method === 'zks_getTransactionDetails')
    return mockData.mockTransactionDetails
  return undefined
}

const theClient = createPublicClient({
  transport: custom(
    getZksyncMockProvider(async ({ method }) => mockReturnData(method)),
  ),
}).extend(publicActionsL2())

test('getL1ChainId', async () => {
  const chainId = await theClient.getL1ChainId()
  expect(chainId).toBeDefined()
})

test('getDefaultBridgeAddresses', async () => {
  const addresses = await zkSyncClient_.getDefaultBridgeAddresses()
  expect(addresses).toBeDefined()
})

test('getTestnetPaymasterAddress', async () => {
  const address = await zkSyncClient_.getTestnetPaymasterAddress()
  expect(address).toBeDefined()
})

test('getMainContractAddress', async () => {
  const mainContractAddress = await zkSyncClient_.getMainContractAddress()
  expect(mainContractAddress).toBeDefined()
})

test('getAllBalances', async () => {
  const balances = await zkSyncClient_.getAllBalances({
    address: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
  })

  const entries = Object.entries(balances)
  for (const [key, value] of entries) {
    expect(typeof key).toBe('string')
    expect(typeof value).toBe('bigint')
  }
})

test('getRawBlockTransaction', async () => {
  const result = await zkSyncClient_.getRawBlockTransaction({
    number: 1,
  })
  expect(result).toBeDefined()
})

test('getL1BatchDetails', async () => {
  const details = await zkSyncClient_.getL1BatchDetails({
    number: 0,
  })
  expect(details).to.not.be.undefined
  expect(details.baseSystemContractsHashes.bootloader).toBeDefined()
  expect(details.baseSystemContractsHashes.default_aa).toBeDefined()
})

test('getL1BatchBlockRange', async () => {
  const blockRange = await zkSyncClient_.getL1BatchBlockRange({
    l1BatchNumber: 0,
  })
  expect(blockRange).toBeDefined()
  expect(blockRange.length === 2)
})

test('getL1BatchNumber', async () => {
  const number = await zkSyncClient_.getL1BatchNumber()
  expect(number).toBeDefined()
})

test('getBridgehubContract', async () => {
  const bridgeHubContractAddress =
    await zkSyncClient_.getBridgehubContractAddress()
  expect(bridgeHubContractAddress).toBeDefined()
})

test('getBaseTokenL1Address', async () => {
  const address = await zkSyncClient_.getBaseTokenL1Address()
  expect(address).toBeDefined()
})

test('estimateFee', async () => {
  const mockFeeValues: Fee = {
    gasLimit: 10n,
    gasPerPubdataLimit: 20n,
    maxPriorityFeePerGas: 30n,
    maxFeePerGas: 30n,
  }

  zkSyncClient_.request = (async ({ method, params }) => {
    if (method === 'zks_estimateFee') return mockFeeValues
    return zkSyncClientLocalNode.request({ method, params } as any)
  }) as EIP1193RequestFn

  const fee = await estimateFee(zkSyncClient_, {
    from: '0x',
  })

  expect(fee).to.deep.equal(mockFeeValues)
})

test('getTransactionDetails', async () => {
  const mockDetails: TransactionDetails = {
    isL1Originated: true,
    status: 'validated',
    fee: 10n,
    gasPerPubdata: 50000n,
    initiatorAddress: '0x000000000000000000000000000000000000800b',
    receivedAt: new Date(1713436617435),
  }
  zkSyncClient_.request = (async ({ method, params }) => {
    if (method === 'zks_getTransactionDetails') return mockDetails
    return zkSyncClientLocalNode.request({ method, params } as any)
  }) as EIP1193RequestFn
  const details = await getTransactionDetails(zkSyncClient_, {
    txHash:
      '0xcf89f4076eae08127daa1b2b9bab94a910d232b4a78b116554f7b29af19e35a4',
  })
  expect(details).to.equal(mockDetails)
})

test('getLogProof', async () => {
  const proofValues: MessageProof = {
    id: 112,
    proof: ['mock-proof1,mock-proof2'],
    root: 'mock-root',
  }

  zkSyncClient_.request = (async ({ method, params }) => {
    if (method === 'zks_getL2ToL1LogProof') return proofValues
    return zkSyncClientLocalNode.request({ method, params } as any)
  }) as EIP1193RequestFn

  const fee = await getLogProof(zkSyncClient_, {
    txHash: '0x',
    index: 5,
  })

  expect(fee).to.deep.equal(proofValues)
})
