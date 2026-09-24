import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
import { rpcUrl } from '~test/tempo/prool.js'
import { generatePrivateKey } from '../accounts/generatePrivateKey.js'
import { sendTransactionSync } from '../actions/index.js'
import { isAddressEqual, parseUnits } from '../index.js'
import {
  Account,
  Actions,
  Addresses,
  FundingPolicy,
  FundingSource,
} from './index.js'

const client = getClient()
const recipient = '0x8888888888888888888888888888888888888888' as const
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

beforeAll(async () => {
  await Actions.token.transferSync(client, {
    account: accounts[0],
    token: Addresses.pathUsd,
    to: accounts[1].address,
    amount: parseUnits('100', 6),
  })
  await Actions.dex.placeSync(client, {
    account: accounts[0],
    token: Addresses.alphaUsd,
    amount: parseUnits('1000', 6),
    type: 'buy',
    tick: 0,
  })
})

afterAll(async () => {
  await fetch(`${rpcUrl}/stop`)
})

describe('Actions.fundingPolicy', () => {
  test('creates a policy, discovers funds, and pays from a candidate', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())
    await Actions.token.mintSync(client, {
      account: accounts[0],
      token: Addresses.alphaUsd,
      to: account.address,
      amount: parseUnits('100', 6),
    })

    const counter = await Actions.fundingPolicy.policyIdCounter(client)
    const created = await Actions.fundingPolicy.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules,
    })
    expect(created.receipt.status).toBe('success')
    expect(created.policyId).toBe(counter)
    expect(await Actions.fundingPolicy.policyIdCounter(client)).toBe(
      counter + 1n,
    )
    expect(created.rulesHash).toBe(FundingPolicy.hash(rules))
    expect(
      await Actions.fundingPolicy.policyExists(client, {
        policyId: created.policyId,
      }),
    ).toBe(true)
    expect(
      await Actions.fundingPolicy.getPolicy(client, {
        policyId: created.policyId,
      }),
    ).toMatchObject({ rulesHash: FundingPolicy.hash(rules) })

    const discovery = await Actions.fundingDiscovery.discover(client, {
      policyId: created.policyId,
      account: account.address,
      token: Addresses.pathUsd,
      amount: parseUnits('50', 6),
      policyRules: FundingPolicy.encode(rules),
    })
    expect(isAddressEqual(discovery.token, Addresses.pathUsd)).toBe(true)
    expect(discovery.sources.length).toBeGreaterThan(0)
    expect(
      isAddressEqual(
        discovery.sources[0]!.target,
        Addresses.nativeDexFundingSource,
      ),
    ).toBe(true)
    expect(discovery.sources[0]?.availableAmount).toBeGreaterThan(0n)

    const unfunded = await Actions.fundingDiscovery.discover(client, {
      policyId: created.policyId,
      account: Account.fromSecp256k1(generatePrivateKey()).address,
      token: Addresses.pathUsd,
      amount: parseUnits('50', 6),
      policyRules: FundingPolicy.encode(rules),
    })
    expect(unfunded.sources).toEqual([])

    const covered = await Actions.fundingDiscovery.discover(client, {
      policyId: created.policyId,
      account: accounts[0].address,
      token: Addresses.pathUsd,
      amount: parseUnits('1', 6),
      policyRules: FundingPolicy.encode(rules),
    })
    expect(covered.sources).toEqual([])

    await expect(
      Actions.fundingDiscovery.discover(client, {
        policyId: created.policyId,
        account: account.address,
        token: Addresses.betaUsd,
        amount: parseUnits('50', 6),
        policyRules: FundingPolicy.encode(rules),
      }),
    ).rejects.toThrow()

    const receipt = await sendTransactionSync(client, {
      account,
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          token: Addresses.pathUsd,
          amount: parseUnits('50', 6),
          slippageBps: 100,
          sources: discovery.sources.map(({ target, data }) => ({
            to: target,
            data,
          })),
        },
      ],
      calls: [
        Actions.token.transfer.call({
          token: Addresses.pathUsd,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
    })
    expect(receipt.status).toBe('success')
  })

  test('rejects unauthorized updates and stale rules', async () => {
    const created = await Actions.fundingPolicy.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules,
    })
    await expect(
      Actions.fundingPolicy.setRulesSync(client, {
        account: accounts[1],
        policyId: created.policyId,
        rules: { ...rules, maxSlippageBps: 200 },
      }),
    ).rejects.toThrow()

    const updated = await Actions.fundingPolicy.setRulesSync(client, {
      account: accounts[0],
      policyId: created.policyId,
      rules: { ...rules, maxSlippageBps: 200 },
    })
    expect(updated.rulesHash).toBe(
      FundingPolicy.hash({ ...rules, maxSlippageBps: 200 }),
    )
    await expect(
      Actions.fundingDiscovery.discover(client, {
        policyId: created.policyId,
        account: accounts[0].address,
        token: Addresses.pathUsd,
        amount: parseUnits('1', 6),
        policyRules: FundingPolicy.encode(rules),
      }),
    ).rejects.toThrow()

    const adminsUpdated = await Actions.fundingPolicy.setAdminsSync(client, {
      account: accounts[0],
      policyId: created.policyId,
      admins: [accounts[0].address, accounts[1].address],
    })
    expect(adminsUpdated.admins).toHaveLength(2)
    expect(
      (
        await Actions.fundingPolicy.getPolicy(client, {
          policyId: created.policyId,
        })
      ).rulesHash,
    ).toBe(updated.rulesHash)
  })

  test('omits a source that cannot verify its output token', async () => {
    const invalidRules = {
      maxSlippageBps: 100,
      sources: {
        [Addresses.pathUsd]: [{ target: recipient, data: '0x' }],
      },
    } as const
    const created = await Actions.fundingPolicy.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules: invalidRules,
    })
    const discovery = await Actions.fundingDiscovery.discover(client, {
      policyId: created.policyId,
      account: accounts[0].address,
      token: Addresses.pathUsd,
      amount: parseUnits('1', 6),
      policyRules: FundingPolicy.encode(invalidRules),
    })
    expect(discovery.sources).toEqual([])
  })

  test('rejects a policy with invalid slippage', async () => {
    await expect(
      Actions.fundingPolicy.createPolicySync(client, {
        account: accounts[0],
        admins: [accounts[0].address],
        rules: { ...rules, maxSlippageBps: 10_001 },
      }),
    ).rejects.toThrow()
  })
})
