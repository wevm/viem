import { describe, expect, test } from 'vp/test'

import { LruMap } from './lru.js'

describe('LruMap', () => {
  test('evicts least recently set entries', () => {
    const cache = new LruMap(5)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.set('d', 4)
    cache.set('e', 5)
    cache.set('f', 6)
    cache.set('g', 7)

    expect([...cache.entries()]).toMatchInlineSnapshot(`
      [
        [
          "c",
          3,
        ],
        [
          "d",
          4,
        ],
        [
          "e",
          5,
        ],
        [
          "f",
          6,
        ],
        [
          "g",
          7,
        ],
      ]
    `)
  })

  test('refreshes entries on get and set', () => {
    const cache = new LruMap(3)
    cache.set('a', 1)
    cache.set('b', 2)
    cache.set('c', 3)
    cache.get('a')
    cache.set('b', 20)
    cache.set('d', 4)

    expect([...cache.entries()]).toMatchInlineSnapshot(`
      [
        [
          "a",
          1,
        ],
        [
          "b",
          20,
        ],
        [
          "d",
          4,
        ],
      ]
    `)
  })

  test('evicts empty string keys', () => {
    const cache = new LruMap<number>(1)
    cache.set('', 1)
    cache.set('x', 2)

    expect([...cache.keys()]).toMatchInlineSnapshot(`
      [
        "x",
      ]
    `)
  })
})
