import { expect, test } from 'vitest'

import { cleanupCache, listenersCache, observe } from './observe.js'
import { wait } from './wait.js'

type Callbacks = { emit: (data: { foo: string }) => void }

test('emits data to callbacks', async () => {
  const id = 'mock'
  const emissions1: { foo: string }[] = []
  const emissions2: { foo: string }[] = []
  const emissions3: { foo: string }[] = []
  const setups: string[] = []

  const emitter = ({ emit }: Callbacks) => {
    setups.push('setup')
    setTimeout(() => emit({ foo: 'bar' }), 100)
    return () => {}
  }

  const unwatch1 = observe(
    id,
    { emit: (data: { foo: string }) => emissions1.push(data) },
    emitter,
  )
  const unwatch2 = observe(
    id,
    { emit: (data: { foo: string }) => emissions2.push(data) },
    emitter,
  )
  const unwatch3 = observe(
    id,
    { emit: (data: { foo: string }) => emissions3.push(data) },
    emitter,
  )

  await wait(100)

  expect(setups).toMatchInlineSnapshot(`
    [
      "setup",
    ]
  `)
  expect(emissions1).toMatchInlineSnapshot(`
    [
      {
        "foo": "bar",
      },
    ]
  `)
  expect(emissions2).toMatchInlineSnapshot(`
    [
      {
        "foo": "bar",
      },
    ]
  `)
  expect(emissions3).toMatchInlineSnapshot(`
    [
      {
        "foo": "bar",
      },
    ]
  `)

  unwatch1()
  unwatch2()
  unwatch3()
})

test('scopes to id', async () => {
  const id1 = 'mock'
  const emissions1: { foo: string }[] = []
  const setups1: string[] = []
  const unwatch1 = observe(
    id1,
    { emit: (data: { foo: string }) => emissions1.push(data) },
    ({ emit }: Callbacks) => {
      setups1.push('setup')
      setTimeout(() => emit({ foo: 'bar1' }), 100)
      return () => {}
    },
  )

  const id2 = 'mock2'
  const emissions2: { foo: string }[] = []
  const setups2: string[] = []
  const unwatch2 = observe(
    id2,
    { emit: (data: { foo: string }) => emissions2.push(data) },
    ({ emit }: Callbacks) => {
      setups2.push('setup')
      setTimeout(() => emit({ foo: 'bar2' }), 100)
      return () => {}
    },
  )

  await wait(100)

  expect(setups1).toMatchInlineSnapshot(`
    [
      "setup",
    ]
  `)
  expect(setups2).toMatchInlineSnapshot(`
    [
      "setup",
    ]
  `)
  expect(emissions1).toMatchInlineSnapshot(`
    [
      {
        "foo": "bar1",
      },
    ]
  `)
  expect(emissions2).toMatchInlineSnapshot(`
    [
      {
        "foo": "bar2",
      },
    ]
  `)

  unwatch1()
  unwatch2()
})

test('cleans up listeners correctly (staggered unwatch)', async () => {
  const id = 'mock'
  const emissions1: { foo: string }[] = []
  const emissions2: { foo: string }[] = []
  const emissions3: { foo: string }[] = []
  const setups: string[] = []

  const emitter = ({ emit }: Callbacks) => {
    setups.push('setup')
    setTimeout(() => emit({ foo: 'bar' }), 100)
    setTimeout(() => emit({ foo: 'bar' }), 200)
    setTimeout(() => emit({ foo: 'bar' }), 300)
    return () => {}
  }

  const unwatch1 = observe(
    id,
    { emit: (data: { foo: string }) => emissions1.push(data) },
    emitter,
  )
  const unwatch2 = observe(
    id,
    { emit: (data: { foo: string }) => emissions2.push(data) },
    emitter,
  )
  const unwatch3 = observe(
    id,
    { emit: (data: { foo: string }) => emissions3.push(data) },
    emitter,
  )

  unwatch1()

  expect(setups).toMatchInlineSnapshot(`
    [
      "setup",
    ]
  `)

  await wait(100)

  expect(setups).toMatchInlineSnapshot(`
    [
      "setup",
    ]
  `)
  expect(emissions1).toMatchInlineSnapshot(`[]`)
  expect(emissions2).toMatchInlineSnapshot(`
    [
      {
        "foo": "bar",
      },
    ]
  `)

  unwatch2()

  await wait(100)

  expect(setups).toMatchInlineSnapshot(`
    [
      "setup",
    ]
  `)
  expect(emissions3).toMatchInlineSnapshot(`
    [
      {
        "foo": "bar",
      },
      {
        "foo": "bar",
      },
    ]
  `)

  unwatch3()
})

test('cleans up listeners correctly (immediately unwatch)', async () => {
  const id = 'mock'
  const emissions1: { foo: string }[] = []
  const emissions2: { foo: string }[] = []
  const emissions3: { foo: string }[] = []
  const setups: string[] = []

  const emitter = ({ emit }: Callbacks) => {
    setups.push('setup')
    setTimeout(() => emit({ foo: 'bar' }), 100)
    setTimeout(() => emit({ foo: 'bar' }), 200)
    return () => {}
  }

  const unwatch1 = observe(
    id,
    { emit: (data: { foo: string }) => emissions1.push(data) },
    emitter,
  )
  const unwatch2 = observe(
    id,
    { emit: (data: { foo: string }) => emissions2.push(data) },
    emitter,
  )
  const unwatch3 = observe(
    id,
    { emit: (data: { foo: string }) => emissions3.push(data) },
    emitter,
  )

  unwatch1()
  unwatch2()
  unwatch3()

  await wait(300)

  expect(setups).toMatchInlineSnapshot(`
    [
      "setup",
    ]
  `)
  expect(emissions1).toMatchInlineSnapshot(`[]`)
  expect(emissions2).toMatchInlineSnapshot(`[]`)
  expect(emissions3).toMatchInlineSnapshot(`[]`)
})

