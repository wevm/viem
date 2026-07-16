import { expect, test } from 'vitest'

import { Client, http } from 'viem'
import { opStackL1Actions, opStackL2Actions } from 'viem/op-stack'

const client = Client.create({
  transport: http('http://127.0.0.1'),
})

test('opStackL1Actions', () => {
  const decorated = client.extend(opStackL1Actions())
  expect({
    deposit: Object.keys(decorated.deposit),
    withdrawal: Object.keys(decorated.withdrawal),
    game: Object.keys(decorated.game),
    output: Object.keys(decorated.output),
    portal: Object.keys(decorated.portal),
  }).toMatchInlineSnapshot(`
    {
      "deposit": [
        "depositTransaction",
        "estimateDepositTransactionGas",
      ],
      "game": [
        "getGame",
        "getGames",
        "getTimeToNextGame",
        "waitForNextGame",
      ],
      "output": [
        "getL2Output",
        "getTimeToNextL2Output",
        "waitForNextL2Output",
      ],
      "portal": [
        "getPortalVersion",
      ],
      "withdrawal": [
        "buildInitiateWithdrawal",
        "estimateFinalizeWithdrawalGas",
        "estimateProveWithdrawalGas",
        "finalizeWithdrawal",
        "getTimeToFinalize",
        "getTimeToProve",
        "getWithdrawalStatus",
        "proveWithdrawal",
        "waitToFinalize",
        "waitToProve",
      ],
    }
  `)
  expect(decorated).not.toHaveProperty('opStack')
})

test('opStackL2Actions', () => {
  const decorated = client.extend(opStackL2Actions())
  expect({
    deposit: Object.keys(decorated.deposit),
    withdrawal: Object.keys(decorated.withdrawal),
    fee: Object.keys(decorated.fee),
  }).toMatchInlineSnapshot(`
    {
      "deposit": [
        "buildDepositTransaction",
      ],
      "fee": [
        "estimateContractL1Fee",
        "estimateContractL1Gas",
        "estimateContractTotalFee",
        "estimateContractTotalGas",
        "estimateL1Fee",
        "estimateL1Gas",
        "estimateOperatorFee",
        "estimateTotalFee",
        "estimateTotalGas",
        "getL1BaseFee",
      ],
      "withdrawal": [
        "buildProveWithdrawal",
        "estimateInitiateWithdrawalGas",
        "initiateWithdrawal",
      ],
    }
  `)
  expect(decorated).not.toHaveProperty('opStack')
})
