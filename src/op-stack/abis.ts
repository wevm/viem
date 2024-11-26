/**
 * ABI for the OP Stack [`GasPriceOracle` contract](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L2/GasPriceOracle.sol).
 * @see https://optimistic.etherscan.io/address/0x420000000000000000000000000000000000000f
 */
export const gasPriceOracleAbi = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    inputs: [],
    name: 'DECIMALS',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'baseFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'gasPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: '_data', type: 'bytes' }],
    name: 'getL1Fee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: '_data', type: 'bytes' }],
    name: 'getL1GasUsed',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l1BaseFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'overhead',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'scalar',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const l2OutputOracleAbi = [
  {
    inputs: [
      { internalType: 'uint256', name: '_submissionInterval', type: 'uint256' },
      { internalType: 'uint256', name: '_l2BlockTime', type: 'uint256' },
      {
        internalType: 'uint256',
        name: '_startingBlockNumber',
        type: 'uint256',
      },
      { internalType: 'uint256', name: '_startingTimestamp', type: 'uint256' },
      { internalType: 'address', name: '_proposer', type: 'address' },
      { internalType: 'address', name: '_challenger', type: 'address' },
      {
        internalType: 'uint256',
        name: '_finalizationPeriodSeconds',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint8', name: 'version', type: 'uint8' },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'outputRoot',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'l2OutputIndex',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'l2BlockNumber',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'l1Timestamp',
        type: 'uint256',
      },
    ],
    name: 'OutputProposed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'prevNextOutputIndex',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'newNextOutputIndex',
        type: 'uint256',
      },
    ],
    name: 'OutputsDeleted',
    type: 'event',
  },
  {
    inputs: [],
    name: 'CHALLENGER',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'FINALIZATION_PERIOD_SECONDS',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'L2_BLOCK_TIME',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PROPOSER',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'SUBMISSION_INTERVAL',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_l2BlockNumber', type: 'uint256' },
    ],
    name: 'computeL2Timestamp',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_l2OutputIndex', type: 'uint256' },
    ],
    name: 'deleteL2Outputs',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_l2OutputIndex', type: 'uint256' },
    ],
    name: 'getL2Output',
    outputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'outputRoot', type: 'bytes32' },
          { internalType: 'uint128', name: 'timestamp', type: 'uint128' },
          { internalType: 'uint128', name: 'l2BlockNumber', type: 'uint128' },
        ],
        internalType: 'struct Types.OutputProposal',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_l2BlockNumber', type: 'uint256' },
    ],
    name: 'getL2OutputAfter',
    outputs: [
      {
        components: [
          { internalType: 'bytes32', name: 'outputRoot', type: 'bytes32' },
          { internalType: 'uint128', name: 'timestamp', type: 'uint128' },
          { internalType: 'uint128', name: 'l2BlockNumber', type: 'uint128' },
        ],
        internalType: 'struct Types.OutputProposal',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_l2BlockNumber', type: 'uint256' },
    ],
    name: 'getL2OutputIndexAfter',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_startingBlockNumber',
        type: 'uint256',
      },
      { internalType: 'uint256', name: '_startingTimestamp', type: 'uint256' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestBlockNumber',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestOutputIndex',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextBlockNumber',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextOutputIndex',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_outputRoot', type: 'bytes32' },
      { internalType: 'uint256', name: '_l2BlockNumber', type: 'uint256' },
      { internalType: 'bytes32', name: '_l1BlockHash', type: 'bytes32' },
      { internalType: 'uint256', name: '_l1BlockNumber', type: 'uint256' },
    ],
    name: 'proposeL2Output',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'startingBlockNumber',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'startingTimestamp',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const l2ToL1MessagePasserAbi = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'gasLimit',
        type: 'uint256',
      },
      { indexed: false, internalType: 'bytes', name: 'data', type: 'bytes' },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'withdrawalHash',
        type: 'bytes32',
      },
    ],
    name: 'MessagePassed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'WithdrawerBalanceBurnt',
    type: 'event',
  },
  {
    inputs: [],
    name: 'MESSAGE_VERSION',
    outputs: [{ internalType: 'uint16', name: '', type: 'uint16' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_target', type: 'address' },
      { internalType: 'uint256', name: '_gasLimit', type: 'uint256' },
      { internalType: 'bytes', name: '_data', type: 'bytes' },
    ],
    name: 'initiateWithdrawal',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'messageNonce',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'sentMessages',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
] as const

export const disputeGameFactoryAbi = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'create',
    inputs: [
      {
        name: '_gameType',
        type: 'uint32',
        internalType: 'GameType',
      },
      {
        name: '_rootClaim',
        type: 'bytes32',
        internalType: 'Claim',
      },
      {
        name: '_extraData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: 'proxy_',
        type: 'address',
        internalType: 'contract IDisputeGame',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'findLatestGames',
    inputs: [
      {
        name: '_gameType',
        type: 'uint32',
        internalType: 'GameType',
      },
      {
        name: '_start',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_n',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'games_',
        type: 'tuple[]',
        internalType: 'struct IDisputeGameFactory.GameSearchResult[]',
        components: [
          {
            name: 'index',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'metadata',
            type: 'bytes32',
            internalType: 'GameId',
          },
          {
            name: 'timestamp',
            type: 'uint64',
            internalType: 'Timestamp',
          },
          {
            name: 'rootClaim',
            type: 'bytes32',
            internalType: 'Claim',
          },
          {
            name: 'extraData',
            type: 'bytes',
            internalType: 'bytes',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'gameAtIndex',
    inputs: [
      {
        name: '_index',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'gameType_',
        type: 'uint32',
        internalType: 'GameType',
      },
      {
        name: 'timestamp_',
        type: 'uint64',
        internalType: 'Timestamp',
      },
      {
        name: 'proxy_',
        type: 'address',
        internalType: 'contract IDisputeGame',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'gameCount',
    inputs: [],
    outputs: [
      {
        name: 'gameCount_',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'gameImpls',
    inputs: [
      {
        name: '',
        type: 'uint32',
        internalType: 'GameType',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IDisputeGame',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'games',
    inputs: [
      {
        name: '_gameType',
        type: 'uint32',
        internalType: 'GameType',
      },
      {
        name: '_rootClaim',
        type: 'bytes32',
        internalType: 'Claim',
      },
      {
        name: '_extraData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: 'proxy_',
        type: 'address',
        internalType: 'contract IDisputeGame',
      },
      {
        name: 'timestamp_',
        type: 'uint64',
        internalType: 'Timestamp',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getGameUUID',
    inputs: [
      {
        name: '_gameType',
        type: 'uint32',
        internalType: 'GameType',
      },
      {
        name: '_rootClaim',
        type: 'bytes32',
        internalType: 'Claim',
      },
      {
        name: '_extraData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: 'uuid_',
        type: 'bytes32',
        internalType: 'Hash',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'initBonds',
    inputs: [
      {
        name: '',
        type: 'uint32',
        internalType: 'GameType',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: '_owner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setImplementation',
    inputs: [
      {
        name: '_gameType',
        type: 'uint32',
        internalType: 'GameType',
      },
      {
        name: '_impl',
        type: 'address',
        internalType: 'contract IDisputeGame',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setInitBond',
    inputs: [
      {
        name: '_gameType',
        type: 'uint32',
        internalType: 'GameType',
      },
      {
        name: '_initBond',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'version',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'DisputeGameCreated',
    inputs: [
      {
        name: 'disputeProxy',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'gameType',
        type: 'uint32',
        indexed: true,
        internalType: 'GameType',
      },
      {
        name: 'rootClaim',
        type: 'bytes32',
        indexed: true,
        internalType: 'Claim',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ImplementationSet',
    inputs: [
      {
        name: 'impl',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'gameType',
        type: 'uint32',
        indexed: true,
        internalType: 'GameType',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'InitBondUpdated',
    inputs: [
      {
        name: 'gameType',
        type: 'uint32',
        indexed: true,
        internalType: 'GameType',
      },
      {
        name: 'newBond',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Initialized',
    inputs: [
      {
        name: 'version',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'GameAlreadyExists',
    inputs: [
      {
        name: 'uuid',
        type: 'bytes32',
        internalType: 'Hash',
      },
    ],
  },
  {
    type: 'error',
    name: 'InsufficientBond',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NoImplementation',
    inputs: [
      {
        name: 'gameType',
        type: 'uint32',
        internalType: 'GameType',
      },
    ],
  },
] as const

export const portal2Abi = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_proofMaturityDelaySeconds',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_disputeGameFinalityDelaySeconds',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
  {
    inputs: [],
    name: 'balance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IDisputeGame',
        name: '_disputeGame',
        type: 'address',
      },
    ],
    name: 'blacklistDisputeGame',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_withdrawalHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '_proofSubmitter',
        type: 'address',
      },
    ],
    name: 'checkWithdrawal',
    outputs: [],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_mint',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_value',
        type: 'uint256',
      },
      {
        internalType: 'uint64',
        name: '_gasLimit',
        type: 'uint64',
      },
      {
        internalType: 'bool',
        name: '_isCreation',
        type: 'bool',
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'depositERC20Transaction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_value',
        type: 'uint256',
      },
      {
        internalType: 'uint64',
        name: '_gasLimit',
        type: 'uint64',
      },
      {
        internalType: 'bool',
        name: '_isCreation',
        type: 'bool',
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'depositTransaction',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IDisputeGame',
        name: '',
        type: 'address',
      },
    ],
    name: 'disputeGameBlacklist',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'disputeGameFactory',
    outputs: [
      {
        internalType: 'contract DisputeGameFactory',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'disputeGameFinalityDelaySeconds',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'donateETH',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasLimit',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
        ],
        internalType: 'struct Types.WithdrawalTransaction',
        name: '_tx',
        type: 'tuple',
      },
    ],
    name: 'finalizeWithdrawalTransaction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasLimit',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
        ],
        internalType: 'struct Types.WithdrawalTransaction',
        name: '_tx',
        type: 'tuple',
      },
      {
        internalType: 'address',
        name: '_proofSubmitter',
        type: 'address',
      },
    ],
    name: 'finalizeWithdrawalTransactionExternalProof',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'finalizedWithdrawals',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'guardian',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract DisputeGameFactory',
        name: '_disputeGameFactory',
        type: 'address',
      },
      {
        internalType: 'contract SystemConfig',
        name: '_systemConfig',
        type: 'address',
      },
      {
        internalType: 'contract SuperchainConfig',
        name: '_superchainConfig',
        type: 'address',
      },
      {
        internalType: 'GameType',
        name: '_initialRespectedGameType',
        type: 'uint32',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2Sender',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: '_byteCount',
        type: 'uint64',
      },
    ],
    name: 'minimumGasLimit',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_withdrawalHash',
        type: 'bytes32',
      },
    ],
    name: 'numProofSubmitters',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'params',
    outputs: [
      {
        internalType: 'uint128',
        name: 'prevBaseFee',
        type: 'uint128',
      },
      {
        internalType: 'uint64',
        name: 'prevBoughtGas',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: 'prevBlockNum',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proofMaturityDelaySeconds',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'proofSubmitters',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasLimit',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
        ],
        internalType: 'struct Types.WithdrawalTransaction',
        name: '_tx',
        type: 'tuple',
      },
      {
        internalType: 'uint256',
        name: '_disputeGameIndex',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'version',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'stateRoot',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'messagePasserStorageRoot',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'latestBlockhash',
            type: 'bytes32',
          },
        ],
        internalType: 'struct Types.OutputRootProof',
        name: '_outputRootProof',
        type: 'tuple',
      },
      {
        internalType: 'bytes[]',
        name: '_withdrawalProof',
        type: 'bytes[]',
      },
    ],
    name: 'proveWithdrawalTransaction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'provenWithdrawals',
    outputs: [
      {
        internalType: 'contract IDisputeGame',
        name: 'disputeGameProxy',
        type: 'address',
      },
      {
        internalType: 'uint64',
        name: 'timestamp',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'respectedGameType',
    outputs: [
      {
        internalType: 'GameType',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'respectedGameTypeUpdatedAt',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'uint8',
        name: '_decimals',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: '_name',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '_symbol',
        type: 'bytes32',
      },
    ],
    name: 'setGasPayingToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'GameType',
        name: '_gameType',
        type: 'uint32',
      },
    ],
    name: 'setRespectedGameType',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'superchainConfig',
    outputs: [
      {
        internalType: 'contract SuperchainConfig',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'systemConfig',
    outputs: [
      {
        internalType: 'contract SystemConfig',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IDisputeGame',
        name: 'disputeGame',
        type: 'address',
      },
    ],
    name: 'DisputeGameBlacklisted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'GameType',
        name: 'newGameType',
        type: 'uint32',
      },
      {
        indexed: true,
        internalType: 'Timestamp',
        name: 'updatedAt',
        type: 'uint64',
      },
    ],
    name: 'RespectedGameTypeSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'version',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'opaqueData',
        type: 'bytes',
      },
    ],
    name: 'TransactionDeposited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'withdrawalHash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'success',
        type: 'bool',
      },
    ],
    name: 'WithdrawalFinalized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'withdrawalHash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'WithdrawalProven',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'withdrawalHash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'proofSubmitter',
        type: 'address',
      },
    ],
    name: 'WithdrawalProvenExtension1',
    type: 'event',
  },
  {
    inputs: [],
    name: 'AlreadyFinalized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BadTarget',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Blacklisted',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CallPaused',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ContentLengthMismatch',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EmptyItem',
    type: 'error',
  },
  {
    inputs: [],
    name: 'GasEstimation',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidDataRemainder',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidDisputeGame',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidGameType',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidHeader',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidMerkleProof',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidProof',
    type: 'error',
  },
  {
    inputs: [],
    name: 'LargeCalldata',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoValue',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NonReentrant',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OnlyCustomGasToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OutOfGas',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ProposalNotValidated',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SmallGasLimit',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TransferFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Unauthorized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnexpectedList',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnexpectedString',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Unproven',
    type: 'error',
  },
] as const

export const portalAbi = [
  { stateMutability: 'nonpayable', type: 'constructor', inputs: [] },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'version',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'opaqueData',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'TransactionDeposited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'withdrawalHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      { name: 'success', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'WithdrawalFinalized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'withdrawalHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'WithdrawalProven',
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'GUARDIAN',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'L2_ORACLE',
    outputs: [
      { name: '', internalType: 'contract L2OutputOracle', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'SYSTEM_CONFIG',
    outputs: [
      { name: '', internalType: 'contract SystemConfig', type: 'address' },
    ],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_value', internalType: 'uint256', type: 'uint256' },
      { name: '_gasLimit', internalType: 'uint64', type: 'uint64' },
      { name: '_isCreation', internalType: 'bool', type: 'bool' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'depositTransaction',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [],
    name: 'donateETH',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        name: '_tx',
        internalType: 'struct Types.WithdrawalTransaction',
        type: 'tuple',
        components: [
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          { name: 'sender', internalType: 'address', type: 'address' },
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'value', internalType: 'uint256', type: 'uint256' },
          { name: 'gasLimit', internalType: 'uint256', type: 'uint256' },
          { name: 'data', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'finalizeWithdrawalTransaction',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'finalizedWithdrawals',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'guardian',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        name: '_l2Oracle',
        internalType: 'contract L2OutputOracle',
        type: 'address',
      },
      { name: '_guardian', internalType: 'address', type: 'address' },
      {
        name: '_systemConfig',
        internalType: 'contract SystemConfig',
        type: 'address',
      },
      { name: '_paused', internalType: 'bool', type: 'bool' },
    ],
    name: 'initialize',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '_l2OutputIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isOutputFinalized',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'l2Oracle',
    outputs: [
      { name: '', internalType: 'contract L2OutputOracle', type: 'address' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'l2Sender',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [{ name: '_byteCount', internalType: 'uint64', type: 'uint64' }],
    name: 'minimumGasLimit',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'params',
    outputs: [
      { name: 'prevBaseFee', internalType: 'uint128', type: 'uint128' },
      { name: 'prevBoughtGas', internalType: 'uint64', type: 'uint64' },
      { name: 'prevBlockNum', internalType: 'uint64', type: 'uint64' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        name: '_tx',
        internalType: 'struct Types.WithdrawalTransaction',
        type: 'tuple',
        components: [
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          { name: 'sender', internalType: 'address', type: 'address' },
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'value', internalType: 'uint256', type: 'uint256' },
          { name: 'gasLimit', internalType: 'uint256', type: 'uint256' },
          { name: 'data', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: '_l2OutputIndex', internalType: 'uint256', type: 'uint256' },
      {
        name: '_outputRootProof',
        internalType: 'struct Types.OutputRootProof',
        type: 'tuple',
        components: [
          { name: 'version', internalType: 'bytes32', type: 'bytes32' },
          { name: 'stateRoot', internalType: 'bytes32', type: 'bytes32' },
          {
            name: 'messagePasserStorageRoot',
            internalType: 'bytes32',
            type: 'bytes32',
          },
          { name: 'latestBlockhash', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
      { name: '_withdrawalProof', internalType: 'bytes[]', type: 'bytes[]' },
    ],
    name: 'proveWithdrawalTransaction',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'provenWithdrawals',
    outputs: [
      { name: 'outputRoot', internalType: 'bytes32', type: 'bytes32' },
      { name: 'timestamp', internalType: 'uint128', type: 'uint128' },
      { name: 'l2OutputIndex', internalType: 'uint128', type: 'uint128' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'systemConfig',
    outputs: [
      { name: '', internalType: 'contract SystemConfig', type: 'address' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'version',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  { stateMutability: 'payable', type: 'receive' },
] as const
