import { expect, test } from 'vitest'

import { isSuperGameType, superGameTypes } from './gameTypes.js'

test('superGameTypes', () => {
  expect([...superGameTypes]).toEqual([4, 5, 7, 9])
})

test('isSuperGameType', () => {
  expect(isSuperGameType(4)).toBe(true)
  expect(isSuperGameType(5)).toBe(true)
  expect(isSuperGameType(7)).toBe(true)
  expect(isSuperGameType(9)).toBe(true)

  expect(isSuperGameType(0)).toBe(false)
  expect(isSuperGameType(1)).toBe(false)
  expect(isSuperGameType(6)).toBe(false)
  expect(isSuperGameType(10)).toBe(false)
})
