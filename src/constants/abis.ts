/* [Multicall3](https://github.com/mds1/multicall) */
export const multicall3Abi = [
  {
    inputs: [
      {
        components: [
          {
            name: 'target',
            type: 'address',
          },
          {
            name: 'allowFailure',
            type: 'bool',
          },
          {
            name: 'callData',
            type: 'bytes',
          },
        ],
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'aggregate3',
    outputs: [
      {
        components: [
          {
            name: 'success',
            type: 'bool',
          },
          {
            name: 'returnData',
            type: 'bytes',
          },
        ],
        name: 'returnData',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const universalResolverAbi = [
  {
    name: 'resolve',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'name', type: 'bytes' },
      { name: 'data', type: 'bytes' },
    ],
    outputs: [
      { name: '', type: 'bytes' },
      { name: 'address', type: 'address' },
    ],
  },
] as const

export const textResolverAbi = [
  {
    name: 'text',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'name', type: 'bytes32' },
      { name: 'key', type: 'string' },
    ],
    outputs: [{ name: '', type: 'string' }],
  },
] as const

export const singleAddressResolverAbi = [
  {
    name: 'addr',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'name', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const

// ERC-1271
// isValidSignature(bytes32 hash, bytes signature) → bytes4 magicValue
export const smartAccountAbi = [
  {
    name: 'isValidSignature',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'hash', type: 'bytes32' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [{ name: '', type: 'bytes4' }],
  },
] as const

// ERC-6492 - universal deployless signature validator contract
// constructor(address _signer, bytes32 _hash, bytes _signature) → bytes4 returnValue
// returnValue is either 0x1 (valid) or 0x0 (invalid)
export const universalSignatureValidatorAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_signer',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '_hash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: '_signature',
        type: 'bytes',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
] as const
