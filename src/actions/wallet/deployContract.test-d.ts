import { test } from 'vitest'

import { wagmiContractConfig } from '~test/src/abis.js'
import { walletClient, walletClientWithAccount } from '~test/src/utils.js'

import { type Abi, parseAbi } from 'abitype'
import { deployContract } from './deployContract.js'

const args = {
  ...wagmiContractConfig,
  account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  bytecode: '0x',
} as const

test('type: legacy', () => {
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
  })

  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
})

test('type: eip1559', () => {
  deployContract(walletClient, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip1559',
  })
  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
    type: 'eip1559',
  })
})

test('type: eip2930', () => {
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
  })

  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
})

test('default', () => {
  deployContract(walletClientWithAccount, {
    abi: parseAbi(['constructor(address to, uint256 tokenId)']),
    bytecode: '0x',
    args: ['0x', 123n],
  })
})

test('defined inline', () => {
  deployContract(walletClientWithAccount, {
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
  deployContract(walletClientWithAccount, {
    abi: wagmiContractConfig.abi as Abi,
    bytecode: '0x',
    args: ['0x'],
  })

  deployContract(walletClientWithAccount, {
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
  deployContract(walletClientWithAccount, {
    abi,
    bytecode: '0x',
    args: ['0x'],
  })

  deployContract(walletClientWithAccount, {
    abi,
    bytecode: '0x',
  })
})
