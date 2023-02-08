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