test('cleans up emit function correctly', async () => {
  const id = 'mock'
  const emissions: { foo: string }[] = []
  const setups: string[] = []

  let active = true
  const emitter = ({ emit }: Callbacks) => {
    setups.push('setup')
    setTimeout(() => emit({ foo: 'bar' }), 100)
    setTimeout(() => emit({ foo: 'bar' }), 200)
    setTimeout(() => emit({ foo: 'bar' }), 300)
    return () => {
      active = false
    }
  }

  const callbacks = { emit: (data: { foo: string }) => emissions.push(data) }
  const unwatch1 = observe(id, callbacks, emitter)
  const unwatch2 = observe(id, callbacks, emitter)
  const unwatch3 = observe(id, callbacks, emitter)

  await wait(100)
  expect(setups).toMatchInlineSnapshot(`
    [
      "setup",
    ]
  `)
  expect(emissions[0]).toMatchInlineSnapshot(`
    {
      "foo": "bar",
    }
  `)
  expect(active).toBe(true)

  unwatch1()

  await wait(100)
  expect(setups).toMatchInlineSnapshot(`
    [
      "setup",
    ]
  `)
  expect(active).toBe(true)

  unwatch2()

  await wait(100)
  expect(setups).toMatchInlineSnapshot(`
    [
      "setup",
    ]
  `)
  expect(active).toBe(true)

  unwatch3()

  expect(active).toBe(false)
})

test('cleans up emit function when last listener unwatch', async () => {
  const id = 'mock'
  const cleanups: string[] = []
  const emitter = ({ emit }: Callbacks) => {
    setTimeout(() => emit({ foo: 'bar' }), 100)
    return () => {
      cleanups.push('cleanup')
    }
  }

  const unwatch1 = observe(
    id,
    {
      emit: () => {
        unwatch1()
        unwatch1()
        unwatch1()
      },
    },
    emitter,
  )

  const unwatch2 = observe(id, { emit: () => {} }, emitter)

  await wait(110)

  // Make sure there is no premature cleanup
  // as watch2 listener is still subscribed
  expect(cleanups).toMatchInlineSnapshot(`[]`)

  unwatch2()

  expect(cleanups).toMatchInlineSnapshot(`
    [
      "cleanup",
    ]
  `)
})

test('removes caches when last listener unwatches', () => {
  const id = 'mock'
  const cleanups: string[] = []
  const emitter = () => () => {
    cleanups.push('cleanup')
  }

  const unwatch1 = observe(id, { emit: () => {} }, emitter)
  const unwatch2 = observe(id, { emit: () => {} }, emitter)

  unwatch1()

  expect(listenersCache.get(id)).toHaveLength(1)
  expect(cleanupCache.has(id)).toBe(true)

  unwatch2()

  expect(cleanups).toMatchInlineSnapshot(`
    [
      "cleanup",
    ]
  `)
  expect(listenersCache.has(id)).toBe(false)
  expect(cleanupCache.has(id)).toBe(false)
})

test('does not reuse cleanup after last listener unwatches', () => {
  const id = 'mock'
  const cleanups: string[] = []
  const cleanup = () => {
    cleanups.push('cleanup')
  }

  observe(id, { emit: () => {} }, () => cleanup)()
  expect(cleanups).toMatchInlineSnapshot(`
    [
      "cleanup",
    ]
  `)

  observe(id, { emit: () => {} }, () => {})()
  expect(cleanups).toMatchInlineSnapshot(`
    [
      "cleanup",
    ]
  `)
})

test('handles async cleanup functions', async () => {
  const id = 'mock'
  const emissions: { foo: string }[] = []
  const cleanups: string[] = []

  const emitter = ({ emit }: Callbacks) => {
    setTimeout(() => emit({ foo: 'bar' }), 100)
    return async () => {
      await wait(1)
      cleanups.push('cleanup')
    }
  }

  const callbacks = { emit: (data: { foo: string }) => emissions.push(data) }
  const unwatch1 = observe(id, callbacks, emitter)
  const unwatch2 = observe(id, callbacks, emitter)

  await wait(110)
  expect(emissions).toMatchInlineSnapshot(`
    [
      {
        "foo": "bar",
      },
      {
        "foo": "bar",
      },
    ]
  `)
  expect(cleanups).toMatchInlineSnapshot(`[]`)

  unwatch1()
  expect(cleanups).toMatchInlineSnapshot(`[]`)

  unwatch2()

  // Give the async cleanup time to execute
  await wait(10)
  expect(cleanups).toMatchInlineSnapshot(`
    [
      "cleanup",
    ]
  `)
})

test('handles async cleanup errors', async () => {
  const id = 'mock'
  const emissions: { foo: string }[] = []
  const cleanups: string[] = []

  const emitter = ({ emit }: Callbacks) => {
    setTimeout(() => emit({ foo: 'bar' }), 100)
    return async () => {
      cleanups.push('cleanup')
      throw new Error('Cleanup failed')
    }
  }

  const unwatch = observe(
    id,
    { emit: (data: { foo: string }) => emissions.push(data) },
    emitter,
  )

  await wait(110)
  expect(emissions).toMatchInlineSnapshot(`
    [
      {
        "foo": "bar",
      },
    ]
  `)

  // This should not throw an error even though cleanup fails
  expect(() => unwatch()).not.toThrow()

  // Give the async cleanup time to execute and fail
  await wait(10)
  expect(cleanups).toMatchInlineSnapshot(`
    [
      "cleanup",
    ]
  `)
})
