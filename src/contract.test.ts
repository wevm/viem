import { expect, test } from 'vitest'

import * as contract from './contract'

test('exports contract actions', () => {
  expect(Object.keys(contract)).toMatchInlineSnapshot(`
    [
      "estimateContractGas",
      "getBytecode",
      "getStorageAt",
      "multicall",
      "readContract",
      "simulateContract",
      "watchContractEvent",
      "deployContract",
      "writeContract",
      "decodeAbi",
      "decodeErrorResult",
      "decodeEventLog",
      "decodeFunctionData",
      "decodeFunctionResult",
      "encodeAbi",
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
