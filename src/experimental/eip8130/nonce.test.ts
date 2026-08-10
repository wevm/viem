import { describe, expect, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import type { Hex } from '../../types/misc.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import { toAccount } from './accounts/toAccount.js'
import { sendCalls } from './actions/sendCalls.js'
import { nonceKeyMax } from './constants.js'
import { key } from './keys.js'
import { nonce } from './nonce.js'
import { parseTransaction } from './utils/parseTransaction.js'
import { erc1167Bytecode } from './utils/proxy.js'

const owner = privateKeyToAccount(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const code = erc1167Bytecode('0x00000000000000000000000000000000000000Ec')
const userSalt =
  '0x0000000000000000000000000000000000000000000000000000000000000001'

const account = toAccount({
  signer: owner,
  userSalt,
  code,
  initialActors: [key.k1(owner.address)],
})

describe('nonce builders', () => {
  test('sequential → channel 0', () => {
    expect(nonce.sequential()).toEqual({ nonceKey: 0n })
  })

  test('channel(key)', () => {
    expect(nonce.channel(7n)).toEqual({ nonceKey: 7n })
  })

  test('channel rejects out-of-range / reserved keys', () => {
    expect(() => nonce.channel(-1n)).toThrow()
    expect(() => nonce.channel(nonceKeyMax + 1n)).toThrow()
    // NONCE_KEY_MAX is nonce-free mode, not a counter channel.
    expect(() => nonce.channel(nonceKeyMax)).toThrow()
  })

  test('randomChannel is in 1 … NONCE_KEY_MAX - 1', () => {
    for (let i = 0; i < 50; i++) {
      const { nonceKey } = nonce.randomChannel()
      expect(nonceKey).toBeGreaterThanOrEqual(1n)
      expect(nonceKey).toBeLessThan(nonceKeyMax)
    }
    // Distinct across calls (collision astronomically unlikely).
    expect(nonce.randomChannel().nonceKey).not.toBe(
      nonce.randomChannel().nonceKey,
    )
  })

  test('nonceless with absolute validBefore (unix ms)', () => {
    expect(nonce.nonceless({ validBefore: 1_800_000_000_000n })).toEqual({
      nonceKey: nonceKeyMax,
      nonceSequence: 0n,
      validBefore: 1_800_000_000_000n,
    })
  })

  test('nonceless with relative expiresIn (seconds → ms validBefore)', () => {
    const nowMs = Date.now()
    const result = nonce.nonceless({ expiresIn: 600 })
    expect(result.nonceKey).toBe(nonceKeyMax)
    expect(result.nonceSequence).toBe(0n)
    expect(Number(result.validBefore)).toBeGreaterThanOrEqual(nowMs + 600_000)
    expect(Number(result.validBefore)).toBeLessThanOrEqual(nowMs + 601_000)
  })

  test('nonceless requires a validBefore', () => {
    expect(() => nonce.nonceless({})).toThrow()
    expect(() => nonce.nonceless({ validBefore: 0n })).toThrow()
  })
})

describe('sendCalls nonce integration', () => {
  function makeClient() {
    const methods: string[] = []
    let sent: Hex | undefined
    let lastGetCountParams: unknown[] | undefined
    const client = createClient({
      chain: mainnet,
      transport: custom({
        async request({ method, params }: { method: string; params: any }) {
          methods.push(method)
          if (method === 'eth_chainId') return '0x1'
          // Actor not yet bound on-chain → resolveSigningScope falls back to the
          // declared handle scope (offline nonce-mode selection).
          if (method === 'eth_call') return `0x${'0'.repeat(64)}`
          if (method === 'eth_getTransactionCount') {
            lastGetCountParams = params
            return '0x3'
          }
          if (method === 'eth_sendRawTransaction') {
            sent = params[0]
            return keccak256(params[0])
          }
          throw new Error(`unexpected RPC: ${method}`)
        },
      }),
    })
    return {
      client,
      methods,
      get sent() {
        return sent
      },
      get lastGetCountParams() {
        return lastGetCountParams
      },
    }
  }

  const fees = {
    gas: 200_000n,
    maxFeePerGas: 2_000_000_000n,
    maxPriorityFeePerGas: 1_000_000_000n,
  }
  const calls = [
    { to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', data: '0x' },
  ]

  test('nonceless: no nonce read, tx carries NONCE_KEY_MAX + validBefore', async () => {
    const ctx = makeClient()
    await sendCalls(ctx.client, {
      account,
      calls,
      ...fees,
      ...nonce.nonceless({ validBefore: 1_800_000_000_000n }),
    })
    expect(ctx.methods).not.toContain('eth_getTransactionCount')
    const parsed = parseTransaction(ctx.sent!)
    expect(parsed.nonceKey).toBe(nonceKeyMax)
    // `0n` sequence RLP-encodes as empty and parses back as `undefined`/`0n`.
    expect(parsed.nonceSequence ?? 0n).toBe(0n)
    expect(parsed.validBefore).toBe(1_800_000_000_000n)
  })

  test('channel: reads the sequence with the 2D nonce_key param', async () => {
    const ctx = makeClient()
    await sendCalls(ctx.client, {
      account,
      calls,
      ...fees,
      ...nonce.channel(5n),
    })
    expect(ctx.methods).toContain('eth_getTransactionCount')
    // [address, blockTag, nonce_key]
    expect(ctx.lastGetCountParams).toHaveLength(3)
    expect(ctx.lastGetCountParams?.[2]).toBe('0x5')
    const parsed = parseTransaction(ctx.sent!)
    expect(parsed.nonceKey).toBe(5n)
    expect(parsed.nonceSequence).toBe(3n)
  })
})
