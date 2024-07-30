import { type Abi, parseAbi } from 'abitype'
import { test } from 'vitest'

import { wagmiContractConfig } from '~test/src/abis.js'
import { encodeDeployData } from './encodeDeployData.js'

test('default', () => {
  encodeDeployData({
    abi: parseAbi(['constructor(address to, uint256 tokenId)']),
    bytecode: '0x',
    args: ['0x', 123n],
  })
})

test('defined inline', () => {
  encodeDeployData({
    abi: [
      {
        type: 'constructor',
        stateMutability: 'nonpayable',
        inputs: [
          {
            type: 'address',
            name: 'to',
          },
          {
            type: 'uint256',
            name: 'tokenId',
          },
        ],
      },
    ],
    bytecode: '0x',
    args: ['0x', 123n],
  })
})

test('declared as Abi', () => {
  encodeDeployData({
    abi: wagmiContractConfig.abi as Abi,
    bytecode: '0x',
    args: ['0x'],
  })

  encodeDeployData({
    abi: wagmiContractConfig.abi as Abi,
    bytecode: '0x',
  })
})

test('no const assertion', () => {
  const abi = [
    {
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ]
  encodeDeployData({
    abi,
    bytecode: '0x',
    args: ['0x'],
  })

  encodeDeployData({
    abi,
    bytecode: '0x',
  })
})

test('abi has no constructor and no args', () => {
  encodeDeployData({
    bytecode: '0x420',
    abi: [
      {
        inputs: [],
        name: 'Foo',
        outputs: [],
        type: 'error',
      },
    ],
  })
})

test('abi has no constructor and includes args', () => {
  encodeDeployData({
    bytecode: '0x420',
    // @ts-expect-error
    args: [123n],
    abi: [
      {
        inputs: [],
        name: 'Foo',
        outputs: [],
        type: 'error',
      },
    ],
  })
})
