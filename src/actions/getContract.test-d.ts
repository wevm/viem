import type {
  Abi,
  Address,
  ExtractAbiEventNames,
  ExtractAbiFunctionNames,
  ResolvedConfig,
} from 'abitype'
import { wagmiMintExampleAbi } from 'abitype/test'
import { expectTypeOf, test } from 'vitest'

import {
  wagmiContractConfig,
  publicClient,
  localHttpUrl,
  anvilChain,
} from '../_test'
import { createWalletClient, http } from '../clients'
import { getContract } from './getContract'
import type { Account } from '../types'

const walletClient = createWalletClient({
  account: '0x',
  chain: anvilChain,
  transport: http(localHttpUrl),
})
const walletClientWithoutAccount = createWalletClient({
  chain: anvilChain,
  transport: http(localHttpUrl),
})
const walletClientWithoutChain = createWalletClient({
  account: '0x',
  transport: http(localHttpUrl),
})

const abi = wagmiMintExampleAbi
const contract = getContract({
  abi,
  // abi: [
  //   {
  //     inputs: [],
  //     name: 'mint',
  //     outputs: [],
  //     stateMutability: 'nonpayable',
  //     type: 'function',
  //   },
  // ],
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  publicClient,
  walletClient: walletClient,
})

contract.write.mint()

contract.write.safeTransferFrom(['0x', '0x', 1n])
contract.read.totalSupply({ blockNumber: 1n })
contract.read.balanceOf(['0x'], { blockNumber: 1n })
contract.simulate.safeTransferFrom(['0x', '0x', 1n])
contract.estimateGas.safeTransferFrom(['0x', '0x', 1n])
contract.watchEvent.Transfer({
  args: {
    from: '0x',
    to: '0x',
  },
  onLogs: () => {},
})

// -----------------------------------------------------------------------------

type ReadFunctionNames = ExtractAbiFunctionNames<
  typeof wagmiContractConfig.abi,
  'pure' | 'view'
>
type WriteFunctionNames = ExtractAbiFunctionNames<
  typeof wagmiContractConfig.abi,
  'nonpayable' | 'payable'
>
type EventNames = ExtractAbiEventNames<typeof wagmiContractConfig.abi>

test('basic', () => {
  const contract = getContract({
    //  ^?
    ...wagmiContractConfig,
    publicClient,
    walletClient,
  })

  expectTypeOf(contract).toMatchTypeOf<{
    estimateGas: {
      [_ in WriteFunctionNames]: Function
    }
    read: {
      [_ in ReadFunctionNames]: Function
    }
    simulate: {
      [_ in WriteFunctionNames]: Function
    }
    watchEvent: {
      [_ in EventNames]: Function
    }
    write: {
      [_ in WriteFunctionNames]: Function
    }
  }>()
})

test('no wallet client', () => {
  const contract = getContract({
    //  ^?
    ...wagmiContractConfig,
    publicClient,
  })

  expectTypeOf(contract).toMatchTypeOf<{
    estimateGas: {
      [_ in WriteFunctionNames]: Function
    }
    read: {
      [_ in ReadFunctionNames]: Function
    }
    simulate: {
      [_ in WriteFunctionNames]: Function
    }
    watchEvent: {
      [_ in EventNames]: Function
    }
  }>()
  expectTypeOf(contract).not.toMatchTypeOf<{
    write: {
      [_ in WriteFunctionNames]: Function
    }
  }>()
})

test('no public client', () => {
  const contract = getContract({
    //  ^?
    ...wagmiContractConfig,
    walletClient,
  })

  expectTypeOf(contract).toMatchTypeOf<{
    write: {
      [_ in WriteFunctionNames]: Function
    }
  }>()
  expectTypeOf(contract).not.toMatchTypeOf<{
    estimateGas: {
      [_ in WriteFunctionNames]: Function
    }
    read: {
      [_ in ReadFunctionNames]: Function
    }
    simulate: {
      [_ in WriteFunctionNames]: Function
    }
    watchEvent: {
      [_ in EventNames]: Function
    }
  }>()
})

