import { expect, test } from 'vitest'

import * as number from './index'

test('exports number', () => {
  expect(number).toMatchInlineSnapshot(`
    {
      "hexToNumber": [Function],
      "numberToHex": [Function],
    }
  `)
})
