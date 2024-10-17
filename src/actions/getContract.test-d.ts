import {
  type Abi,
  type Address,
  type ExtractAbiEventNames,
  type ExtractAbiFunctionNames,
  type ResolvedRegister,
  parseAbi,
} from 'abitype'

import { expectTypeOf, test } from 'vitest'

import { wagmiContractConfig } from '~test/src/abis.js'
import { anvilMainnet } from '../../test/src/anvil.js'
import type { Account } from '../accounts/types.js'
import { celo } from '../chains/index.js'

import { createPublicClient } from '../clients/createPublicClient.js'
import { createWalletClient } from '../clients/createWalletClient.js'
import { http } from '../clients/transports/http.js'
import type { Chain } from '../types/chain.js'

import { getContract } from './getContract.js'

const publicClient = anvilMainnet.getClient()
const walletClient = createWalletClient({
  account: '0x',
  chain: anvilMainnet.chain,
  transport: http(anvilMainnet.rpcUrl.http),
})
const walletClientWithoutAccount = createWalletClient({
  chain: anvilMainnet.chain,
  transport: http(anvilMainnet.rpcUrl.http),
})
const walletClientWithoutChain = createWalletClient({
  account: '0x',
  transport: http(anvilMainnet.rpcUrl.http),
})

test('generic client', () => {
  const contract = getContract({
    ...wagmiContractConfig,
    client: walletClient,
  })

  expectTypeOf<keyof typeof contract>().toEqualTypeOf<
    | 'address'
    | 'createEventFilter'
    | 'estimateGas'
    | 'watchEvent'
    | 'read'
    | 'simulate'
    | 'getEvents'
    | 'write'
    | 'abi'
  >()
})

test('public and wallet client', () => {
  const contract = getContract({
    ...wagmiContractConfig,
    client: { public: publicClient, wallet: walletClient },
  })

  expectTypeOf<keyof typeof contract>().toEqualTypeOf<
    | 'createEventFilter'
    | 'estimateGas'
    | 'read'
    | 'simulate'
    | 'getEvents'
    | 'watchEvent'
    | 'write'
    | 'address'
    | 'abi'
  >()
})

test('no wallet client', () => {
  const contract = getContract({
    ...wagmiContractConfig,
    client: { public: publicClient },
  })

  expectTypeOf<keyof typeof contract>().toEqualTypeOf<
    | 'createEventFilter'
    | 'estimateGas'
    | 'read'
    | 'simulate'
    | 'getEvents'
    | 'watchEvent'
    | 'address'
    | 'abi'
  >()
})

test('no public client', () => {
  const contract = getContract({
    ...wagmiContractConfig,
    client: { wallet: walletClient },
  })

  expectTypeOf<keyof typeof contract>().toEqualTypeOf<
    'estimateGas' | 'write' | 'address' | 'abi'
  >()
})

test('without const assertion on `abi`', () => {
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
    client: { public: publicClient, wallet: walletClient },
  })

  expectTypeOf(contract).toMatchTypeOf<{
    createEventFilter: {
      [_ in string]: Function
    }
    estimateGas: {
      [_1: string]: Function
    }
    read: {
      [_2: string]: Function
    }
    simulate: {
      [_3: string]: Function
    }
    watchEvent: {
      [_4: string]: Function
    }
    write: {
      [_5: string]: Function
    }
  }>()
})

test('`abi` declared as `Abi` type', () => {
  const abi: Abi = []
  const contract = getContract({
    ...wagmiContractConfig,
    abi,
    client: { public: publicClient, wallet: walletClient },
  })

  contract.createEventFilter.Transfer({ from: '0x' })

  expectTypeOf(contract).toMatchTypeOf<{
    createEventFilter: {
      [_ in string]: Function
    }
    estimateGas: {
      [_1: string]: Function
    }
    read: {
      [_2: string]: Function
    }
    simulate: {
      [_3: string]: Function
    }
    watchEvent: {
      [_4: string]: Function
    }
    write: {
      [_5: string]: Function
    }
  }>()
})

