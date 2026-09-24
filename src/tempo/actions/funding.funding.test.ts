import { beforeAll, describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
import { generatePrivateKey } from '../../accounts/generatePrivateKey.js'
import { sendTransactionSync } from '../../actions/wallet/sendTransactionSync.js'
import { isAddressEqual, parseUnits } from '../../index.js'
import { Account, Addresses, FundingPolicy, FundingSource } from '../index.js'
import * as actions from './index.js'

const client = getClient()
const recipient = '0x8888888888888888888888888888888888888888' as const
const rules = {
  maxSlippageBps: 100,
  sources: {
    [Addresses.pathUsd]: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
  },
} as const

beforeAll(async () => {
  await actions.token.transferSync(client, {
    account: accounts[0],
    token: Addresses.pathUsd,
    to: accounts[1].address,
    amount: parseUnits('100', 6),
  })
  await actions.dex.placeSync(client, {
    account: accounts[0],
    token: Addresses.alphaUsd,
    amount: parseUnits('1000', 6),
    type: 'buy',
    tick: 0,
  })
})

describe('discover', () => {
  test.each([false, true])(
    'funds a payment (stored policy: %s)',
    async (storedPolicy) => {
      const account = Account.fromSecp256k1(generatePrivateKey())
      await actions.token.mintSync(client, {
        account: accounts[0],
        token: Addresses.alphaUsd,
        to: account.address,
        amount: parseUnits('100', 6),
      })
      const policyId = storedPolicy
        ? (
            await actions.funding.createPolicySync(client, {
              account: accounts[0],
              admins: [accounts[0].address],
              rules,
            })
          ).policyId
        : undefined

      const discovery = await actions.funding.discover(client, {
        policyId,
        account: account.address,
        token: Addresses.pathUsd,
        amount: parseUnits('50', 6),
        rules,
      })
      expect(isAddressEqual(discovery.token, Addresses.pathUsd)).toBe(true)
      expect(discovery.sources).toHaveLength(1)
      expect(
        isAddressEqual(discovery.sources[0]!.to, Addresses.dexFundingSource),
      ).toBe(true)
      expect(discovery.sources[0]?.availableAmount).toBeGreaterThan(0n)

      const receipt = await sendTransactionSync(client, {
        account,
        feePayer: accounts[1],
        feeToken: Addresses.pathUsd,
        requireFunds: [discovery],
        calls: [
          actions.token.transfer.call({
            token: Addresses.pathUsd,
            to: recipient,
            amount: parseUnits('50', 6),
          }),
        ],
      })
      expect(receipt.status).toBe('success')
    },
  )

  test('returns no candidates when inputs are unavailable or the target is covered', async () => {
    const { policyId } = await actions.funding.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules,
    })
    const unfunded = await actions.funding.discover(client, {
      policyId,
      account: Account.fromSecp256k1(generatePrivateKey()).address,
      token: Addresses.pathUsd,
      amount: parseUnits('50', 6),
      rules: FundingPolicy.encode(rules),
    })
    expect(unfunded.sources).toEqual([])

    const covered = await actions.funding.discover(client, {
      policyId,
      account: accounts[0].address,
      token: Addresses.pathUsd,
      amount: parseUnits('1', 6),
      rules: FundingPolicy.encode(rules),
    })
    expect(covered.sources).toEqual([])
  })

  test('rejects an output token without a route', async () => {
    const { policyId } = await actions.funding.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules,
    })
    await expect(
      actions.funding.discover(client, {
        policyId,
        account: accounts[0].address,
        token: Addresses.betaUsd,
        amount: parseUnits('50', 6),
        rules: FundingPolicy.encode(rules),
      }),
    ).rejects.toThrow()
  })

  test('rejects stale rules', async () => {
    const { policyId } = await actions.funding.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules,
    })
    await actions.funding.setPolicyRulesSync(client, {
      account: accounts[0],
      policyId,
      rules: { ...rules, maxSlippageBps: 200 },
    })
    await expect(
      actions.funding.discover(client, {
        policyId,
        account: accounts[0].address,
        token: Addresses.pathUsd,
        amount: parseUnits('1', 6),
        rules: FundingPolicy.encode(rules),
      }),
    ).rejects.toThrow()
  })

  test('rejects a missing policy instead of using rules-only discovery', async () => {
    await expect(
      actions.funding.discover(client, {
        account: accounts[0].address,
        amount: parseUnits('1', 6),
        policyId: 0n,
        rules: FundingPolicy.encode(rules),
        token: Addresses.pathUsd,
      }),
    ).rejects.toThrow()
  })

  test('rejects malformed rules without a stored policy', async () => {
    await expect(
      actions.funding.discover(client, {
        account: accounts[0].address,
        amount: parseUnits('1', 6),
        rules: '0x1234',
        token: Addresses.pathUsd,
      }),
    ).rejects.toThrow()
  })

  test('omits a source that cannot verify the output token', async () => {
    const invalidRules = {
      maxSlippageBps: 100,
      sources: {
        [Addresses.pathUsd]: [{ to: recipient, data: '0x' }],
      },
    } as const
    const { policyId } = await actions.funding.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules: invalidRules,
    })
    const discovery = await actions.funding.discover(client, {
      policyId,
      account: accounts[0].address,
      token: Addresses.pathUsd,
      amount: parseUnits('1', 6),
      rules: FundingPolicy.encode(invalidRules),
    })
    expect(discovery.sources).toEqual([])
  })
})

describe('createPolicy', () => {
  test('creates a policy and emits its rules', async () => {
    const counter = await actions.funding.policyIdCounter(client)
    const created = await actions.funding.createPolicySync(client, {
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
    expect(await actions.funding.policyIdCounter(client)).toBe(counter + 1n)
    expect(
      await actions.funding.policyExists(client, {
        policyId: created.policyId,
      }),
    ).toBe(true)
    expect(
      await actions.funding.getPolicy(client, {
        policyId: created.policyId,
      }),
    ).toMatchObject({ rulesHash: created.rulesHash })
  })

  test('rejects invalid slippage', async () => {
    await expect(
      actions.funding.createPolicySync(client, {
        account: accounts[0],
        admins: [accounts[0].address],
        rules: { ...rules, maxSlippageBps: 10_001 },
      }),
    ).rejects.toThrow()
  })
})

describe('setPolicyRules', () => {
  test('rejects unauthorized updates and changes the commitment', async () => {
    const created = await actions.funding.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules,
    })

    await expect(
      actions.funding.setPolicyRulesSync(client, {
        account: accounts[1],
        policyId: created.policyId,
        rules: { ...rules, maxSlippageBps: 200 },
      }),
    ).rejects.toThrow()

    const updated = await actions.funding.setPolicyRulesSync(client, {
      account: accounts[0],
      policyId: created.policyId,
      rules: { ...rules, maxSlippageBps: 200 },
    })
    expect(updated.rulesHash).toBe(
      FundingPolicy.hash({ ...rules, maxSlippageBps: 200 }),
    )
  })
})

describe('setPolicyAdmins', () => {
  test('replaces administrators without changing the rules commitment', async () => {
    const created = await actions.funding.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules,
    })
    const updated = await actions.funding.setPolicyAdminsSync(client, {
      account: accounts[0],
      admins: [accounts[0].address, accounts[1].address],
      policyId: created.policyId,
    })

    expect(updated.admins).toHaveLength(2)
    expect(
      (
        await actions.funding.getPolicy(client, {
          policyId: created.policyId,
        })
      ).rulesHash,
    ).toBe(created.rulesHash)
  })
})
