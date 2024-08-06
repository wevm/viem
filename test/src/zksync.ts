import { zksyncLocalNode } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
import { http } from '~viem/index.js'
import { accounts } from './constants.js'

export const zksyncClientLocalNode = createClient({
  chain: zksyncLocalNode,
  transport: http(),
})

export const zksyncClientLocalNodeWithAccount = createClient({
  account: accounts[0].address,
  chain: zksyncLocalNode,
  transport: http(),
})

export function getZksyncMockProvider(
  request: ({
    method,
    params,
  }: { method: string; params?: unknown }) => Promise<any>,
) {
  return {
    on: () => null,
    removeListener: () => null,
    request: ({ method, params }: any) => request({ method, params }),
  }
}

export const mockedL1BatchNumber = '0x2012'

export const mockFeeValues = {
  gas_limit: '0x2803d',
  gas_per_pubdata_limit: '0x42',
  max_fee_per_gas: '0xee6b280',
  max_priority_fee_per_gas: '0x0',
}

export const mockAccountBalances = {
  '0x0000000000000000000000000000000000000000': '1000000000000000000',
  '0x0000000000000000000000000000000000000001': '2000000000000000000',
  '0x0000000000000000000000000000000000000002': '3500000000000000000',
}

export const mockBaseTokenL1Address =
  '0x0000000000000000000000000000000000000000'

export const mockBlockDetails = {
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
  operatorAddress: '0xde03a0b5963f75f1c8485b355ff6d30f3093bde7',
  protocolVersion: 'Version19',
}

export const mockAddress = '0x173999892363ba18c9dc60f8c57152fc914bce89'

export const mockAddresses = {
  l1SharedDefaultBridge: '0x648afeaf09a3db988ac41b786001235bbdbc7640',
  l2SharedDefaultBridge: '0xfd61c893b903fa133908ce83dfef67c4c2350dd8',
  l1Erc20DefaultBridge: '0xbe270c78209cfda84310230aaa82e18936310b2e',
  l2Erc20DefaultBridge: '0xfc073319977e314f251eae6ae6be76b0b3baeecf',
  l1WethBridge: '0x5e6d086f5ec079adff4fb3774cdf3e8d6a34f7e9',
  l2WethBridge: '0x5e6d086f5ec079adff4fb3774cdf3e8d6a34f7e9',
}

export const mockRange = [0, 5]

export const mockDetails = {
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

export const mockProofValues = {
  id: 112,
  proof: [
    '0x3d999d6a5bacdc5c8c01ad0917c1dca03c632fc486ac623a8857804374b0d1b1',
    '0xc3d03eebfd83049991ea3d3e358b6712e7aa2e2e63dc2d4b438987cec28ac8d0',
    '0xe3697c7f33c31a9b0f0aeb8542287d0d21e8c4cf82163d0c44c7a98aa11aa111',
    '0x199cc5812543ddceeddd0fc82807646a4899444240db2c0d2f20c3cceb5f51fa',
    '0xe4733f281f18ba3ea8775dd62d2fcd84011c8c938f16ea5790fd29a03bf8db89',
    '0x1798a1fd9c8fbb818c98cff190daa7cc10b6e5ac9716b4a2649f7c2ebcef2272',
    '0x66d7c5983afe44cf15ea8cf565b34c6c31ff0cb4dd744524f7842b942d08770d',
    '0xb04e5ee349086985f74b73971ce9dfe76bbed95c84906c5dffd96504e1e5396c',
    '0xac506ecb5465659b3a927143f6d724f91d8d9c4bdb2463aee111d9aa869874db',
    '0x124b05ec272cecd7538fdafe53b6628d31188ffb6f345139aac3c3c1fd2e470f',
    '0xc3be9cbd19304d84cca3d045e06b8db3acd68c304fc9cd4cbffe6d18036cb13f',
  ],
  root: '0x443ddd5b010069db588a5f21e9145f94a93dd8109c72cc70d79281f1c19db2c8',
}

export const mockMainContractAddress =
  '0x9fab5aec650f1ce6e35ec60a611af0a1345927c8'

export const mockRawBlockTransaction = [
  {
    common_data: {
      L1: {
        sender: '0xde03a0b5963f75f1c8485b355ff6d30f3093bde7',
        serialId: 0,
        deadlineBlock: 0,
        layer2TipFee: '0x0',
        fullFee: '0x0',
        maxFeePerGas: '0x1dcd6500',
        gasLimit: '0x44aa200',
        gasPerPubdataLimit: '0x320',
        opProcessingType: 'Common',
        priorityQueueType: 'Deque',
        ethHash:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        ethBlock: 125,
        canonicalTxHash:
          '0x9376f805ccd40186a73672a4d0db064060956e70c4ae486ab205291986439343',
        toMint: '0x7fe5cf2bea0000',
        refundRecipient: '0xde03a0b5963f75f1c8485b355ff6d30f3093bde7',
      },
      L2: {
        nonce: 0,
        fee: {
          gas_limit: '0x2803d',
          gas_per_pubdata_limit: '0x42',
          max_fee_per_gas: '0xee6b280',
          max_priority_fee_per_gas: '0x0',
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

export const mockTransactionDetails = {
  isL1Originated: true,
  status: 'validated',
  fee: 10n,
  gasPerPubdata: 50000n,
  initiatorAddress: '0x000000000000000000000000000000000000800b',
  receivedAt: new Date(1713436617435),
}

export const mockedGasEstimation = 123456789n

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
  if (method === 'zks_getL2ToL1LogProof') return mockProofValues
  if (method === 'zks_getMainContract') return mockMainContractAddress
  if (method === 'zks_getRawBlockTransactions') return mockRawBlockTransaction
  if (method === 'zks_getTestnetPaymaster') return mockTestnetPaymasterAddress
  if (method === 'zks_getTransactionDetails') return mockTransactionDetails
  if (method === 'zks_L1BatchNumber') return mockedL1BatchNumber
  if (method === 'zks_estimateGasL1ToL2') return mockedGasEstimation
  return undefined
}

export function mockClientPublicActionsL2(client: any) {
  client.request = async ({ method }: any) => {
    return mockRequestReturnData(method)
  }
}
