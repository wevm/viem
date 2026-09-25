import { FundingRequirement } from 'ox/tempo'
import { parseUnits } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { Account, Actions, Addresses, Funding, FundingSource } from 'viem/tempo'
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
              getRoute: ({ chainId }) =>
                chainId === 4217
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
      `[RpcResponse.InvalidParamsError: Access key and multisig funding require explicit sources until policy resolution is supported.]`,
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
