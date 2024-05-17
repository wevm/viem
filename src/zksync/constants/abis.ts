/* [ContractDeployer](https://github.com/matter-labs/era-system-contracts/blob/main/contracts/ContractDeployer.sol) */
export const contractDeployerAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'accountAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'enum IContractDeployer.AccountNonceOrdering',
        name: 'nonceOrdering',
        type: 'uint8',
      },
    ],
    name: 'AccountNonceOrderingUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'accountAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'enum IContractDeployer.AccountAbstractionVersion',
        name: 'aaVersion',
        type: 'uint8',
      },
    ],
    name: 'AccountVersionUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'deployerAddress',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'bytecodeHash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'contractAddress',
        type: 'address',
      },
    ],
    name: 'ContractDeployed',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_salt',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '_bytecodeHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: '_input',
        type: 'bytes',
      },
    ],
    name: 'create',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_salt',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '_bytecodeHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: '_input',
        type: 'bytes',
      },
    ],
    name: 'create2',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_salt',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '_bytecodeHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: '_input',
        type: 'bytes',
      },
      {
        internalType: 'enum IContractDeployer.AccountAbstractionVersion',
        name: '_aaVersion',
        type: 'uint8',
      },
    ],
    name: 'create2Account',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
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
        internalType: 'bytes32',
        name: '_bytecodeHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: '_input',
        type: 'bytes',
      },
      {
        internalType: 'enum IContractDeployer.AccountAbstractionVersion',
        name: '_aaVersion',
        type: 'uint8',
      },
    ],
    name: 'createAccount',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_address',
        type: 'address',
      },
    ],
    name: 'extendedAccountVersion',
    outputs: [
      {
        internalType: 'enum IContractDeployer.AccountAbstractionVersion',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_keccak256BytecodeHash',
        type: 'bytes32',
      },
    ],
    name: 'forceDeployKeccak256',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'bytecodeHash',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'newAddress',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'callConstructor',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'input',
            type: 'bytes',
          },
        ],
        internalType: 'struct ContractDeployer.ForceDeployment',
        name: '_deployment',
        type: 'tuple',
      },
      {
        internalType: 'address',
        name: '_sender',
        type: 'address',
      },
    ],
    name: 'forceDeployOnAddress',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'bytecodeHash',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'newAddress',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'callConstructor',
            type: 'bool',
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'input',
            type: 'bytes',
          },
        ],
        internalType: 'struct ContractDeployer.ForceDeployment[]',
        name: '_deployments',
        type: 'tuple[]',
      },
    ],
    name: 'forceDeployOnAddresses',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_address',
        type: 'address',
      },
    ],
    name: 'getAccountInfo',
    outputs: [
      {
        components: [
          {
            internalType: 'enum IContractDeployer.AccountAbstractionVersion',
            name: 'supportedAAVersion',
            type: 'uint8',
          },
          {
            internalType: 'enum IContractDeployer.AccountNonceOrdering',
            name: 'nonceOrdering',
            type: 'uint8',
          },
        ],
        internalType: 'struct IContractDeployer.AccountInfo',
        name: 'info',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_sender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_senderNonce',
        type: 'uint256',
      },
    ],
    name: 'getNewAddressCreate',
    outputs: [
      {
        internalType: 'address',
        name: 'newAddress',
        type: 'address',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_sender',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '_bytecodeHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '_salt',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: '_input',
        type: 'bytes',
      },
    ],
    name: 'getNewAddressCreate2',
    outputs: [
      {
        internalType: 'address',
        name: 'newAddress',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'enum IContractDeployer.AccountAbstractionVersion',
        name: '_version',
        type: 'uint8',
      },
    ],
    name: 'updateAccountVersion',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'enum IContractDeployer.AccountNonceOrdering',
        name: '_nonceOrdering',
        type: 'uint8',
      },
    ],
    name: 'updateNonceOrdering',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export const paymasterAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_minAllowance',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '_innerInput',
        type: 'bytes',
      },
    ],
    name: 'approvalBased',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'input',
        type: 'bytes',
      },
    ],
    name: 'general',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export const bridgehubAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'oldAdmin',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'NewAdmin',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'stateTransitionManager',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'chainGovernance',
        type: 'address',
      },
    ],
    name: 'NewChain',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'oldPendingAdmin',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newPendingAdmin',
        type: 'address',
      },
    ],
    name: 'NewPendingAdmin',
    type: 'event',
  },
  {
    inputs: [],
    name: 'acceptAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_stateTransitionManager',
        type: 'address',
      },
    ],
    name: 'addStateTransitionManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
    ],
    name: 'addToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
    ],
    name: 'baseToken',
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
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_stateTransitionManager',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_baseToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_salt',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_admin',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_initData',
        type: 'bytes',
      },
    ],
    name: 'createNewChain',
    outputs: [
      {
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
    ],
    name: 'getStateTransition',
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
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_gasPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_l2GasLimit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_l2GasPerPubdataByteLimit',
        type: 'uint256',
      },
    ],
    name: 'l2TransactionBaseCost',
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
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: '_l2TxHash',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: '_l2BatchNumber',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_l2MessageIndex',
        type: 'uint256',
      },
      {
        internalType: 'uint16',
        name: '_l2TxNumberInBatch',
        type: 'uint16',
      },
      {
        internalType: 'bytes32[]',
        name: '_merkleProof',
        type: 'bytes32[]',
      },
      {
        internalType: 'enum TxStatus',
        name: '_status',
        type: 'uint8',
      },
    ],
    name: 'proveL1ToL2TransactionStatus',
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
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_batchNumber',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_index',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'uint8',
            name: 'l2ShardId',
            type: 'uint8',
          },
          {
            internalType: 'bool',
            name: 'isService',
            type: 'bool',
          },
          {
            internalType: 'uint16',
            name: 'txNumberInBatch',
            type: 'uint16',
          },
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'bytes32',
            name: 'key',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'value',
            type: 'bytes32',
          },
        ],
        internalType: 'struct L2Log',
        name: '_log',
        type: 'tuple',
      },
      {
        internalType: 'bytes32[]',
        name: '_proof',
        type: 'bytes32[]',
      },
    ],
    name: 'proveL2LogInclusion',
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
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_batchNumber',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_index',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'uint16',
            name: 'txNumberInBatch',
            type: 'uint16',
          },
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
        ],
        internalType: 'struct L2Message',
        name: '_message',
        type: 'tuple',
      },
      {
        internalType: 'bytes32[]',
        name: '_proof',
        type: 'bytes32[]',
      },
    ],
    name: 'proveL2MessageInclusion',
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
    inputs: [
      {
        internalType: 'address',
        name: '_stateTransitionManager',
        type: 'address',
      },
    ],
    name: 'removeStateTransitionManager',
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
            name: 'chainId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'mintValue',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'l2Contract',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'l2Value',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'l2Calldata',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'l2GasLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'l2GasPerPubdataByteLimit',
            type: 'uint256',
          },
          {
            internalType: 'bytes[]',
            name: 'factoryDeps',
            type: 'bytes[]',
          },
          {
            internalType: 'address',
            name: 'refundRecipient',
            type: 'address',
          },
        ],
        internalType: 'struct L2TransactionRequestDirect',
        name: '_request',
        type: 'tuple',
      },
    ],
    name: 'requestL2TransactionDirect',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'canonicalTxHash',
        type: 'bytes32',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'chainId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'mintValue',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'l2Value',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'l2GasLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'l2GasPerPubdataByteLimit',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'refundRecipient',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'secondBridgeAddress',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'secondBridgeValue',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'secondBridgeCalldata',
            type: 'bytes',
          },
        ],
        internalType: 'struct L2TransactionRequestTwoBridgesOuter',
        name: '_request',
        type: 'tuple',
      },
    ],
    name: 'requestL2TransactionTwoBridges',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'canonicalTxHash',
        type: 'bytes32',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_newPendingAdmin',
        type: 'address',
      },
    ],
    name: 'setPendingAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_sharedBridge',
        type: 'address',
      },
    ],
    name: 'setSharedBridge',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'sharedBridge',
    outputs: [
      {
        internalType: 'contract IL1SharedBridge',
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
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
    ],
    name: 'stateTransitionManager',
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
        internalType: 'address',
        name: '_stateTransitionManager',
        type: 'address',
      },
    ],
    name: 'stateTransitionManagerIsRegistered',
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
    inputs: [
      {
        internalType: 'address',
        name: '_baseToken',
        type: 'address',
      },
    ],
    name: 'tokenIsRegistered',
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
]

