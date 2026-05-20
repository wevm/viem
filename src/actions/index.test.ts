import { expect, test } from 'vp/test'

import * as actions from './index.js'

test('exports', () => {
  expect(Object.keys(actions).sort()).toMatchInlineSnapshot(`
    [
      "public",
    ]
  `)
})
