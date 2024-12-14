import { expect, test } from 'vitest'

import type { Address } from 'abitype'
import { zksyncLocalNode } from '../../../src/chains/index.js'
import { getZksyncMockProvider } from '../../../test/src/zksync.js'
import {
  mockAccountBalances,
  mockAddress,
  mockBaseTokenL1Address,
  mockDetails,
  mockMainContractAddress,
  mockProofValues,
  mockRequestReturnData,
  mockTestnetPaymasterAddress,
  mockTransactionDetails,
  mockedGasEstimation,
  mockedL1BatchNumber,
} from '../../../test/src/zksync.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { custom } from '../../clients/transports/custom.js'
import { estimateFee } from '../actions/estimateFee.js'
import { estimateGasL1ToL2 } from '../actions/estimateGasL1ToL2.js'
import type { GetAllBalancesReturnType } from '../actions/getAllBalances.js'
import { getLogProof } from '../actions/getLogProof.js'
import { getTransactionDetails } from '../actions/getTransactionDetails.js'
import { publicActionsL2 } from './publicL2.js'

const mockedZksyncClient = createPublicClient({
  transport: custom(
    getZksyncMockProvider(async ({ method }) => mockRequestReturnData(method)),
  ),
  chain: zksyncLocalNode,
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
    mockAccountBalancesBigInt[key as Address] = BigInt(value)
  }

  expect(balances).to.deep.equal(mockAccountBalancesBigInt)
})

test('getRawBlockTransaction', async () => {
  const result = await mockedZksyncClient.getRawBlockTransaction({
    number: 1,
  })
  expect(result).toMatchInlineSnapshot(`
    [
      {
        "commonData": {
          "L1": {
            "canonicalTxHash": "0x9376f805ccd40186a73672a4d0db064060956e70c4ae486ab205291986439343",
            "deadlineBlock": 0,
            "ethBlock": 125,
            "ethHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "fullFee": "0x0",
            "gasLimit": "0x44aa200",
            "gasPerPubdataLimit": "0x320",
            "layer2TipFee": "0x0",
            "maxFeePerGas": "0x1dcd6500",
            "opProcessingType": "Common",
            "priorityQueueType": "Deque",
            "refundRecipient": "0xde03a0b5963f75f1c8485b355ff6d30f3093bde7",
            "sender": "0xde03a0b5963f75f1c8485b355ff6d30f3093bde7",
            "serialId": 0,
            "toMint": "0x7fe5cf2bea0000",
          },
          "L2": {
            "fee": {
              "gasLimit": "0x2803d",
              "gasPerPubdataLimit": "0x42",
              "maxFeePerGas": "0xee6b280",
              "maxPriorityFeePerGas": "0x0",
            },
            "initiatorAddress": "0x000000000000000000000000000000000000800b",
            "input": {
              "data": {},
              "hash": "0x",
            },
            "nonce": 0,
            "paymasterParams": {
              "paymaster": "0x0a67078A35745947A37A552174aFe724D8180c25",
              "paymasterInput": {},
            },
            "signature": {},
            "transactionType": "ProtocolUpgrade",
          },
        },
        "execute": {
          "calldata": "0xef0e2ff4000000000000000000000000000000000000000000000000000000000000010e",
          "contractAddress": "0x000000000000000000000000000000000000800b",
          "factoryDeps": "0x",
          "value": 0n,
        },
        "rawBytes": "",
        "receivedTimestampMs": 1713436617435,
      },
    ]
  `)
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
  expect(blockRange).toMatchInlineSnapshot(`
    [
      0,
      5,
    ]
  `)
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

  expect(fee).toMatchInlineSnapshot(`
    {
      "gasLimit": 163901n,
      "gasPerPubdataLimit": 66n,
      "maxFeePerGas": 250000000n,
      "maxPriorityFeePerGas": 0n,
    }
  `)
})

test('estimateGasL1ToL2', async () => {
  const gas = await estimateGasL1ToL2(mockedZksyncClient, {
    account: mockAddress,
    to: '0xa61464658AfeAf65CccaaFD3a512b69A83B77618',
    value: 70n,
  })

  expect(gas).to.deep.equal(mockedGasEstimation)
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
