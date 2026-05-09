import { expect, test } from 'vitest'

import * as solidity from './solidity.js'

test('exports solidity constants', () => {
  expect(solidity).toMatchInlineSnapshot(`
    {
      "panicReasons": {
        "1": "An \`assert\` condition failed.",
        "17": "Arithmetic operation resulted in underflow or overflow.",
        "18": "Division or modulo by zero (e.g. \`5 / 0\` or \`23 % 0\`).",
        "33": "Attempted to convert to an invalid type.",
        "34": "Attempted to access a storage byte array that is incorrectly encoded.",
        "49": "Performed \`.pop()\` on an empty array",
        "50": "Array index is out of bounds.",
        "65": "Allocated too much memory or created an array which is too large.",
        "81": "Attempted to call a zero-initialized variable of internal function type.",
      },
      "solidityError": {
        "inputs": [
          {
            "name": "message",
            "type": "string",
          },
        ],
        "name": "Error",
        "type": "error",
      },
      "solidityPanic": {
        "inputs": [
          {
            "name": "reason",
            "type": "uint256",
          },
        ],
        "name": "Panic",
        "type": "error",
      },
    }
  `)
})
