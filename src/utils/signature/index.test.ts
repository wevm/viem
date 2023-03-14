import { expect, test } from 'vitest'

import * as utils from './index'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "hashMessage": [Function],
      "recoverAddress": [Function],
      "recoverMessageAddress": [Function],
      "verifyMessage": [Function],
    }
  `)
})
