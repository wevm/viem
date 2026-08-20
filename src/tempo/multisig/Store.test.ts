import { describe, expect, test } from 'vitest'
import * as Operation from './Operation.js'
import * as Store from './Store.js'

const id = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const operation = Operation.from({
  account: '0x1111111111111111111111111111111111111111',
  approvals: [],
  config: {
    owners: [
      { owner: '0x1111111111111111111111111111111111111111', weight: 1 },
    ],
    threshold: 1,
  },
  createdAt: 1,
  id,
  signatures: 1,
  status: 'success',
  threshold: 1,
  transactionHash: id,
  updatedAt: 1,
  version: 0n,
  weight: 1,
})

describe('from', () => {
  test('behavior: returns source', () => {
    const source = Store.memory()
    expect(Store.from({ source })).toBe(source)
  })
})

describe('memory', () => {
  test('behavior: compare and set', async () => {
    const store = Store.memory()
    const next = { ...operation, updatedAt: 2 }

    expect(await store.compareAndSet('key', null, operation)).toBe(true)
    expect(await store.compareAndSet('key', null, next)).toBe(false)
    expect(await store.compareAndSet('key', operation, next)).toBe(true)
    expect(await store.get('key')).toStrictEqual(next)
  })
})

describe('InvalidStoreValueError', () => {
  test('default', () => {
    expect(new Store.InvalidStoreValueError()).toMatchInlineSnapshot(`
      [MultisigStore.InvalidStoreValueError: Stored multisig operation is malformed or unsupported.

      Version: viem@2.55.19]
    `)
  })

  test('behavior: cause', () => {
    const cause = new Error('invalid value')
    const error = new Store.InvalidStoreValueError({ cause })

    expect(error.cause).toBe(cause)
  })
})
