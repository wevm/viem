import { expect, test } from 'vitest'

import * as utils from './index'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "pad": [Function],
      "padBytes": [Function],
      "padHex": [Function],
      "trim": [Function],
      "trimBytes": [Function],
      "trimHex": [Function],
    }
  `)
})
