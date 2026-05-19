import { afterEach, describe, expect, test, vi } from 'vp/test'

import { cleanupCache, listenersCache, observe } from './observe.js'

afterEach(() => {
  cleanupCache.clear()
  listenersCache.clear()
  vi.useRealTimers()
})

describe('observe', () => {
  test('behavior: shares one emitter for matching observer IDs', async () => {
    vi.useFakeTimers()
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const callback3 = vi.fn()
    const emitter = vi.fn((emit) => {
      setTimeout(() => emit.change({ foo: 'bar' }), 100)
      return () => {}
    })

    const unwatch1 = observe('mock', { change: callback1 }, emitter)
    const unwatch2 = observe('mock', { change: callback2 }, emitter)
    const unwatch3 = observe('mock', { change: callback3 }, emitter)

    await vi.advanceTimersByTimeAsync(100)

    expect(emitter).toHaveBeenCalledTimes(1)
    expect({
      callback1: callback1.mock.calls,
      callback2: callback2.mock.calls,
      callback3: callback3.mock.calls,
    }).toMatchInlineSnapshot(`
      {
        "callback1": [
          [
            {
              "foo": "bar",
            },
          ],
        ],
        "callback2": [
          [
            {
              "foo": "bar",
            },
          ],
        ],
        "callback3": [
          [
            {
              "foo": "bar",
            },
          ],
        ],
      }
    `)

    unwatch1()
    unwatch2()
    unwatch3()
  })

  test('behavior: scopes emitters by observer ID', async () => {
    vi.useFakeTimers()
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const emitter1 = vi.fn((emit) => {
      setTimeout(() => emit.change({ foo: 'bar1' }), 100)
      return () => {}
    })
    const emitter2 = vi.fn((emit) => {
      setTimeout(() => emit.change({ foo: 'bar2' }), 100)
      return () => {}
    })

    const unwatch1 = observe('mock1', { change: callback1 }, emitter1)
    const unwatch2 = observe('mock2', { change: callback2 }, emitter2)

    await vi.advanceTimersByTimeAsync(100)

    expect(emitter1).toHaveBeenCalledTimes(1)
    expect(emitter2).toHaveBeenCalledTimes(1)
    expect({
      callback1: callback1.mock.calls,
      callback2: callback2.mock.calls,
    }).toMatchInlineSnapshot(`
      {
        "callback1": [
          [
            {
              "foo": "bar1",
            },
          ],
        ],
        "callback2": [
          [
            {
              "foo": "bar2",
            },
          ],
        ],
      }
    `)

    unwatch1()
    unwatch2()
  })

  test('behavior: ignores unwatched listeners', async () => {
    vi.useFakeTimers()
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const emitter = vi.fn((emit) => {
      setTimeout(() => emit.change({ count: 1 }), 100)
      setTimeout(() => emit.change({ count: 2 }), 200)
      return () => {}
    })

    const unwatch1 = observe('mock', { change: callback1 }, emitter)
    const unwatch2 = observe('mock', { change: callback2 }, emitter)

    unwatch1()
    await vi.advanceTimersByTimeAsync(200)
    unwatch2()

    expect({
      callback1: callback1.mock.calls,
      callback2: callback2.mock.calls,
    }).toMatchInlineSnapshot(`
      {
        "callback1": [],
        "callback2": [
          [
            {
              "count": 1,
            },
          ],
          [
            {
              "count": 2,
            },
          ],
        ],
      }
    `)
  })

  test('behavior: runs cleanup for the last listener only', () => {
    const cleanup = vi.fn()
    const emitter = vi.fn(() => cleanup)

    const unwatch1 = observe('mock', { change: vi.fn() }, emitter)
    const unwatch2 = observe('mock', { change: vi.fn() }, emitter)

    unwatch1()
    expect(cleanup).not.toHaveBeenCalled()

    unwatch2()
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  test('behavior: swallows async cleanup errors', async () => {
    const cleanup = vi.fn().mockRejectedValue(new Error('boom'))
    const emitter = vi.fn(() => cleanup)

    const unwatch = observe('mock', { change: vi.fn() }, emitter)

    expect(() => unwatch()).not.toThrow()
    await Promise.resolve()
    expect(cleanup).toHaveBeenCalledTimes(1)
  })
})
