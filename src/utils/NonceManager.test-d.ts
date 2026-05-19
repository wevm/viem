import { describe, expectTypeOf, test } from 'vp/test'

import { NonceManager } from './index.js'
import * as NonceManagerSubpath from 'viem/utils/NonceManager'

const address = '0x0000000000000000000000000000000000000000'
const client = {} as NonceManager.Client

describe('create', () => {
  test('types: is exposed from the utils index and subpath entrypoints', () => {
    expectTypeOf(NonceManager.create).toEqualTypeOf<
      typeof NonceManagerSubpath.create
    >()
    expectTypeOf<NonceManager.NonceManager>().toEqualTypeOf<NonceManagerSubpath.NonceManager>()
  })

  test('types: creates a nonce manager from a source', () => {
    const manager = NonceManager.create({
      source: {
        get() {
          return 0
        },
      },
    })

    expectTypeOf(manager).toEqualTypeOf<NonceManager.NonceManager>()
    expectTypeOf(manager.get({ address, chainId: 1n, client })).toEqualTypeOf<
      Promise<number>
    >()
  })

  test('types: requires bigint chain ids', () => {
    const manager = NonceManager.create({
      source: {
        get() {
          return 0
        },
      },
    })

    manager.get({
      address,
      // @ts-expect-error - chain IDs must be bigint.
      chainId: 1,
      client,
    })
  })

  test('types: accepts optional source persistence', () => {
    NonceManager.create({
      source: {
        get() {
          return 0
        },
      },
    })

    NonceManager.create({
      source: {
        get() {
          return 0
        },
        set(options, nonce) {
          expectTypeOf(options).toEqualTypeOf<NonceManager.Key>()
          expectTypeOf(nonce).toEqualTypeOf<number>()
        },
      },
    })
  })
})

describe('jsonRpc', () => {
  test('types: returns a nonce source', () => {
    expectTypeOf(NonceManager.jsonRpc()).toEqualTypeOf<NonceManager.Source>()
  })
})