test('`abi` defined inline', () => {
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
    client: { public: publicClient, wallet: walletClient },
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
    createEventFilter: {
      [_ in string]: Function
    }
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
    client: { public: publicClient, wallet: walletClient },
  })
  expectTypeOf(contract.write.safeTransferFrom)
    .parameter(0)
    .toEqualTypeOf<
      | readonly [
          ResolvedRegister['AddressType'],
          ResolvedRegister['AddressType'],
          ResolvedRegister['BigIntType'],
        ]
      | readonly [
          ResolvedRegister['AddressType'],
          ResolvedRegister['AddressType'],
          ResolvedRegister['BigIntType'],
          ResolvedRegister['AddressType'],
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
    client: { public: publicClient, wallet: walletClient },
  })
  const contractWithoutAccount = getContract({
    ...wagmiContractConfig,
    client: { public: publicClient, wallet: walletClientWithoutAccount },
  })

  expectTypeOf(contractWithAccount.write.approve)
    .parameter(1)
    .extract<{ account?: Account | Address | null | undefined }>()
    // @ts-expect-error
    .toBeNever()
  expectTypeOf(contractWithoutAccount.write.approve)
    .parameter(1)
    .extract<{ account: Account | Address | null }>()
    // @ts-expect-error
    .toBeNever()
})

test('with and without wallet client `chain`', () => {
  const contractWithChain = getContract({
    ...wagmiContractConfig,
    client: { public: publicClient, wallet: walletClient },
  })
  const contractWithoutChain = getContract({
    ...wagmiContractConfig,
    client: { public: publicClient, wallet: walletClientWithoutChain },
  })

  expectTypeOf(contractWithChain.write.approve)
    .parameter(1)
    .extract<{ chain?: Chain | null | undefined }>()
    // @ts-expect-error
    .toBeNever()
  expectTypeOf(contractWithoutChain.write.approve)
    .parameter(1)
    .extract<{ chain: Chain | null | undefined }>()
    // @ts-expect-error
    .toBeNever()
})

