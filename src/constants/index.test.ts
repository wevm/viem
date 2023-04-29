import { expect, test } from 'vitest'

import * as index from './index.js'

test('exports index', () => {
  expect(Object.keys(index)).toMatchInlineSnapshot(`
    [
      "zeroAddress",
      "multicall3Abi",
      "aggregate3Signature",
      "panicReasons",
      "solidityError",
      "solidityPanic",
      "etherUnits",
      "gweiUnits",
      "weiUnits",
    ]
  `)
})
