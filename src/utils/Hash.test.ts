import { expect, test } from 'vitest'

import { Hash } from 'viem/utils'

test('zero', () => {
  expect(Hash.zero).toMatchInlineSnapshot(
    `"0x0000000000000000000000000000000000000000000000000000000000000000"`,
  )
})
