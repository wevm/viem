import { zksyncLocalNode } from '~viem/chains/index.js'
import { createClient } from '~viem/clients/createClient.js'
import { http } from '~viem/index.js'
import type { ZksyncTransactionReceipt } from '~viem/zksync/index.js'
import { accounts as acc } from './constants.js'

export const zksyncClientLocalNode = createClient({
  chain: zksyncLocalNode,
  transport: http(),
})

export const zksyncClientLocalNodeWithAccount = createClient({
  account: acc[0].address,
  chain: zksyncLocalNode,
  transport: http(),
})

export function getZksyncMockProvider(
  request: ({
    method,
    params,
  }: {
    method: string
    params?: unknown
  }) => Promise<any>,
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

export const mockGasPerPubdata = '0x42'

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
  l1Nullifier: '0xFb2fdA7D9377F98a6cbD7A61C9f69575c8E947b6',
  l1NativeTokenVault: '0xeC1D6d4A357bd65226eBa599812ba4fDA5514F47',
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

export const mockReceipt: ZksyncTransactionReceipt = {
  transactionHash:
    '0x15c295874fe9ad8f6708def4208119c68999f7a76ac6447c111e658ba6bfaa1e',
  transactionIndex: 0,
  blockHash:
    '0x395fdbf0faa12cb49438dcbcf96ddb130b8c0730dd0a0dd6999e247e2c2bca85',
  blockNumber: 45n,
  l1BatchTxIndex: 0n,
  l1BatchNumber: 22n,
  from: '0x36615cf349d7f6344891b1e7ca7c72883f5dc049',
  to: '0x000000000000000000000000000000000000800a',
  cumulativeGasUsed: 0n,
  gasUsed: 221700n,
  contractAddress: null,
  logs: [
    {
      address: '0x000000000000000000000000000000000000800a',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x00000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049',
        '0x0000000000000000000000000000000000000000000000000000000000008001',
      ],
      data: '0x00000000000000000000000000000000000000000000000000001cd79e564400',
      blockHash:
        '0x395fdbf0faa12cb49438dcbcf96ddb130b8c0730dd0a0dd6999e247e2c2bca85',
      blockNumber: 45n,
      l1BatchNumber: 22n,
      transactionHash:
        '0x15c295874fe9ad8f6708def4208119c68999f7a76ac6447c111e658ba6bfaa1e',
      transactionIndex: 0,
      logIndex: 0,
      transactionLogIndex: 0,
      logType: null,
      removed: false,
    },
    {
      address: '0x000000000000000000000000000000000000800a',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x0000000000000000000000000000000000000000000000000000000000008001',
        '0x00000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049',
      ],
      data: '0x000000000000000000000000000000000000000000000000000004ce9a63b600',
      blockHash:
        '0x395fdbf0faa12cb49438dcbcf96ddb130b8c0730dd0a0dd6999e247e2c2bca85',
      blockNumber: 45n,
      l1BatchNumber: 22n,
      transactionHash:
        '0x15c295874fe9ad8f6708def4208119c68999f7a76ac6447c111e658ba6bfaa1e',
      transactionIndex: 0,
      logIndex: 1,
      transactionLogIndex: 1,
      logType: null,
      removed: false,
    },
    {
      address: '0x000000000000000000000000000000000000800a',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x00000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049',
        '0x000000000000000000000000000000000000000000000000000000000000800a',
      ],
      data: '0x00000000000000000000000000000000000000000000000000000001a13b8600',
      blockHash:
        '0x395fdbf0faa12cb49438dcbcf96ddb130b8c0730dd0a0dd6999e247e2c2bca85',
      blockNumber: 45n,
      l1BatchNumber: 22n,
      transactionHash:
        '0x15c295874fe9ad8f6708def4208119c68999f7a76ac6447c111e658ba6bfaa1e',
      transactionIndex: 0,
      logIndex: 2,
      transactionLogIndex: 2,
      logType: null,
      removed: false,
    },
    {
      address: '0x0000000000000000000000000000000000008008',
      topics: [
        '0x27fe8c0b49f49507b9d4fe5968c9f49edfe5c9df277d433a07a0717ede97638d',
      ],
      data: '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008008000000000000000000000000000000000000000000000000000000000000800a0bc337b42226405c56d0c4db2bd874946831bd2b0b00e51e72d0cf430165fe7f',
      blockHash:
        '0x395fdbf0faa12cb49438dcbcf96ddb130b8c0730dd0a0dd6999e247e2c2bca85',
      blockNumber: 45n,
      l1BatchNumber: 22n,
      transactionHash:
        '0x15c295874fe9ad8f6708def4208119c68999f7a76ac6447c111e658ba6bfaa1e',
      transactionIndex: 0,
      logIndex: 3,
      transactionLogIndex: 3,
      logType: null,
      removed: false,
    },
    {
      address: '0x0000000000000000000000000000000000008008',
      topics: [
        '0x3a36e47291f4201faf137fab081d92295bce2d53be2c6ca68ba82c7faa9ce241',
        '0x000000000000000000000000000000000000000000000000000000000000800a',
        '0x0bc337b42226405c56d0c4db2bd874946831bd2b0b00e51e72d0cf430165fe7f',
      ],
      data: '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000386c0960f936615cf349d7f6344891b1e7ca7c72883f5dc04900000000000000000000000000000000000000000000000000000001a13b86000000000000000000',
      blockHash:
        '0x395fdbf0faa12cb49438dcbcf96ddb130b8c0730dd0a0dd6999e247e2c2bca85',
      blockNumber: 45n,
      l1BatchNumber: 22n,
      transactionHash:
        '0x15c295874fe9ad8f6708def4208119c68999f7a76ac6447c111e658ba6bfaa1e',
      transactionIndex: 0,
      logIndex: 4,
      transactionLogIndex: 4,
      logType: null,
      removed: false,
    },
    {
      address: '0x000000000000000000000000000000000000800a',
      topics: [
        '0x2717ead6b9200dd235aad468c9809ea400fe33ac69b5bfaa6d3e90fc922b6398',
        '0x00000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049',
        '0x00000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049',
      ],
      data: '0x00000000000000000000000000000000000000000000000000000001a13b8600',
      blockHash:
        '0x395fdbf0faa12cb49438dcbcf96ddb130b8c0730dd0a0dd6999e247e2c2bca85',
      blockNumber: 45n,
      l1BatchNumber: 22n,
      transactionHash:
        '0x15c295874fe9ad8f6708def4208119c68999f7a76ac6447c111e658ba6bfaa1e',
      transactionIndex: 0,
      logIndex: 5,
      transactionLogIndex: 5,
      logType: null,
      removed: false,
    },
    {
      address: '0x000000000000000000000000000000000000800a',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        '0x0000000000000000000000000000000000000000000000000000000000008001',
        '0x00000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049',
      ],
      data: '0x000000000000000000000000000000000000000000000000000003df28f90a00',
      blockHash:
        '0x395fdbf0faa12cb49438dcbcf96ddb130b8c0730dd0a0dd6999e247e2c2bca85',
      blockNumber: 45n,
      l1BatchNumber: 22n,
      transactionHash:
        '0x15c295874fe9ad8f6708def4208119c68999f7a76ac6447c111e658ba6bfaa1e',
      transactionIndex: 0,
      logIndex: 6,
      transactionLogIndex: 6,
      logType: null,
      removed: false,
    },
  ],
  l2ToL1Logs: [
    {
      blockNumber: 40n,
      blockHash:
        '0x395fdbf0faa12cb49438dcbcf96ddb130b8c0730dd0a0dd6999e247e2c2bca85',
      l1BatchNumber: 22n,
      transactionIndex: 0n,
      shardId: 0n,
      isService: true,
      sender: '0x0000000000000000000000000000000000008008',
      key: '0x000000000000000000000000000000000000000000000000000000000000800a',
      value:
        '0x0bc337b42226405c56d0c4db2bd874946831bd2b0b00e51e72d0cf430165fe7f',
      transactionHash:
        '0x15c295874fe9ad8f6708def4208119c68999f7a76ac6447c111e658ba6bfaa1e',
      logIndex: 0n,
    },
  ],
  status: 'success',
  root: '0x395fdbf0faa12cb49438dcbcf96ddb130b8c0730dd0a0dd6999e247e2c2bca85',
  logsBloom:
    '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  type: 'eip1559',
  effectiveGasPrice: 100000000n,
}

