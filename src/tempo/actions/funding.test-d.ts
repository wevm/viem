import { createClient, http } from 'viem'
import { tempoActions } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'
import * as Addresses from '../Addresses.js'
import type { FundingRequirement } from '../index.js'
import { discover } from './funding.js'

test('discover', () => {
  const account = '0x0000000000000000000000000000000000000001'
  expectTypeOf<discover.ReturnValue>().toExtend<FundingRequirement.FundingRequirement>()

  discover.call({
    account,
    amount: 1n,
    slippageBps: 0,
    sources: [],
    token: Addresses.pathUsd,
  })
  discover.call({
    account,
    amount: 1n,
    policyId: 1n,
    rules: '0x',
    token: Addresses.pathUsd,
  })

  // @ts-expect-error Policy discovery requires complete rules.
  discover.call({ account, amount: 1n, policyId: 1n, token: Addresses.pathUsd })
  // @ts-expect-error Policy-free discovery requires source configurations.
  discover.call({
    account,
    amount: 1n,
    slippageBps: 0,
    token: Addresses.pathUsd,
  })
  // @ts-expect-error Rules must be verified against a policy ID.
  discover.call({ account, amount: 1n, rules: '0x', token: Addresses.pathUsd })
  // @ts-expect-error Policy rules cannot be overridden by source configurations.
  discover.call({
    account,
    amount: 1n,
    policyId: 1n,
    rules: '0x',
    slippageBps: 0,
    sources: [],
    token: Addresses.pathUsd,
  })
})

test('discover account inference', () => {
  const parameters = {
    amount: 1n,
    slippageBps: 0,
    sources: [],
    token: Addresses.pathUsd,
  } as const
  const client = createClient({
    account: '0x0000000000000000000000000000000000000001',
    transport: http('http://localhost:9546'),
  }).extend(tempoActions())
  discover(client, parameters)
  client.funding.discover(parameters)
  discover(client, { ...parameters, account: client.account })

  const publicClient = createClient({
    transport: http('http://localhost:9546'),
  }).extend(tempoActions())
  discover(publicClient, { ...parameters, account: client.account.address })
  // @ts-expect-error An account is required without a client account.
  discover(publicClient, parameters)
  // @ts-expect-error The decorator also requires an account without a client account.
  publicClient.funding.discover(parameters)
})
