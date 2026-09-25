import { describe, expect, test } from 'vitest'
import { accounts, getClient, http } from '~test/tempo/config.js'
import { generatePrivateKey } from '../../accounts/generatePrivateKey.js'
import { custom } from '../../clients/transports/custom.js'
import {
  Account,
  Addresses,
  Funding,
  FundingPolicy,
  FundingSource,
  Store,
  withFunding,
} from '../index.js'
import * as actions from './index.js'

const client = getClient()

describe('authorizeSync', () => {
  test('assigns the configured default policy', async () => {
    const { policyId } = await actions.funding.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules: { maxSlippageBps: 0, sources: {} },
    })
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: accounts[0],
    })
    const { receipt } = await actions.accessKey.authorizeSync(
      getClient({
        transport: withFunding(http(), { policyId, store: Store.memory() }),
      }),
      { account: accounts[0], accessKey, fundingPolicy: true },
    )
    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(
      await actions.accessKey.getFundingPolicyId(client, {
        account: accounts[0],
        accessKey,
      }),
    ).toBe(policyId)
  })

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

describe('behavior', () => {
  test('rejects relay changes before signing the key authorization', async () => {
    const { policyId } = await actions.funding.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules: { maxSlippageBps: 0, sources: {} },
    })
    const handler = Funding.handleRequest(
      (request, options) => client.request(request as never, options),
      { policyId },
    )
    const accessKey = Account.fromP256(generatePrivateKey(), {
      access: accounts[0],
    })
    const results = []
    for (const [field, value] of [
      ['keyId', accounts[1].address],
      ['chainId', '0x1'],
      ['expiry', '0x1'],
      ['limits', []],
      ['allowedCalls', []],
      ['account', accounts[1].address],
      ['keyType', 'secp256k1'],
      ['witness', `0x${'22'.repeat(32)}`],
      ['isAdmin', true],
      ['signature', {}],
      ['fundingPolicy', true],
      ['fundingPolicy', '0x0'],
      ['fundingPolicy', undefined],
    ] as const) {
      // Alter a real handler response to exercise an untrusted relay boundary.
      const transport = custom({
        request: async (request) => {
          const result = await handler(request)
          if (request.method !== 'eth_fillKeyAuthorization') return result
          const response = result as Funding.RpcSchema[1]['ReturnType']
          return {
            ...response,
            keyAuthorization: { ...response.keyAuthorization, [field]: value },
          }
        },
      })
      const result = await actions.accessKey
        .signAuthorization(getClient({ transport }), {
          account: accounts[0],
          accessKey,
          expiry: 4_000_000_000,
          fundingPolicy: true,
          limits: [{ token: Addresses.pathUsd, limit: 50_000_000n }],
          scopes: [{ address: Addresses.pathUsd, selector: '0xa9059cbb' }],
          witness: `0x${'11'.repeat(32)}`,
        })
        .catch((error) => error)
      results.push({ field, result })
    }
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "field": "keyId",
          "result": [RpcResponse.InvalidParamsError: \`eth_fillKeyAuthorization\` changed \`keyAuthorization.keyId\`.],
        },
        {
          "field": "chainId",
          "result": [RpcResponse.InvalidParamsError: \`eth_fillKeyAuthorization\` changed \`keyAuthorization.chainId\`.],
        },
        {
          "field": "expiry",
          "result": [RpcResponse.InvalidParamsError: \`eth_fillKeyAuthorization\` changed \`keyAuthorization.expiry\`.],
        },
        {
          "field": "limits",
          "result": [RpcResponse.InvalidParamsError: \`eth_fillKeyAuthorization\` changed \`keyAuthorization.limits\`.],
        },
        {
          "field": "allowedCalls",
          "result": [RpcResponse.InvalidParamsError: \`eth_fillKeyAuthorization\` changed \`keyAuthorization.allowedCalls\`.],
        },
        {
          "field": "account",
          "result": [RpcResponse.InvalidParamsError: \`eth_fillKeyAuthorization\` changed \`keyAuthorization.account\`.],
        },
        {
          "field": "keyType",
          "result": [RpcResponse.InvalidParamsError: \`eth_fillKeyAuthorization\` changed \`keyAuthorization.keyType\`.],
        },
        {
          "field": "witness",
          "result": [RpcResponse.InvalidParamsError: \`eth_fillKeyAuthorization\` changed \`keyAuthorization.witness\`.],
        },
        {
          "field": "isAdmin",
          "result": [RpcResponse.InvalidParamsError: \`eth_fillKeyAuthorization\` changed \`keyAuthorization.isAdmin\`.],
        },
        {
          "field": "signature",
          "result": [RpcResponse.InvalidParamsError: \`eth_fillKeyAuthorization\` must return an unsigned \`keyAuthorization\`.],
        },
        {
          "field": "fundingPolicy",
          "result": [RpcResponse.InvalidParamsError: \`eth_fillKeyAuthorization\` must resolve \`fundingPolicy\` to a nonzero uint64 policy ID.],
        },
        {
          "field": "fundingPolicy",
          "result": [RpcResponse.InvalidParamsError: \`eth_fillKeyAuthorization\` must resolve \`fundingPolicy\` to a nonzero uint64 policy ID.],
        },
        {
          "field": "fundingPolicy",
          "result": [RpcResponse.InvalidParamsError: \`eth_fillKeyAuthorization\` must resolve \`fundingPolicy\` to a nonzero uint64 policy ID.],
        },
      ]
    `)
  })
})
