import { expect, test } from 'vitest'

import * as ens from './ens'

test('exports ens', () => {
  expect(ens).toMatchInlineSnapshot(`
    {
      "getEnsAddress": [Function],
      "getEnsName": [Function],
      "getEnsResolver": [Function],
      "labelhash": [Function],
      "namehash": [Function],
      "normalize": [Function],
    }
  `)
})
