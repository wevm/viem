import { Addresses } from 'viem'
import { expect, test } from 'vitest'

test('create2', () => {
  expect(Addresses.create2).toMatchInlineSnapshot(
    `"0x4e59b44847b379578588920ca78fbf26c0b4956c"`,
  )
})