test('without const assertion', () => {
  const abi = [
    {
      inputs: [{ name: 'owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ]
  const contract = getContract({
    ...wagmiContractConfig,
    abi,
    publicClient,
    walletClient,
  })

  expectTypeOf(contract).toMatchTypeOf<{
    estimateGas: {
      [_: string]: Function
    }
    read: {
      [_: string]: Function
    }
    simulate: {
      [_: string]: Function
    }
    watchEvent: {
      [_: string]: Function
    }
    write: {
      [_: string]: Function
    }
  }>()
})

test('declared as Abi type', () => {
  const abi: Abi = []
  const contract = getContract({
    ...wagmiContractConfig,
    abi,
    publicClient,
    walletClient: walletClient,
  })

  expectTypeOf(contract).toMatchTypeOf<{
    estimateGas: {
      [_: string]: Function
    }
    read: {
      [_: string]: Function
    }
    simulate: {
      [_: string]: Function
    }
    watchEvent: {
      [_: string]: Function
    }
    write: {
      [_: string]: Function
    }
  }>()
})

test('defined inline', () => {
  const contract = getContract({
    ...wagmiContractConfig,
    abi: [
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: 'from',
            type: 'address',
          },
          { indexed: true, name: 'to', type: 'address' },
          {
            indexed: true,
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'Transfer',
        type: 'event',
      },
      {
        inputs: [{ name: 'owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    publicClient,
    walletClient,
  })
  type Abi_ = [
    {
      anonymous: false
      inputs: [
        {
          indexed: true
          name: 'from'
          type: 'address'
        },
        { indexed: true; name: 'to'; type: 'address' },
        {
          indexed: true
          name: 'tokenId'
          type: 'uint256'
        },
      ]
      name: 'Transfer'
      type: 'event'
    },
    {
      inputs: [{ name: 'owner'; type: 'address' }]
      name: 'balanceOf'
      outputs: [{ name: ''; type: 'uint256' }]
      stateMutability: 'view'
      type: 'function'
    },
    {
      inputs: [
        { name: 'from'; type: 'address' },
        { name: 'to'; type: 'address' },
        { name: 'tokenId'; type: 'uint256' },
      ]
      name: 'safeTransferFrom'
      outputs: []
      stateMutability: 'nonpayable'
      type: 'function'
    },
  ]
  type ReadFunctionNames = ExtractAbiFunctionNames<Abi_, 'pure' | 'view'>
  type WriteFunctionNames = ExtractAbiFunctionNames<
    Abi_,
    'nonpayable' | 'payable'
  >
  type EventNames = ExtractAbiEventNames<Abi_>

  expectTypeOf(contract).toMatchTypeOf<{
    estimateGas: {
      [_ in WriteFunctionNames]: Function
    }
    read: {
      [_ in ReadFunctionNames]: Function
    }
    simulate: {
      [_ in WriteFunctionNames]: Function
    }
    watchEvent: {
      [_ in EventNames]: Function
    }
    write: {
      [_ in WriteFunctionNames]: Function
    }
  }>()
})

test('overloaded function', () => {
  const contract = getContract({
    ...wagmiContractConfig,
    publicClient,
    walletClient,
  })
  expectTypeOf(contract.write.safeTransferFrom)
    .parameter(0)
    .toEqualTypeOf<
      | readonly [
          ResolvedConfig['AddressType'],
          ResolvedConfig['AddressType'],
          ResolvedConfig['BigIntType'],
        ]
      | readonly [
          ResolvedConfig['AddressType'],
          ResolvedConfig['AddressType'],
          ResolvedConfig['BigIntType'],
          ResolvedConfig['AddressType'],
        ]
    >()
  expectTypeOf(contract.write.safeTransferFrom).toBeCallableWith([
    '0x…',
    '0x…',
    123n,
  ])
  expectTypeOf(contract.write.safeTransferFrom).toBeCallableWith([
    '0x…',
    '0x…',
    123n,
    '0x…',
  ])
})

test('with and without wallet client `account`', () => {
  const contractWithAccount = getContract({
    ...wagmiContractConfig,
    publicClient,
    walletClient,
  })
  const contractWithoutAccount = getContract({
    ...wagmiContractConfig,
    publicClient,
    walletClient: walletClientWithoutAccount,
  })

  expectTypeOf(contractWithAccount.write.mint).parameters.toEqualTypeOf<
    [params?: { account?: Account | Address }]
  >()
  expectTypeOf(contractWithoutAccount.write.mint).parameters.toEqualTypeOf<
    [params: { account: Account | Address }]
  >()

  expectTypeOf(contractWithAccount.write.approve).parameters.toEqualTypeOf<
    [
      args: readonly [`0x${string}`, bigint],
      params?: { account?: Account | Address },
    ]
  >()
  expectTypeOf(contractWithoutAccount.write.approve).parameters.toEqualTypeOf<
    [
      args: readonly [`0x${string}`, bigint],
      params: { account: Account | Address },
    ]
  >()
})

test('with and without wallet client `chain`', () => {
  const contractWithChain = getContract({
    ...wagmiContractConfig,
    publicClient,
    walletClient,
  })
  const contractWithoutChain = getContract({
    ...wagmiContractConfig,
    publicClient,
    walletClient: walletClientWithoutChain,
  })

  contractWithChain.write.mint({
    chain: '0x…',
  })
  contractWithoutChain.write.mint({
    chain: '0x…',
  })

  // expectTypeOf(contractWithChain.write.mint).parameters.toEqualTypeOf<
  //   [params?: { account?: Account | Address }]
  // >()
  // expectTypeOf(contractWithoutChain.write.mint).parameters.toEqualTypeOf<
  //   [params: { chain: any }]
  // >()

  // expectTypeOf(contractWithChain.write.approve).parameters.toEqualTypeOf<
  //   [
  //     args: readonly [`0x${string}`, bigint],
  //     params?: { account?: Account | Address },
  //   ]
  // >()
  // expectTypeOf(contractWithoutChain.write.approve).parameters.toEqualTypeOf<
  //   [
  //     args: readonly [`0x${string}`, bigint],
  //     params: { account: Account | Address },
  //   ]
  // >()
})
