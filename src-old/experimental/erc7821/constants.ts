export const abi = [
  {
    type: 'fallback',
    stateMutability: 'payable',
  },
  {
    type: 'receive',
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'execute',
    inputs: [
      {
        name: 'mode',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'executionData',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'supportsExecutionMode',
    inputs: [
      {
        name: 'mode',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'result',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'error',
    name: 'FnSelectorNotRecognized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UnsupportedExecutionMode',
    inputs: [],
  },
] as const

export const executionMode = {
  default: '0x0100000000000000000000000000000000000000000000000000000000000000',
  opData: '0x0100000000007821000100000000000000000000000000000000000000000000',
  batchOfBatches:
    '0x0100000000007821000200000000000000000000000000000000000000000000',
} as const
