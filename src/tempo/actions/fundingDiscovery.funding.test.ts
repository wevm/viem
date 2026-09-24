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
    [Addresses.pathUsd]: [
      {
        target: Addresses.nativeDexFundingSource,
        data: FundingSource.encodeData({ tokenIn: Addresses.alphaUsd }),
      },
    ],
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
  test('finds a source and uses it to fund a payment', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())
    await actions.token.mintSync(client, {
      account: accounts[0],
      token: Addresses.alphaUsd,
      to: account.address,
      amount: parseUnits('100', 6),
    })
    const { policyId } = await actions.fundingPolicy.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules,
    })

    const discovery = await actions.fundingDiscovery.discover(client, {
      policyId,
      account: account.address,
      token: Addresses.pathUsd,
      amount: parseUnits('50', 6),
      policyRules: FundingPolicy.encode(rules),
    })
    expect(isAddressEqual(discovery.token, Addresses.pathUsd)).toBe(true)
    expect(discovery.sources).toHaveLength(1)
    expect(
      isAddressEqual(
        discovery.sources[0]!.to,
        Addresses.nativeDexFundingSource,
      ),
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
  })

  test('returns no candidates when inputs are unavailable or the target is covered', async () => {
    const { policyId } = await actions.fundingPolicy.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules,
    })
    const unfunded = await actions.fundingDiscovery.discover(client, {
      policyId,
      account: Account.fromSecp256k1(generatePrivateKey()).address,
      token: Addresses.pathUsd,
      amount: parseUnits('50', 6),
      policyRules: FundingPolicy.encode(rules),
    })
    expect(unfunded.sources).toEqual([])

    const covered = await actions.fundingDiscovery.discover(client, {
      policyId,
      account: accounts[0].address,
      token: Addresses.pathUsd,
      amount: parseUnits('1', 6),
      policyRules: FundingPolicy.encode(rules),
    })
    expect(covered.sources).toEqual([])
  })

  test('rejects an output token without a route', async () => {
    const { policyId } = await actions.fundingPolicy.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules,
    })
    await expect(
      actions.fundingDiscovery.discover(client, {
        policyId,
        account: accounts[0].address,
        token: Addresses.betaUsd,
        amount: parseUnits('50', 6),
        policyRules: FundingPolicy.encode(rules),
      }),
    ).rejects.toThrow()
  })

  test('rejects stale rules', async () => {
    const { policyId } = await actions.fundingPolicy.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules,
    })
    await actions.fundingPolicy.setRulesSync(client, {
      account: accounts[0],
      policyId,
      rules: { ...rules, maxSlippageBps: 200 },
    })
    await expect(
      actions.fundingDiscovery.discover(client, {
        policyId,
        account: accounts[0].address,
        token: Addresses.pathUsd,
        amount: parseUnits('1', 6),
        policyRules: FundingPolicy.encode(rules),
      }),
    ).rejects.toThrow()
  })

  test('omits a source that cannot verify the output token', async () => {
    const invalidRules = {
      maxSlippageBps: 100,
      sources: {
        [Addresses.pathUsd]: [{ target: recipient, data: '0x' }],
      },
    } as const
    const { policyId } = await actions.fundingPolicy.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules: invalidRules,
    })
    const discovery = await actions.fundingDiscovery.discover(client, {
      policyId,
      account: accounts[0].address,
      token: Addresses.pathUsd,
      amount: parseUnits('1', 6),
      policyRules: FundingPolicy.encode(invalidRules),
    })
    expect(discovery.sources).toEqual([])
  })
})
