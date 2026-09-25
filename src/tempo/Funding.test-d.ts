import { http } from 'viem'
import {
  Actions,
  Addresses,
  Funding,
  FundingSource,
  type Transaction,
  withFunding,
} from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'

test('owner funding intent', () => {
  const requirement = { amount: 50n, token: Addresses.pathUsd } as const
  expectTypeOf(requirement).toExtend<Funding.Requirement>()
  expectTypeOf(requirement).not.toExtend<
    NonNullable<
      Transaction.TransactionSerializableTempo['requireFunds']
    >[number]
  >()
  void Actions.token.transferSync(getClient(), {
    account: accounts[0],
    amount: 50n,
    requireFunds: true,
    to: accounts[1].address,
    token: Addresses.pathUsd,
  })
})

test('token-only action requirement', () => {
  void Actions.token.transferSync(getClient(), {
    account: accounts[0],
    amount: 50n,
    requireFunds: [{ token: Addresses.pathUsd }],
    to: accounts[1].address,
    token: Addresses.pathUsd,
  })
})

test('transport metadata', () => {
  const client = getClient({
    transport: withFunding(http(), {
      getRoute: ({ token }) => {
        if (token.toLowerCase() === Addresses.pathUsd.toLowerCase())
          return {
            sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
          }
        return undefined
      },
    }),
  })
  // getClient deliberately erases the transport type; verify the wrapper directly.
  const transport = withFunding(http(), {})({})
  expectTypeOf(transport.value!.funding).toEqualTypeOf<true>()
  expectTypeOf(transport.config.type).toEqualTypeOf<'http'>()
  expectTypeOf(client.request).toBeFunction()
})

test('getRoute callback', () => {
  Funding.handleRequest(getClient().request as Funding.handleRequest.Handler, {
    getRoute: async ({ chainId, token, transaction }) => {
      expectTypeOf(chainId).toEqualTypeOf<number>()
      expectTypeOf(token).toEqualTypeOf<`0x${string}`>()
      expectTypeOf(transaction).toEqualTypeOf<
        Readonly<Funding.handleRequest.Transaction>
      >()
      return { sources: [FundingSource.dex({ tokenIn: token })] }
    },
  })
  withFunding(http())
})

test('rule registration RPC', () => {
  const client = getClient()
  const result = client.request<Funding.RpcSchema[0]>({
    method: 'funding_registerPolicyRules',
    params: [{ chainId: '0x539', rules: '0x' }],
  })
  expectTypeOf(result).toEqualTypeOf<Promise<{ rulesHash: `0x${string}` }>>()
})
