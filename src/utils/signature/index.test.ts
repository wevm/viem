import { expect, test } from 'vitest'

import * as utils from './index.js'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "hashMessage": [Function],
      "hashTypedData": [Function],
      "recoverAddress": [Function],
      "recoverMessageAddress": [Function],
      "recoverTypedDataAddress": [Function],
      "verifyMessage": [Function],
      "verifyTypedData": [Function],
    }
  `)
})
