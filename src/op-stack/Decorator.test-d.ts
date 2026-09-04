import { expectTypeOf, test } from 'vitest'

import { Account, Client, http } from 'viem'
import { optimism } from 'viem/chains'
import {
  Actions,
  type OpStackL1Actions,
  type OpStackL2Actions,
  Withdrawal,
  opStackL1Actions,
  opStackL2Actions,
} from 'viem/op-stack'

const client = Client.create({
  chain: optimism,
  transport: http('http://127.0.0.1'),
})
const account = Account.fromPrivateKey(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const request = {
  gas: 21_000n,
  to: '0x0000000000000000000000000000000000000001',
} as const
declare const game: Actions.l2.buildProveWithdrawal.Game
declare const withdrawalData: Withdrawal.Withdrawal

test('decorator domains', () => {
  expectTypeOf<keyof OpStackL1Actions>().toEqualTypeOf<
    'deposit' | 'withdrawal' | 'game' | 'output' | 'portal'
  >()
  expectTypeOf<keyof OpStackL1Actions['deposit']>().toEqualTypeOf<
    'depositTransaction' | 'estimateDepositTransactionGas'
  >()
  expectTypeOf<keyof OpStackL1Actions['withdrawal']>().toEqualTypeOf<
    | 'buildInitiateWithdrawal'
    | 'estimateFinalizeWithdrawalGas'
    | 'estimateProveWithdrawalGas'
    | 'finalizeWithdrawal'
    | 'getTimeToFinalize'
    | 'getTimeToProve'
    | 'getWithdrawalStatus'
    | 'proveWithdrawal'
    | 'waitToFinalize'
    | 'waitToProve'
  >()
  expectTypeOf<keyof OpStackL1Actions['game']>().toEqualTypeOf<
    'getGame' | 'getGames' | 'getTimeToNextGame' | 'waitForNextGame'
  >()
  expectTypeOf<keyof OpStackL1Actions['output']>().toEqualTypeOf<
    'getL2Output' | 'getTimeToNextL2Output' | 'waitForNextL2Output'
  >()
  expectTypeOf<
    keyof OpStackL1Actions['portal']
  >().toEqualTypeOf<'getPortalVersion'>()

  expectTypeOf<keyof OpStackL2Actions>().toEqualTypeOf<
    'deposit' | 'withdrawal' | 'fee'
  >()
  expectTypeOf<
    keyof OpStackL2Actions['deposit']
  >().toEqualTypeOf<'buildDepositTransaction'>()
  expectTypeOf<keyof OpStackL2Actions['withdrawal']>().toEqualTypeOf<
    | 'buildProveWithdrawal'
    | 'estimateInitiateWithdrawalGas'
    | 'initiateWithdrawal'
  >()
  expectTypeOf<keyof OpStackL2Actions['fee']>().toEqualTypeOf<
    | 'estimateContractL1Fee'
    | 'estimateContractL1Gas'
    | 'estimateContractTotalFee'
    | 'estimateContractTotalGas'
    | 'estimateL1Fee'
    | 'estimateL1Gas'
    | 'estimateOperatorFee'
    | 'estimateTotalFee'
    | 'estimateTotalGas'
    | 'getL1BaseFee'
  >()
})

test('L1 decorator requires an account for writes', () => {
  const decorated = client.extend(opStackL1Actions())
  type Options = Parameters<typeof decorated.deposit.depositTransaction>[0]

  expectTypeOf<Options>().toMatchTypeOf<{
    account: unknown
    request: unknown
  }>()
})

test('L2 decorator preserves contract inference', () => {
  const decorated = client.extend(opStackL2Actions())
  const abi = [
    {
      inputs: [{ name: 'value', type: 'uint256' }],
      name: 'setValue',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ] as const

  decorated.fee.estimateContractL1Fee({
    abi,
    address: '0x0000000000000000000000000000000000000000',
    args: [1n],
    functionName: 'setValue',
  })

  decorated.fee.estimateContractL1Fee({
    abi,
    address: '0x0000000000000000000000000000000000000000',
    // @ts-expect-error invalid argument type
    args: ['1'],
    functionName: 'setValue',
  })
})

test('L2 decorator requires an account for withdrawals', () => {
  const decorated = client.extend(opStackL2Actions())

  decorated.withdrawal.initiateWithdrawal({ account, request })
  decorated.withdrawal.initiateWithdrawal(
    // @ts-expect-error An account is required when the client has none.
    { request },
  )

  const accountClient = Client.create({
    account,
    chain: optimism,
    transport: http('http://127.0.0.1'),
  }).extend(opStackL2Actions())
  accountClient.withdrawal.initiateWithdrawal({ request })
})

test('decorators preserve builder inference', async () => {
  const l1 = client.extend(opStackL1Actions())
  const l2 = client.extend(opStackL2Actions())
  const deposit = await l2.deposit.buildDepositTransaction({
    account: request.to,
    to: request.to,
  })

  expectTypeOf(deposit.account).toEqualTypeOf<
    Account.JsonRpc<typeof request.to>
  >()
  expectTypeOf(deposit.targetChain).toEqualTypeOf<typeof optimism>()
  l1.deposit.depositTransaction(deposit)

  const withdrawal = await l1.withdrawal.buildInitiateWithdrawal({
    account: request.to,
    to: request.to,
  })
  expectTypeOf(withdrawal.account).toEqualTypeOf<
    Account.JsonRpc<typeof request.to>
  >()
  l2.withdrawal.initiateWithdrawal(withdrawal)

  const proof = await l2.withdrawal.buildProveWithdrawal({
    account: request.to,
    game,
    withdrawal: withdrawalData,
  })
  expectTypeOf(proof.account).toEqualTypeOf<typeof request.to>()
  expectTypeOf(proof.targetChain).toEqualTypeOf<typeof optimism>()
  l1.withdrawal.proveWithdrawal(proof)
})
