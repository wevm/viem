import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { toAccount } from '../../eip8130/accounts/toAccount.js'
import { key } from '../../eip8130/keys.js'
import { parseTransaction } from '../../eip8130/utils/parseTransaction.js'
import { erc1167Bytecode } from '../../eip8130/utils/proxy.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import { createPayerClient } from '../client.js'
import type { GetTermsReturnType } from '../types.js'
import {
  prepareTransactionRequest,
  sendTransaction,
  sendTransactionSync,
} from './sendTransaction.js'

const owner = privateKeyToAccount(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const account = toAccount({
  signer: owner,
  userSalt: `0x${'01'.padStart(64, '0')}`,
  code: erc1167Bytecode('0x00000000000000000000000000000000000000Ec'),
  initialActors: [key.k1(owner.address)],
})
const PAYER = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as const
const FEE_RECIPIENT = '0x90F79bf6EB2c4f870365E785982E1f101E93b906' as const
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const
const userCalls = [
  {
    to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const,
    data: '0x' as const,
  },
]

const gasEstimate = {
  gasLimit: '0xC350',
  maxFeePerGas: '0x59682F00',
  maxPriorityFeePerGas: '0x59682F00',
} as const

const sponsoredTerms: GetTermsReturnType = {
  gasEstimate,
  options: [
    {
      kind: 'sponsored',
      payer: PAYER,
      ttl: 300,
      conditions: { maxExpiry: 60 },
      provider: { name: 'My App' },
    },
  ],
}

const tokenTerms: GetTermsReturnType = {
  gasEstimate,
  options: [
    {
      kind: 'token',
      payer: PAYER,
      methods: ['payer_signTransaction'],
      ttl: 60,
      conditions: { maxExpiry: 60 },
      tokens: [
        {
          token: USDC,
          symbol: 'USDC',
          decimals: 6,
          paymentAmount: '0x30D40',
          feeRecipient: FEE_RECIPIENT,
          rate: { numerator: '0x7A308480', denominator: '0xDE0B6B3A7640000' },
        },
      ],
    },
  ],
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(1_700_000_000_000)
})
afterEach(() => {
  vi.useRealTimers()
})

function makeClient() {
  return createClient({
    chain: mainnet,
    transport: custom({
      async request({ method }: { method: string }) {
        if (method === 'eth_chainId') return '0x1'
        if (method === 'eth_call') return `0x${'0'.repeat(192)}`
        if (method === 'eth_getTransactionCount') return '0x0'
        throw new Error(`unexpected chain RPC: ${method}`)
      },
    }),
  })
}

describe('prepareTransactionRequest', () => {
  test('surfaces payment offers as a component of the fill', async () => {
    const payer = createPayerClient({
      transport: custom({
        async request({ method }: { method: string }) {
          if (method === 'payer_getTerms') return sponsoredTerms
          throw new Error(`unexpected ${method}`)
        },
      }),
    })

    const { request, capabilities } = await prepareTransactionRequest(
      makeClient(),
      {
        account,
        payerClient: payer,
        calls: userCalls,
        capabilities: { paymasterService: {} },
        nonceSequence: 0n,
      },
    )

    // Payment terms are a component of the fill.
    expect(capabilities.paymentOptions).toHaveLength(1)
    expect(capabilities.paymentOptions[0].kind).toBe('sponsored')
    expect(capabilities.gasEstimate).toEqual(gasEstimate)

    // The base fill is sized from the payer's recommended gas.
    expect(request.gas).toBe(hexToBigInt(gasEstimate.gasLimit))
    expect(request.maxFeePerGas).toBe(hexToBigInt(gasEstimate.maxFeePerGas))
    expect(request.from).toBe(account.address)
  })

  test('forwards preferredTokens / context to payer_getTerms', async () => {
    const seen: { params: any }[] = []
    const payer = createPayerClient({
      transport: custom({
        async request({ method, params }: { method: string; params: any }) {
          if (method === 'payer_getTerms') {
            seen.push({ params })
            return tokenTerms
          }
          throw new Error(`unexpected ${method}`)
        },
      }),
    })

    await prepareTransactionRequest(makeClient(), {
      account,
      payerClient: payer,
      calls: userCalls,
      capabilities: {
        paymasterService: {
          preferredTokens: [USDC],
          context: { policyId: 'x' },
        },
      },
      nonceSequence: 0n,
    })
    expect(seen[0].params[0].preferredTokens).toEqual([USDC])
    expect(seen[0].params[0].context).toEqual({ policyId: 'x' })
  })
})

