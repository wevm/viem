import { expect, test } from 'vitest'

import { Address } from 'viem'

test('ether', () => {
  expect(Address.ether).toMatchInlineSnapshot(
    `"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"`,
  )
})

test('zero', () => {
  expect(Address.zero).toMatchInlineSnapshot(
    `"0x0000000000000000000000000000000000000000"`,
  )
})
