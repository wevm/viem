import { expect, test } from 'vitest'

import { Client, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { opStackL1Actions, opStackL2Actions } from 'viem/op-stack'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const client = Client.create({
  transport: http('http://127.0.0.1'),
})

const l1Client = Client.create({
  account: constants.accounts[0].address,
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
}).extend(opStackL1Actions())
const l2Client = Client.create({
  account: constants.accounts[0].address,
  chain: optimism,
  transport: http(anvil.optimism.rpcUrl.http),
}).extend(opStackL2Actions())

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

test(
  'opStackL1Actions execute decorated actions',
  { timeout: 60_000 },
  async () => {
    const prepared = await l1Client.withdrawal.buildInitiateWithdrawal({
      to: constants.accounts[1].address,
    })
    expect(prepared.request.gas).toBeGreaterThan(0n)

    const version = await l1Client.portal.getPortalVersion({
      targetChain: optimism,
    })
    expect(version.major).toBeGreaterThan(0)
    expect(
      await l1Client.deposit.estimateDepositTransactionGas({
        account: constants.accounts[0].address,
        request: {
          gas: 21_000n,
          to: constants.accounts[1].address,
        },
        targetChain: optimism,
      }),
    ).toBeGreaterThan(0n)

    expect(
      await l1Client.deposit.depositTransaction({
        account: constants.accounts[0].address,
        request: {
          gas: 21_000n,
          to: constants.accounts[1].address,
        },
        targetChain: optimism,
      }),
    ).toMatch(/^0x[\da-f]{64}$/)
  },
)

test(
  'opStackL2Actions execute decorated actions',
  { timeout: 60_000 },
  async () => {
    const request = {
      account: constants.accounts[0].address,
      to: constants.accounts[1].address,
      value: 1n,
    } as const

    const deposit = await l2Client.deposit.buildDepositTransaction({
      to: constants.accounts[1].address,
    })
    expect(deposit.request.gas).toBeGreaterThan(0n)

    expect(
      await l2Client.withdrawal.estimateInitiateWithdrawalGas({
        account: constants.accounts[0].address,
        request: { gas: 21_000n, to: constants.accounts[1].address },
      }),
    ).toBeGreaterThan(0n)
    expect(
      await l2Client.withdrawal.initiateWithdrawal({
        account: constants.accounts[0].address,
        request: { gas: 21_000n, to: constants.accounts[1].address },
      }),
    ).toMatch(/^0x[\da-f]{64}$/)

    const contract = {
      abi: generated.Erc721.abi,
      account: constants.accounts[0].address,
      address: constants.accounts[1].address,
      functionName: 'mint',
    } as const
    expect(await l2Client.fee.estimateContractL1Fee(contract)).toBeGreaterThan(
      0n,
    )
    expect(await l2Client.fee.estimateContractL1Gas(contract)).toBeGreaterThan(
      0n,
    )
    expect(
      await l2Client.fee.estimateContractTotalFee(contract),
    ).toBeGreaterThan(0n)
    expect(
      await l2Client.fee.estimateContractTotalGas(contract),
    ).toBeGreaterThan(0n)
    expect(await l2Client.fee.estimateL1Fee(request)).toBeGreaterThan(0n)
    expect(await l2Client.fee.estimateL1Gas(request)).toBeGreaterThan(0n)
    expect(
      await l2Client.fee.estimateOperatorFee(request),
    ).toMatchInlineSnapshot(`0n`)
    expect(await l2Client.fee.estimateTotalFee(request)).toBeGreaterThan(0n)
    expect(await l2Client.fee.estimateTotalGas(request)).toBeGreaterThan(0n)
    expect(await l2Client.fee.getL1BaseFee()).toBeGreaterThan(0n)
  },
)
