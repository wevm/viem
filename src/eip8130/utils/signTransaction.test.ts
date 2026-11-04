import { describe, expect, test } from 'vitest'
import { accounts } from '~test/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import type { Hex } from '../../types/misc.js'
import { size } from '../../utils/data/size.js'
import { sliceHex } from '../../utils/data/slice.js'
import { recoverAddress } from '../../utils/signature/recoverAddress.js'
import { ecrecoverAuthenticator, openPayer } from '../constants.js'
import type { TransactionSerializable8130 } from '../types/transaction.js'
import {
  getPayerSignatureHash,
  getSenderSignatureHash,
} from './hashTransaction.js'
import { parseTransaction } from './parseTransaction.js'
import { type Signer, signTransaction } from './signTransaction.js'

// Arbitrary non-k1 authenticator contracts; core treats `authenticator` as opaque.
const authenticators = {
  p256: '0x8130C89F65750431b564A4730397552a11CeA256',
  passkey: '0x813007b6b1b48E75D91dEc5927ab515d12a0F1d0',
} as const

const sender = privateKeyToAccount(accounts[0].privateKey)
const sponsor = privateKeyToAccount(accounts[1].privateKey)
const bob = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const

// A non-ECDSA signer (e.g. P-256 / WebAuthn) whose `sign` returns the
// authenticator-specific `data` blob rather than a 65-byte ECDSA signature.
// P-256 data layout is r || s || x || y || preHash = 129 bytes.
const p256Data = `0x${'ab'.repeat(129)}` as const
function toMockP256Signer(options: { authenticator?: Hex } = {}): Signer {
  return {
    address: '0x0000000000000000000000000000000000000000',
    async sign() {
      return p256Data
    },
    ...(options.authenticator
      ? { authenticator: options.authenticator as `0x${string}` }
      : {}),
  }
}

