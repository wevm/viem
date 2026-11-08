import { expectTypeOf, test } from 'vitest'

import { Account, Client, http } from 'viem'
import { base, optimism } from 'viem/chains'
import { Actions, Withdrawal } from 'viem/op-stack'

const address = '0x0000000000000000000000000000000000000001'
const account = Account.fromPrivateKey(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const request = {
  gas: 21_000n,
  to: '0x0000000000000000000000000000000000000001',
} as const
declare const game: Actions.l2.buildProveWithdrawal.Game
declare const withdrawal: Withdrawal.Withdrawal

test('write actions require an account when the client has none', () => {
  const client = Client.create({ chain: optimism, transport: http() })

  Actions.l2.initiateWithdrawal(client, { account, request })
  Actions.l2.initiateWithdrawal(
    client,
    // @ts-expect-error An account is required when the client has none.
    { request },
  )

  const accountClient = Client.create({
    account,
    chain: optimism,
    transport: http(),
  })
  expectTypeOf(
    Actions.l2.initiateWithdrawal(accountClient, { request }),
  ).resolves.toEqualTypeOf<`0x${string}`>()
})

test('buildDepositTransaction preserves account and chain overrides', async () => {
  const client = Client.create({ transport: http() })
  const result = await Actions.l2.buildDepositTransaction(client, {
    account: address,
    chain: base,
    to: address,
  })

  expectTypeOf(result.account).toEqualTypeOf<Account.JsonRpc<typeof address>>()
  expectTypeOf(result.targetChain).toEqualTypeOf<typeof base>()
  Actions.l1.depositTransaction(client, result)
})

test('buildProveWithdrawal preserves account and chain overrides', async () => {
  const client = Client.create({ transport: http() })
  const result = await Actions.l2.buildProveWithdrawal(client, {
    account: address,
    chain: optimism,
    game,
    withdrawal,
  })

  expectTypeOf(result.account).toEqualTypeOf<typeof address>()
  expectTypeOf(result.targetChain).toEqualTypeOf<typeof optimism>()
  Actions.l1.proveWithdrawal(client, result)

  const accountClient = Client.create({
    account,
    chain: optimism,
    transport: http(),
  })
  const resultFromClient = await Actions.l2.buildProveWithdrawal(
    accountClient,
    { game, withdrawal },
  )
  expectTypeOf(resultFromClient.account).toEqualTypeOf<typeof account>()
  expectTypeOf(resultFromClient.targetChain).toEqualTypeOf<typeof optimism>()
  Actions.l1.proveWithdrawal(client, resultFromClient)
})

test('exports errors under Actions.l2.Errors', () => {
  expectTypeOf(
    new Actions.l2.Errors.StorageProofNotFoundError(),
  ).toEqualTypeOf<Actions.l2.Errors.StorageProofNotFoundError>()
  expectTypeOf(
    new Actions.l2.Errors.TimestampMismatchError({
      blockTimestamp: 1n,
      gameTimestamp: 2n,
    }),
  ).toEqualTypeOf<Actions.l2.Errors.TimestampMismatchError>()

  type FlatErrorKey = Extract<keyof typeof Actions.l2, `${string}Error`>

  expectTypeOf<FlatErrorKey>().toEqualTypeOf<never>()
})
