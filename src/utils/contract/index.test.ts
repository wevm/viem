import { expect, test } from 'vitest'

import * as utils from './index.js'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "extractFunctionName": [Function],
      "extractFunctionParams": [Function],
      "extractFunctionParts": [Function],
      "extractFunctionType": [Function],
    }
  `)
})
