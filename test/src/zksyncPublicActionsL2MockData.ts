import { Address } from 'abitype'
import { EIP1193RequestFn } from '~viem/index.js'
import { TransactionDetails } from '~viem/zksync/actions/getTransactionDetails.js'
import type { Fee } from '../../src/zksync/actions/estimateFee.js'
import { ZksGetAllBalancesReturnType } from '../../src/zksync/actions/getAllBalances.js'
import { BaseBlockDetails } from '../../src/zksync/actions/getBlockDetails.js'
import { ZksDefaultBridgeAddressesReturnType } from '../../src/zksync/actions/getDefaultBridgeAddresses.js'
import { GetL1BatchBlockRangeReturnParameters } from '../../src/zksync/actions/getL1BatchBlockRange.js'
import { BatchDetails } from '../../src/zksync/actions/getL1BatchDetails.js'
import { MessageProof } from '../../src/zksync/actions/getLogProof.js'
import { RawBlockTransactions } from '../../src/zksync/actions/getRawBlockTransaction.js'

export const mockFeeValues: Fee = {
  gasLimit: 10n,
  gasPerPubdataLimit: 20n,
  maxPriorityFeePerGas: 30n,
  maxFeePerGas: 30n,
}

export const mockAccountBalances: ZksGetAllBalancesReturnType = {
  '0x0000000000000000000000000000000000000000': '1000000000000000000',
  '0x0000000000000000000000000000000000000001': '2000000000000000000',
  '0x0000000000000000000000000000000000000002': '3500000000000000000',
}

export const mockBaseTokenL1Address: Address =
  '0x0000000000000000000000000000000000000000'

export const mockBlockDetails: BaseBlockDetails = {
  number: 0,
  timestamp: 1713435780,
  l1BatchNumber: 0,
  l1TxCount: 2,
  l2TxCount: 3,
  status: 'verified',
  baseSystemContractsHashes: {
    bootloader:
      '0x010008bb22aea1e22373cb8d807b15c67eedd65523e9cba4cc556adfa504f7b8',
    default_aa:
      '0x010008bb22aea1e22373cb8d807b15c67eedd65523e9cba4cc556adfa504f7b8',
  },
}

export const mockAddress: Address = '0x173999892363ba18c9dc60f8c57152fc914bce89'

export const mockAddresses: ZksDefaultBridgeAddressesReturnType = {
  l1SharedDefaultBridge: '0x648afeaf09a3db988ac41b786001235bbdbc7640',
  l2SharedDefaultBridge: '0xfd61c893b903fa133908ce83dfef67c4c2350dd8',
  l1Erc20DefaultBridge: '0xbe270c78209cfda84310230aaa82e18936310b2e',
  l2Erc20DefaultBridge: '0xfc073319977e314f251eae6ae6be76b0b3baeecf',
  l1WethBridge: '0x5e6d086f5ec079adff4fb3774cdf3e8d6a34f7e9',
  l2WethBridge: '0x5e6d086f5ec079adff4fb3774cdf3e8d6a34f7e9',
}

export const mockRange: GetL1BatchBlockRangeReturnParameters = [0, 5]

export const mockDetails: BatchDetails = {
  number: 0,
  timestamp: 0,
  l1TxCount: 0,
  l2TxCount: 0,
  l1BatchNumber: 0,
  status: 'verified',
  l1GasPrice: 0,
  l2FairGasPrice: 0,
  baseSystemContractsHashes: {
    bootloader:
      '0x010008bb22aea1e22373cb8d807b15c67eedd65523e9cba4cc556adfa504f7b8',
    default_aa:
      '0x01000563a7f32f1d97b4697f3bc996132433314b9b17351a7f7cd6073f618569',
  },
}

export const mockChainId = '0x9'

export const mockProofValues: MessageProof = {
  id: 112,
  proof: ['mock-proof1,mock-proof2'],
  root: 'mock-root',
}

export const mockMainContractAddress =
  '0x9fab5aec650f1ce6e35ec60a611af0a1345927c8'

export const mockRawBlockTransaction: RawBlockTransactions = [
  {
    common_data: {
      L2: {
        nonce: 0,
        fee: {
          gas_limit: BigInt(21000),
          max_fee_per_gas: BigInt(50),
          max_priority_fee_per_gas: BigInt(10),
          gas_per_pubdata_limit: BigInt(1000),
        },
        initiatorAddress: '0x000000000000000000000000000000000000800b',
        signature: new Uint8Array(),
        transactionType: 'ProtocolUpgrade',
        input: {
          hash: '0x',
          data: new Uint8Array(),
        },
        paymasterParams: {
          paymaster: '0x0a67078A35745947A37A552174aFe724D8180c25',
          paymasterInput: new Uint8Array(),
        },
      },
    },
    execute: {
      calldata:
        '0xef0e2ff4000000000000000000000000000000000000000000000000000000000000010e',
      contractAddress: '0x000000000000000000000000000000000000800b',
      factoryDeps: '0x',
      value: BigInt(0),
    },
    received_timestamp_ms: 1713436617435,
    raw_bytes: '',
  },
]

export const mockTestnetPaymasterAddress =
  '0x0a67078A35745947A37A552174aFe724D8180c25'

export const mockTransactionDetails: TransactionDetails = {
  isL1Originated: true,
  status: 'validated',
  fee: 10n,
  gasPerPubdata: 50000n,
  initiatorAddress: '0x000000000000000000000000000000000000800b',
  receivedAt: new Date(1713436617435),
}

export const mockRequestReturnData = async (method: string) => {
  if (method === 'zks_L1ChainId') return mockChainId
  if (method === 'zks_estimateFee') return mockFeeValues
  if (method === 'zks_getAllAccountBalances') return mockAccountBalances
  if (method === 'zks_getBaseTokenL1Address') return mockBaseTokenL1Address
  if (method === 'zks_getBlockDetails') return mockBlockDetails
  if (method === 'zks_getBridgehubContract') return mockAddress
  if (method === 'zks_getBridgeContracts') return mockAddresses
  if (method === 'zks_getL1BatchBlockRange') return mockRange
  if (method === 'zks_getL1BatchDetails') return mockDetails
  if (method === 'zks_L1BatchNumber') return 1
  if (method === 'zks_getL2ToL1LogProof') return mockProofValues
  if (method === 'zks_getMainContract') return mockMainContractAddress
  if (method === 'zks_getRawBlockTransactions') return mockRawBlockTransaction
  if (method === 'zks_getTestnetPaymaster') return mockTestnetPaymasterAddress
  if (method === 'zks_getTransactionDetails') return mockTransactionDetails
  return undefined
}

export function mockClientPublicActionsL2(client) {
  client.request = (async ({ method }) => {
    return mockRequestReturnData(method)
  }) as EIP1193RequestFn
}