export const mockFailedDepositReceipt: ZksyncTransactionReceipt = {
  transactionHash:
    '0x5b08ec4c7ebb02c07a3f08bc5677aec87c47200f685f6389969a3c084bee13dc',
  transactionIndex: 0,
  blockHash:
    '0x1f33506c39562bb7909730a5d3249c46654b49ed5ef9d6561d40ee6dba4c0df3',
  blockNumber: 51n,
  l1BatchTxIndex: 0n,
  l1BatchNumber: 26n,
  from: '0x435dd24aa6b5e4cb393168aeadefe782d2ac1f34',
  to: '0x0000000000000000000000000000000000010003',
  cumulativeGasUsed: 0n,
  gasUsed: 300000n,
  contractAddress: null,
  logs: [
    {
      address: '0x000000000000000000000000000000000000800a',
      topics: [
        '0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885',
        '0x0000000000000000000000000000000000000000000000000000000000008001',
      ],
      data: '0x0000000000000000000000000000000000000000000000000000479f69c6ac00',
      blockHash:
        '0x1f33506c39562bb7909730a5d3249c46654b49ed5ef9d6561d40ee6dba4c0df3',
      blockNumber: 51n,
      l1BatchNumber: 26n,
      transactionHash:
        '0x5b08ec4c7ebb02c07a3f08bc5677aec87c47200f685f6389969a3c084bee13dc',
      transactionIndex: 0,
      logIndex: 0,
      transactionLogIndex: 0,
      logType: null,
      removed: false,
    },
    {
      address: '0x0000000000000000000000000000000000008008',
      topics: [
        '0x27fe8c0b49f49507b9d4fe5968c9f49edfe5c9df277d433a07a0717ede97638d',
      ],
      data: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080015b08ec4c7ebb02c07a3f08bc5677aec87c47200f685f6389969a3c084bee13dc0000000000000000000000000000000000000000000000000000000000000000',
      blockHash:
        '0x1f33506c39562bb7909730a5d3249c46654b49ed5ef9d6561d40ee6dba4c0df3',
      blockNumber: 51n,
      l1BatchNumber: 26n,
      transactionHash:
        '0x5b08ec4c7ebb02c07a3f08bc5677aec87c47200f685f6389969a3c084bee13dc',
      transactionIndex: 0,
      logIndex: 1,
      transactionLogIndex: 1,
      logType: null,
      removed: false,
    },
  ],
  l2ToL1Logs: [
    {
      blockNumber: 5907n,
      blockHash:
        '0x1f33506c39562bb7909730a5d3249c46654b49ed5ef9d6561d40ee6dba4c0df3',
      l1BatchNumber: 26n,
      transactionIndex: 0n,
      shardId: 0n,
      isService: true,
      sender: '0x0000000000000000000000000000000000008001',
      key: '0x5b08ec4c7ebb02c07a3f08bc5677aec87c47200f685f6389969a3c084bee13dc',
      value:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      transactionHash:
        '0x5b08ec4c7ebb02c07a3f08bc5677aec87c47200f685f6389969a3c084bee13dc',
      logIndex: 0n,
    },
  ],
  status: 'reverted',
  logsBloom:
    '0x00000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020040000000000000040000000000000000000000000000000080000000000000000000000000000000000000000000000400000000000000000000000001000000000000004000100000000000000000000000000000000000080000080000000100000000000000000000000000000000000000000000000000000000000008000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000',
  type: '0xff',
  effectiveGasPrice: 262500000n,
}

