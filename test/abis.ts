export const mixedAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
    ],
    name: 'Unauthorized',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'foo',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'bar',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'barry',
        type: 'string',
      },
    ],
    name: 'Address',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bool',
        name: 'foo',
        type: 'bool',
      },
      {
        indexed: true,
        internalType: 'bool',
        name: 'bar',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'baz',
        type: 'string',
      },
    ],
    name: 'Boolean',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'foo',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'bar',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'baz',
        type: 'string',
      },
    ],
    name: 'Bytes32',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'int32',
        name: 'foo',
        type: 'int32',
      },
      {
        indexed: true,
        internalType: 'int32',
        name: 'bar',
        type: 'int32',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'baz',
        type: 'string',
      },
    ],
    name: 'Int32',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'string',
        name: 'foo',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'string',
        name: 'bar',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'baz',
        type: 'string',
      },
    ],
    name: 'String',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'foo',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'bar',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'baz',
        type: 'string',
      },
    ],
    name: 'Uint',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint24[2]',
        name: 'foo',
        type: 'uint24[2]',
      },
      {
        indexed: true,
        internalType: 'uint24[2]',
        name: 'bar',
        type: 'uint24[2]',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'baz',
        type: 'string',
      },
    ],
    name: 'Uint24StaticArray',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint32',
        name: 'foo',
        type: 'uint32',
      },
      {
        indexed: true,
        internalType: 'uint32',
        name: 'bar',
        type: 'uint32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'baz',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'barry',
        type: 'string',
      },
    ],
    name: 'Uint32',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256[]',
        name: 'foo',
        type: 'uint256[]',
      },
      {
        indexed: true,
        internalType: 'uint256[]',
        name: 'bar',
        type: 'uint256[]',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'baz',
        type: 'string',
      },
    ],
    name: 'UintDynamicArray',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'xIn',
        type: 'address[]',
      },
    ],
    name: 'dynamicAddressArray',
    outputs: [
      {
        internalType: 'address[]',
        name: 'xOut',
        type: 'address[]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bool[2]',
        name: 'xIn',
        type: 'bool[2]',
      },
    ],
    name: 'dynamicBooleanArray',
    outputs: [
      {
        internalType: 'bool[2]',
        name: 'xOut',
        type: 'bool[2]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'xIn',
        type: 'bytes',
      },
    ],
    name: 'dynamicBytes',
    outputs: [
      {
        internalType: 'bytes',
        name: 'xOut',
        type: 'bytes',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes[]',
        name: 'xIn',
        type: 'bytes[]',
      },
    ],
    name: 'dynamicBytesArray',
    outputs: [
      {
        internalType: 'bytes[]',
        name: 'xOut',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int256[]',
        name: 'xIn',
        type: 'int256[]',
      },
    ],
    name: 'dynamicIntArray',
    outputs: [
      {
        internalType: 'int256[]',
        name: 'xOut',
        type: 'int256[]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'xIn',
        type: 'string',
      },
    ],
    name: 'dynamicString',
    outputs: [
      {
        internalType: 'string',
        name: 'xOut',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string[]',
        name: 'xIn',
        type: 'string[]',
      },
    ],
    name: 'dynamicStringArray',
    outputs: [
      {
        internalType: 'string[]',
        name: 'xOut',
        type: 'string[]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string[][][]',
        name: 'xIn',
        type: 'string[][][]',
      },
    ],
    name: 'dynamicStringNestedDynamicArray',
    outputs: [
      {
        internalType: 'string[][][]',
        name: 'xOut',
        type: 'string[][][]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string[2][3]',
        name: 'xIn',
        type: 'string[2][3]',
      },
    ],
    name: 'dynamicStringNestedStaticArray',
    outputs: [
      {
        internalType: 'string[2][3]',
        name: 'xOut',
        type: 'string[2][3]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string[2]',
        name: 'xIn',
        type: 'string[2]',
      },
    ],
    name: 'dynamicStringStaticArray',
    outputs: [
      {
        internalType: 'string[2]',
        name: 'xOut',
        type: 'string[2]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256[]',
            name: 'x',
            type: 'uint256[]',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'string[]',
            name: 'z',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Baz',
        name: 'bazIn',
        type: 'tuple',
      },
    ],
    name: 'dynamicStruct',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256[]',
            name: 'x',
            type: 'uint256[]',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'string[]',
            name: 'z',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Baz',
        name: 'bazOut',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256[]',
                name: 'x',
                type: 'uint256[]',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'string[]',
                name: 'z',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Baz',
            name: 'foo',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'a',
            type: 'uint256',
          },
          {
            internalType: 'string[]',
            name: 'b',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Wagmi',
        name: 'wagmiIn',
        type: 'tuple',
      },
    ],
    name: 'dynamicStruct2',
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256[]',
                name: 'x',
                type: 'uint256[]',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'string[]',
                name: 'z',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Baz',
            name: 'foo',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'a',
            type: 'uint256',
          },
          {
            internalType: 'string[]',
            name: 'b',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Wagmi',
        name: 'wagmiOut',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint256[]',
                    name: 'x',
                    type: 'uint256[]',
                  },
                  {
                    internalType: 'bool',
                    name: 'y',
                    type: 'bool',
                  },
                  {
                    internalType: 'string[]',
                    name: 'z',
                    type: 'string[]',
                  },
                ],
                internalType: 'struct ABIExample.Baz',
                name: 'foo',
                type: 'tuple',
              },
              {
                internalType: 'uint256',
                name: 'a',
                type: 'uint256',
              },
              {
                internalType: 'string[]',
                name: 'b',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Wagmi',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint256[]',
                    name: 'x',
                    type: 'uint256[]',
                  },
                  {
                    internalType: 'bool',
                    name: 'y',
                    type: 'bool',
                  },
                  {
                    internalType: 'string[]',
                    name: 'z',
                    type: 'string[]',
                  },
                ],
                internalType: 'struct ABIExample.Baz',
                name: 'foo',
                type: 'tuple',
              },
              {
                internalType: 'uint256',
                name: 'a',
                type: 'uint256',
              },
              {
                internalType: 'string[]',
                name: 'b',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Wagmi',
            name: 'bar',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'c',
            type: 'uint256',
          },
          {
            internalType: 'string[]',
            name: 'd',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Gmi',
        name: 'gmiIn',
        type: 'tuple',
      },
    ],
    name: 'dynamicStruct3',
    outputs: [
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint256[]',
                    name: 'x',
                    type: 'uint256[]',
                  },
                  {
                    internalType: 'bool',
                    name: 'y',
                    type: 'bool',
                  },
                  {
                    internalType: 'string[]',
                    name: 'z',
                    type: 'string[]',
                  },
                ],
                internalType: 'struct ABIExample.Baz',
                name: 'foo',
                type: 'tuple',
              },
              {
                internalType: 'uint256',
                name: 'a',
                type: 'uint256',
              },
              {
                internalType: 'string[]',
                name: 'b',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Wagmi',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint256[]',
                    name: 'x',
                    type: 'uint256[]',
                  },
                  {
                    internalType: 'bool',
                    name: 'y',
                    type: 'bool',
                  },
                  {
                    internalType: 'string[]',
                    name: 'z',
                    type: 'string[]',
                  },
                ],
                internalType: 'struct ABIExample.Baz',
                name: 'foo',
                type: 'tuple',
              },
              {
                internalType: 'uint256',
                name: 'a',
                type: 'uint256',
              },
              {
                internalType: 'string[]',
                name: 'b',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Wagmi',
            name: 'bar',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'c',
            type: 'uint256',
          },
          {
            internalType: 'string[]',
            name: 'd',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Gmi',
        name: 'gmiOut',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256[]',
            name: 'x',
            type: 'uint256[]',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'string[]',
            name: 'z',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Baz[]',
        name: 'bazIn',
        type: 'tuple[]',
      },
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint256[]',
                    name: 'x',
                    type: 'uint256[]',
                  },
                  {
                    internalType: 'bool',
                    name: 'y',
                    type: 'bool',
                  },
                  {
                    internalType: 'string[]',
                    name: 'z',
                    type: 'string[]',
                  },
                ],
                internalType: 'struct ABIExample.Baz',
                name: 'foo',
                type: 'tuple',
              },
              {
                internalType: 'uint256',
                name: 'a',
                type: 'uint256',
              },
              {
                internalType: 'string[]',
                name: 'b',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Wagmi',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint256[]',
                    name: 'x',
                    type: 'uint256[]',
                  },
                  {
                    internalType: 'bool',
                    name: 'y',
                    type: 'bool',
                  },
                  {
                    internalType: 'string[]',
                    name: 'z',
                    type: 'string[]',
                  },
                ],
                internalType: 'struct ABIExample.Baz',
                name: 'foo',
                type: 'tuple',
              },
              {
                internalType: 'uint256',
                name: 'a',
                type: 'uint256',
              },
              {
                internalType: 'string[]',
                name: 'b',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Wagmi',
            name: 'bar',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'c',
            type: 'uint256',
          },
          {
            internalType: 'string[]',
            name: 'd',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Gmi[]',
        name: 'gmiIn',
        type: 'tuple[]',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256[]',
                name: 'x',
                type: 'uint256[]',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'string[]',
                name: 'z',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Baz',
            name: 'foo',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'a',
            type: 'uint256',
          },
          {
            internalType: 'string[]',
            name: 'b',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Wagmi',
        name: 'wagmiIn',
        type: 'tuple',
      },
    ],
    name: 'dynamicStructDynamicArrayParams',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256[]',
            name: 'x',
            type: 'uint256[]',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'string[]',
            name: 'z',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Baz[]',
        name: 'bazOut',
        type: 'tuple[]',
      },
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint256[]',
                    name: 'x',
                    type: 'uint256[]',
                  },
                  {
                    internalType: 'bool',
                    name: 'y',
                    type: 'bool',
                  },
                  {
                    internalType: 'string[]',
                    name: 'z',
                    type: 'string[]',
                  },
                ],
                internalType: 'struct ABIExample.Baz',
                name: 'foo',
                type: 'tuple',
              },
              {
                internalType: 'uint256',
                name: 'a',
                type: 'uint256',
              },
              {
                internalType: 'string[]',
                name: 'b',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Wagmi',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint256[]',
                    name: 'x',
                    type: 'uint256[]',
                  },
                  {
                    internalType: 'bool',
                    name: 'y',
                    type: 'bool',
                  },
                  {
                    internalType: 'string[]',
                    name: 'z',
                    type: 'string[]',
                  },
                ],
                internalType: 'struct ABIExample.Baz',
                name: 'foo',
                type: 'tuple',
              },
              {
                internalType: 'uint256',
                name: 'a',
                type: 'uint256',
              },
              {
                internalType: 'string[]',
                name: 'b',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Wagmi',
            name: 'bar',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'c',
            type: 'uint256',
          },
          {
            internalType: 'string[]',
            name: 'd',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Gmi[]',
        name: 'gmiOut',
        type: 'tuple[]',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256[]',
                name: 'x',
                type: 'uint256[]',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'string[]',
                name: 'z',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Baz',
            name: 'foo',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'a',
            type: 'uint256',
          },
          {
            internalType: 'string[]',
            name: 'b',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Wagmi',
        name: 'wagmiOut',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256[]',
            name: 'x',
            type: 'uint256[]',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'string[]',
            name: 'z',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Baz',
        name: 'bazIn',
        type: 'tuple',
      },
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint256[]',
                    name: 'x',
                    type: 'uint256[]',
                  },
                  {
                    internalType: 'bool',
                    name: 'y',
                    type: 'bool',
                  },
                  {
                    internalType: 'string[]',
                    name: 'z',
                    type: 'string[]',
                  },
                ],
                internalType: 'struct ABIExample.Baz',
                name: 'foo',
                type: 'tuple',
              },
              {
                internalType: 'uint256',
                name: 'a',
                type: 'uint256',
              },
              {
                internalType: 'string[]',
                name: 'b',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Wagmi',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint256[]',
                    name: 'x',
                    type: 'uint256[]',
                  },
                  {
                    internalType: 'bool',
                    name: 'y',
                    type: 'bool',
                  },
                  {
                    internalType: 'string[]',
                    name: 'z',
                    type: 'string[]',
                  },
                ],
                internalType: 'struct ABIExample.Baz',
                name: 'foo',
                type: 'tuple',
              },
              {
                internalType: 'uint256',
                name: 'a',
                type: 'uint256',
              },
              {
                internalType: 'string[]',
                name: 'b',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Wagmi',
            name: 'bar',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'c',
            type: 'uint256',
          },
          {
            internalType: 'string[]',
            name: 'd',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Gmi',
        name: 'gmiIn',
        type: 'tuple',
      },
    ],
    name: 'dynamicStructParams',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256[]',
            name: 'x',
            type: 'uint256[]',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'string[]',
            name: 'z',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Baz',
        name: 'bazOut',
        type: 'tuple',
      },
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint256[]',
                    name: 'x',
                    type: 'uint256[]',
                  },
                  {
                    internalType: 'bool',
                    name: 'y',
                    type: 'bool',
                  },
                  {
                    internalType: 'string[]',
                    name: 'z',
                    type: 'string[]',
                  },
                ],
                internalType: 'struct ABIExample.Baz',
                name: 'foo',
                type: 'tuple',
              },
              {
                internalType: 'uint256',
                name: 'a',
                type: 'uint256',
              },
              {
                internalType: 'string[]',
                name: 'b',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Wagmi',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint256[]',
                    name: 'x',
                    type: 'uint256[]',
                  },
                  {
                    internalType: 'bool',
                    name: 'y',
                    type: 'bool',
                  },
                  {
                    internalType: 'string[]',
                    name: 'z',
                    type: 'string[]',
                  },
                ],
                internalType: 'struct ABIExample.Baz',
                name: 'foo',
                type: 'tuple',
              },
              {
                internalType: 'uint256',
                name: 'a',
                type: 'uint256',
              },
              {
                internalType: 'string[]',
                name: 'b',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Wagmi',
            name: 'bar',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'c',
            type: 'uint256',
          },
          {
            internalType: 'string[]',
            name: 'd',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Gmi',
        name: 'gmiOut',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256[]',
            name: 'x',
            type: 'uint256[]',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'string[]',
            name: 'z',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Baz[2]',
        name: 'bazIn',
        type: 'tuple[2]',
      },
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint256[]',
                    name: 'x',
                    type: 'uint256[]',
                  },
                  {
                    internalType: 'bool',
                    name: 'y',
                    type: 'bool',
                  },
                  {
                    internalType: 'string[]',
                    name: 'z',
                    type: 'string[]',
                  },
                ],
                internalType: 'struct ABIExample.Baz',
                name: 'foo',
                type: 'tuple',
              },
              {
                internalType: 'uint256',
                name: 'a',
                type: 'uint256',
              },
              {
                internalType: 'string[]',
                name: 'b',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Wagmi',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint256[]',
                    name: 'x',
                    type: 'uint256[]',
                  },
                  {
                    internalType: 'bool',
                    name: 'y',
                    type: 'bool',
                  },
                  {
                    internalType: 'string[]',
                    name: 'z',
                    type: 'string[]',
                  },
                ],
                internalType: 'struct ABIExample.Baz',
                name: 'foo',
                type: 'tuple',
              },
              {
                internalType: 'uint256',
                name: 'a',
                type: 'uint256',
              },
              {
                internalType: 'string[]',
                name: 'b',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Wagmi',
            name: 'bar',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'c',
            type: 'uint256',
          },
          {
            internalType: 'string[]',
            name: 'd',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Gmi[3]',
        name: 'gmiIn',
        type: 'tuple[3]',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256[]',
                name: 'x',
                type: 'uint256[]',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'string[]',
                name: 'z',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Baz',
            name: 'foo',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'a',
            type: 'uint256',
          },
          {
            internalType: 'string[]',
            name: 'b',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Wagmi',
        name: 'wagmiIn',
        type: 'tuple',
      },
    ],
    name: 'dynamicStructStaticArrayParams',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256[]',
            name: 'x',
            type: 'uint256[]',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'string[]',
            name: 'z',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Baz[2]',
        name: 'bazOut',
        type: 'tuple[2]',
      },
      {
        components: [
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint256[]',
                    name: 'x',
                    type: 'uint256[]',
                  },
                  {
                    internalType: 'bool',
                    name: 'y',
                    type: 'bool',
                  },
                  {
                    internalType: 'string[]',
                    name: 'z',
                    type: 'string[]',
                  },
                ],
                internalType: 'struct ABIExample.Baz',
                name: 'foo',
                type: 'tuple',
              },
              {
                internalType: 'uint256',
                name: 'a',
                type: 'uint256',
              },
              {
                internalType: 'string[]',
                name: 'b',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Wagmi',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                components: [
                  {
                    internalType: 'uint256[]',
                    name: 'x',
                    type: 'uint256[]',
                  },
                  {
                    internalType: 'bool',
                    name: 'y',
                    type: 'bool',
                  },
                  {
                    internalType: 'string[]',
                    name: 'z',
                    type: 'string[]',
                  },
                ],
                internalType: 'struct ABIExample.Baz',
                name: 'foo',
                type: 'tuple',
              },
              {
                internalType: 'uint256',
                name: 'a',
                type: 'uint256',
              },
              {
                internalType: 'string[]',
                name: 'b',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Wagmi',
            name: 'bar',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'c',
            type: 'uint256',
          },
          {
            internalType: 'string[]',
            name: 'd',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Gmi[3]',
        name: 'gmiOut',
        type: 'tuple[3]',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256[]',
                name: 'x',
                type: 'uint256[]',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'string[]',
                name: 'z',
                type: 'string[]',
              },
            ],
            internalType: 'struct ABIExample.Baz',
            name: 'foo',
            type: 'tuple',
          },
          {
            internalType: 'uint256',
            name: 'a',
            type: 'uint256',
          },
          {
            internalType: 'string[]',
            name: 'b',
            type: 'string[]',
          },
        ],
        internalType: 'struct ABIExample.Wagmi',
        name: 'wagmiOut',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'xIn',
        type: 'uint256[]',
      },
    ],
    name: 'dynamicUintArray',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'xOut',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[][]',
        name: 'xIn',
        type: 'uint256[][]',
      },
    ],
    name: 'dynamicUintNestedArray',
    outputs: [
      {
        internalType: 'uint256[][]',
        name: 'xOut',
        type: 'uint256[][]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[][][]',
        name: 'xIn',
        type: 'uint256[][][]',
      },
    ],
    name: 'dynamicUintNestedNestedArray',
    outputs: [
      {
        internalType: 'uint256[][][]',
        name: 'xOut',
        type: 'uint256[][][]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'xIn',
        type: 'address',
      },
    ],
    name: 'staticAddress',
    outputs: [
      {
        internalType: 'address',
        name: 'xOut',
        type: 'address',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[2]',
        name: 'xIn',
        type: 'address[2]',
      },
    ],
    name: 'staticAddressArray',
    outputs: [
      {
        internalType: 'address[2]',
        name: 'xOut',
        type: 'address[2]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: 'xIn',
        type: 'bool',
      },
    ],
    name: 'staticBoolean',
    outputs: [
      {
        internalType: 'bool',
        name: 'xOut',
        type: 'bool',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bool[2]',
        name: 'xIn',
        type: 'bool[2]',
      },
    ],
    name: 'staticBooleanArray',
    outputs: [
      {
        internalType: 'bool[2]',
        name: 'xOut',
        type: 'bool[2]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes16',
        name: 'xIn',
        type: 'bytes16',
      },
    ],
    name: 'staticBytes16',
    outputs: [
      {
        internalType: 'bytes16',
        name: 'xOut',
        type: 'bytes16',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes8',
        name: 'xIn',
        type: 'bytes8',
      },
    ],
    name: 'staticBytes8',
    outputs: [
      {
        internalType: 'bytes8',
        name: 'xOut',
        type: 'bytes8',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes8[2]',
        name: 'xIn',
        type: 'bytes8[2]',
      },
    ],
    name: 'staticBytes8Array',
    outputs: [
      {
        internalType: 'bytes8[2]',
        name: 'xOut',
        type: 'bytes8[2]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int256',
        name: 'xIn',
        type: 'int256',
      },
    ],
    name: 'staticInt',
    outputs: [
      {
        internalType: 'int256',
        name: 'xOut',
        type: 'int256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int32',
        name: 'xIn',
        type: 'int32',
      },
    ],
    name: 'staticInt256',
    outputs: [
      {
        internalType: 'int256',
        name: 'xOut',
        type: 'int256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int32',
        name: 'xIn',
        type: 'int32',
      },
    ],
    name: 'staticInt32',
    outputs: [
      {
        internalType: 'int32',
        name: 'xOut',
        type: 'int32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int8',
        name: 'xIn',
        type: 'int8',
      },
    ],
    name: 'staticInt8',
    outputs: [
      {
        internalType: 'int8',
        name: 'xOut',
        type: 'int8',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'int256[3]',
        name: 'xIn',
        type: 'int256[3]',
      },
    ],
    name: 'staticIntArray',
    outputs: [
      {
        internalType: 'int256[3]',
        name: 'xOut',
        type: 'int256[3]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo',
        name: 'fooIn',
        type: 'tuple',
      },
    ],
    name: 'staticStruct',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo',
        name: 'fooOut',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'baz',
            type: 'tuple',
          },
          {
            internalType: 'uint8[2]',
            name: 'x',
            type: 'uint8[2]',
          },
        ],
        internalType: 'struct ABIExample.Bar',
        name: 'barIn',
        type: 'tuple',
      },
    ],
    name: 'staticStruct2',
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'baz',
            type: 'tuple',
          },
          {
            internalType: 'uint8[2]',
            name: 'x',
            type: 'uint8[2]',
          },
        ],
        internalType: 'struct ABIExample.Bar',
        name: 'barOut',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo[]',
        name: 'fooIn',
        type: 'tuple[]',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'baz',
            type: 'tuple',
          },
          {
            internalType: 'uint8[2]',
            name: 'x',
            type: 'uint8[2]',
          },
        ],
        internalType: 'struct ABIExample.Bar[]',
        name: 'barIn',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo',
        name: 'fooIn2',
        type: 'tuple',
      },
    ],
    name: 'staticStructDynamicArrayParams',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo[]',
        name: 'fooOut',
        type: 'tuple[]',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'baz',
            type: 'tuple',
          },
          {
            internalType: 'uint8[2]',
            name: 'x',
            type: 'uint8[2]',
          },
        ],
        internalType: 'struct ABIExample.Bar[]',
        name: 'barOut',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo',
        name: 'fooOut2',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo[][][]',
        name: 'fooIn',
        type: 'tuple[][][]',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'baz',
            type: 'tuple',
          },
          {
            internalType: 'uint8[2]',
            name: 'x',
            type: 'uint8[2]',
          },
        ],
        internalType: 'struct ABIExample.Bar[][][]',
        name: 'barIn',
        type: 'tuple[][][]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo',
        name: 'fooIn2',
        type: 'tuple',
      },
    ],
    name: 'staticStructDynamicNestedArrayParams',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo[][][]',
        name: 'fooOut',
        type: 'tuple[][][]',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'baz',
            type: 'tuple',
          },
          {
            internalType: 'uint8[2]',
            name: 'x',
            type: 'uint8[2]',
          },
        ],
        internalType: 'struct ABIExample.Bar[][][]',
        name: 'barOut',
        type: 'tuple[][][]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo',
        name: 'fooOut2',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo',
        name: 'fooIn',
        type: 'tuple',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'baz',
            type: 'tuple',
          },
          {
            internalType: 'uint8[2]',
            name: 'x',
            type: 'uint8[2]',
          },
        ],
        internalType: 'struct ABIExample.Bar',
        name: 'barIn',
        type: 'tuple',
      },
    ],
    name: 'staticStructParams',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo',
        name: 'fooOut',
        type: 'tuple',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'baz',
            type: 'tuple',
          },
          {
            internalType: 'uint8[2]',
            name: 'x',
            type: 'uint8[2]',
          },
        ],
        internalType: 'struct ABIExample.Bar',
        name: 'barOut',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo',
        name: 'fooIn',
        type: 'tuple',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'baz',
            type: 'tuple',
          },
          {
            internalType: 'uint8[2]',
            name: 'x',
            type: 'uint8[2]',
          },
        ],
        internalType: 'struct ABIExample.Bar',
        name: 'barIn',
        type: 'tuple',
      },
    ],
    name: 'staticStructParamsUnnamed',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo',
        name: '',
        type: 'tuple',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'baz',
            type: 'tuple',
          },
          {
            internalType: 'uint8[2]',
            name: 'x',
            type: 'uint8[2]',
          },
        ],
        internalType: 'struct ABIExample.Bar',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo[2]',
        name: 'fooIn',
        type: 'tuple[2]',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'baz',
            type: 'tuple',
          },
          {
            internalType: 'uint8[2]',
            name: 'x',
            type: 'uint8[2]',
          },
        ],
        internalType: 'struct ABIExample.Bar[3]',
        name: 'barIn',
        type: 'tuple[3]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo',
        name: 'fooIn2',
        type: 'tuple',
      },
    ],
    name: 'staticStructStaticArrayParams',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo[2]',
        name: 'fooOut',
        type: 'tuple[2]',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'baz',
            type: 'tuple',
          },
          {
            internalType: 'uint8[2]',
            name: 'x',
            type: 'uint8[2]',
          },
        ],
        internalType: 'struct ABIExample.Bar[3]',
        name: 'barOut',
        type: 'tuple[3]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo',
        name: 'fooOut2',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo[2][3]',
        name: 'fooIn',
        type: 'tuple[2][3]',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'baz',
            type: 'tuple',
          },
          {
            internalType: 'uint8[2]',
            name: 'x',
            type: 'uint8[2]',
          },
        ],
        internalType: 'struct ABIExample.Bar[3][2]',
        name: 'barIn',
        type: 'tuple[3][2]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo',
        name: 'fooIn2',
        type: 'tuple',
      },
    ],
    name: 'staticStructStaticNestedArrayParams',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo[2][3]',
        name: 'fooOut',
        type: 'tuple[2][3]',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'foo',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'x',
                type: 'uint256',
              },
              {
                internalType: 'bool',
                name: 'y',
                type: 'bool',
              },
              {
                internalType: 'address',
                name: 'z',
                type: 'address',
              },
            ],
            internalType: 'struct ABIExample.Foo',
            name: 'baz',
            type: 'tuple',
          },
          {
            internalType: 'uint8[2]',
            name: 'x',
            type: 'uint8[2]',
          },
        ],
        internalType: 'struct ABIExample.Bar[3][2]',
        name: 'barOut',
        type: 'tuple[3][2]',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'y',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'z',
            type: 'address',
          },
        ],
        internalType: 'struct ABIExample.Foo',
        name: 'fooOut2',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'xIn',
        type: 'uint256',
      },
    ],
    name: 'staticUint',
    outputs: [
      {
        internalType: 'uint256',
        name: 'xOut',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'xIn',
        type: 'uint32',
      },
    ],
    name: 'staticUint256',
    outputs: [
      {
        internalType: 'uint256',
        name: 'xOut',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'xIn',
        type: 'uint32',
      },
    ],
    name: 'staticUint32',
    outputs: [
      {
        internalType: 'uint32',
        name: 'xOut',
        type: 'uint32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'xIn',
        type: 'uint8',
      },
    ],
    name: 'staticUint8',
    outputs: [
      {
        internalType: 'uint8',
        name: 'xOut',
        type: 'uint8',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[3]',
        name: 'xIn',
        type: 'uint256[3]',
      },
    ],
    name: 'staticUintArray',
    outputs: [
      {
        internalType: 'uint256[3]',
        name: 'xOut',
        type: 'uint256[3]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[3][2]',
        name: 'xIn',
        type: 'uint256[3][2]',
      },
    ],
    name: 'staticUintNestedArray',
    outputs: [
      {
        internalType: 'uint256[3][2]',
        name: 'xOut',
        type: 'uint256[3][2]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[3][2][4]',
        name: 'xIn',
        type: 'uint256[3][2][4]',
      },
    ],
    name: 'staticUintNestedArray2',
    outputs: [
      {
        internalType: 'uint256[3][2][4]',
        name: 'xOut',
        type: 'uint256[3][2][4]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'xIn',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'yIn',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'zIn',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'fooIn',
        type: 'string',
      },
    ],
    name: 'stringStringUintString',
    outputs: [
      {
        internalType: 'string',
        name: 'yOut',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'xIn',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'yIn',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'zIn',
        type: 'bool',
      },
    ],
    name: 'stringUintBool',
    outputs: [
      {
        internalType: 'uint256',
        name: 'yOut',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[2]',
        name: 'xIn',
        type: 'uint256[2]',
      },
      {
        internalType: 'bool',
        name: 'yIn',
        type: 'bool',
      },
      {
        internalType: 'string',
        name: 'zIn',
        type: 'string',
      },
    ],
    name: 'uintArrayBoolString',
    outputs: [
      {
        internalType: 'uint256[2]',
        name: 'xOut',
        type: 'uint256[2]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'xIn',
        type: 'uint256[]',
      },
      {
        internalType: 'bool',
        name: 'yIn',
        type: 'bool',
      },
      {
        internalType: 'string',
        name: 'zIn',
        type: 'string',
      },
    ],
    name: 'uintArrayBoolString2',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'xOut',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: 'xIn',
        type: 'uint256[]',
      },
      {
        internalType: 'bool',
        name: 'yIn',
        type: 'bool',
      },
      {
        internalType: 'string',
        name: 'zIn',
        type: 'string',
      },
    ],
    name: 'uintArrayBoolString2Return',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'xOut',
        type: 'uint256[]',
      },
      {
        internalType: 'bool',
        name: 'yOut',
        type: 'bool',
      },
      {
        internalType: 'string',
        name: 'zOut',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[2]',
        name: 'xIn',
        type: 'uint256[2]',
      },
      {
        internalType: 'bool',
        name: 'yIn',
        type: 'bool',
      },
      {
        internalType: 'string[3]',
        name: 'zIn',
        type: 'string[3]',
      },
    ],
    name: 'uintArrayBoolStringArray',
    outputs: [
      {
        internalType: 'uint256[2]',
        name: 'xOut',
        type: 'uint256[2]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[2]',
        name: 'xIn',
        type: 'uint256[2]',
      },
      {
        internalType: 'bool',
        name: 'yIn',
        type: 'bool',
      },
      {
        internalType: 'string[]',
        name: 'zIn',
        type: 'string[]',
      },
    ],
    name: 'uintArrayBoolStringArray2',
    outputs: [
      {
        internalType: 'uint256[2]',
        name: 'xOut',
        type: 'uint256[2]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[2]',
        name: 'xIn',
        type: 'uint256[2]',
      },
      {
        internalType: 'bool',
        name: 'yIn',
        type: 'bool',
      },
      {
        internalType: 'string[3]',
        name: 'zIn',
        type: 'string[3]',
      },
    ],
    name: 'uintArrayBoolStringArrayReturn',
    outputs: [
      {
        internalType: 'uint256[2]',
        name: 'xOut',
        type: 'uint256[2]',
      },
      {
        internalType: 'bool',
        name: 'yOut',
        type: 'bool',
      },
      {
        internalType: 'string[3]',
        name: 'zOut',
        type: 'string[3]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[2]',
        name: 'xIn',
        type: 'uint256[2]',
      },
      {
        internalType: 'bool',
        name: 'yIn',
        type: 'bool',
      },
      {
        internalType: 'string[]',
        name: 'zIn',
        type: 'string[]',
      },
    ],
    name: 'uintArrayBoolStringArrayReturn',
    outputs: [
      {
        internalType: 'uint256[2]',
        name: 'xOut',
        type: 'uint256[2]',
      },
      {
        internalType: 'bool',
        name: 'yOut',
        type: 'bool',
      },
      {
        internalType: 'string[]',
        name: 'zOut',
        type: 'string[]',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[2]',
        name: 'xIn',
        type: 'uint256[2]',
      },
      {
        internalType: 'bool',
        name: 'yIn',
        type: 'bool',
      },
      {
        internalType: 'string',
        name: 'zIn',
        type: 'string',
      },
    ],
    name: 'uintArrayBoolStringReturn',
    outputs: [
      {
        internalType: 'uint256[2]',
        name: 'xOut',
        type: 'uint256[2]',
      },
      {
        internalType: 'bool',
        name: 'yOut',
        type: 'bool',
      },
      {
        internalType: 'string',
        name: 'zOut',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'xIn',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'yIn',
        type: 'bool',
      },
      {
        internalType: 'address',
        name: 'zIn',
        type: 'address',
      },
    ],
    name: 'uintBoolAddress',
    outputs: [
      {
        internalType: 'uint256',
        name: 'xOut',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'xIn',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'yIn',
        type: 'bool',
      },
      {
        internalType: 'address',
        name: 'zIn',
        type: 'address',
      },
    ],
    name: 'uintBoolAddressReturn',
    outputs: [
      {
        internalType: 'uint256',
        name: 'xOut',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'yOut',
        type: 'bool',
      },
      {
        internalType: 'address',
        name: 'zOut',
        type: 'address',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'xIn',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'yIn',
        type: 'bool',
      },
      {
        internalType: 'address',
        name: 'zIn',
        type: 'address',
      },
    ],
    name: 'uintBoolAddressReturnUnnamed',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'xIn',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'yIn',
        type: 'bool',
      },
      {
        internalType: 'string',
        name: 'zIn',
        type: 'string',
      },
    ],
    name: 'uintBoolStringReturn',
    outputs: [
      {
        internalType: 'uint256',
        name: 'xOut',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'yOut',
        type: 'bool',
      },
      {
        internalType: 'string',
        name: 'zOut',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'wagmi',
    outputs: [
      {
        internalType: 'uint256',
        name: 'x',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'y',
        type: 'bool',
      },
      {
        internalType: 'address',
        name: 'z',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
