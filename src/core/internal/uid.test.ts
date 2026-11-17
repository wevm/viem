import { expect, test } from 'vitest'

import { uid } from './uid.js'

test('default', () => {
  const id_1 = uid()
  expect(id_1).toHaveLength(11)
  const id_2 = uid()
  expect(id_2).toHaveLength(11)
  expect(id_1).not.toBe(id_2)
})

test('args: length', () => {
  expect(uid(16)).toHaveLength(16)
  expect(uid(32)).toHaveLength(32)
})
