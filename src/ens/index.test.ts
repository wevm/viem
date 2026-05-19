import { expect, test } from 'vp/test'

import * as ens from './index.js'

test('exports', () => {
  expect(Object.keys(ens).sort()).toMatchInlineSnapshot(`
    [
      "InvalidChainIdError",
      "labelhash",
      "namehash",
      "normalize",
      "toCoinType",
    ]
  `)
})
