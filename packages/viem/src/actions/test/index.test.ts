import { expect, test } from 'vitest'

import * as actions from './index'

test('exports actions', () => {
  expect(actions).toMatchInlineSnapshot(`
    {
      "mine": [Function],
      "setBalance": [Function],
      Symbol(Symbol.toStringTag): "Module",
    }
  `)
})
