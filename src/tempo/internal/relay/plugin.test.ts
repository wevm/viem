import { Secp256k1 } from 'ox'
import { Transaction as core_Transaction, TxEnvelopeTempo } from 'ox/tempo'
import { createClient } from 'viem'
import { fillTransaction } from 'viem/actions'
import { Actions, type Capabilities, Relay, withRelay } from 'viem/tempo'
import { beforeAll, expect, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'

const userAccount = Tempo.accounts[9]!
const feePayerAccount = Tempo.accounts[0]!
const recipient = Tempo.accounts[7]!

// Keep token candidates independent of the token-list API.
const localnetTokens = [
  '0x20c0000000000000000000000000000000000000',
  '0x20c0000000000000000000000000000000000001',
  '0x20c0000000000000000000000000000000000002',
  '0x20c0000000000000000000000000000000000003',
] as const

const caller = Tempo.getClient({ chain: Tempo.chain })

beforeAll(async () => {
  await Promise.all(
    [0, 9].map((index) =>
      Actions.faucet.fundSync(Tempo.getClient({ chain: Tempo.chain }), {
        account: Tempo.accounts[index]!,
        timeout: 60_000,
      }),
    ),
  )
  // userAccount prefers alphaUsd (a faucet-funded genesis token) as its fee token.
  await Actions.fee.setUserTokenSync(caller, {
    account: userAccount,
    token: Tempo.addresses.alphaUsd,
  })
})

test.each(['direct', 'custom'] as const)(
  'built-in plugins compose around a downstream handler: %s',
  async (mode) => {
    const downstream: Relay.handleRequest.Handler = (request) =>
      caller.request(request as never)
    const plugins = [
      Relay.simulate(),
      Relay.autoSwap(),
      Relay.feePayer({ account: feePayerAccount }),
      ...(mode === 'custom'
        ? [
            ((next) =>
              Object.freeze(async (request, options) =>
                next(request, options),
              )) satisfies Relay.Plugin,
          ]
        : []),
      Relay.feeToken({ resolveTokens: () => [Tempo.addresses.alphaUsd] }),
    ]
    const handle =
      mode === 'direct'
        ? plugins.reduceRight((next, plugin) => plugin(next), downstream)
        : Relay.handleRequest(downstream, { plugins })
    const result = (await handle(
      {
        method: 'eth_fillTransaction',
        params: [
          {
            from: userAccount.address,
            calls: [
              Actions.token.transfer.call(caller, {
                token: Tempo.addresses.alphaUsd,
                to: recipient.address,
                amount: 1n,
              }),
            ],
          },
        ],
      },
      { chainId: Tempo.chain.id },
    )) as {
      tx: Record<string, unknown>
      capabilities: Capabilities.FillTransactionCapabilities
    }
    const transaction = core_Transaction.fromRpc(
      result.tx as core_Transaction.Rpc,
    )!
    expect(transaction.feeToken?.toLowerCase()).toBe(
      Tempo.addresses.alphaUsd.toLowerCase(),
    )
    expect(result.capabilities.sponsored).toBe(true)
    expect(result.capabilities.balanceDiffs).toBeDefined()
    expect(result.capabilities.fee).toBeDefined()
    const envelope = TxEnvelopeTempo.from(
      transaction as TxEnvelopeTempo.TxEnvelopeTempo,
    )
    expect(
      Secp256k1.recoverAddress({
        payload: TxEnvelopeTempo.getFeePayerSignPayload(envelope, {
          sender: userAccount.address,
        }),
        signature: envelope.feePayerSignature!,
      }),
    ).toBe(feePayerAccount.address.toLowerCase())
  },
)

test.each(
  Array.from({ length: 16 }, (_, mask) =>
    [false, true].map((reverse) => ({ mask, reverse })),
  ).flat(),
)('enabled plugins $mask, reversed $reverse', async ({ mask, reverse }) => {
  const plugins = [
    Relay.feePayer({ account: feePayerAccount }),
    Relay.autoSwap(),
    Relay.feeToken({
      resolveTokens: () => localnetTokens,
    }),
    Relay.simulate(),
  ].filter((_, index) => mask & (1 << index))
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: reverse ? [...plugins].reverse() : plugins,
    }),
  })
  const result = await fillTransaction(client, {
    account: userAccount.address,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
    feeToken: Tempo.addresses.alphaUsd,
  })
  expect(result.transaction.gas).toBeGreaterThan(0n)
  if (mask !== 0) expect(result.capabilities?.sponsored).toBe(Boolean(mask & 1))
  expect(Boolean(result.transaction.feePayerSignature)).toBe(Boolean(mask & 1))
  expect(Boolean(result.capabilities?.fee)).toBe(Boolean(mask & 8))
  expect(Boolean(result.capabilities?.balanceDiffs)).toBe(Boolean(mask & 8))
})

test('built-in plugins preserve unrelated requests and request options', async () => {
  const signal = new AbortController().signal
  const request = { method: 'eth_chainId' }
  const options = { signal, retryCount: 0, uid: 'unrelated' }
  const handle = Relay.handleRequest(
    async (request, options) => ({ request, options }),
    {
      plugins: [
        Relay.feePayer(),
        Relay.autoSwap(),
        Relay.feeToken(),
        Relay.simulate(),
      ],
    },
  )
  expect(await handle(request, options)).toEqual({ request, options })
})

test('built-in plugins preserve nested RPC errors and normalize expiration', async () => {
  const upstreamError = {
    code: -32603,
    message: 'Revm error: transaction expired: valid_before is in the past',
  }
  const handle = Relay.handleRequest(
    async () => {
      throw new Error('Transport failed', { cause: upstreamError })
    },
    { plugins: [Relay.simulate()] },
  )
  await expect(handle({ method: 'eth_blockNumber' })).rejects.toMatchObject({
    code: -32003,
    message: 'Transaction expired.',
    data: { code: 'transaction_expired' },
  })
})