test('no read functions', () => {
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
    client: { public: publicClient, wallet: walletClient },
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
  type WriteFunctionNames = ExtractAbiFunctionNames<
    Abi_,
    'nonpayable' | 'payable'
  >
  type EventNames = ExtractAbiEventNames<Abi_>

  expectTypeOf(contract).toMatchTypeOf<{
    createEventFilter: {
      [_ in EventNames]: Function
    }
    estimateGas: {
      [_ in WriteFunctionNames]: Function
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

test('no write functions', () => {
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
    ],
    client: { public: publicClient, wallet: walletClient },
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
  ]
  type ReadFunctionNames = ExtractAbiFunctionNames<Abi_, 'pure' | 'view'>
  type EventNames = ExtractAbiEventNames<Abi_>

  expectTypeOf(contract).toMatchTypeOf<{
    createEventFilter: {
      [_ in EventNames]: Function
    }
    read: {
      [_ in ReadFunctionNames]: Function
    }
    watchEvent: {
      [_ in EventNames]: Function
    }
  }>()
})

test('no events', () => {
  const contract = getContract({
    ...wagmiContractConfig,
    abi: [
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
    client: { public: publicClient, wallet: walletClient },
  })
  type Abi_ = [
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
    write: {
      [_ in WriteFunctionNames]: Function
    }
  }>()
})

test('empty abi', () => {
  const contract = getContract({
    ...wagmiContractConfig,
    abi: [],
    client: { public: publicClient, wallet: walletClient },
  })
  expectTypeOf<keyof typeof contract>().toEqualTypeOf<'address' | 'abi'>()
  expectTypeOf(contract.abi).toEqualTypeOf<readonly []>()
  expectTypeOf(
    contract.address,
  ).toEqualTypeOf<'0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'>()
})

test('argument permutations', async () => {
  const abi = parseAbi([
    // functions
    'function nonpayableWithoutArgs()',
    'function nonpayableWithArgs(string x, uint256 y)',
    'function payableWithoutArgs() payable',
    'function payableWithArgs(string x, uint256 y) payable',
    'function pureWithoutArgs() pure returns (string)',
    'function pureWithArgs(string x, uint256 y) pure returns (string)',
    'function viewWithoutArgs() view returns (string)',
    'function viewWithArgs(string x, uint256 y) view returns (string)',

    'function overloadedNonpayable()',
    'function overloadedNonpayable(string x)',
    'function overloadedNonpayable(string x, uint256 y)',
    'function overloadedNonpayable2(string x)',
    'function overloadedNonpayable2(string x, uint256 y)',

    'function overloadedView() view returns (string)',
    'function overloadedView(string x) view returns (string)',
    'function overloadedView(string x, uint256 y) view returns (string)',
    'function overloadedView2(string x) view returns (string)',
    'function overloadedView2(string x, uint256 y) view returns (string)',

    // events
    'event WithoutInputs()',
    'event WithIndexedNamedInputs(string indexed x, uint256 indexed y)',
    'event WithIndexedUnnamedInputs(string indexed, uint256 indexed)',
    'event WithUnindexedInputs(string x, uint256 y)',
    'event WithMixedNamedInputs(string indexed x, uint256 y)',
    'event WithMixedUnnamedInputs(string indexed, uint256 y)',
  ])
  const contract = getContract({
    ...wagmiContractConfig,
    abi,
    client: { public: publicClient, wallet: walletClient },
  })

  // estimateGas
  contract.estimateGas.nonpayableWithoutArgs({ account: '0x' })
  contract.estimateGas.nonpayableWithArgs(['foo', 69n], { account: '0x' })
  contract.estimateGas.payableWithoutArgs({ account: '0x', value: 1n })
  contract.estimateGas.payableWithArgs(['foo', 69n], {
    account: '0x',
    value: 1n,
  })

  contract.estimateGas.overloadedNonpayable({ account: '0x' })
  contract.estimateGas.overloadedNonpayable(['foo'], { account: '0x' })
  contract.estimateGas.overloadedNonpayable2(['foo'], { account: '0x' })
  contract.estimateGas.overloadedNonpayable2(['foo', 69n], { account: '0x' })

  // read
  contract.read.pureWithoutArgs()
  contract.read.pureWithoutArgs({ blockNumber: 123n })
  contract.read.pureWithArgs(['foo', 69n])
  contract.read.pureWithArgs(['foo', 69n], { blockNumber: 123n })
  contract.read.viewWithoutArgs()
  contract.read.viewWithoutArgs({ blockNumber: 123n })
  contract.read.viewWithArgs(['foo', 69n])
  contract.read.viewWithArgs(['foo', 69n], { blockNumber: 123n })

  contract.read.overloadedView()
  contract.read.overloadedView(['foo'])
  contract.read.overloadedView2(['foo'])
  contract.read.overloadedView2(['foo', 69n])

  const read_1 = await contract.read.viewWithArgs(['foo', 69n])
  expectTypeOf(read_1).toEqualTypeOf<string>()

  // simulate
  contract.simulate.nonpayableWithoutArgs({ account: '0x' })
  contract.simulate.nonpayableWithArgs(['foo', 69n], { account: '0x' })
  contract.simulate.payableWithoutArgs({ account: '0x', value: 1n })
  contract.simulate.payableWithArgs(['foo', 69n], { account: '0x', value: 1n })

  contract.simulate.overloadedNonpayable({ account: '0x' })
  contract.simulate.overloadedNonpayable(['foo'], { account: '0x' })
  contract.simulate.overloadedNonpayable2(['foo'], { account: '0x' })
  contract.simulate.overloadedNonpayable2(['foo', 69n], { account: '0x' })

  // write
  contract.write.nonpayableWithoutArgs()
  contract.write.nonpayableWithoutArgs({ nonce: 123 })
  contract.write.nonpayableWithArgs(['foo', 69n])
  contract.write.nonpayableWithArgs(['foo', 69n], { nonce: 123 })
  contract.write.payableWithoutArgs()
  contract.write.payableWithoutArgs({ nonce: 123, value: 123n })
  contract.write.payableWithArgs(['foo', 69n])
  contract.write.payableWithArgs(['foo', 69n], {
    nonce: 123,
    value: 123n,
  })

  contract.write.overloadedNonpayable()
  contract.write.overloadedNonpayable(['foo'])
  contract.write.overloadedNonpayable2(['foo'])
  contract.write.overloadedNonpayable2(['foo', 69n])

  // createEventFilter
  contract.createEventFilter.WithoutInputs()
  contract.createEventFilter.WithoutInputs({ fromBlock: 123n })

  contract.createEventFilter.WithIndexedNamedInputs({
    x: 'foo',
    y: null,
  })
  contract.createEventFilter.WithIndexedNamedInputs({ x: 'foo' })
  contract.createEventFilter.WithIndexedNamedInputs(
    { x: 'foo' },
    { fromBlock: 123n },
  )

  contract.createEventFilter.WithIndexedUnnamedInputs([])
  contract.createEventFilter.WithIndexedUnnamedInputs(['foo'])
  contract.createEventFilter.WithIndexedUnnamedInputs(['foo'], {
    fromBlock: 123n,
  })

  contract.createEventFilter.WithUnindexedInputs({
    fromBlock: 123n,
  })

  contract.createEventFilter.WithMixedNamedInputs({})
  contract.createEventFilter.WithMixedNamedInputs({ x: 'foo ' })
  contract.createEventFilter.WithMixedNamedInputs(
    { x: 'foo' },
    { fromBlock: 123n },
  )

  contract.createEventFilter.WithMixedUnnamedInputs([])
  contract.createEventFilter.WithMixedUnnamedInputs(['foo'])
  contract.createEventFilter.WithMixedUnnamedInputs(['foo'], {
    fromBlock: 123n,
  })

  const createEventFilter_1 =
    await contract.createEventFilter.WithIndexedNamedInputs({
      x: 'foo',
      y: null,
    })
  expectTypeOf(createEventFilter_1.eventName)
    .toEqualTypeOf<'WithIndexedNamedInputs'>
  expectTypeOf(createEventFilter_1.args.x).toEqualTypeOf<'foo'>()
  expectTypeOf(createEventFilter_1.args.y).toEqualTypeOf<null>()
  const createEventFilter_2 =
    await contract.createEventFilter.WithIndexedUnnamedInputs(['foo'])
  expectTypeOf(createEventFilter_2.eventName)
    .toEqualTypeOf<'WithIndexedUnnamedInputs'>
  expectTypeOf(createEventFilter_2.args[0]).toEqualTypeOf<'foo'>()

  const createEventFilter_loose =
    await contract.createEventFilter.WithMixedNamedInputs({
      x: 'foo',
    })
  expectTypeOf(createEventFilter_loose.strict).toEqualTypeOf<undefined>()

  const createEventFilter_lax =
    await contract.createEventFilter.WithMixedNamedInputs({
      x: 'foo',
    })
  expectTypeOf(createEventFilter_lax.strict).toEqualTypeOf<undefined>()

  const createEventFilter_strict =
    await contract.createEventFilter.WithMixedNamedInputs(
      {
        x: 'foo',
      },
      { strict: true },
    )
  expectTypeOf(createEventFilter_strict.strict).toEqualTypeOf<true>()

  // watchEvent
  // @ts-expect-error
  contract.watchEvent.WithoutInputs()
  contract.watchEvent.WithoutInputs({ onLogs, pollingInterval: 4_000 })

  contract.watchEvent.WithIndexedNamedInputs({}, { onLogs })
  contract.watchEvent.WithIndexedNamedInputs({ x: 'foo' }, { onLogs })
  contract.watchEvent.WithIndexedNamedInputs({ x: 'foo' }, { onLogs })

  contract.watchEvent.WithIndexedUnnamedInputs([], { onLogs })
  contract.watchEvent.WithIndexedUnnamedInputs(['foo'], { onLogs })
  contract.watchEvent.WithIndexedUnnamedInputs(['foo'], { onLogs })

  contract.watchEvent.WithUnindexedInputs({ onLogs })

  contract.watchEvent.WithMixedNamedInputs({}, { onLogs })
  contract.watchEvent.WithMixedNamedInputs({ x: 'foo ' }, { onLogs })
  contract.watchEvent.WithMixedNamedInputs({ x: 'foo' }, { onLogs })

  contract.watchEvent.WithMixedUnnamedInputs([], { onLogs })
  contract.watchEvent.WithMixedUnnamedInputs(['foo'], { onLogs })
  contract.watchEvent.WithMixedUnnamedInputs(['foo'], { onLogs })

  function onLogs() {}
})

test('estimateGas', () => {
  const contract1 = getContract({
    ...wagmiContractConfig,
    client: publicClient,
  })
  // `account` required
  contract1.estimateGas.mint({ account: '0x' })
  contract1.estimateGas.approve(['0x', 123n], { account: '0x' })

  const contract2 = getContract({
    ...wagmiContractConfig,
    client: walletClient,
  })
  // `account` inherited from `walletClient`
  contract2.estimateGas.mint()
  contract2.estimateGas.approve(['0x', 123n])

  const contract3 = getContract({
    ...wagmiContractConfig,
    client: walletClientWithoutAccount,
  })
  // `account` required
  contract3.estimateGas.mint({ account: '0x' })
  contract3.estimateGas.approve(['0x', 123n], { account: '0x' })

  const contract4 = getContract({
    ...wagmiContractConfig,
    client: { public: publicClient, wallet: walletClient },
  })
  // `account` inherited from `walletClient`
  contract4.estimateGas.mint()
  contract4.estimateGas.approve(['0x', 123n])
})

test('simulate', async () => {
  const contract1 = getContract({
    ...wagmiContractConfig,
    client: publicClient,
  })
  const result1 = await contract1.simulate.mint()
  expectTypeOf<Pick<(typeof result1)['request'], 'account'>>().toEqualTypeOf<{
    account?: undefined
  }>()

  const contract2 = getContract({
    ...wagmiContractConfig,
    client: walletClient,
  })
  const result2 = await contract2.simulate.mint()
  expectTypeOf<Pick<(typeof result2)['request'], 'account'>>().toEqualTypeOf<{
    account: {
      address: '0x'
      type: 'json-rpc'
    }
  }>()

  const contract3 = getContract({
    ...wagmiContractConfig,
    client: publicClient,
  })
  const result3 = await contract3.simulate.mint({ account: '0x' })
  expectTypeOf<Pick<(typeof result3)['request'], 'account'>>().toEqualTypeOf<{
    account: {
      address: '0x'
      type: 'json-rpc'
    }
  }>()
})

test('chain w/ formatter', () => {
  const publicClient = createPublicClient({
    chain: celo,
    transport: http(),
  })
  const walletClient = createWalletClient({
    account: '0x',
    chain: celo,
    transport: http(),
  })

  const contract = getContract({
    ...wagmiContractConfig,
    client: { public: publicClient, wallet: walletClient },
  })
  const contract_public = getContract({
    ...wagmiContractConfig,
    client: { public: publicClient },
  })
  const contract_wallet = getContract({
    ...wagmiContractConfig,
    client: { wallet: walletClient },
  })

  expectTypeOf<keyof typeof contract>().toEqualTypeOf<
    | 'createEventFilter'
    | 'estimateGas'
    | 'read'
    | 'simulate'
    | 'getEvents'
    | 'watchEvent'
    | 'write'
    | 'address'
    | 'abi'
  >()
  expectTypeOf<keyof typeof contract_public>().toEqualTypeOf<
    | 'createEventFilter'
    | 'estimateGas'
    | 'read'
    | 'simulate'
    | 'getEvents'
    | 'watchEvent'
    | 'address'
    | 'abi'
  >()
  expectTypeOf<keyof typeof contract_wallet>().toEqualTypeOf<
    'estimateGas' | 'write' | 'address' | 'abi'
  >()

  contract.estimateGas.mint([1n], {
    feeCurrency: '0x',
  })
})
