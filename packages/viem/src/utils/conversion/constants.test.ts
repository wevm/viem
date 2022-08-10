import { expect, test } from 'vitest'

import * as constants from './constants'

test('exports constants', () => {
  expect(constants).toMatchInlineSnapshot(`
    {
      "weiPerEther": 1000000000000000000,
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
