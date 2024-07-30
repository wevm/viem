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
