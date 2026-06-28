import { Abi } from 'ox'
import type * as Hex from 'ox/Hex'
import { expectTypeOf, test } from 'vitest'

import { Actions, Client, http, walletActions } from 'viem'

const client = Client.create({ transport: http() })

const abi = Abi.from(['constructor(address to, uint256 tokenId)'])
const base = {
  abi,
  args: ['0x', 123n],
  bytecode: '0x',
} as const

test('return type is Hex', () => {
  expectTypeOf<Actions.contract.deploy.ReturnType>().toEqualTypeOf<Hex.Hex>()
})

test('infers constructor args', async () => {
  await Actions.contract.deploy(client, base)

  // @ts-expect-error missing args
  Actions.contract.deploy(client, {
    abi,
    bytecode: '0x',
  })

  Actions.contract.deploy(client, {
    abi,
    // @ts-expect-error wrong arg type
    args: [123n, 123n],
    bytecode: '0x',
  })
})

test('rejects args when no constructor is present', () => {
  const abi = Abi.from(['function foo()'])

  Actions.contract.deploy(client, {
    abi,
    bytecode: '0x',
  })

  Actions.contract.deploy(client, {
    abi,
    // @ts-expect-error args not allowed
    args: [123n],
    bytecode: '0x',
  })
})

test('rejects access lists', () => {
  Actions.contract.deploy(client, {
    ...base,
    // @ts-expect-error accessList not allowed
    accessList: [],
  })
})

test('type: legacy', () => {
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
})

test('type: eip1559', () => {
  Actions.contract.deploy(client, {
    ...base,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip1559',
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
    type: 'eip1559',
  })
})

test('type: eip2930', () => {
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
})

test('decorator: contract.deploy threads through walletActions', async () => {
  const decorated = Client.create({ transport: http() }).extend(walletActions())
  const hash = await decorated.contract.deploy(base)
  expectTypeOf(hash).toEqualTypeOf<Hex.Hex>()
})
