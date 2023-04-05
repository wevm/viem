import { expect, test } from 'vitest'

import * as utils from './index.js'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "labelhash": [Function],
      "namehash": [Function],
      "packetToBytes": [Function],
      "parseAvatarRecord": [Function],
    }
  `)
})
