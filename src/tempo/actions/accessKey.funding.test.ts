import { describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
import { generatePrivateKey } from '../../accounts/generatePrivateKey.js'
import { Account, Addresses, FundingPolicy, FundingSource } from '../index.js'
import * as actions from './index.js'

const client = getClient()

describe('authorizeSync', () => {
  test.each(['existing', 'inline'] as const)(
    'assigns an %s funding policy',
    async (type) => {
      const account = accounts[0]
      const accessKey = Account.fromP256(generatePrivateKey(), {
        access: account,
      })
      const { policyId, rules } = await actions.funding.createPolicySync(
        client,
        {
          account,
          admins: [account.address],
          rules: {
            maxSlippageBps: 100,
            sources: {
              [Addresses.pathUsd]: [
                FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
              ],
            },
          },
        },
      )
      const { receipt } = await actions.accessKey.authorizeSync(client, {
        account,
        accessKey,
        fundingPolicy:
          type === 'existing' ? policyId : { admins: [account.address], rules },
      })
      expect(receipt.status).toBe('success')
      const assigned = await actions.accessKey.getFundingPolicyId(client, {
        account,
        accessKey,
      })
      if (type === 'existing') expect(assigned).toBe(policyId)
      else expect(assigned).toBeGreaterThan(policyId)
      expect(
        (await actions.funding.getPolicy(client, { policyId: assigned }))
          .rulesHash,
      ).toBe(FundingPolicy.hash(rules))
    },
  )
})

describe('getFundingPolicyId', () => {
  test('returns zero for a key without a funding policy', async () => {
    const account = accounts[0]
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: account,
    })
    await actions.accessKey.authorizeSync(client, {
      account,
      accessKey,
    })
    expect(
      await actions.accessKey.getFundingPolicyId(client, {
        account,
        accessKey,
      }),
    ).toBe(0n)
  })
})
