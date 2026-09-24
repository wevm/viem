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
