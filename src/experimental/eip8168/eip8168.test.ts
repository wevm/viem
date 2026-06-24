import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { erc20Abi } from '../../constants/abis.js'
import { decodeFunctionData } from '../../utils/abi/decodeFunctionData.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import { to8130Account } from '../eip8130/accounts/to8130Account.js'
import { key } from '../eip8130/keys.js'
import { parseTransaction8130 } from '../eip8130/utils/parseTransaction.js'
import { erc1167Bytecode } from '../eip8130/utils/proxy.js'
import { sendSponsoredCalls } from './actions/sendSponsoredCalls.js'
import { createPayerClient } from './client.js'
import type { GetTermsReturnType } from './types.js'
import {
  buildSponsoredCalls,
  selectPaymentOption,
} from './utils/buildSponsoredCalls.js'

const owner = privateKeyToAccount(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const account = to8130Account({
  signer: owner,
  userSalt: `0x${'01'.padStart(64, '0')}`,
  code: erc1167Bytecode('0x00000000000000000000000000000000000000Ec'),
  initialActors: [key.k1(owner.address)],
})
const PAYER = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as const
const FEE_RECIPIENT = '0x90F79bf6EB2c4f870365E785982E1f101E93b906' as const
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const
const userCalls = [
  { to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', data: '0x' as const },
]

const gasEstimate = {
  gasLimit: '0xC350',
  maxFeePerGas: '0x59682F00',
  maxPriorityFeePerGas: '0x59682F00',
} as const

const MAX_EXPIRY_REL = 60 // upper bound from conditions (relative seconds)

const sponsoredTerms: GetTermsReturnType = {
  gasEstimate,
  options: [
    {
      kind: 'sponsored',
      payer: PAYER,
      // Required pair is implied; methods lists only OPTIONAL extras (none here).
      ttl: 300,
      conditions: { maxExpiry: MAX_EXPIRY_REL },
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
      conditions: { maxExpiry: MAX_EXPIRY_REL },
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

// Freeze time so expiry assertions are deterministic.
const FROZEN_NOW_MS = 1_700_000_000_000 // arbitrary fixed epoch
const FROZEN_NOW_S = Math.floor(FROZEN_NOW_MS / 1000)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FROZEN_NOW_MS)
})
afterEach(() => {
  vi.useRealTimers()
})

describe('selectPaymentOption', () => {
  test('prefers a selectable sponsored offer', () => {
    const { option, tokenChoice } = selectPaymentOption(sponsoredTerms)
    expect(option.kind).toBe('sponsored')
    expect(tokenChoice).toBeUndefined()
  })

  test('picks a token offer + choice when a token is requested', () => {
    const { option, tokenChoice } = selectPaymentOption(tokenTerms, {
      token: USDC,
    })
    expect(option.kind).toBe('token')
    expect(tokenChoice?.token).toBe(USDC)
  })

  test('skips declined sponsored entries', () => {
    const { option } = selectPaymentOption({
      gasEstimate,
      options: [
        { kind: 'sponsored_declined', code: 'BUDGET_EXHAUSTED' },
        ...tokenTerms.options,
      ],
    })
    expect(option.kind).toBe('token')
  })

  test('throws when only declined entries exist', () => {
    expect(() =>
      selectPaymentOption({
        options: [{ kind: 'sponsored_declined', code: 'POLICY_REJECTED' }],
      }),
    ).toThrow()
  })
})

describe('buildSponsoredCalls', () => {
  test('full sponsorship -> single phase, no transfer', () => {
    const built = buildSponsoredCalls({
      terms: sponsoredTerms,
      calls: userCalls,
    })
    expect(built.payer).toBe(PAYER)
    expect(built.calls).toEqual([userCalls])
    expect(built.paymentAmount).toBeUndefined()
  })

  test('token payment -> phase 0 transfer(feeRecipient, paymentAmount) + phase 1 user calls', () => {
    const built = buildSponsoredCalls({ terms: tokenTerms, calls: userCalls })
    expect(built.paymentAmount).toBe(hexToBigInt('0x30D40'))
    expect(built.feeRecipient).toBe(FEE_RECIPIENT)
    expect(built.calls).toHaveLength(2)
    const transfer = built.calls[0][0]
    expect(transfer.to).toBe(USDC)
    const decoded = decodeFunctionData({ abi: erc20Abi, data: transfer.data! })
    expect(decoded.functionName).toBe('transfer')
    expect(decoded.args[0]).toBe(FEE_RECIPIENT)
    expect(decoded.args[1]).toBe(hexToBigInt('0x30D40'))
    expect(built.calls[1]).toEqual(userCalls)
  })

  test('token payment defaults destination to offer payer when feeRecipient absent', () => {
    const built = buildSponsoredCalls({
      terms: {
        options: [
          {
            ...tokenTerms.options[0],
            tokens: [{ ...tokenTerms.options[0].tokens[0], feeRecipient: undefined }],
          } as (typeof tokenTerms.options)[number],
        ],
      },
      calls: userCalls,
    })
    expect(built.feeRecipient).toBe(PAYER)
    const decoded = decodeFunctionData({
      abi: erc20Abi,
      data: built.calls[0][0].data!,
    })
    expect(decoded.args[0]).toBe(PAYER)
  })

  test('throws when there is no selectable offer', () => {
    expect(() =>
      buildSponsoredCalls({ terms: { options: [] }, calls: userCalls }),
    ).toThrow()
  })
})

describe('createPayerClient', () => {
  test('maps methods to payer_* JSON-RPC', async () => {
    const seen: { method: string; params: any }[] = []
    const payer = createPayerClient({
      transport: custom({
        async request({ method, params }: { method: string; params: any }) {
          seen.push({ method, params })
          if (method === 'payer_getTerms') return sponsoredTerms
          if (method === 'payer_getSponsorshipBalance')
            return { balances: [], ttl: 30 }
          throw new Error(`unexpected ${method}`)
        },
      }),
    })
    const terms = await payer.getTerms({
      chainId: '0x1',
      from: owner.address,
      calls: userCalls,
    })
    expect(terms.options[0].kind).toBe('sponsored')
    expect(seen[0].method).toBe('payer_getTerms')
    expect(seen[0].params[0].from).toBe(owner.address)

    await payer.getSponsorshipBalance({ from: owner.address, kind: ['credit'] })
    expect(seen[1].method).toBe('payer_getSponsorshipBalance')
  })
})

describe('sendSponsoredCalls (end-to-end)', () => {
  function makeClient() {
    return createClient({
      chain: mainnet,
      transport: custom({
        async request({ method }: { method: string }) {
          if (method === 'eth_chainId') return '0x1'
          throw new Error(`unexpected chain RPC: ${method}`)
        },
      }),
    })
  }

  test('full sponsorship: sender-signs, payer relays; expiry = now + maxExpiry', async () => {
    let relayed: `0x${string}` | undefined
    const payer = createPayerClient({
      transport: custom({
        async request({ method, params }: { method: string; params: any }) {
          if (method === 'payer_getTerms') return sponsoredTerms
          if (method === 'payer_sendTransaction') {
            relayed = params[0].signedTransaction
            return { transactionHash: keccak256(params[0].signedTransaction) }
          }
          throw new Error(`unexpected ${method}`)
        },
      }),
    })

    const result = await sendSponsoredCalls(makeClient(), {
      account,
      payerClient: payer,
      calls: userCalls,
      nonceSequence: 0n,
    })
    expect(result).toHaveProperty('transactionHash')

    const parsed = parseTransaction8130(relayed!)
    expect(parsed.payer?.toLowerCase()).toBe(PAYER.toLowerCase())
    expect(parsed.payerAuth ?? '0x').toBe('0x') // payer fills this in
    expect(parsed.senderAuth).toBeDefined()
    expect(parsed.calls).toHaveLength(1) // single phase, full sponsorship
    expect(parsed.calls?.[0]?.[0]?.to).toBe(userCalls[0].to.toLowerCase())
    expect(parsed.gas).toBe(hexToBigInt(gasEstimate.gasLimit))
    // expiry = now + maxExpiry (relative)
    expect(parsed.expiry).toBe(BigInt(FROZEN_NOW_S + MAX_EXPIRY_REL))
  })

  test('token payment: phase 0 transfer present; co-sign mode returns signed tx', async () => {
    const payer = createPayerClient({
      transport: custom({
        async request({ method, params }: { method: string; params: any }) {
          if (method === 'payer_getTerms') return tokenTerms
          if (method === 'payer_signTransaction')
            return { signedTransaction: params[0].signedTransaction }
          throw new Error(`unexpected ${method}`)
        },
      }),
    })

    const result = await sendSponsoredCalls(makeClient(), {
      account,
      payerClient: payer,
      calls: userCalls,
      mode: 'sign',
      token: USDC,
      nonceSequence: 0n,
    })
    expect(result).toHaveProperty('signedTransaction')
    const parsed = parseTransaction8130(
      (result as { signedTransaction: `0x${string}` }).signedTransaction,
    )
    expect(parsed.calls).toHaveLength(2)
    expect(parsed.calls?.[0]?.[0]?.to).toBe(USDC.toLowerCase())
  })

  test('mode "sign" throws when the selected offer omits payer_signTransaction', async () => {
    const payer = createPayerClient({
      transport: custom({
        async request({ method }: { method: string }) {
          if (method === 'payer_getTerms') return sponsoredTerms // methods: send only
          throw new Error(`unexpected ${method}`)
        },
      }),
    })
    await expect(
      sendSponsoredCalls(makeClient(), {
        account,
        payerClient: payer,
        calls: userCalls,
        mode: 'sign',
        nonceSequence: 0n,
      }),
    ).rejects.toThrow()
  })
})
