import type { Address } from 'abitype'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { mainnet } from '../chains/index.js'
import { createClient } from '../clients/createClient.js'
import { custom } from '../clients/transports/custom.js'
import { serializeTransaction } from '../eip8130/utils/serializeTransaction.js'
import { createAggregatePayerClient } from './aggregate.js'
import {
  hasChainPayerService,
  payerServiceChainIds,
  registerPayerServiceChains,
  unregisterPayerServiceChains,
} from './chains.js'
import type { PayerClient } from './client.js'
import { toChainPayerClient } from './client.js'
import type { GetTermsReturnType } from './types.js'

const PAYER_A = '0x1111111111111111111111111111111111111111' as const
const PAYER_B = '0x2222222222222222222222222222222222222222' as const

// A serialized 8130 tx naming `payer` — used to drive routing.
function signedFor(payer: Address) {
  return serializeTransaction({
    chainId: 1,
    nonceSequence: 0n,
    maxFeePerGas: 1n,
    maxPriorityFeePerGas: 1n,
    gas: 21_000n,
    calls: [[{ to: '0x0000000000000000000000000000000000000001', data: '0x' }]],
    payer,
    senderAuth: '0x1234',
  })
}

/** A minimal in-memory {@link PayerClient} with call spies. */
function fakePayer(
  terms: GetTermsReturnType,
  options: {
    fail?: boolean
    balance?: { balances: any[]; ttl: number }
    hash?: `0x${string}`
  } = {},
): { client: PayerClient; getTerms: any; send: any; sign: any } {
  const getTerms = vi.fn(async () => {
    if (options.fail) throw new Error('source down')
    return terms
  })
  const send = vi.fn(async () => ({
    transactionHash: options.hash ?? (`0x${'ab'.repeat(32)}` as const),
  }))
  const sign = vi.fn(async (p: { signedTransaction: `0x${string}` }) => ({
    signedTransaction: p.signedTransaction,
  }))
  const getSponsorshipBalance = vi.fn(
    async () => options.balance ?? { balances: [], ttl: 30 },
  )
  return {
    client: {
      getTerms,
      sendTransaction: send,
      signTransaction: sign,
      getSponsorshipBalance,
    },
    getTerms,
    send,
    sign,
  }
}

const gas = (gasLimit: `0x${string}`) => ({
  gasLimit,
  maxFeePerGas: '0x1' as const,
  maxPriorityFeePerGas: '0x1' as const,
})

describe('hasChainPayerService', () => {
  const TEST_ID = 999_001

  afterEach(() => unregisterPayerServiceChains(TEST_ID))

  test('false for an unregistered chain, id, undefined', () => {
    expect(hasChainPayerService(TEST_ID)).toBe(false)
    expect(hasChainPayerService({ id: TEST_ID })).toBe(false)
    expect(hasChainPayerService(undefined)).toBe(false)
  })

  test('true after register; false after unregister', () => {
    registerPayerServiceChains(TEST_ID)
    expect(payerServiceChainIds.has(TEST_ID)).toBe(true)
    expect(hasChainPayerService(TEST_ID)).toBe(true)
    expect(hasChainPayerService({ id: TEST_ID })).toBe(true)
    unregisterPayerServiceChains(TEST_ID)
    expect(hasChainPayerService(TEST_ID)).toBe(false)
  })

  test('honors an explicit chainIds set without touching the registry', () => {
    expect(hasChainPayerService(TEST_ID, { chainIds: [TEST_ID] })).toBe(true)
    expect(payerServiceChainIds.has(TEST_ID)).toBe(false)
  })
})

describe('toChainPayerClient', () => {
  test('routes payer_* over the client transport', async () => {
    const seen: string[] = []
    const terms: GetTermsReturnType = {
      options: [{ kind: 'sponsored', payer: PAYER_A, ttl: 300 }],
    }
    const client = createClient({
      chain: mainnet,
      transport: custom({
        async request({ method }: { method: string }) {
          seen.push(method)
          if (method === 'payer_getTerms') return terms
          throw new Error(`unexpected ${method}`)
        },
      }),
    })
    const payer = toChainPayerClient(client)
    expect(
      await payer.getTerms({ chainId: '0x1', from: PAYER_A, calls: [] }),
    ).toEqual(terms)
    expect(seen).toContain('payer_getTerms')
  })
})