export const mockFailedDepositTransaction = {
  hash: '0x5b08ec4c7ebb02c07a3f08bc5677aec87c47200f685f6389969a3c084bee13dc',
  nonce: 0,
  blockHash:
    '0x1f33506c39562bb7909730a5d3249c46654b49ed5ef9d6561d40ee6dba4c0df3',
  blockNumber: 51n,
  transactionIndex: 0,
  from: '0x435dd24aa6b5e4cb393168aeadefe782d2ac1f34',
  to: '0x0000000000000000000000000000000000010003',
  value: 0n,
  gasPrice: 262500000n,
  gas: 300000n,
  input:
    '0xcfe7af7c00000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc04900000000000000000000000036615cf349d7f6344891b1e7ca7c72883f5dc049000000000000000000000000326437271e12059c2f323922e2c7610d7234941a000000000000000000000000000000000000000000000000000000000000000700000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001c1010000000000000000000000000000000000000000000000000000000000000009000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003444149000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000344414900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000',
  type: 'priority',
  maxFeePerGas: 262500000n,
  maxPriorityFeePerGas: 0n,
  chainId: 271,
  l1BatchNumber: 26n,
  l1BatchTxIndex: 0n,
  maxFeePerBlobGas: undefined,
  typeHex: '0xff',
  v: undefined,
  yParity: undefined,
}

export const mockLogProof = {
  proof: [
    '0x010f000100000000000000000000000000000000000000000000000000000000',
    '0x72abee45b59e344af8a6e520241c4744aff26ed411f4c4b00f8af09adada43ba',
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
    '0xfef7bd9f889811e59e4076a0174087135f080177302763019adaf531257e3a87',
    '0xa707d1c62d8be699d34cb74804fdd7b4c568b6c1a821066f126c680d4b83e00b',
    '0xf6e093070e0389d2e529d60fadb855fdded54976ec50ac709e3a36ceaa64c291',
    '0xe4ed1ec13a28c40715db6399f6f99ce04e5f19d60ad3ff6831f098cb6cf75944',
  ],
  id: 0,
  root: '0x16a369954a147966c849e4a55e1762dc4c235cd454f3d9c2e0f4fb32e93c1546',
}

export const mockRequestReturnData = async (method: string) => {
  if (method === 'zks_L1ChainId') return mockChainId
  if (method === 'zks_estimateFee') return mockFeeValues
  if (method === 'zks_gasPerPubdata') return mockGasPerPubdata
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
  if (method === 'eth_getTransactionReceipt') return mockReceipt
  if (method === 'zks_getL2ToL1LogProof') return mockLogProof
  return undefined
}

export function mockClientPublicActionsL2(client: any) {
  client.request = async ({ method }: any) => {
    return mockRequestReturnData(method)
  }
}

export const accounts = [
  {
    address: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    privateKey:
      '0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110',
  },
  {
    address: '0xa61464658AfeAf65CccaaFD3a512b69A83B77618',
    privateKey:
      '0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3',
  },
] as const