describe('signTransaction (EIP-8130)', () => {
  test('EOA path: raw 65-byte sender_auth recovers sender', async () => {
    const transaction: TransactionSerializable8130 = {
      chainId: 8453,
      nonceSequence: 1n,
      maxFeePerGas: 2n,
      gas: 100_000n,
      calls: [[{ to: bob, data: '0xdeadbeef' }]],
    }
    const serialized = await signTransaction({
      transaction,
      account: sender,
    })
    const parsed = parseTransaction(serialized)

    expect(parsed.from).toBeUndefined()
    expect(parsed.senderAuth).toBeDefined()
    // raw 65-byte signature
    expect(sliceHex(parsed.senderAuth!).length).toBe(2 + 65 * 2)

    const hash = getSenderSignatureHash(parsed)
    const recovered = await recoverAddress({
      hash,
      signature: parsed.senderAuth!,
    })
    expect(recovered.toLowerCase()).toBe(sender.address.toLowerCase())
  })

  test('configured-actor path: ECRECOVER_AUTHENTICATOR || signature', async () => {
    const transaction: TransactionSerializable8130 = {
      chainId: 8453,
      from: sender.address,
      nonceSequence: 1n,
      maxFeePerGas: 2n,
      calls: [[{ to: bob }]],
    }
    const serialized = await signTransaction({
      transaction,
      account: sender,
    })
    const parsed = parseTransaction(serialized)

    expect(parsed.from?.toLowerCase()).toBe(sender.address.toLowerCase())
    // first 20 bytes are the authenticator
    expect(sliceHex(parsed.senderAuth!, 0, 20)).toBe(ecrecoverAuthenticator)

    const hash = getSenderSignatureHash(parsed)
    const recovered = await recoverAddress({
      hash,
      signature: sliceHex(parsed.senderAuth!, 20),
    })
    expect(recovered.toLowerCase()).toBe(sender.address.toLowerCase())
  })

  test('sponsored: payer_auth recovers sponsor, bound to resolved sender', async () => {
    const transaction: TransactionSerializable8130 = {
      chainId: 8453,
      nonceSequence: 1n,
      maxFeePerGas: 2n,
      gas: 50_000n,
      calls: [[{ to: bob }]],
    }
    const serialized = await signTransaction({
      transaction,
      account: sender,
      payer: { account: sponsor },
    })
    const parsed = parseTransaction(serialized)

    expect(parsed.payer?.toLowerCase()).toBe(sponsor.address.toLowerCase())
    expect(sliceHex(parsed.payerAuth!, 0, 20)).toBe(ecrecoverAuthenticator)

    // payer hash binds the resolved (recovered) sender address
    const payerHash = getPayerSignatureHash({
      ...parsed,
      from: sender.address,
    })
    const recovered = await recoverAddress({
      hash: payerHash,
      signature: sliceHex(parsed.payerAuth!, 20),
    })
    expect(recovered.toLowerCase()).toBe(sponsor.address.toLowerCase())
  })

  test('open payer: raw 65-byte payer_auth recovers sponsor', async () => {
    const transaction: TransactionSerializable8130 = {
      chainId: 8453,
      nonceSequence: 1n,
      maxFeePerGas: 2n,
      gas: 50_000n,
      calls: [[{ to: bob, value: 1n }]],
    }
    const serialized = await signTransaction({
      transaction,
      account: sender,
      payer: { account: sponsor, address: openPayer },
    })
    const parsed = parseTransaction(serialized)

    expect(parsed.payer).toBe(openPayer)
    expect(size(parsed.payerAuth!)).toBe(65)

    const recovered = await recoverAddress({
      hash: getPayerSignatureHash({ ...parsed, from: sender.address }),
      signature: parsed.payerAuth!,
    })
    expect(recovered.toLowerCase()).toBe(sponsor.address.toLowerCase())
  })

  test('open payer: rejects a non-secp256k1 payer signer', async () => {
    await expect(
      signTransaction({
        transaction: {
          chainId: 8453,
          from: sender.address,
          maxFeePerGas: 2n,
          calls: [[{ to: bob }]],
        },
        account: sender,
        payer: {
          account: toMockP256Signer({ authenticator: authenticators.p256 }),
          address: openPayer,
        },
      }),
    ).rejects.toThrow('Open payer mode requires a secp256k1 payer signer')
  })

  test('sender-only: payer_auth left empty for a sponsor to add', async () => {
    const serialized = await signTransaction({
      transaction: {
        chainId: 8453,
        from: sender.address,
        maxFeePerGas: 2n,
        calls: [[{ to: bob }]],
        payer: openPayer,
      },
      account: sender,
    })
    const parsed = parseTransaction(serialized)
    expect(parsed.payer).toBe(openPayer)
    expect(parsed.payerAuth).toBeUndefined()
  })

  test('explicit payer address overrides default', async () => {
    const transaction: TransactionSerializable8130 = {
      chainId: 8453,
      from: sender.address,
      maxFeePerGas: 2n,
      calls: [[{ to: bob }]],
    }
    const serialized = await signTransaction({
      transaction,
      account: sender,
      payer: { account: sponsor, address: sponsor.address },
    })
    const parsed = parseTransaction(serialized)
    expect(parsed.payer?.toLowerCase()).toBe(sponsor.address.toLowerCase())
  })

  test('configured-actor path: custom authenticator || data (P-256/passkey)', async () => {
    const transaction: TransactionSerializable8130 = {
      chainId: 8453,
      from: sender.address,
      nonceSequence: 1n,
      maxFeePerGas: 2n,
      calls: [[{ to: bob }]],
    }
    const serialized = await signTransaction({
      transaction,
      account: toMockP256Signer(),
      authenticator: authenticators.p256,
    })
    const parsed = parseTransaction(serialized)

    expect(parsed.from?.toLowerCase()).toBe(sender.address.toLowerCase())
    // first 20 bytes are the P-256 authenticator, remainder is the raw data blob
    expect(sliceHex(parsed.senderAuth!, 0, 20).toLowerCase()).toBe(
      authenticators.p256.toLowerCase(),
    )
    expect(sliceHex(parsed.senderAuth!, 20)).toBe(p256Data)
  })

  test('configured-actor path: authenticator read from the signer', async () => {
    const transaction: TransactionSerializable8130 = {
      chainId: 8453,
      from: sender.address,
      maxFeePerGas: 2n,
      calls: [[{ to: bob }]],
    }
    const serialized = await signTransaction({
      transaction,
      account: toMockP256Signer({
        authenticator: authenticators.p256,
      }),
    })
    const parsed = parseTransaction(serialized)
    expect(sliceHex(parsed.senderAuth!, 0, 20).toLowerCase()).toBe(
      authenticators.p256.toLowerCase(),
    )
  })

  test('explicit authenticator overrides the signer authenticator', async () => {
    const transaction: TransactionSerializable8130 = {
      chainId: 8453,
      from: sender.address,
      maxFeePerGas: 2n,
      calls: [[{ to: bob }]],
    }
    const serialized = await signTransaction({
      transaction,
      account: toMockP256Signer({
        authenticator: authenticators.passkey,
      }),
      authenticator: authenticators.p256,
    })
    const parsed = parseTransaction(serialized)
    expect(sliceHex(parsed.senderAuth!, 0, 20).toLowerCase()).toBe(
      authenticators.p256.toLowerCase(),
    )
  })

  test('sponsored: payer with a custom authenticator', async () => {
    const transaction: TransactionSerializable8130 = {
      chainId: 8453,
      from: sender.address,
      maxFeePerGas: 2n,
      gas: 50_000n,
      calls: [[{ to: bob }]],
    }
    const serialized = await signTransaction({
      transaction,
      account: sender,
      payer: {
        account: toMockP256Signer(),
        address: bob,
        authenticator: authenticators.passkey,
      },
    })
    const parsed = parseTransaction(serialized)
    expect(parsed.payer?.toLowerCase()).toBe(bob.toLowerCase())
    expect(sliceHex(parsed.payerAuth!, 0, 20).toLowerCase()).toBe(
      authenticators.passkey.toLowerCase(),
    )
    expect(sliceHex(parsed.payerAuth!, 20)).toBe(p256Data)
  })

  test('throws without sender account or preset senderAuth', async () => {
    await expect(
      signTransaction({
        transaction: { chainId: 1, maxFeePerGas: 2n },
      }),
    ).rejects.toThrowError()
  })

  test('preset senderAuth skips signing', async () => {
    const senderAuth = `0x${'11'.repeat(65)}` as const
    const serialized = await signTransaction({
      transaction: { chainId: 1, maxFeePerGas: 2n, senderAuth },
    })
    const parsed = parseTransaction(serialized)
    expect(parsed.senderAuth).toBe(senderAuth)
  })
})
