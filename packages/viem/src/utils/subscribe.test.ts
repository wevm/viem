import { expect, test, vi } from 'vitest'

import { subscribe } from './subscribe'
import { wait } from './wait'

test('emits data to callbacks', async () => {
  const id = 'mock'
  const callback1 = vi.fn()
  const callback2 = vi.fn()
  const callback3 = vi.fn()

  const emitter = vi.fn(({ emit }) => {
    setTimeout(() => emit({ foo: 'bar' }), 100)
    return () => {
      //
    }
  })

  const unwatch1 = subscribe(id, callback1)(emitter)
  const unwatch2 = subscribe(id, callback2)(emitter)
  const unwatch3 = subscribe(id, callback3)(emitter)

  await wait(100)

  expect(emitter).toHaveBeenCalledOnce()
  expect(callback1).toHaveBeenNthCalledWith(1, { foo: 'bar' })
  expect(callback2).toHaveBeenNthCalledWith(1, { foo: 'bar' })
  expect(callback3).toHaveBeenNthCalledWith(1, { foo: 'bar' })

  unwatch1()
  unwatch2()
  unwatch3()
})

test('scopes to id', async () => {
  const id1 = 'mock'
  const callback1 = vi.fn()
  const emitter1 = vi.fn(({ emit }) => {
    setTimeout(() => emit({ foo: 'bar1' }), 100)
    return () => {
      //
    }
  })
  const unwatch1 = subscribe(id1, callback1)(emitter1)

  const id2 = 'mock2'
  const callback2 = vi.fn()
  const emitter2 = vi.fn(({ emit }) => {
    setTimeout(() => emit({ foo: 'bar2' }), 100)
    return () => {
      //
    }
  })
  const unwatch2 = subscribe(id2, callback2)(emitter2)

  await wait(100)

  expect(emitter1).toHaveBeenCalledTimes(1)
  expect(emitter2).toHaveBeenCalledTimes(1)
  expect(callback1).toHaveBeenNthCalledWith(1, { foo: 'bar1' })
  expect(callback2).toHaveBeenNthCalledWith(1, { foo: 'bar2' })

  unwatch1()
  unwatch2()
})

test('cleans up listeners correctly', async () => {
  const id = 'mock'
  const callback1 = vi.fn()
  const callback2 = vi.fn()
  const callback3 = vi.fn()

  const emitter = vi.fn(({ emit }) => {
    setTimeout(() => emit({ foo: 'bar' }), 100)
    setTimeout(() => emit({ foo: 'bar' }), 200)
    setTimeout(() => emit({ foo: 'bar' }), 300)
    return () => {
      //
    }
  })

  const unwatch1 = subscribe(id, callback1)(emitter)
  const unwatch2 = subscribe(id, callback2)(emitter)
  const unwatch3 = subscribe(id, callback3)(emitter)

  unwatch1()

  expect(emitter).toHaveBeenCalledOnce()

  await wait(100)

  expect(emitter).toHaveBeenCalledOnce()
  expect(callback1).toHaveBeenCalledTimes(0)
  expect(callback2).toHaveBeenCalledTimes(1)

  unwatch2()

  await wait(100)

  expect(emitter).toHaveBeenCalledOnce()
  expect(callback3).toHaveBeenCalledTimes(2)

  unwatch3()
})

test('cleans up emit function correctly', async () => {
  const id = 'mock'
  const callback = vi.fn()

  let active = true
  const emitter = vi.fn(({ emit }) => {
    setTimeout(() => emit({ foo: 'bar' }), 100)
    setTimeout(() => emit({ foo: 'bar' }), 200)
    setTimeout(() => emit({ foo: 'bar' }), 300)
    return () => {
      active = false
    }
  })

  const unwatch1 = subscribe(id, callback)(emitter)
  const unwatch2 = subscribe(id, callback)(emitter)
  const unwatch3 = subscribe(id, callback)(emitter)

  await wait(100)
  expect(emitter).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenNthCalledWith(1, { foo: 'bar' })
  expect(active).toBe(true)

  unwatch1()

  await wait(100)
  expect(emitter).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenNthCalledWith(1, { foo: 'bar' })
  expect(active).toBe(true)

  unwatch2()

  await wait(100)
  expect(emitter).toHaveBeenCalledTimes(1)
  expect(callback).toHaveBeenNthCalledWith(1, { foo: 'bar' })
  expect(active).toBe(true)

  unwatch3()

  expect(active).toBe(false)
})
