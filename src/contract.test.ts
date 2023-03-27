import { expect, test } from 'vitest'

import * as contract from './contract.js'

test('exports contract actions', () => {
  expect(Object.keys(contract)).toMatchInlineSnapshot(`
    [
      "createContractEventFilter",
      "estimateContractGas",
      "getBytecode",
      "getStorageAt",
      "multicall",
      "readContract",
      "simulateContract",
      "watchContractEvent",
      "deployContract",
      "writeContract",
      "decodeAbiParameters",
      "decodeErrorResult",
      "decodeEventLog",
      "decodeFunctionData",
      "decodeFunctionResult",
      "encodeAbiParameters",
      "encodeDeployData",
      "encodeErrorResult",
      "encodeEventTopics",
      "encodeFunctionData",
      "encodeFunctionResult",
      "formatAbiItemWithArgs",
      "formatAbiItem",
      "getAbiItem",
    ]
  `)
})