describe('sendTransaction', () => {
  test('submits with the chosen sponsored offer (single phase)', async () => {
    let relayed: `0x${string}` | undefined
    const payer = createPayerClient({
      transport: custom({
        async request({ method, params }: { method: string; params: any }) {
          if (method === 'payer_sendTransaction') {
            relayed = params[0].signedTransaction
            return { transactionHash: keccak256(params[0].signedTransaction) }
          }
          throw new Error(`unexpected ${method}`)
        },
      }),
    })

    const result = await sendTransaction(makeClient(), {
      account,
      payerClient: payer,
      calls: userCalls,
      capabilities: {
        paymentOption: sponsoredTerms.options[0],
        gasEstimate,
      },
      nonceSequence: 0n,
    })
    expect(result).toHaveProperty('transactionHash')

    const parsed = parseTransaction(relayed!)
    expect(parsed.payer?.toLowerCase()).toBe(PAYER.toLowerCase())
    expect(parsed.calls).toHaveLength(1)
    expect(parsed.gas).toBe(hexToBigInt(gasEstimate.gasLimit))
  })

  test('token offer: phase-0 transfer present; co-sign mode returns signed tx', async () => {
    const payer = createPayerClient({
      transport: custom({
        async request({ method, params }: { method: string; params: any }) {
          if (method === 'payer_signTransaction')
            return { signedTransaction: params[0].signedTransaction }
          throw new Error(`unexpected ${method}`)
        },
      }),
    })

    const result = await sendTransaction(makeClient(), {
      account,
      payerClient: payer,
      calls: userCalls,
      mode: 'sign',
      token: USDC,
      capabilities: {
        paymentOption: tokenTerms.options[0],
        gasEstimate,
      },
      nonceSequence: 0n,
    })
    expect(result).toHaveProperty('signedTransaction')
    const parsed = parseTransaction(
      (result as { signedTransaction: `0x${string}` }).signedTransaction,
    )
    expect(parsed.calls).toHaveLength(2)
    expect(parsed.calls?.[0]?.[0]?.to).toBe(USDC.toLowerCase())
  })
})

describe('sendTransactionSync', () => {
  test('submits via payer then returns the awaited EIP-8130 receipt', async () => {
    const RECEIPT = {
      transactionHash: `0x${'ab'.repeat(32)}` as const,
      status: '0x1' as const,
      payer: PAYER,
      phaseStatuses: ['0x1'] as const,
    }
    // A sync send drives payer_sendTransaction, then polls the chain for the
    // receipt; the mock chain resolves the receipt immediately.
    const client = createClient({
      chain: mainnet,
      transport: custom({
        async request({ method }: { method: string }) {
          if (method === 'eth_chainId') return '0x1'
          if (method === 'eth_call') return `0x${'0'.repeat(192)}`
          if (method === 'eth_getTransactionCount') return '0x0'
          if (method === 'eth_getTransactionReceipt') return RECEIPT
          throw new Error(`unexpected chain RPC: ${method}`)
        },
      }),
    })
    const payer = createPayerClient({
      transport: custom({
        async request({ method, params }: { method: string; params: any }) {
          if (method === 'payer_sendTransaction')
            return {
              transactionHash: RECEIPT.transactionHash,
              tokenCharged: { token: USDC, amount: '0x30D40' },
            }
          throw new Error(`unexpected ${method}: ${JSON.stringify(params)}`)
        },
      }),
    })

    const { transactionHash, tokenCharged, receipt } =
      await sendTransactionSync(client, {
        account,
        payerClient: payer,
        calls: userCalls,
        capabilities: { paymentOption: sponsoredTerms.options[0], gasEstimate },
        nonceSequence: 0n,
      })

    expect(transactionHash).toBe(RECEIPT.transactionHash)
    expect(tokenCharged?.token).toBe(USDC)
    expect(receipt.eip8130.phaseStatuses).toEqual(['0x1'])
    expect(receipt.eip8130.payer).toBe(PAYER)
  })
})
