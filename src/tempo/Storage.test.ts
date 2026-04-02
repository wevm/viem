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
})
