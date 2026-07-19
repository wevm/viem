import type { Abi } from 'abitype'
import type { Address, Hex } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Client, Contract, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({ chain: mainnet, transport: http() })
const address = '0x0000000000000000000000000000000000000001' as const
const recipient = '0x0000000000000000000000000000000000000002'

const accountClient = Client.create({
  account: recipient,
  chain: mainnet,
  transport: http(),
})

const abi = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'lookup',
    outputs: [{ name: 'owner', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'lookup',
    outputs: [{ name: 'id', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [],
    name: 'metadata',
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'quote',
    outputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'valid', type: 'bool' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

test('preserves the bound ABI and address', () => {
  const contract = Contract.from({ abi, address, client: accountClient })

  expectTypeOf(contract.abi).toEqualTypeOf<typeof abi>()
  expectTypeOf(contract.address).toEqualTypeOf<typeof address>()
  expectTypeOf<keyof typeof contract>().toEqualTypeOf<
    | 'abi'
    | 'address'
    | 'createEventFilter'
    | 'estimateGas'
    | 'getLogs'
    | 'read'
    | 'simulate'
    | 'watchEvent'
    | 'write'
  >()
})

test('infers function args and return values from one options bag', async () => {
  const contract = Contract.from({ abi, address, client: accountClient })

  const balance = await contract.read.balanceOf({ args: [recipient] })
  expectTypeOf(balance).toEqualTypeOf<bigint>()

  const owner = await contract.read.lookup({ args: [1n] })
  expectTypeOf(owner).toEqualTypeOf<Address.Address>()

  const id = await contract.read.lookup({ args: [recipient] })
  expectTypeOf(id).toEqualTypeOf<bigint>()

  const gas = contract.estimateGas.transfer({ args: [recipient, 1n] })
  expectTypeOf(gas).toEqualTypeOf<Promise<bigint>>()

  const simulation = await contract.simulate.transfer({
    args: [recipient, 1n],
  })
  expectTypeOf(simulation.result).toEqualTypeOf<boolean>()

  const hash = contract.write.transfer({ args: [recipient, 1n] })
  expectTypeOf(hash).toEqualTypeOf<Promise<Hex.Hex>>()

  contract.write.deposit({ value: 1n })
  contract.write.deposit()

  // A hoisted client account keeps `account` optional, but per-call overrides work.
  contract.write.transfer({ account: address, args: [recipient, 1n] })

  // @ts-expect-error args belong inside the options bag
  contract.read.balanceOf([recipient])
  // @ts-expect-error balanceOf requires an address argument
  contract.read.balanceOf()
  // @ts-expect-error nonpayable functions cannot receive value
  contract.write.transfer({ args: [recipient, 1n], value: 1n })
})

test('threads as through read and simulate', async () => {
  const contract = Contract.from({ abi, address, client })

  const object = await contract.read.metadata()
  expectTypeOf(object).toEqualTypeOf<{ name: string; symbol: string }>()

  const array = await contract.read.metadata({ as: 'Array' })
  expectTypeOf(array).toEqualTypeOf<readonly [string, string]>()

  const simulation = await contract.simulate.quote({ as: 'Array' })
  expectTypeOf(simulation.result).toEqualTypeOf<readonly [bigint, boolean]>()
})

test('infers event names and decoded logs', async () => {
  const contract = Contract.from({ abi, address, client })

  const filter = await contract.createEventFilter.Transfer({
    args: { from: address },
    fromBlock: 1n,
    strict: true,
  })
  expectTypeOf(filter.abiEvent?.name).toEqualTypeOf<'Transfer' | undefined>()

  const logs = await contract.getLogs.Transfer({
    args: { to: recipient },
    strict: true,
  })
  expectTypeOf(logs[0]!.eventName).toEqualTypeOf<'Transfer'>()
  expectTypeOf(logs[0]!.args).toEqualTypeOf<{
    from: Address.Address
    to: Address.Address
    amount: bigint
  }>()

  const watcher = contract.watchEvent.Transfer({ strict: true })
  watcher.onLogs((logs) => {
    expectTypeOf(logs[0]!.eventName).toEqualTypeOf<'Transfer'>()
    expectTypeOf(logs[0]!.args.amount).toEqualTypeOf<bigint>()
  })

  // @ts-expect-error unknown event
  contract.getLogs.Approval()
})

test('omits groups that have no matching ABI items', () => {
  const empty = Contract.from({ abi: [] as const, address, client })
  expectTypeOf<keyof typeof empty>().toEqualTypeOf<'abi' | 'address'>()

  const read = Contract.from({
    abi: [abi[0]],
    address,
    client,
  })
  expectTypeOf<keyof typeof read>().toEqualTypeOf<'abi' | 'address' | 'read'>()

  const write = Contract.from({
    abi: [abi[3]],
    address,
    client: accountClient,
  })
  expectTypeOf<keyof typeof write>().toEqualTypeOf<
    'abi' | 'address' | 'estimateGas' | 'simulate' | 'write'
  >()

  const event = Contract.from({
    abi: [abi[5]],
    address,
    client,
  })
  expectTypeOf<keyof typeof event>().toEqualTypeOf<
    'abi' | 'address' | 'createEventFilter' | 'getLogs' | 'watchEvent'
  >()
})

test('requires a per-call account when the client has none', () => {
  const contract = Contract.from({ abi, address, client })
  expectTypeOf<keyof typeof contract>().toEqualTypeOf<
    | 'abi'
    | 'address'
    | 'createEventFilter'
    | 'estimateGas'
    | 'getLogs'
    | 'read'
    | 'simulate'
    | 'watchEvent'
    | 'write'
  >()

  const hash = contract.write.transfer({
    account: recipient,
    args: [recipient, 1n],
  })
  expectTypeOf(hash).toEqualTypeOf<Promise<Hex.Hex>>()

  // @ts-expect-error account is required without a client account
  contract.write.transfer({ args: [recipient, 1n] })
  // @ts-expect-error options with an account are required without a client account
  contract.write.deposit()
  // @ts-expect-error args are still inferred alongside a per-call account
  contract.write.transfer({ account: recipient, args: [recipient] })
})

test('keeps write when the client account is widened', () => {
  const contract = Contract.from({
    abi,
    address,
    client: client as Client.Client,
  })
  expectTypeOf(contract.write.transfer).toBeFunction()
  contract.write.transfer({ account: recipient, args: [recipient, 1n] })
  // @ts-expect-error account is required when the client account may be absent
  contract.write.transfer({ args: [recipient, 1n] })
})

test('keeps all groups for a widened ABI', () => {
  const widened: Abi = abi
  const contract = Contract.from({
    abi: widened,
    address,
    client: accountClient,
  })

  expectTypeOf(contract.read.anything!).toBeFunction()
  expectTypeOf(contract.estimateGas.anything!).toBeFunction()
  expectTypeOf(contract.simulate.anything!).toBeFunction()
  expectTypeOf(contract.write.anything!).toBeFunction()
  expectTypeOf(contract.createEventFilter.Anything!).toBeFunction()
  expectTypeOf(contract.getLogs.Anything!).toBeFunction()
  expectTypeOf(contract.watchEvent.Anything!).toBeFunction()
})
