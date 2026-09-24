import { describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
import { Addresses, FundingPolicy, FundingSource } from '../index.js'
import * as actions from './index.js'

const client = getClient()
const rules = {
  maxSlippageBps: 100,
  sources: {
    [Addresses.pathUsd]: [
      {
        target: Addresses.nativeDexFundingSource,
        data: FundingSource.encodeData({ tokenIn: Addresses.alphaUsd }),
      },
    ],
  },
} as const

describe('createPolicy', () => {
  test('creates a policy and emits its rules', async () => {
    const counter = await actions.fundingPolicy.policyIdCounter(client)
    const created = await actions.fundingPolicy.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules,
    })

    expect(created.receipt.status).toBe('success')
    expect(created.policyId).toBe(counter)
    expect(created.rulesHash).toBe(FundingPolicy.hash(rules))
    expect(created.rules.maxSlippageBps).toBe(100)
    expect(created.rules.routes).toHaveLength(1)
    expect(created.rules.routes[0]?.sources).toHaveLength(1)
    expect(await actions.fundingPolicy.policyIdCounter(client)).toBe(
      counter + 1n,
    )
    expect(
      await actions.fundingPolicy.policyExists(client, {
        policyId: created.policyId,
      }),
    ).toBe(true)
    expect(
      await actions.fundingPolicy.getPolicy(client, {
        policyId: created.policyId,
      }),
    ).toMatchObject({ rulesHash: created.rulesHash })
  })

  test('rejects invalid slippage', async () => {
    await expect(
      actions.fundingPolicy.createPolicySync(client, {
        account: accounts[0],
        admins: [accounts[0].address],
        rules: { ...rules, maxSlippageBps: 10_001 },
      }),
    ).rejects.toThrow()
  })
})

describe('setRules', () => {
  test('rejects unauthorized updates and changes the commitment', async () => {
    const created = await actions.fundingPolicy.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules,
    })

    await expect(
      actions.fundingPolicy.setRulesSync(client, {
        account: accounts[1],
        policyId: created.policyId,
        rules: { ...rules, maxSlippageBps: 200 },
      }),
    ).rejects.toThrow()

    const updated = await actions.fundingPolicy.setRulesSync(client, {
      account: accounts[0],
      policyId: created.policyId,
      rules: { ...rules, maxSlippageBps: 200 },
    })
    expect(updated.rulesHash).toBe(
      FundingPolicy.hash({ ...rules, maxSlippageBps: 200 }),
    )
  })
})

describe('setAdmins', () => {
  test('replaces administrators without changing the rules commitment', async () => {
    const created = await actions.fundingPolicy.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules,
    })
    const updated = await actions.fundingPolicy.setAdminsSync(client, {
      account: accounts[0],
      admins: [accounts[0].address, accounts[1].address],
      policyId: created.policyId,
    })

    expect(updated.admins).toHaveLength(2)
    expect(
      (
        await actions.fundingPolicy.getPolicy(client, {
          policyId: created.policyId,
        })
      ).rulesHash,
    ).toBe(created.rulesHash)
  })
})
