import { expect, test } from 'vitest'

import * as tokens from './index.js'

test('exports', () => {
  expect(Object.keys(tokens)).toMatchInlineSnapshot(`
    [
      "defineToken",
      "usdc",
    ]
  `)
})
