import { expect, test } from 'vitest'

import { zkSyncLocalNode } from '../../../src/chains/index.js'
import { getZksyncMockProvider } from '../../../test/src/zksync.js'
import {
  mockAccountBalances,
  mockAddress,
  mockBaseTokenL1Address,
  mockDetails,
  mockFeeValues,
  mockMainContractAddress,
  mockProofValues,
  mockRange,
  mockRawBlockTransaction,
  mockRequestReturnData,
  mockTestnetPaymasterAddress,
  mockTransactionDetails,
  mockedL1BatchNumber,
} from '../../../test/src/zksyncPublicActionsL2MockData.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { custom } from '../../clients/transports/custom.js'
import { estimateFee } from '../actions/estimateFee.js'
import type { GetAllBalancesReturnType } from '../actions/getAllBalances.js'
import { getLogProof } from '../actions/getLogProof.js'
import { getTransactionDetails } from '../actions/getTransactionDetails.js'
import { publicActionsL2 } from './publicL2.js'

const mockedZksyncClient = createPublicClient({
  transport: custom(
    getZksyncMockProvider(async ({ method }) => mockRequestReturnData(method)),
  ),
  chain: zkSyncLocalNode,
}).extend(publicActionsL2())

test('getL1ChainId', async () => {
  const chainId = await mockedZksyncClient.getL1ChainId()
  expect(chainId).to.be.equal('0x9')
})

test('getDefaultBridgeAddresses', async () => {
  const addresses = await mockedZksyncClient.getDefaultBridgeAddresses()

  const returnedAddresses = {
    erc20L1: '0xbe270c78209cfda84310230aaa82e18936310b2e',
    sharedL1: '0x648afeaf09a3db988ac41b786001235bbdbc7640',
    sharedL2: '0xfd61c893b903fa133908ce83dfef67c4c2350dd8',
  }

  expect(addresses).to.deep.equal(returnedAddresses)
})

test('getTestnetPaymasterAddress', async () => {
  const address = await mockedZksyncClient.getTestnetPaymasterAddress()
  expect(address).to.equal(mockTestnetPaymasterAddress)
})

test('getMainContractAddress', async () => {
  const mainContractAddress = await mockedZksyncClient.getMainContractAddress()
  expect(mainContractAddress).to.equal(mockMainContractAddress)
})

test('getAllBalances', async () => {
  const balances = await mockedZksyncClient.getAllBalances({
    account: mockAddress,
  })

  const mockAccountBalancesBigInt: GetAllBalancesReturnType = {}
  const entries = Object.entries(mockAccountBalances)
  for (const [key, value] of entries) {
    mockAccountBalancesBigInt[key] = BigInt(value)
  }

  expect(balances).to.deep.equal(mockAccountBalancesBigInt)
})

test('getRawBlockTransaction', async () => {
  const result = await mockedZksyncClient.getRawBlockTransaction({
    number: 1,
  })
  expect(result).to.equal(mockRawBlockTransaction)
})

test('getL1BatchDetails', async () => {
  const details = await mockedZksyncClient.getL1BatchDetails({
    number: 0,
  })
  expect(details).to.equal(mockDetails)
})

test('getL1BatchBlockRange', async () => {
  const blockRange = await mockedZksyncClient.getL1BatchBlockRange({
    l1BatchNumber: 0,
  })
  expect(blockRange).toBeDefined()
  expect(blockRange.length === 2)
  expect(blockRange).to.equal(mockRange)
})

test('getL1BatchNumber', async () => {
  const number = await mockedZksyncClient.getL1BatchNumber()
  expect(number).to.be.equal(mockedL1BatchNumber)
})

test('getBridgehubContract', async () => {
  const bridgeHubContractAddress =
    await mockedZksyncClient.getBridgehubContractAddress()
  expect(bridgeHubContractAddress).to.equal(mockAddress)
})

test('getBaseTokenL1Address', async () => {
  const address = await mockedZksyncClient.getBaseTokenL1Address()
  expect(address).to.equal(mockBaseTokenL1Address)
})

test('estimateFee', async () => {
  const fee = await estimateFee(mockedZksyncClient, {
    account: mockAddress,
  })

  expect(fee).to.deep.equal(mockFeeValues)
})

test('getTransactionDetails', async () => {
  const details = await getTransactionDetails(mockedZksyncClient, {
    txHash:
      '0xcf89f4076eae08127daa1b2b9bab94a910d232b4a78b116554f7b29af19e35a4',
  })
  expect(details).to.equal(mockTransactionDetails)
})

test('getLogProof', async () => {
  const fee = await getLogProof(mockedZksyncClient, {
    txHash: '0x',
    index: 5,
  })

  expect(fee).to.deep.equal(mockProofValues)
})
