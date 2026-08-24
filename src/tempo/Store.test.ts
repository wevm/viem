import { Store } from 'viem/tempo'
import { describe, expect, test } from 'vitest'

describe('Store.memory', () => {
  test('compareAndSet', async () => {
    const store = Store.memory()

    expect(await store.compareAndSet?.('key', null, 'one')).toBe(true)
    expect(await store.compareAndSet?.('key', null, 'two')).toBe(false)
    expect(await store.compareAndSet?.('key', 'one', 'two')).toBe(true)
    expect(await store.getItem('key')).toBe('two')
  })

  test('getItem returns null for missing keys', async () => {
    const store = Store.memory()
    expect(await store.getItem('missing')).toBeNull()
  })

  test('setItem + getItem', async () => {
    const store = Store.memory()
    await store.setItem('key', 'value')
    expect(await store.getItem('key')).toBe('value')
  })

  test('removeItem', async () => {
    const store = Store.memory()
    await store.setItem('key', 'value')
    await store.removeItem('key')
    expect(await store.getItem('key')).toBeNull()
  })

  test('overwrite', async () => {
    const store = Store.memory()
    await store.setItem('key', 'first')
    await store.setItem('key', 'second')
    expect(await store.getItem('key')).toBe('second')
  })
})

describe('Store.defaultStore', () => {
  test('falls back to memory when session storage access is denied', async () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'sessionStorage',
    )
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      get() {
        throw new DOMException('Access denied.', 'SecurityError')
      },
    })

    try {
      const store = Store.defaultStore()
      await store.setItem('fallback', 'value')
      expect(await store.getItem('fallback')).toBe('value')
    } finally {
      if (descriptor)
        Object.defineProperty(globalThis, 'sessionStorage', descriptor)
      else delete (globalThis as { sessionStorage?: unknown }).sessionStorage
    }
  })

  test('returns a working store', async () => {
    const store = Store.defaultStore()
    expect(store).toBeDefined()

    await store.setItem('test-default', 'val')
    expect(await store.getItem('test-default')).toBe('val')
    await store.removeItem('test-default')
    expect(await store.getItem('test-default')).toBeNull()
  })
})

describe('Store.from', () => {
  test('prefixes compareAndSet keys', async () => {
    const base = Store.memory()
    const store = Store.from(base, { key: 'tempo' })

    expect(await store.compareAndSet?.('foo', null, 'bar')).toBe(true)
    expect(await base.getItem('tempo:foo')).toBe('bar')
  })

  test('prefixes keys', async () => {
    const base = Store.memory()
    const store = Store.from(base, { key: 'tempo' })

    await store.setItem('foo', 'bar')
    expect(await store.getItem('foo')).toBe('bar')
    expect(await base.getItem('tempo:foo')).toBe('bar')
  })

  test('removeItem with prefix', async () => {
    const base = Store.memory()
    const store = Store.from(base, { key: 'tempo' })

    await store.setItem('foo', 'bar')
    await store.removeItem('foo')
    expect(await base.getItem('tempo:foo')).toBeNull()
  })

  test('no prefix when key is omitted', async () => {
    const base = Store.memory()
    const store = Store.from(base)

    await store.setItem('raw', 'val')
    expect(await base.getItem('raw')).toBe('val')
  })

  test('deduplicates concurrent getItem calls for the same key', async () => {
    let calls = 0
    const slow: Store.Store = {
      async getItem(_key) {
        calls++
        await new Promise((r) => setTimeout(r, 50))
        return 'val'
      },
      async setItem() {},
      async removeItem() {},
    }

    const store = Store.from(slow)

    const [a, b, c] = await Promise.all([
      store.getItem('x'),
      store.getItem('x'),
      store.getItem('x'),
    ])

    expect(a).toBe('val')
    expect(b).toBe('val')
    expect(c).toBe('val')
    expect(calls).toBe(1)
  })

  test('does not deduplicate different keys', async () => {
    let calls = 0
    const slow: Store.Store = {
      async getItem(_key) {
        calls++
        await new Promise((r) => setTimeout(r, 10))
        return 'val'
      },
      async setItem() {},
      async removeItem() {},
    }

    const store = Store.from(slow)
    await Promise.all([store.getItem('a'), store.getItem('b')])
    expect(calls).toBe(2)
  })

  test('allows new getItem after previous resolves', async () => {
    let calls = 0
    const slow: Store.Store = {
      async getItem(_key) {
        calls++
        await new Promise((r) => setTimeout(r, 10))
        return `val-${calls}`
      },
      async setItem() {},
      async removeItem() {},
    }

    const store = Store.from(slow)

    const first = await store.getItem('x')
    const second = await store.getItem('x')

    expect(first).toBe('val-1')
    expect(second).toBe('val-2')
    expect(calls).toBe(2)
  })

  test('setItem invalidates in-flight read', async () => {
    let calls = 0
    const values = new Map<string, string>()
    const slow: Store.Store = {
      async getItem(key) {
        calls++
        await new Promise((r) => setTimeout(r, 50))
        return values.get(key) ?? null
      },
      setItem(key, value) {
        values.set(key, value)
      },
      removeItem(key) {
        values.delete(key)
      },
    }

    const store = Store.from(slow)

    // Start a read, then write, then read again.
    const p1 = store.getItem('x')
    store.setItem('x', 'new')
    const p2 = store.getItem('x')

    await p1
    const result = await p2
    // Second read should have triggered a new call.
    expect(calls).toBe(2)
    expect(result).toBe('new')
  })
})
