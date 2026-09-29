import { Hash, Hex } from 'ox'
import {
  FundingRequirement,
  KeyAuthorization,
  TransactionRequest,
} from 'ox/tempo'
import { encodeFunctionData, parseUnits } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { getBlock, getTransaction, sendTransactionSync } from 'viem/actions'
import {
  Abis,
  Account,
  Actions,
  Addresses,
  type Funding,
  FundingPolicy,
  FundingSource,
  Relay,
  Store,
  withRelay,
} from 'viem/tempo'
import { beforeAll, describe, expect, test } from 'vitest'
import { accounts, getClient, http } from '~test/tempo/config.js'

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

describe('Relay.funding', () => {
  test('fills the default policy without changing authorization fields', async () => {
    const { policyId } = await Actions.funding.createPolicySync(client, {
      account: accounts[0],
      admins: [accounts[0].address],
      rules: { maxSlippageBps: 0, sources: {} },
    })
    const handler = Relay.handleRequest(
      (request, options) => client.request(request as never, options),
      { plugins: [Relay.funding({ policyId })] },
    )
    const authorization = KeyAuthorization.toRpcUnsigned({
      account: accounts[0].address,
      address: accounts[1].address,
      chainId: 1337n,
      expiry: 4_000_000_000,
      limits: [{ token: Addresses.pathUsd, limit: 50_000_000n, period: 3600 }],
      scopes: [{ address: Addresses.pathUsd, selector: '0xa9059cbb' }],
      type: 'secp256k1',
      witness: `0x${'11'.repeat(32)}`,
    })
    const result = (await handler({
      method: 'eth_fillKeyAuthorization',
      params: [
        {
          account: accounts[0].address,
          keyAuthorization: { ...authorization, fundingPolicy: true },
        },
      ],
    })) as Funding.RpcSchema[1]['ReturnType']
    expect(result).toMatchInlineSnapshot(
      {
        keyAuthorization: { fundingPolicy: expect.any(String) },
      },
      `
      {
        "keyAuthorization": {
          "account": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "allowedCalls": [
            {
              "selectorRules": [
                {
                  "selector": "0xa9059cbb",
                },
              ],
              "target": "0x20c0000000000000000000000000000000000000",
            },
          ],
          "chainId": "0x539",
          "expiry": "0xee6b2800",
          "fundingPolicy": Any<String>,
          "keyId": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
          "keyType": "secp256k1",
          "limits": [
            {
              "limit": "0x2faf080",
              "period": "0xe10",
              "token": "0x20c0000000000000000000000000000000000000",
            },
          ],
          "witness": "0x1111111111111111111111111111111111111111111111111111111111111111",
        },
      }
    `,
    )
    expect(BigInt(result.keyAuthorization.fundingPolicy as `0x${string}`)).toBe(
      policyId,
    )

    // Concrete policies bypass default selection, including inline policies.
    const explicit = { ...authorization, fundingPolicy: '0x123' as const }
    expect(
      await handler({
        method: 'eth_fillKeyAuthorization',
        params: [{ account: accounts[0].address, keyAuthorization: explicit }],
      }),
    ).toEqual({ keyAuthorization: explicit })
    const inline = {
      ...authorization,
      fundingPolicy: FundingPolicy.toRpc({
        admins: [accounts[0].address],
        rules: { maxSlippageBps: 0, sources: {} },
      }),
    }
    expect(
      await handler({
        method: 'eth_fillKeyAuthorization',
        params: [{ account: accounts[0].address, keyAuthorization: inline }],
      }),
    ).toEqual({ keyAuthorization: inline })
  })

  test('registers rules by chain and hash without granting policy authority', async () => {
    const store = Store.memory()
    const handler = Relay.handleRequest(
      (request, options) => client.request(request as never, options),
      { plugins: [Relay.funding({ store })] },
    )
    const rules = FundingPolicy.encode({ maxSlippageBps: 100, sources: {} })
    const result = (await handler({
      method: 'funding_registerPolicyRules',
      params: [{ chainId: '0x539', rules }],
    })) as { rulesHash: `0x${string}` }
    expect(result).toMatchInlineSnapshot(`
      {
        "rulesHash": "0xd5a13181d1d1e6b81d9f5f2709cd532384c7c5e45ae9305ba897c13e16385c27",
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
      const handler = Relay.handleRequest(
        (request, options) => client.request(request as never, options),
        {
          plugins: [
            Relay.funding(
              chainId === undefined
                ? {
                    getRoute: ({ chainId, transaction }) =>
                      chainId === 4217 &&
                      transaction.from === account.address &&
                      transaction.calls?.[0]?.to === accounts[1].address
                        ? {
                            sources: [
                              FundingSource.dex({
                                tokenIn: Addresses.alphaUsd,
                              }),
                            ],
                          }
                        : undefined,
                  }
                : {},
            ),
          ],
        },
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
      })) as Relay.Plugin.FillResult
      expect(result).toMatchInlineSnapshot(
        {
          raw: expect.any(String),
          tx: {
            from: expect.any(String),
            gas: expect.any(String),
            hash: expect.any(String),
            maxFeePerGas: expect.any(String),
          },
        },
        `
        {
          "capabilities": {
            "sponsored": false,
          },
          "raw": Any<String>,
          "tx": {
            "aaAuthorizationList": [],
            "accessList": [],
            "authorizationList": [],
            "blockHash": undefined,
            "blockNumber": null,
            "calls": [
              {
                "data": "0x",
                "to": "0x8c8d35429f74ec245f8ef2f4fd1e551cff97d650",
                "value": undefined,
              },
            ],
            "chainId": "0x539",
            "from": Any<String>,
            "gas": Any<String>,
            "hash": Any<String>,
            "input": undefined,
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
              "yParity": "0x0",
            },
            "to": undefined,
            "transactionIndex": null,
            "type": "0x76",
            "value": "0x0",
          },
        }
      `,
      )
    },
  )

  test('passes unrelated RPC requests through', async () => {
    const handler = Relay.handleRequest(
      (request, options) => client.request(request as never, options),
      { plugins: [Relay.funding()] },
    )
    expect(await handler({ method: 'eth_chainId' })).toMatchInlineSnapshot(
      '"0x539"',
    )
  })
})

describe('behavior', () => {
  describe('relay plugins', () => {
    test('infers a transfer with only discovery and one fill', async () => {
      const methods: string[] = []
      const handle = Relay.handleRequest(
        (request, options) => {
          methods.push(request.method)
          return client.request(request as never, options)
        },
        {
          plugins: [Relay.funding({ getRoute: () => ({ sources: [] }) })],
          resolveTokens: () => {
            throw new Error('Known transfers do not need token candidates.')
          },
        },
      )
      const result = (await handle({
        method: 'eth_fillTransaction',
        params: [
          TransactionRequest.toRpc({
            from: accounts[0].address,
            chainId: 1337,
            calls: [
              Actions.token.transfer.call({
                token: Addresses.pathUsd,
                amount: 10n,
                to: accounts[1].address,
              }),
            ],
            requireFunds: true,
          }),
        ],
      })) as Relay.Plugin.FillResult
      expect(result.tx.requireFunds).toMatchObject([
        {
          token: '0x20C0000000000000000000000000000000000000',
          amount: '0xa',
          sources: [],
        },
      ])
      expect(methods).toEqual(['eth_call', 'eth_fillTransaction'])
    })

    test('forwards complete requirements without discovery or simulation', async () => {
      const methods: string[] = []
      const handle = Relay.handleRequest(
        (request, options) => {
          methods.push(request.method)
          return client.request(request as never, options)
        },
        { plugins: [Relay.funding()] },
      )
      const requireFunds = [
        { token: Addresses.pathUsd, amount: 10n, sources: [] },
      ] as const
      const result = (await handle({
        method: 'eth_fillTransaction',
        params: [
          TransactionRequest.toRpc({
            from: accounts[0].address,
            chainId: 1337,
            calls: [
              Actions.token.transfer.call({
                token: Addresses.pathUsd,
                amount: 10n,
                to: accounts[1].address,
              }),
            ],
            requireFunds,
          }),
        ],
      })) as Relay.Plugin.FillResult
      expect(result.tx.requireFunds).toEqual(
        requireFunds.map(FundingRequirement.toRpc),
      )
      expect(methods).toEqual(['eth_fillTransaction'])
    })

    test('keeps empty inferred requirements resolved in the fill result', async () => {
      const relay = Relay.create({
        client,
        plugins: [Relay.funding()],
      })
      const result = (await relay.request({
        method: 'eth_fillTransaction',
        params: [
          TransactionRequest.toRpc({
            from: accounts[0].address,
            chainId: 1337,
            calls: [
              {
                to: Addresses.pathUsd,
                data: encodeFunctionData({
                  abi: Abis.tip20,
                  functionName: 'balanceOf',
                  args: [accounts[0].address],
                }),
              },
            ],
            requireFunds: true,
          }),
        ],
      })) as Relay.Plugin.FillResult
      expect(result.tx.requireFunds).toEqual([])
    })

    test.each([
      { replacement: undefined },
      { replacement: [] },
      {
        replacement: [
          { token: Addresses.alphaUsd, amount: '0x2', sources: [] },
        ],
      },
    ])(
      'restores inferred requirements replaced downstream with $replacement',
      async ({ replacement }) => {
        const handler = Relay.handleRequest(
          async (request, options) => {
            const result = await client.request(request as never, options)
            if (request.method !== 'eth_fillTransaction') return result
            const filled = result as unknown as Relay.Plugin.FillResult
            return {
              ...filled,
              tx: { ...filled.tx, requireFunds: replacement },
            }
          },
          {
            plugins: [
              Relay.funding({ getRoute: () => ({ sources: [] }) }),
              {
                afterFill: async (result) => ({
                  capabilities: { resolvedFunding: result.tx.requireFunds },
                }),
              },
            ],
          },
        )
        const result = (await handler({
          method: 'eth_fillTransaction',
          params: [
            TransactionRequest.toRpc({
              from: accounts[0].address,
              chainId: 1337,
              calls: [
                Actions.token.transfer.call({
                  token: Addresses.pathUsd,
                  amount: 10n,
                  to: accounts[1].address,
                }),
              ],
              requireFunds: true,
            }),
          ],
        })) as Relay.Plugin.FillResult
        const expected = [
          {
            token: '0x20C0000000000000000000000000000000000000',
            amount: '0xa',
            slippageBps: '0x0',
            sources: [],
          },
        ]
        expect(result.tx.requireFunds).toEqual(expected)
        expect(result.capabilities?.resolvedFunding).toEqual(expected)
      },
    )

    test('shares token resolution between fee selection and inference', async () => {
      const methods: string[] = []
      const downstream: Relay.handleRequest.Handler = (request, options) => {
        methods.push(request.method)
        return client.request(request as never, options)
      }
      const handle = Relay.handleRequest(downstream, {
        plugins: [
          Relay.feeToken(),
          Relay.funding({ getRoute: () => ({ sources: [] }) }),
        ],
        resolveTokens: async (chainId) => {
          const chain = await downstream({ method: 'eth_chainId' })
          if (Number(chain) !== chainId) throw new Error('Unexpected chain')
          return [Addresses.pathUsd, Addresses.alphaUsd]
        },
      })
      const result = (await handle({
        method: 'eth_fillTransaction',
        params: [
          TransactionRequest.toRpc({
            from: accounts[0].address,
            chainId: 1337,
            calls: [
              Actions.dex.sell.call({
                tokenIn: Addresses.alphaUsd,
                tokenOut: Addresses.pathUsd,
                amountIn: 100n,
                minAmountOut: 0n,
              }),
            ],
            requireFunds: true,
          }),
        ],
      })) as Relay.Plugin.FillResult
      expect(result.tx.requireFunds).toMatchObject([
        {
          token: '0x20C0000000000000000000000000000000000001',
          amount: '0x64',
          sources: [],
        },
      ])
      expect(methods.filter((method) => method === 'eth_chainId')).toHaveLength(
        1,
      )
      expect(
        methods.filter((method) => method === 'tempo_simulateV1'),
      ).toHaveLength(1)
      expect(
        methods.filter((method) => method === 'eth_fillTransaction'),
      ).toHaveLength(1)
    })

    test('resolves funding before sponsoring a fully prepared transaction', async () => {
      const methods: string[] = []
      const handle = Relay.handleRequest(
        (request, options) => {
          methods.push(request.method)
          return client.request(request as never, options)
        },
        {
          plugins: [
            Relay.funding({ getRoute: () => ({ sources: [] }) }),
            Relay.feePayer({ account: accounts[0] }),
          ],
        },
      )
      const result = (await handle({
        method: 'eth_fillTransaction',
        params: [
          TransactionRequest.toRpc({
            from: accounts[0].address,
            chainId: 1337,
            calls: [
              Actions.token.transfer.call({
                token: Addresses.pathUsd,
                amount: 10n,
                to: accounts[1].address,
              }),
            ],
            gas: 1_000_000n,
            maxFeePerGas: 1_000_000_000n,
            maxPriorityFeePerGas: 0n,
            nonce: 0n,
            feeToken: Addresses.pathUsd,
            feePayer: true,
            requireFunds: true,
          }),
        ],
      })) as Relay.Plugin.FillResult
      expect(result.tx.requireFunds).toMatchObject([
        {
          token: '0x20C0000000000000000000000000000000000000',
          amount: '0xa',
          sources: [],
        },
      ])
      expect(result.tx.feePayerSignature).toBeDefined()
      expect(methods).toEqual(['eth_call'])
    })

    test('composes sponsorship, fee selection, funding, and a funded preview', async () => {
      const sender = Account.fromSecp256k1(generatePrivateKey())
      await Actions.token.transferSync(client, {
        account: accounts[0],
        token: Addresses.alphaUsd,
        amount: 1_000_000n,
        to: sender.address,
      })
      const methods: string[] = []
      const store = Store.memory()
      const handle = Relay.handleRequest(
        (request, options) => {
          methods.push(request.method)
          return client.request(request as never, options)
        },
        {
          resolveTokens: () => [Addresses.pathUsd, Addresses.alphaUsd],
          plugins: [
            Relay.funding({
              store,
              getRoute: () => ({
                sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
              }),
            }),
            Relay.feePayer({ account: accounts[0] }),
            Relay.feeToken({ store }),
            Relay.simulate({ store }),
          ],
        },
      )
      const result = (await handle({
        method: 'eth_fillTransaction',
        params: [
          TransactionRequest.toRpc({
            from: sender.address,
            chainId: 1337,
            calls: [
              Actions.token.transfer.call({
                token: Addresses.pathUsd,
                amount: 1_000_000n,
                to: accounts[1].address,
              }),
            ],
            requireFunds: true,
            feePayer: true,
          }),
        ],
      })) as Relay.Plugin.FillResult
      expect(result.tx.feePayerSignature).toBeDefined()
      expect(result.capabilities).toMatchObject({
        sponsored: true,
        balanceDiffs: {
          [sender.address]: [
            expect.objectContaining({
              address: Addresses.alphaUsd,
              direction: 'outgoing',
              value: '0xf4240',
            }),
          ],
        },
      })
      expect(
        methods.filter((method) => method === 'eth_fillTransaction'),
      ).toHaveLength(1)
      expect(
        methods.filter((method) => method === 'tempo_simulateV1'),
      ).toHaveLength(1)
      expect(methods).not.toContain('eth_chainId')
      const receipt = await sendTransactionSync(
        getClient({
          transport: withRelay(http(), {
            plugins: [
              Relay.funding({
                getRoute: () => ({
                  sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
                }),
              }),
              Relay.feePayer({ account: accounts[0] }),
            ],
          }),
        }),
        {
          account: sender,
          feePayer: true,
          calls: [
            Actions.token.transfer.call({
              token: Addresses.pathUsd,
              amount: 1_000_000n,
              to: accounts[1].address,
            }),
          ],
          requireFunds: true,
        },
      )
      expect(receipt.status).toBe('success')
      expect(receipt.feePayer).toBe(accounts[0].address.toLowerCase())
    })
  })

  test.each([
    { token: '0x1234' },
    { amount: 'not-a-quantity' },
    { slippageBps: '0x2711' },
    { sources: [{ target: '0x1234', data: '0x' }] },
    { sources: [{ target: Addresses.dexFundingSource, data: 'invalid' }] },
  ])('rejects malformed requirement %j', async (invalid) => {
    const handler = Relay.handleRequest(
      (request, options) => client.request(request as never, options),
      { plugins: [Relay.funding()] },
    )
    await expect(
      handler({
        method: 'eth_fillTransaction',
        params: [
          {
            chainId: '0x539',
            from: accounts[0].address,
            requireFunds: [
              { token: Addresses.pathUsd, amount: '0x1', ...invalid },
            ],
          },
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Invalid funding requirement: check \`token\`, \`amount\`, \`slippageBps\`, \`policyRules\`, and source \`target\` and \`data\` fields.]`,
    )
  })

  test('rejects invalid default policy requests', async () => {
    const authorization = {
      ...KeyAuthorization.toRpcUnsigned({
        address: accounts[1].address,
        chainId: 1337n,
        type: 'secp256k1',
      }),
      fundingPolicy: true,
    }
    const results = []
    for (const failure of [
      'missing default',
      'zero default',
      'unknown default',
      'signed',
      'owner',
      'chain',
      'missing authorization',
    ] as const) {
      const handler = Relay.handleRequest(
        (request, options) => client.request(request as never, options),
        {
          plugins: [
            Relay.funding({
              policyId:
                failure === 'missing default'
                  ? undefined
                  : failure === 'zero default'
                    ? 0n
                    : 0xffffffffffffffffn,
            }),
          ],
        },
      )
      const keyAuthorization = {
        ...authorization,
        ...(failure === 'signed' ? { signature: {} } : {}),
        ...(failure === 'owner' ? { account: accounts[1].address } : {}),
      }
      const result = await handler(
        {
          method: 'eth_fillKeyAuthorization',
          params: [
            {
              account: accounts[0].address,
              keyAuthorization:
                failure === 'missing authorization'
                  ? undefined
                  : keyAuthorization,
            },
          ],
        },
        { chainId: failure === 'chain' ? 1 : 1337 },
      ).catch((error) => error)
      results.push({ failure, result })
    }
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "failure": "missing default",
          "result": [RpcResponse.InvalidParamsError: \`fundingPolicy: true\` requires a configured nonzero uint64 \`policyId\`.],
        },
        {
          "failure": "zero default",
          "result": [RpcResponse.InvalidParamsError: \`fundingPolicy: true\` requires a configured nonzero uint64 \`policyId\`.],
        },
        {
          "failure": "unknown default",
          "result": [RpcResponse.InvalidParamsError: Default funding policy 18446744073709551615 does not exist on chain 1337.],
        },
        {
          "failure": "signed",
          "result": [RpcResponse.InvalidParamsError: Cannot fill an already signed key authorization.],
        },
        {
          "failure": "owner",
          "result": [RpcResponse.InvalidParamsError: \`keyAuthorization.account\` must match the requested owner account.],
        },
        {
          "failure": "chain",
          "result": [RpcResponse.InvalidParamsError: The key authorization chain must match the request chain.],
        },
        {
          "failure": "missing authorization",
          "result": [RpcResponse.InvalidParamsError: Expected an owner \`account\` and unsigned \`keyAuthorization\`.],
        },
      ]
    `)
  })

  test('rejects malformed rule registrations', async () => {
    const handler = Relay.handleRequest(
      (request, options) => client.request(request as never, options),
      { plugins: [Relay.funding()] },
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

  test.each([{ keyId: '0x1234' }, { signature: '0x1234' }])(
    'rejects malformed signed key authorizations %j',
    async (invalid) => {
      const account = await setupAccount()
      const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
        access: account,
      })
      const authorization = await Actions.accessKey.signAuthorization(client, {
        account,
        accessKey,
        fundingPolicy: 1n,
      })
      const handler = Relay.handleRequest(
        (request, options) => client.request(request as never, options),
        { plugins: [Relay.funding()] },
      )
      await expect(
        handler({
          method: 'eth_fillTransaction',
          params: [
            {
              chainId: '0x539',
              from: account.address,
              keyId: accessKey.accessKeyAddress,
              keyAuthorization: {
                ...KeyAuthorization.toRpc(authorization),
                ...invalid,
              },
              requireFunds: [{ token: Addresses.pathUsd, amount: '0x1' }],
            },
          ],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[RpcResponse.InvalidParamsError: Invalid signed \`keyAuthorization\`.]`,
      )
    },
  )

  test.each(['configured', 'registered', 'inline', 'mismatch'] as const)(
    'uses %s policy rules when the transport is configured with rules',
    async (mode) => {
      const account = await setupAccount()
      const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
        access: account,
      })
      const rules = {
        maxSlippageBps: 0,
        sources: {
          [Addresses.pathUsd]: [
            FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
          ],
        },
      }
      const { policyId } = await Actions.funding.createPolicySync(client, {
        account,
        admins: [account.address],
        feePayer: accounts[1],
        rules,
      })
      const funded = getClient({
        transport: withRelay(http(), {
          plugins: [
            Relay.funding({
              policyId,
              policyRules:
                mode === 'configured' ? rules : { ...rules, maxSlippageBps: 1 },
              store: Store.memory(),
            }),
          ],
        }),
      })
      if (mode === 'registered')
        await Actions.funding.setPolicyRulesSync(funded, {
          account,
          feePayer: accounts[1],
          policyId,
          rules,
        })
      const keyAuthorization = await Actions.accessKey.signAuthorization(
        funded,
        {
          account,
          accessKey,
          fundingPolicy: true,
        },
      )
      expect(keyAuthorization.fundingPolicy).toBe(policyId)
      const transfer = Actions.token.transferSync(funded, {
        account: accessKey,
        feePayer: accounts[1],
        keyAuthorization,
        token: Addresses.pathUsd,
        to: accounts[0].address,
        amount: 1n,
        requireFunds: [
          {
            token: Addresses.pathUsd,
            amount: 1n,
            ...(mode === 'inline' ? { policyRules: rules } : {}),
          },
        ],
      })
      if (mode === 'mismatch') {
        await expect(transfer).rejects.toThrow(
          'Funding policy rules do not match the current onchain commitment.',
        )
        return
      }
      const { receipt } = await transfer
      expect(receipt.status).toBe('success')
      const balance = await Actions.token.getBalance(client, {
        account: account.address,
        token: Addresses.alphaUsd,
      })
      expect(balance.formatted).toBe('99.999999')
    },
  )

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
      const handler = Relay.handleRequest(
        (request, options) => client.request(request as never, options),
        { plugins: [Relay.funding({ store })] },
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
      const handler = Relay.handleRequest(
        (request, options) => getClient().request(request as never, options),
        { plugins: [Relay.funding()] },
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
    const handler = Relay.handleRequest(
      (request, options) => getClient().request(request as never, options),
      { plugins: [Relay.funding()] },
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
    const handler = Relay.handleRequest(
      getClient().request as Relay.handleRequest.Handler,
      { plugins: [Relay.funding()] },
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
    const handler = Relay.handleRequest(
      (request, options) => getClient().request(request as never, options),
      {
        plugins: [
          Relay.funding({
            getRoute: ({ token }) => {
              if (token.toLowerCase() === Addresses.pathUsd.toLowerCase())
                return {
                  sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
                }
              return undefined
            },
          }),
        ],
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

  test('rejects missing senders and signed requests before filling', async () => {
    const next = getClient().request
    const handler = Relay.handleRequest(
      (request, options) => next(request as never, options),
      { plugins: [Relay.funding({})] },
    )
    await expect(
      handler({
        method: 'eth_fillTransaction',
        params: [{ requireFunds: true }],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Funding inference requires the transaction sender (\`from\`).]`,
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

  describe('funding RPC state', () => {
    test.each([
      { method: 'eth_call', hash: false },
      { method: 'eth_call', hash: true },
      { method: 'eth_estimateGas', hash: false },
    ] as const)(
      '$method resolves funding against the requested block and overrides (hash: $hash)',
      async ({ method, hash }) => {
        const account = Account.fromSecp256k1(generatePrivateKey())
        const block = await getBlock(client)
        await Actions.token.mintSync(client, {
          account: accounts[0],
          token: Addresses.pathUsd,
          to: account.address,
          amount: parseUnits('100', 6),
        })
        const slot = Hash.keccak256(
          Hex.concat(
            Hex.padLeft(account.address, 32),
            Hex.fromNumber(9, { size: 32 }),
          ),
        )
        const stateOverrides = {
          [Addresses.alphaUsd]: {
            stateDiff: {
              [slot]: Hex.fromNumber(parseUnits('100', 6), { size: 32 }),
            },
          },
        }
        const handler = Relay.handleRequest(
          (request, options) => client.request(request as never, options),
          {
            plugins: [
              Relay.funding({
                getRoute: () => ({
                  sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
                }),
              }),
            ],
          },
        )
        const result = await handler({
          method,
          params: [
            TransactionRequest.toRpc({
              from: account.address,
              chainId: 1337,
              feeToken: Addresses.alphaUsd,
              requireFunds: true,
              calls: [
                Actions.token.transfer.call({
                  token: Addresses.pathUsd,
                  to: accounts[1].address,
                  amount: parseUnits('50', 6),
                }),
                {
                  to: Addresses.pathUsd,
                  data: encodeFunctionData({
                    abi: Abis.tip20,
                    functionName: 'balanceOf',
                    args: [account.address],
                  }),
                },
              ],
            }),
            hash ? { blockHash: block.hash } : Hex.fromNumber(block.number),
            stateOverrides,
            ...(method === 'eth_call'
              ? [{ time: Hex.fromNumber(block.timestamp + 1n) }]
              : []),
          ],
        })
        if (method === 'eth_call') expect(result).toBe(`0x${'0'.repeat(64)}`)
        else expect(BigInt(result as Hex.Hex)).toBeGreaterThan(0n)
        expect(
          (
            await Actions.token.getBalance(client, {
              account: account.address,
              token: Addresses.pathUsd,
            })
          ).amount,
        ).toBe(parseUnits('100', 6))
        expect(
          (
            await Actions.token.getBalance(client, {
              account: account.address,
              token: Addresses.alphaUsd,
            })
          ).amount,
        ).toBe(0n)
      },
    )
  })

  describe('transaction funding inference', () => {
    test('simulates swaps whose wallet debit can depend on internal DEX balances', async () => {
      const methods: string[] = []
      const handler = Relay.handleRequest(
        (request, options) => {
          methods.push(request.method)
          return client.request(request as never, options)
        },
        { plugins: [Relay.funding({ getRoute: () => ({ sources: [] }) })] },
      )
      await handler({
        method: 'eth_fillTransaction',
        params: [
          TransactionRequest.toRpc({
            from: accounts[0].address,
            chainId: 1337,
            calls: [
              Actions.dex.sell.call({
                tokenIn: Addresses.alphaUsd,
                tokenOut: Addresses.pathUsd,
                amountIn: 100n,
                minAmountOut: 0n,
              }),
            ],
            requireFunds: true,
          }),
        ],
      })
      expect(methods).toContain('tempo_simulateV1')
      expect(methods).toContain('eth_fillTransaction')
    })

    test.each([false, true])(
      'skips simulation only for fully recognized batches (unknown call: %s)',
      async (unknown) => {
        const methods: string[] = []
        const handler = Relay.handleRequest(
          (request, options) => {
            methods.push(request.method)
            return client.request(request as never, options)
          },
          { plugins: [Relay.funding({ getRoute: () => ({ sources: [] }) })] },
        )
        const result = (await handler({
          method: 'eth_fillTransaction',
          params: [
            TransactionRequest.toRpc({
              from: accounts[0].address,
              chainId: 1337,
              calls: [
                Actions.token.transfer.call({
                  token: Addresses.pathUsd,
                  amount: 100n,
                  to: accounts[0].address,
                }),
                Actions.token.transfer.call({
                  token: Addresses.pathUsd,
                  amount: 20n,
                  to: accounts[1].address,
                }),
                Actions.token.burn.call({
                  token: Addresses.pathUsd,
                  amount: 30n,
                }),
                ...(unknown
                  ? ([
                      {
                        to: Addresses.pathUsd,
                        data: encodeFunctionData({
                          abi: Abis.tip20,
                          functionName: 'balanceOf',
                          args: [accounts[0].address],
                        }),
                      },
                    ] as const)
                  : []),
              ],
              requireFunds: true,
            }),
          ],
        })) as Relay.Plugin.FillResult
        expect(result.tx.requireFunds).toMatchObject([
          {
            token: '0x20C0000000000000000000000000000000000000',
            amount: '0x64',
          },
        ])
        expect(methods.includes('tempo_simulateV1')).toBe(unknown)
        expect(methods).toContain('eth_fillTransaction')
      },
    )

    const handler = Relay.handleRequest(
      (request, options) => client.request(request as never, options),
      { plugins: [Relay.funding()] },
    )

    test.each([
      { sources: [] },
      { token: Addresses.betaUsd, sources: [] },
      { amount: '0x0', sources: [] },
    ] satisfies Funding.RequirementRpc[])(
      'resolves raw RPC partial requirements and preserves overrides (%j)',
      async (requirement) => {
        const result = (await handler({
          method: 'eth_fillTransaction',
          params: [
            {
              ...TransactionRequest.toRpc({
                from: accounts[0].address,
                chainId: 1337,
                calls: [
                  Actions.token.transfer.call({
                    token: Addresses.pathUsd,
                    amount: 50n,
                    to: accounts[1].address,
                  }),
                ],
              }),
              requireFunds: [requirement],
            },
          ],
        })) as Relay.Plugin.FillResult
        expect(result.tx.requireFunds).toEqual([
          {
            token:
              'token' in requirement ? requirement.token : Addresses.pathUsd,
            amount: 'amount' in requirement ? requirement.amount : '0x32',
            sources: [],
          },
        ])
      },
    )

    test('resolves a zero transfer without requiring transfer logs', async () => {
      const result = (await handler({
        method: 'eth_fillTransaction',
        params: [
          {
            ...TransactionRequest.toRpc({
              from: accounts[0].address,
              chainId: 1337,
              calls: [
                Actions.token.transfer.call({
                  token: Addresses.pathUsd,
                  amount: 0n,
                  to: accounts[1].address,
                }),
              ],
            }),
            requireFunds: [{ sources: [] }],
          },
        ],
      })) as Relay.Plugin.FillResult
      expect(result.tx.requireFunds).toMatchObject([
        {
          token: Addresses.pathUsd,
          amount: '0x0',
          sources: [],
        },
      ])
    })

    test('matches partial batch entries by token and preserves their order', async () => {
      const transaction = TransactionRequest.toRpc({
        from: accounts[0].address,
        chainId: 1337,
        calls: [
          Actions.token.transfer.call({
            token: Addresses.pathUsd,
            amount: 50n,
            to: accounts[1].address,
          }),
          Actions.token.transfer.call({
            token: Addresses.alphaUsd,
            amount: 75n,
            to: accounts[1].address,
          }),
        ],
      })
      const result = (await handler({
        method: 'eth_fillTransaction',
        params: [
          {
            ...transaction,
            requireFunds: [
              { token: Addresses.alphaUsd, sources: [] },
              { token: Addresses.pathUsd, amount: '0x0', sources: [] },
            ],
          },
        ],
      })) as Relay.Plugin.FillResult
      expect(result.tx.requireFunds).toMatchObject([
        { token: Addresses.alphaUsd, amount: '0x4b', sources: [] },
        { token: Addresses.pathUsd, amount: '0x0', sources: [] },
      ])
      for (const requirement of [
        { sources: [] },
        { token: Addresses.betaUsd, sources: [] },
      ])
        await expect(
          handler({
            method: 'eth_fillTransaction',
            params: [{ ...transaction, requireFunds: [requirement] }],
          }),
        ).rejects.toThrow('Cannot unambiguously infer the funding requirement')
    })

    test('infers a missing token and amount from a single-token batch', async () => {
      const result = (await handler({
        method: 'eth_fillTransaction',
        params: [
          {
            ...TransactionRequest.toRpc({
              from: accounts[0].address,
              chainId: 1337,
              calls: [50n, 75n].map((amount) =>
                Actions.token.transfer.call({
                  token: Addresses.pathUsd,
                  amount,
                  to: accounts[1].address,
                }),
              ),
            }),
            requireFunds: [{ sources: [] }],
          },
        ],
      })) as Relay.Plugin.FillResult
      expect(result.tx.requireFunds).toMatchObject([
        {
          token: '0x20C0000000000000000000000000000000000000',
          amount: '0x7d',
          sources: [],
        },
      ])
    })

    test('sources only the shortfall from an inferred total balance', async () => {
      const account = await setupAccount()
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token: Addresses.pathUsd,
        to: account.address,
        amount: parseUnits('40', 6),
      })
      const funded = getClient({
        transport: withRelay(http(), {
          plugins: [
            Relay.funding({
              store: Store.memory(),
              getRoute: () => ({
                sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
              }),
            }),
          ],
        }),
      })
      const recipient = Account.fromSecp256k1(generatePrivateKey()).address
      const receipt = await sendTransactionSync(funded, {
        account,
        feePayer: accounts[1],
        calls: [
          Actions.token.transfer.call({
            token: Addresses.pathUsd,
            to: recipient,
            amount: parseUnits('100', 6),
          }),
        ],
        requireFunds: true,
      })
      expect(receipt.status).toBe('success')
      const transaction = await getTransaction(funded, {
        hash: receipt.transactionHash,
      })
      expect(transaction.requireFunds?.[0]?.amount).toBe(parseUnits('100', 6))
      expect(
        (
          await Actions.token.getBalance(client, {
            account: account.address,
            token: Addresses.alphaUsd,
          })
        ).amount,
      ).toBe(parseUnits('40', 6))
      expect(
        (
          await Actions.token.getBalance(client, {
            account: recipient,
            token: Addresses.pathUsd,
          })
        ).amount,
      ).toBe(parseUnits('100', 6))
    })

    test('fills and sends an inferred batch through Relay.funding', async () => {
      const account = await setupAccount()
      await Actions.token.mintSync(client, {
        account: accounts[0],
        amount: parseUnits('1', 6),
        to: account.address,
        token: Addresses.pathUsd,
      })
      const fundedClient = getClient({
        transport: withRelay(http(), {
          plugins: [Relay.funding({ store: Store.memory() })],
        }),
      })
      const recipient = Account.fromSecp256k1(generatePrivateKey()).address
      const receipt = await sendTransactionSync(fundedClient, {
        account,
        feePayer: accounts[1],
        calls: [
          Actions.token.transfer.call({
            token: Addresses.pathUsd,
            to: recipient,
            amount: parseUnits('20', 6),
          }),
          Actions.token.transfer.call({
            token: Addresses.pathUsd,
            to: recipient,
            amount: parseUnits('30', 6),
          }),
        ],
        requireFunds: true,
      })
      expect(receipt.status).toBe('success')
      const transaction = await getTransaction(fundedClient, {
        hash: receipt.transactionHash,
      })
      expect(
        transaction.requireFunds?.map(({ token, amount }) => ({
          token: token.toLowerCase(),
          amount,
        })),
      ).toEqual([{ token: Addresses.pathUsd, amount: parseUnits('50', 6) }])
      expect(
        (
          await Actions.token.getBalance(client, {
            account: recipient,
            token: Addresses.pathUsd,
          })
        ).amount,
      ).toBe(parseUnits('50', 6))
    })

    test('propagates the node funding error when the configured route has no sources', async () => {
      const account = await setupAccount()
      const handler = Relay.handleRequest(
        (request, options) => client.request(request as never, options),
        {
          plugins: [
            Relay.funding({
              getRoute: () => ({ sources: [] }),
            }),
          ],
        },
      )
      await expect(
        handler({
          method: 'eth_fillTransaction',
          params: [
            {
              ...TransactionRequest.toRpc({
                from: account.address,
                chainId: 1337,
                calls: [
                  Actions.token.transfer.call({
                    token: Addresses.pathUsd,
                    to: accounts[1].address,
                    amount: 100n,
                  }),
                ],
              }),
              requireFunds: true,
            },
          ],
        }),
      ).rejects.toThrow('InsufficientFunding')
    })
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
