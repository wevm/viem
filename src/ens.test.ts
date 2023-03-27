import { expect, test } from 'vitest'

import * as ens from './ens.js'

test('exports ens', () => {
  expect(ens).toMatchInlineSnapshot(`
    {
      "getEnsAddress": [Function],
      "getEnsName": [Function],
      "labelhash": [Function],
      "namehash": [Function],
      "normalize": [Function],
    }
  `)
})
