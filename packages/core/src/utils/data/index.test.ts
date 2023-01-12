import { expect, test } from 'vitest'

import * as utils from './index'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "concat": [Function],
      "concatBytes": [Function],
      "concatHex": [Function],
      "pad": [Function],
      "padBytes": [Function],
      "padHex": [Function],
      "trim": [Function],
    }
  `)
})