describe('createAggregatePayerClient', () => {
  test('throws with no payers', () => {
    expect(() => createAggregatePayerClient({ payers: [] })).toThrow()
  })

  test('getTerms queries every source in parallel and merges best-first', async () => {
    const a = fakePayer({
      gasEstimate: gas('0x5208'),
      fiatCurrency: 'USD',
      options: [{ kind: 'sponsored', payer: PAYER_A, ttl: 300 }],
    })
    const b = fakePayer({
      gasEstimate: gas('0xC350'), // larger → worst-case wins
      options: [{ kind: 'sponsored', payer: PAYER_B, ttl: 60 }],
    })
    const agg = createAggregatePayerClient({ payers: [a.client, b.client] })

    const terms = await agg.getTerms({
      chainId: '0x1',
      from: PAYER_A,
      calls: [],
    })

    expect(a.getTerms).toHaveBeenCalledTimes(1)
    expect(b.getTerms).toHaveBeenCalledTimes(1)
    // Source order preserved; both offers present.
    expect(terms.options.map((o) => (o as any).payer)).toEqual([
      PAYER_A,
      PAYER_B,
    ])
    // Worst-case (largest) gasLimit across responses.
    expect(terms.gasEstimate?.gasLimit).toBe('0xC350')
    // First defined fiatCurrency.
    expect(terms.fiatCurrency).toBe('USD')
  })

  test('a failing source is skipped (onError) and never fatal', async () => {
    const a = fakePayer(
      { options: [{ kind: 'sponsored', payer: PAYER_A, ttl: 300 }] },
      { fail: true },
    )
    const b = fakePayer({
      options: [{ kind: 'sponsored', payer: PAYER_B, ttl: 60 }],
    })
    const onError = vi.fn()
    const agg = createAggregatePayerClient({
      payers: [a.client, b.client],
      onError,
    })

    const terms = await agg.getTerms({
      chainId: '0x1',
      from: PAYER_A,
      calls: [],
    })

    expect(onError).toHaveBeenCalledTimes(1)
    expect(terms.options.map((o) => (o as any).payer)).toEqual([PAYER_B])
  })

  test('sendTransaction routes to the source that offered the tx `payer`', async () => {
    const a = fakePayer({
      options: [{ kind: 'sponsored', payer: PAYER_A, ttl: 300 }],
    })
    const b = fakePayer({
      options: [{ kind: 'sponsored', payer: PAYER_B, ttl: 60 }],
    })
    const agg = createAggregatePayerClient({ payers: [a.client, b.client] })

    await agg.getTerms({ chainId: '0x1', from: PAYER_A, calls: [] }) // populate routes

    await agg.sendTransaction({ signedTransaction: signedFor(PAYER_B) })
    expect(b.send).toHaveBeenCalledTimes(1)
    expect(a.send).not.toHaveBeenCalled()

    await agg.signTransaction({ signedTransaction: signedFor(PAYER_A) })
    expect(a.sign).toHaveBeenCalledTimes(1)
    expect(b.sign).not.toHaveBeenCalled()
  })

  test('sendTransaction throws for an unknown / unrouted payer', async () => {
    const a = fakePayer({
      options: [{ kind: 'sponsored', payer: PAYER_A, ttl: 300 }],
    })
    const agg = createAggregatePayerClient({ payers: [a.client] })
    await agg.getTerms({ chainId: '0x1', from: PAYER_A, calls: [] })
    await expect(
      agg.sendTransaction({ signedTransaction: signedFor(PAYER_B) }),
    ).rejects.toThrow()
  })

  test('getSponsorshipBalance concatenates balances and takes the min ttl', async () => {
    const balA = { balances: [{ kind: 'sponsorship', limits: [] }], ttl: 30 }
    const balB = { balances: [{ kind: 'credit', limits: [] }], ttl: 10 }
    const a = fakePayer({ options: [] }, { balance: balA as any })
    const b = fakePayer({ options: [] }, { balance: balB as any })
    const agg = createAggregatePayerClient({ payers: [a.client, b.client] })

    const { balances, ttl } = await agg.getSponsorshipBalance({ from: PAYER_A })
    expect(balances).toHaveLength(2)
    expect(ttl).toBe(10)
  })
})
