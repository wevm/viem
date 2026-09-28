import { expect, test } from 'vitest'

import { Game } from 'viem/op-stack'

test('superTypes', () => {
  expect([...Game.superTypes]).toMatchInlineSnapshot(`
    [
      4,
      5,
      7,
      9,
    ]
  `)
})

test('isSuper', () => {
  expect([0, 4, 5, 6, 7, 9, 10].map(Game.isSuper)).toMatchInlineSnapshot(`
    [
      false,
      true,
      true,
      false,
      true,
      true,
      false,
    ]
  `)
})
