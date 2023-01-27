import { expect, test } from 'vitest'

import * as utils from './index'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "decodeAbi": [Function],
      "decodeFunctionData": [Function],
      "encodeAbi": [Function],
      "encodeFunctionData": [Function],
    }
  `)
})
