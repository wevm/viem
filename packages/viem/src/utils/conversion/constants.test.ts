import { expect, test } from 'vitest'

import * as constants from './constants'

test('exports constants', () => {
  expect(constants).toMatchInlineSnapshot(`
    {
      "gweiPerEther": 1000000000,
      "weiPerEther": 1000000000000000000,
      "weiPerGwei": 1000000000,
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
