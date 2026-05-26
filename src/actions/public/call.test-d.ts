import { expectTypeOf, test } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import type { BlockTag } from '../../types/block.js'
import type { Hash } from '../../types/misc.js'

import { type CallParameters, call } from './call.js'

const client = anvilMainnet.getClient()
const blockHash = `0x${'0'.repeat(64)}` as Hash

test('block parameters', () => {
  type BlockNumberParameters = CallParameters & { blockNumber: bigint }
  expectTypeOf<BlockNumberParameters['blockTag']>().toEqualTypeOf<undefined>()
  expectTypeOf<BlockNumberParameters['blockHash']>().toEqualTypeOf<undefined>()
  expectTypeOf<
    BlockNumberParameters['requireCanonical']
  >().toEqualTypeOf<undefined>()

  type BlockTagParameters = CallParameters & { blockTag: BlockTag }
  expectTypeOf<BlockTagParameters['blockNumber']>().toEqualTypeOf<undefined>()
  expectTypeOf<BlockTagParameters['blockHash']>().toEqualTypeOf<undefined>()
  expectTypeOf<
    BlockTagParameters['requireCanonical']
  >().toEqualTypeOf<undefined>()

  type BlockHashParameters = Extract<CallParameters, { blockHash: Hash }>
  expectTypeOf<BlockHashParameters['blockNumber']>().toEqualTypeOf<undefined>()
  expectTypeOf<BlockHashParameters['blockTag']>().toEqualTypeOf<undefined>()
  expectTypeOf<BlockHashParameters['requireCanonical']>().toEqualTypeOf<
    boolean | undefined
  >()

  call(client, {
    blockNumber: 0n,
  })

  call(client, {
    blockTag: 'latest',
  })

  call(client, {
    blockHash,
  })

  call(client, {
    blockHash,
    requireCanonical: true,
  })

  call(client, {
    blockNumber: 0n,
    // @ts-expect-error
    blockTag: 'latest',
  })

  // @ts-expect-error
  call(client, {
    blockNumber: 0n,
    blockHash,
  })

  // @ts-expect-error
  call(client, {
    blockTag: 'latest',
    blockHash,
  })

  // @ts-expect-error
  call(client, {
    blockNumber: 0n,
    requireCanonical: true,
  })

  // @ts-expect-error
  call(client, {
    blockTag: 'latest',
    requireCanonical: true,
  })

  // @ts-expect-error
  call(client, {
    requireCanonical: true,
  })
})

test('legacy', () => {
  call(client, {
    gasPrice: 0n,
  })

  // @ts-expect-error
  call(client, {
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  call(client, {
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
  // @ts-expect-error
  call(client, {
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
})

test('eip1559', () => {
  call(client, {
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  call(client, {
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  call(client, {
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip1559',
  })
  // @ts-expect-error
  call(client, {
    gasPrice: 0n,
    type: 'eip1559',
  })
})

test('eip2930', () => {
  call(client, {
    accessList: [],
    gasPrice: 0n,
  })

  // @ts-expect-error
  call(client, {
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  call(client, {
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
  // @ts-expect-error
  call(client, {
    accessList: [],
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
})
