import { describe, expect, test } from 'vitest'
import { privateKeyToAccount } from '../../src/accounts/privateKeyToAccount.js'
import { baseSepolia } from '../../src/chains/index.js'
import {
  actorScope,
  canonicalAuthenticators,
} from '../../src/experimental/eip8130/constants.js'
import { getEip8130Deployment } from '../../src/experimental/eip8130/deployments.js'
import { authorizeActor, key } from '../../src/experimental/eip8130/keys.js'
import type {
  AaCalls,
  TransactionSerializable8130,
} from '../../src/experimental/eip8130/types/transaction.js'
import { parseTransaction8130 } from '../../src/experimental/eip8130/utils/parseTransaction.js'
import { erc1167Bytecode } from '../../src/experimental/eip8130/utils/proxy.js'
import { serializeTransaction8130 } from '../../src/experimental/eip8130/utils/serializeTransaction.js'
import { signTransaction8130 } from '../../src/experimental/eip8130/utils/signTransaction.js'
import { sliceHex } from '../../src/utils/data/slice.js'
import { fromRlp } from '../../src/utils/encoding/fromRlp.js'
import { stringToHex } from '../../src/utils/encoding/toHex.js'
import { keccak256 } from '../../src/utils/hash/keccak256.js'

// Publicly-known Hardhat test key #0 — NOT a secret, used only to make the
// demo's signature/output deterministic.
const DEMO_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as const

// Pretty-prints an object whose leaves may be bigint (JSON can't serialize those).
function jsonify(value: unknown): string {
  return JSON.stringify(
    value,
    (_, v) => (typeof v === 'bigint' ? `${v.toString()} (bigint)` : v),
    2,
  )
}

describe('build an EIP-8130 transaction (offline demo)', () => {
  test('serialize → JSON + RLP envelope, then parse back', async () => {
    const owner = privateKeyToAccount(DEMO_KEY)
    const deployment = getEip8130Deployment(baseSepolia.id)!

    const p256PubKey = {
      x: '0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296',
      y: '0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5',
    } as const

    // ── calls ──────────────────────────────────────────────────────────────
    // Calls are grouped into ORDERED PHASES. Each phase is its own atomic batch.
    // NOTE on `value`: an EIP-8130 call is ONLY `{ to, data }` — there is no
    // per-call `value` field at all (a call is RLP `[to, data]`). ETH value
    // movement is driven by the account's wallet bytecode via `data`, not by a
    // value on each call. (The TS type `AaCall` reflects this: it has no `value`.)
    const calls: AaCalls = [
      // Phase 0 — e.g. an ERC-20 approve.
      [
        {
          to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          data: '0x095ea7b3', // approve(...) selector (args elided for brevity)
        },
      ],
      // Phase 1 — two calls executed atomically after phase 0 succeeds.
      [
        {
          to: '0x2626664c2603336E57B271c5C0b26F421741e481',
          data: '0x3593564c', // execute(...) selector
        },
        {
          to: owner.address,
          data: '0x',
        },
      ],
    ]

    // ── the transaction ──────────────────────────────────────────────────────
    // A self-paid tx that ALSO deploys the account (a `create` account change)
    // and registers a P-256 session key (a `config` change is shown via the
    // higher-level helpers elsewhere; here we keep the create + calls focused).
    const transaction: TransactionSerializable8130 = {
      chainId: baseSepolia.id,
      // EOA path: omit `from` and let the sender be recovered from senderAuth.
      nonceSequence: 0n,
      maxPriorityFeePerGas: 1_000_000n, // 0.001 gwei
      maxFeePerGas: 100_000_000n, // 0.1 gwei
      gas: 500_000n,
      accountChanges: [
        {
          type: 'create',
          userSalt: keccak256(stringToHex('viem-8130-demo')),
          // ERC-1167 minimal proxy → the canonical wallet implementation.
          code: erc1167Bytecode(deployment.accounts.default),
          // Initial actors MUST be sorted by actorId ascending. One owner here.
          initialActors: [key.k1(owner.address)],
        },
      ],
      calls,
      // self-pay → no payer / payerAuth
    }

    console.log('\n══════════════════════════════════════════════════════════')
    console.log(' EIP-8130 transaction (unsigned, serializable form)')
    console.log('══════════════════════════════════════════════════════════')
    console.log(jsonify(transaction))
    console.log(
      '\nnote: each call is only { to, data } — EIP-8130 calls carry no `value`.',
    )

    // Show that an authorizeActor change (a P-256 session key) is built the same
    // way — for reference, not added to the tx above.
    const sessionKeyChange = authorizeActor(key.p256(p256PubKey), {
      scope: actorScope.sender,
    })
    console.log('\n— example authorizeActor change (P-256 session key) —')
    console.log(jsonify(sessionKeyChange))
    console.log('  p256 authenticator:', canonicalAuthenticators.p256)

    // ── sign + serialize ─────────────────────────────────────────────────────
    const serialized = await signTransaction8130({
      transaction,
      account: owner,
    })

    console.log('\n══════════════════════════════════════════════════════════')
    console.log(' Serialized envelope (EIP-2718: AA_TX_TYPE || rlp(body))')
    console.log('══════════════════════════════════════════════════════════')
    console.log('type byte:', sliceHex(serialized, 0, 1), '(AA_TX_TYPE = 0x7b)')
    console.log('byte length:', (serialized.length - 2) / 2)
    console.log('\nrlp envelope:')
    console.log(serialized)

    // ── decode the raw RLP to show the 13-field wire layout ──────────────────
    const fields = fromRlp(sliceHex(serialized, 1), 'hex') as unknown[]
    const fieldNames = [
      'chain_id',
      'sender',
      'nonce_key',
      'nonce_sequence',
      'expiry',
      'max_priority_fee_per_gas',
      'max_fee_per_gas',
      'gas_limit',
      'account_changes',
      'calls',
      'payer',
      'sender_auth',
      'payer_auth',
    ]
    console.log('\n— raw RLP fields (13 elements) —')
    fields.forEach((value, i) => {
      const rendered = Array.isArray(value)
        ? jsonify(value)
        : (value as string)
      console.log(`  [${i}] ${fieldNames[i]}: ${rendered}`)
    })

    // ── round-trip: parse the envelope back to a structured tx ───────────────
    const parsed = parseTransaction8130(serialized)
    console.log('\n══════════════════════════════════════════════════════════')
    console.log(' Parsed back from the envelope')
    console.log('══════════════════════════════════════════════════════════')
    console.log(jsonify(parsed))

    // The round-trip must reproduce the input (sans the bogus `value`).
    expect(parsed.chainId).toBe(baseSepolia.id)
    expect(parsed.calls).toHaveLength(2)
    expect(parsed.calls?.[1]).toHaveLength(2)
    // A call is only `{ to, data }` — there is never a per-call `value`.
    expect(parsed.calls?.[1][0].to.toLowerCase()).toBe(
      '0x2626664c2603336e57b271c5c0b26f421741e481',
    )
    expect(parsed.calls?.[1][0].data).toBe('0x3593564c')
    expect((parsed.calls?.[1][0] as { value?: unknown }).value).toBeUndefined()
    expect(parsed.accountChanges?.[0].type).toBe('create')
    expect(parsed.senderAuth).toBeDefined()
    // Self-pay: no payer / payerAuth.
    expect(parsed.payer).toBeUndefined()
    expect(parsed.payerAuth).toBeUndefined()

    // Re-serializing the parsed tx yields the identical envelope.
    expect(serializeTransaction8130(parsed)).toBe(serialized)
  })
})
