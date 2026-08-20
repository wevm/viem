import { describe, expect, test } from 'vitest'
import * as Store from './Store.js'

describe('from', () => {
  test('behavior: returns source', () => {
    const source = Store.memory()
    expect(Store.from({ source })).toBe(source)
  })
})

describe('memory', () => {
  test('behavior: compare and set', async () => {
    const store = Store.memory()

    expect(await store.compareAndSet('key', null, 'one')).toBe(true)
    expect(await store.compareAndSet('key', null, 'two')).toBe(false)
    expect(await store.compareAndSet('key', 'one', 'two')).toBe(true)
    expect(await store.get('key')).toMatchInlineSnapshot(`"two"`)
  })
})
