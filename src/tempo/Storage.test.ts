import { describe, expect, test } from 'vitest'
import * as Storage from './Storage.js'

describe('Storage.memory', () => {
  test('getItem returns null for missing keys', async () => {
    const storage = Storage.memory()
    expect(await storage.getItem('missing')).toBeNull()
  })

  test('setItem + getItem', async () => {
    const storage = Storage.memory()
    await storage.setItem('key', 'value')
    expect(await storage.getItem('key')).toBe('value')
  })

  test('removeItem', async () => {
    const storage = Storage.memory()
    await storage.setItem('key', 'value')
    await storage.removeItem('key')
    expect(await storage.getItem('key')).toBeNull()
  })

  test('overwrite', async () => {
    const storage = Storage.memory()
    await storage.setItem('key', 'first')
    await storage.setItem('key', 'second')
    expect(await storage.getItem('key')).toBe('second')
  })
})

describe('Storage.default', () => {
  test('returns a working storage', async () => {
    const storage = Storage.defaultStorage()
    expect(storage).toBeDefined()

    await storage.setItem('test-default', 'val')
    expect(await storage.getItem('test-default')).toBe('val')
    await storage.removeItem('test-default')
    expect(await storage.getItem('test-default')).toBeNull()
  })
})

describe('Storage.from', () => {
  test('prefixes keys', async () => {
    const base = Storage.memory()
    const storage = Storage.from(base, { key: 'tempo' })

    await storage.setItem('foo', 'bar')
    expect(await storage.getItem('foo')).toBe('bar')
    expect(await base.getItem('tempo:foo')).toBe('bar')
  })

  test('removeItem with prefix', async () => {
    const base = Storage.memory()
    const storage = Storage.from(base, { key: 'tempo' })

    await storage.setItem('foo', 'bar')
    await storage.removeItem('foo')
    expect(await base.getItem('tempo:foo')).toBeNull()
  })

  test('no prefix when key is omitted', async () => {
    const base = Storage.memory()
    const storage = Storage.from(base)

    await storage.setItem('raw', 'val')
    expect(await base.getItem('raw')).toBe('val')
  })

  test('deduplicates concurrent getItem calls for the same key', async () => {
    let calls = 0
    const slow: Storage.Storage = {
      async getItem(_key) {
        calls++
        await new Promise((r) => setTimeout(r, 50))
        return 'val'
      },
      async setItem() {},
      async removeItem() {},
    }

    const storage = Storage.from(slow)

    const [a, b, c] = await Promise.all([
      storage.getItem('x'),
      storage.getItem('x'),
      storage.getItem('x'),
    ])

    expect(a).toBe('val')
    expect(b).toBe('val')
    expect(c).toBe('val')
    expect(calls).toBe(1)
  })

  test('does not deduplicate different keys', async () => {
    let calls = 0
    const slow: Storage.Storage = {
      async getItem(_key) {
        calls++
        await new Promise((r) => setTimeout(r, 10))
        return 'val'
      },
      async setItem() {},
      async removeItem() {},
    }

    const storage = Storage.from(slow)
    await Promise.all([storage.getItem('a'), storage.getItem('b')])
    expect(calls).toBe(2)
  })

  test('allows new getItem after previous resolves', async () => {
    let calls = 0
    const slow: Storage.Storage = {
      async getItem(_key) {
        calls++
        await new Promise((r) => setTimeout(r, 10))
        return `val-${calls}`
      },
      async setItem() {},
      async removeItem() {},
    }

    const storage = Storage.from(slow)

    const first = await storage.getItem('x')
    const second = await storage.getItem('x')

    expect(first).toBe('val-1')
    expect(second).toBe('val-2')
    expect(calls).toBe(2)
  })

  test('setItem invalidates in-flight read', async () => {
    let calls = 0
    const store = new Map<string, string>()
    const slow: Storage.Storage = {
      async getItem(key) {
        calls++
        await new Promise((r) => setTimeout(r, 50))
        return store.get(key) ?? null
      },
      setItem(key, value) {
        store.set(key, value)
      },
      removeItem(key) {
        store.delete(key)
      },
    }

    const storage = Storage.from(slow)

    // Start a read, then write, then read again.
    const p1 = storage.getItem('x')
    storage.setItem('x', 'new')
    const p2 = storage.getItem('x')

    await p1
    const result = await p2
    // Second read should have triggered a new call.
    expect(calls).toBe(2)
    expect(result).toBe('new')
  })
})