export const l1BridgeFactoryAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'txDataHash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'l2DepositTxHash',
        type: 'bytes32',
      },
    ],
    name: 'BridgehubDepositFinalized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'txDataHash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'l1Token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'BridgehubDepositInitiatedSharedBridge',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'l1Token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'ClaimedFailedDepositSharedBridge',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'l2DepositTxHash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'l1Token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'DepositInitiatedSharedBridge',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'l1Token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'WithdrawalFinalizedSharedBridge',
    type: 'event',
  },
  {
    inputs: [],
    name: 'bridgehub',
    outputs: [
      {
        internalType: 'contract IBridgehub',
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
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: '_txDataHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '_txHash',
        type: 'bytes32',
      },
    ],
    name: 'bridgehubConfirmL2Transaction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_prevMsgSender',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_data',
        type: 'bytes',
      },
    ],
    name: 'bridgehubDeposit',
    outputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'magicValue',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'l2Contract',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'l2Calldata',
            type: 'bytes',
          },
          {
            internalType: 'bytes[]',
            name: 'factoryDeps',
            type: 'bytes[]',
          },
          {
            internalType: 'bytes32',
            name: 'txDataHash',
            type: 'bytes32',
          },
        ],
        internalType: 'struct L2TransactionRequestTwoBridgesInner',
        name: 'request',
        type: 'tuple',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_prevMsgSender',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_l1Token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
    ],
    name: 'bridgehubDepositBaseToken',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_depositSender',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_l1Token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: '_l2TxHash',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: '_l2BatchNumber',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_l2MessageIndex',
        type: 'uint256',
      },
      {
        internalType: 'uint16',
        name: '_l2TxNumberInBatch',
        type: 'uint16',
      },
      {
        internalType: 'bytes32[]',
        name: '_merkleProof',
        type: 'bytes32[]',
      },
    ],
    name: 'claimFailedDeposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_l2Receiver',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_l1Token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_mintValue',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_l2TxGasLimit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_l2TxGasPerPubdataByte',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_refundRecipient',
        type: 'address',
      },
    ],
    name: 'deposit',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'txHash',
        type: 'bytes32',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: '_l2TxHash',
        type: 'bytes32',
      },
    ],
    name: 'depositHappened',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_l2BatchNumber',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_l2MessageIndex',
        type: 'uint256',
      },
      {
        internalType: 'uint16',
        name: '_l2TxNumberInBatch',
        type: 'uint16',
      },
      {
        internalType: 'bytes',
        name: '_message',
        type: 'bytes',
      },
      {
        internalType: 'bytes32[]',
        name: '_merkleProof',
        type: 'bytes32[]',
      },
    ],
    name: 'finalizeWithdrawal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_l2BatchNumber',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_l2MessageIndex',
        type: 'uint256',
      },
    ],
    name: 'isWithdrawalFinalizedShared',
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
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
    ],
    name: 'l2BridgeAddress',
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
]
