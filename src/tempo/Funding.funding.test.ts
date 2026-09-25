import { FundingRequirement, KeyAuthorization } from 'ox/tempo'
import { parseUnits } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import {
  Account,
  Actions,
  Addresses,
  Funding,
  FundingPolicy,
  FundingSource,
  Store,
} from 'viem/tempo'
import { beforeAll, describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'

const client = getClient()

beforeAll(async () => {
  await Actions.token.transferSync(client, {
    account: accounts[0],
    amount: parseUnits('100', 6),
    to: accounts[1].address,
    token: Addresses.pathUsd,
  })

  // Initialize every standard input pair inspected by the default route.
  for (const token of [
    Addresses.alphaUsd,
    Addresses.betaUsd,
    Addresses.thetaUsd,
  ] as const)
    await Actions.dex.placeSync(client, {
      account: accounts[0],
      amount: parseUnits('1000', 6),
      tick: 0,
      token,
      type: 'buy',
    })
})

describe('handleRequest', () => {
  test('registers rules by chain and hash without granting policy authority', async () => {
    const store = Store.memory()
    const handler = Funding.handleRequest(
      (request, options) => client.request(request as never, options),
      { store },
    )
    const rules = FundingPolicy.encode({ maxSlippageBps: 100, sources: {} })
    const result = (await handler({
      method: 'funding_registerPolicyRules',
      params: [{ chainId: '0x539', rules }],
    })) as { rulesHash: `0x${string}` }
    expect(result).toMatchInlineSnapshot(`
      {
        "rulesHash": "0x7846a084481e81b28e65d2c2163c18e2a07ff86b3a52836cac307fb04e7a8c18",
      }
    `)
    expect(
      await handler({
        method: 'funding_registerPolicyRules',
        params: [{ chainId: '0x539', rules }],
      }),
    ).toEqual(result)
    expect(
      await store.getItem(
        `funding:1337:${Addresses.fundingPolicy}:rules:${result.rulesHash}`,
      ),
    ).toEqual(rules)
    expect(
      await store.getItem(
        `funding:4217:${Addresses.fundingPolicy}:rules:${result.rulesHash}`,
      ),
    ).toBeNull()
  })

  test.each([undefined, '0x539'] as const)(
    'fills an unsigned RPC funding requirement with chainId %s',
    async (chainId) => {
      const account = await setupAccount()
      await Actions.token.mintSync(client, {
        account: accounts[0],
        amount: parseUnits('1', 6),
        to: account.address,
        token: Addresses.pathUsd,
      })
      const handler = Funding.handleRequest(
        (request, options) => client.request(request as never, options),
        chainId === undefined
          ? {
              getRoute: ({ chainId, transaction }) =>
                chainId === 4217 &&
                transaction.from === account.address &&
                transaction.calls?.[0]?.to === accounts[1].address
                  ? {
                      sources: [
                        FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
                      ],
                    }
                  : undefined,
            }
          : {},
      )
      const result = (await handler({
        method: 'eth_fillTransaction',
        params: [
          {
            chainId,
            from: account.address,
            calls: [{ to: accounts[1].address, data: '0x', value: '0x0' }],
            requireFunds: [{ amount: '0x2faf080', token: Addresses.pathUsd }],
          },
        ],
      })) as Funding.handleRequest.Result
      expect(result).toMatchInlineSnapshot(
        {
          raw: expect.any(String),
          tx: {
            gas: expect.any(String),
            hash: expect.any(String),
            maxFeePerGas: expect.any(String),
          },
        },
        `
      {
        "raw": Any<String>,
        "tx": {
          "aaAuthorizationList": [],
          "accessList": [],
          "calls": [
            {
              "data": null,
              "input": "0x",
              "to": "0x8c8d35429f74ec245f8ef2f4fd1e551cff97d650",
              "value": "0x0",
            },
          ],
          "chainId": "0x539",
          "feePayerSignature": null,
          "feeToken": null,
          "gas": Any<String>,
          "hash": Any<String>,
          "keyAuthorization": null,
          "maxFeePerGas": Any<String>,
          "maxPriorityFeePerGas": "0x0",
          "nonce": "0x0",
          "nonceKey": "0x0",
          "requireFunds": [
            {
              "amount": "0x2faf080",
              "slippageBps": "0x0",
              "sources": [
                {
                  "data": "0x00000000000000000000000020c00000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000002ebae40",
                  "target": "0x1120000000000000000000000000000000000001",
                },
              ],
              "token": "0x20c0000000000000000000000000000000000000",
            },
          ],
          "signature": {
            "r": "0x840cfc572845f5786e702984c2a582528cad4b49b2a10b9db1be7fca90058565",
            "s": "0x25e7109ceb98168d95b09b18bbf6b685130e0562f233877d492b94eee0c5b6d1",
            "type": "secp256k1",
            "v": "0x0",
            "yParity": "0x0",
          },
          "type": "0x76",
          "validAfter": null,
          "validBefore": null,
        },
      }
    `,
      )
    },
  )

  test('passes unrelated RPC requests through', async () => {
    const handler = Funding.handleRequest((request, options) =>
      client.request(request as never, options),
    )
    expect(await handler({ method: 'eth_chainId' })).toMatchInlineSnapshot(
      '"0x539"',
    )
  })
})

describe('behavior', () => {
  test('rejects malformed rule registrations', async () => {
    const handler = Funding.handleRequest((request, options) =>
      client.request(request as never, options),
    )
    const results = []
    for (const params of [
      [],
      [{ chainId: '0x0', rules: '0x' }],
      [{ chainId: '0x539', rules: '0x' }],
      [{ chainId: '0x1', rules: '0x' }],
    ])
      results.push(
        await handler(
          {
            method: 'funding_registerPolicyRules',
            params,
          },
          { chainId: 1337 },
        ).catch((error) => error),
      )
    expect(results).toMatchInlineSnapshot(`
      [
        [RpcResponse.InvalidParamsError: Expected one parameter containing \`chainId\` and encoded \`rules\`.],
        [RpcResponse.InvalidParamsError: Registration requires a valid \`chainId\` matching the request chain.],
        [RpcResponse.InvalidParamsError: \`rules\` must contain canonical ABI-encoded funding policy rules.],
        [RpcResponse.InvalidParamsError: Registration requires a valid \`chainId\` matching the request chain.],
      ]
    `)
  })

  test('rejects invalid delegated funding', async () => {
    const results = []
    for (const failure of [
      'missing policy',
      'expired',
      'wrong key',
      'wrong account',
      'wrong chain',
      'output',
      'slippage',
      'tampered rules',
      'tampered cache',
      'missing rules',
    ] as const) {
      const account = await setupAccount()
      const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
        access: account,
      })
      const { policyId, rulesHash, rules } =
        await Actions.funding.createPolicySync(client, {
          account,
          admins: [account.address],
          feePayer: accounts[1],
          rules: {
            maxSlippageBps: 0,
            sources: {
              [Addresses.pathUsd]: [
                FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
              ],
            },
          },
        })
      const authorization = await Actions.accessKey.signAuthorization(client, {
        account,
        accessKey,
        ...(failure === 'missing policy' ? {} : { fundingPolicy: policyId }),
        ...(failure === 'expired' ? { expiry: 1 } : {}),
      })
      const store = Store.memory()
      await store.setItem(
        `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
        FundingPolicy.encode(rules),
      )
      const tampered = FundingPolicy.encode({ maxSlippageBps: 1, sources: {} })
      if (failure === 'tampered cache')
        await store.setItem(
          `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
          tampered,
        )
      if (failure === 'missing rules')
        await store.removeItem(
          `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
        )
      const handler = Funding.handleRequest(
        (request, options) => client.request(request as never, options),
        { store },
      )
      const result = await handler({
        method: 'eth_fillTransaction',
        params: [
          {
            chainId: '0x539',
            from: account.address,
            keyId:
              failure === 'wrong key'
                ? accounts[1].address
                : accessKey.accessKeyAddress,
            keyAuthorization: {
              ...KeyAuthorization.toRpc(authorization),
              ...(failure === 'wrong account'
                ? { account: accounts[1].address }
                : {}),
              ...(failure === 'wrong chain' ? { chainId: '0x1' } : {}),
            },
            requireFunds: [
              {
                token:
                  failure === 'output' ? Addresses.betaUsd : Addresses.pathUsd,
                amount: '0x1',
                ...(failure === 'slippage' ? { slippageBps: '0x1' } : {}),
                ...(failure === 'tampered rules'
                  ? { policyRules: tampered }
                  : {}),
              },
            ],
          },
        ],
      }).catch((error) => error)
      results.push({ failure, result })
    }
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "failure": "missing policy",
          "result": [RpcResponse.InvalidParamsError: The access key has no funding policy.],
        },
        {
          "failure": "expired",
          "result": [RpcResponse.InvalidParamsError: The funding access key has expired.],
        },
        {
          "failure": "wrong key",
          "result": [RpcResponse.InvalidParamsError: \`keyAuthorization\` must match the funding account, access key, and chain.],
        },
        {
          "failure": "wrong account",
          "result": [RpcResponse.InvalidParamsError: \`keyAuthorization\` must match the funding account, access key, and chain.],
        },
        {
          "failure": "wrong chain",
          "result": [RpcResponse.InvalidParamsError: \`keyAuthorization\` must match the funding account, access key, and chain.],
        },
        {
          "failure": "output",
          "result": [RpcResponse.InvalidParamsError: The funding policy does not allow output token 0x20c0000000000000000000000000000000000002.],
        },
        {
          "failure": "slippage",
          "result": [RpcResponse.InvalidParamsError: \`slippageBps\` exceeds the funding policy maximum.],
        },
        {
          "failure": "tampered rules",
          "result": [RpcResponse.InvalidParamsError: Funding policy rules do not match the current onchain commitment.],
        },
        {
          "failure": "tampered cache",
          "result": [RpcResponse.InvalidParamsError: Funding policy rules do not match the current onchain commitment.],
        },
        {
          "failure": "missing rules",
          "result": [RpcResponse.InvalidParamsError: Funding policy rules are not in the store; supply \`policyRules\` explicitly.],
        },
      ]
    `)
  })

  test.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid chain id %s',
    async (chainId) => {
      const handler = Funding.handleRequest((request, options) =>
        getClient().request(request as never, options),
      )
      await expect(
        handler(
          {
            method: 'eth_fillTransaction',
            params: [
              {
                from: accounts[0].address,
                requireFunds: [{ token: Addresses.pathUsd, amount: '0x1' }],
              },
            ],
          },
          { chainId },
        ),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[RpcResponse.InvalidParamsError: Expected a valid chain ID.]`,
      )
    },
  )

  test('requires a custom route on other chains', async () => {
    const handler = Funding.handleRequest((request, options) =>
      getClient().request(request as never, options),
    )
    await expect(
      handler(
        {
          method: 'eth_fillTransaction',
          params: [
            {
              from: accounts[0].address,
              requireFunds: [{ token: Addresses.pathUsd, amount: '0x1' }],
            },
          ],
        },
        { chainId: 10000000 },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: No funding route configured for 0x20c0000000000000000000000000000000000000.]`,
    )
  })

  test('rejects conflicting chain ids', async () => {
    const handler = Funding.handleRequest(
      getClient().request as Funding.handleRequest.Handler,
    )
    await expect(
      handler(
        {
          method: 'eth_fillTransaction',
          params: [
            {
              chainId: '0x539',
              from: accounts[0].address,
              requireFunds: [{ token: Addresses.pathUsd, amount: '0x1' }],
            },
          ],
        },
        { chainId: 4217 },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Conflicting chain ids.]`,
    )
  })

  test('rejects unresolved access key funding without using owner routes', async () => {
    const handler = Funding.handleRequest(
      (request, options) => getClient().request(request as never, options),
      {
        getRoute: ({ token }) => {
          if (token.toLowerCase() === Addresses.pathUsd.toLowerCase())
            return {
              sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
            }
          return undefined
        },
      },
    )
    await expect(
      handler({
        method: 'eth_fillTransaction',
        params: [
          {
            from: accounts[0].address,
            keyId: accounts[1].address,
            requireFunds: [{ amount: '0x1', token: Addresses.pathUsd }],
          },
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: The funding access key is not installed; supply \`keyAuthorization\`.]`,
    )
  })

  test('rejects inference and signed requests before filling', async () => {
    const next = getClient().request
    const handler = Funding.handleRequest(
      (request, options) => next(request as never, options),
      {},
    )
    await expect(
      handler({
        method: 'eth_fillTransaction',
        params: [{ requireFunds: true }],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Supply \`requireFunds\` with explicit \`token\` and \`amount\`; automatic inference is not supported yet.]`,
    )
    await expect(
      handler({
        method: 'eth_fillTransaction',
        params: [
          {
            requireFunds: [
              FundingRequirement.toRpc({
                amount: 1n,
                sources: [],
                token: Addresses.pathUsd,
              }),
            ],
            signature: '0x01',
          },
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Cannot fill funding on an already signed transaction.]`,
    )
  })
})

async function setupAccount() {
  const account = Account.fromSecp256k1(generatePrivateKey())
  await Actions.token.mintSync(client, {
    account: accounts[0],
    amount: parseUnits('100', 6),
    to: account.address,
    token: Addresses.alphaUsd,
  })
  return account
}
