import { expect, test } from 'vp/test'

import * as actions from 'viem/actions'

test('exports', () => {
  expect(Object.keys(actions).sort()).toMatchInlineSnapshot(`
    [
      "public",
    ]
  `)
})
