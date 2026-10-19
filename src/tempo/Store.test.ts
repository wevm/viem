import { Store } from 'viem/tempo'
import { describe, expect, test } from 'vitest'

describe('Store.memory', () => {
  test('behavior: compareAndSet', async () => {
    const store = Store.memory()

    expect(await store.compareAndSet?.('key', null, 'one')).toBe(true)
    expect(await store.compareAndSet?.('key', null, 'two')).toBe(false)
    expect(await store.compareAndSet?.('key', 'one', 'two')).toBe(true)
    expect(await store.getItem('key')).toBe('two')
  })

  test('behavior: expires compare-and-set values', async () => {
    const store = Store.memory()

    expect(
      await store.compareAndSet('key', null, 'value', { expiresAt: 0 }),
    ).toBe(true)
    expect(await store.getItem('key')).toBeNull()
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

  test('behavior: forwards compare-and-set expiration', async () => {
    const base = Store.memory()
    const store = Store.from(base, { key: 'tempo' })

    expect(
      await store.compareAndSet?.('foo', null, 'bar', { expiresAt: 0 }),
    ).toBe(true)
    expect(await base.getItem('tempo:foo')).toBeNull()
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

  test('behavior: deduplicates concurrent getItem calls for the same key', async () => {
    const values = ['first', 'second', 'third'].values()
    const slow: Store.Store = {
      async getItem(_key) {
        const value = values.next().value ?? null
        await new Promise((r) => setTimeout(r, 50))
        return value
      },
      async setItem() {},
      async removeItem() {},
    }

    const store = Store.from(slow)

    const result = await Promise.all([
      store.getItem('x'),
      store.getItem('x'),
      store.getItem('x'),
    ])

    expect(result).toMatchInlineSnapshot(`
      [
        "first",
        "first",
        "first",
      ]
    `)
  })

  test('behavior: does not deduplicate different keys', async () => {
    const slow: Store.Store = {
      async getItem(key) {
        await new Promise((r) => setTimeout(r, 10))
        return key
      },
      async setItem() {},
      async removeItem() {},
    }

    const store = Store.from(slow)
    const result = await Promise.all([store.getItem('a'), store.getItem('b')])
    expect(result).toMatchInlineSnapshot(`
      [
        "a",
        "b",
      ]
    `)
  })

  test('behavior: allows new getItem after previous resolves', async () => {
    const values = ['first', 'second'].values()
    const slow: Store.Store = {
      async getItem(_key) {
        await new Promise((r) => setTimeout(r, 10))
        return values.next().value ?? null
      },
      async setItem() {},
      async removeItem() {},
    }

    const store = Store.from(slow)

    const first = await store.getItem('x')
    const second = await store.getItem('x')

    expect([first, second]).toMatchInlineSnapshot(`
      [
        "first",
        "second",
      ]
    `)
  })

  test('behavior: setItem invalidates in-flight read', async () => {
    const values = new Map<string, string>()
    const slow: Store.Store = {
      async getItem(key) {
        const value = values.get(key) ?? null
        await new Promise((r) => setTimeout(r, 50))
        return value
      },
      setItem(key, value) {
        values.set(key, value)
      },
      removeItem(key) {
        values.delete(key)
      },
    }

    const store = Store.from(slow)

    const p1 = store.getItem('x')
    await store.setItem('x', 'new')
    const p2 = store.getItem('x')

    expect(await Promise.all([p1, p2])).toMatchInlineSnapshot(`
      [
        null,
        "new",
      ]
    `)
  })
})
