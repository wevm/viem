import type { Hex } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Account, Client, http } from 'viem'
import { optimism } from 'viem/chains'
import { Actions } from 'viem/op-stack'

const address = '0x0000000000000000000000000000000000000001'
const account = Account.fromPrivateKey(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)

test('write actions accept a null chain override', () => {
  const client = Client.create({ account, transport: http() })
  expectTypeOf(
    Actions.l1.depositTransaction(client, {
      chain: null,
      portalAddress: address,
      request: { gas: 21_000n, to: address },
    }),
  ).resolves.toEqualTypeOf<Hex.Hex>()
})

test('write actions require an account when the client has none', () => {
  const client = Client.create({ transport: http() })

  Actions.l1.depositTransaction(client, {
    account,
    request: { gas: 21_000n, to: address },
    targetChain: optimism,
  })

  Actions.l1.depositTransaction(
    client,
    // @ts-expect-error An account is required when the client has none.
    {
      request: { gas: 21_000n, to: address },
      targetChain: optimism,
    },
  )
})

test('buildInitiateWithdrawal preserves an account override', async () => {
  const client = Client.create({ chain: optimism, transport: http() })
  const result = await Actions.l1.buildInitiateWithdrawal(client, {
    account: address,
    to: address,
  })

  expectTypeOf(result.account).toEqualTypeOf<Account.JsonRpc<typeof address>>()
  Actions.l2.initiateWithdrawal(client, result)

  const resultWithoutAccount = await Actions.l1.buildInitiateWithdrawal(
    client,
    { to: address },
  )
  expectTypeOf(resultWithoutAccount.account).toEqualTypeOf<undefined>()
})
