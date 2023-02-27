import { expect, test } from 'vitest'

import * as index from './index'

test('exports index', () => {
  expect(Object.keys(index)).toMatchInlineSnapshot(`
    [
      "multicall3Abi",
      "panicReasons",
      "solidityError",
      "solidityPanic",
      "etherUnits",
      "gweiUnits",
      "weiUnits",
    ]
  `)
})
