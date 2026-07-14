import { expect, test } from 'vitest'

import { Client, http } from 'viem'
import { opStackL1Actions, opStackL2Actions } from 'viem/op-stack'

const client = Client.create({
  transport: http('http://127.0.0.1'),
})

test('opStackL1Actions', () => {
  const decorated = client.extend(opStackL1Actions())
  expect(Object.keys(decorated.opStack)).toMatchInlineSnapshot(`
    [
      "buildInitiateWithdrawal",
      "depositTransaction",
      "estimateDepositTransactionGas",
      "estimateFinalizeWithdrawalGas",
      "estimateProveWithdrawalGas",
      "finalizeWithdrawal",
      "getGame",
      "getGames",
      "getL2Output",
      "getPortalVersion",
      "getTimeToFinalize",
      "getTimeToNextGame",
      "getTimeToNextL2Output",
      "getTimeToProve",
      "getWithdrawalStatus",
      "proveWithdrawal",
      "waitForNextGame",
      "waitForNextL2Output",
      "waitToFinalize",
      "waitToProve",
    ]
  `)
})

test('opStackL2Actions', () => {
  const decorated = client.extend(opStackL2Actions())
  expect(Object.keys(decorated.opStack)).toMatchInlineSnapshot(`
    [
      "buildDepositTransaction",
      "buildProveWithdrawal",
      "estimateContractL1Fee",
      "estimateContractL1Gas",
      "estimateContractTotalFee",
      "estimateContractTotalGas",
      "estimateInitiateWithdrawalGas",
      "estimateL1Fee",
      "estimateL1Gas",
      "estimateOperatorFee",
      "estimateTotalFee",
      "estimateTotalGas",
      "getL1BaseFee",
      "initiateWithdrawal",
    ]
  `)
})
