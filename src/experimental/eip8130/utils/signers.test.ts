import * as P256 from 'ox/P256'
import { describe, expect, test } from 'vitest'
import { decodeAbiParameters } from '../../../utils/abi/decodeAbiParameters.js'
import { size } from '../../../utils/data/size.js'
import { sliceHex } from '../../../utils/data/slice.js'
import { hexToBigInt } from '../../../utils/encoding/fromHex.js'
import { canonicalAuthenticators } from '../constants.js'
import type { TransactionSerializable8130 } from '../types/transaction.js'
import { parseTransaction8130 } from './parseTransaction.js'
import { toP256Signer, toWebAuthnSigner } from './signers.js'
import { signTransaction8130 } from './signTransaction.js'

const bob = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const
const privateKey = `0x${'a'.repeat(64)}` as const
const hash = `0x${'42'.repeat(32)}` as const

describe('toP256Signer', () => {
  test('produces 129-byte `r || s || x || y || preHash` data', async () => {
    const signer = toP256Signer({ privateKey })
    const data = await signer.sign!({ hash })

    expect(size(data)).toBe(129)
    expect(signer.authenticator).toBe(canonicalAuthenticators.p256)

    const r = sliceHex(data, 0, 32)
    const s = sliceHex(data, 32, 64)
    const x = sliceHex(data, 64, 96)
    const y = sliceHex(data, 96, 128)
    expect(x).toBe(signer.publicKey.x)
    expect(y).toBe(signer.publicKey.y)
    expect(sliceHex(data, 128, 129)).toBe('0x00')

    // The signature verifies over the raw digest with the signer's public key.
    const verified = P256.verify({
      hash: false,
      payload: hash,
      publicKey: P256.getPublicKey({ privateKey }),
      signature: { r: hexToBigInt(r), s: hexToBigInt(s) },
    })
    expect(verified).toBe(true)
  })

  test('signs a configured-actor transaction (authenticator || data)', async () => {
    const signer = toP256Signer({ privateKey })
    const transaction: TransactionSerializable8130 = {
      chainId: 8453,
      from: bob,
      nonceSequence: 1n,
      maxFeePerGas: 2n,
      calls: [[{ to: bob }]],
    }
    const serialized = await signTransaction8130({
      transaction,
      account: signer,
    })
    const parsed = parseTransaction8130(serialized)

    expect(sliceHex(parsed.senderAuth!, 0, 20).toLowerCase()).toBe(
      canonicalAuthenticators.p256.toLowerCase(),
    )
    expect(size(sliceHex(parsed.senderAuth!, 20))).toBe(129)
  })
})

describe('toWebAuthnSigner', () => {
  const x = `0x${'11'.repeat(32)}` as const
  const y = `0x${'22'.repeat(32)}` as const
  const r = `0x${'33'.repeat(32)}` as const
  const s = `0x${'44'.repeat(32)}` as const
  const authenticatorData = `0x${'ab'.repeat(37)}` as const
  const clientDataJSON =
    '{"type":"webauthn.get","challenge":"...","origin":"https://account.vibes.base.org"}'

  const source = {
    publicKey: { x, y },
    async sign() {
      return {
        signature: `0x${r.slice(2)}${s.slice(2)}` as `0x${string}`,
        webauthn: {
          authenticatorData,
          clientDataJSON,
          challengeIndex: 23,
          typeIndex: 1,
        },
      }
    },
  }

  test('ABI-encodes `(WebAuthnAuth, x, y)` data the authenticator can decode', async () => {
    const signer = toWebAuthnSigner(source)
    expect(signer.authenticator).toBe(canonicalAuthenticators.passkey)

    const data = await signer.sign!({ hash })
    const [auth, decodedX, decodedY] = decodeAbiParameters(
      [
        {
          type: 'tuple',
          components: [
            { name: 'r', type: 'bytes32' },
            { name: 's', type: 'bytes32' },
            { name: 'challengeIndex', type: 'uint256' },
            { name: 'typeIndex', type: 'uint256' },
            { name: 'authenticatorData', type: 'bytes' },
            { name: 'clientDataJSON', type: 'string' },
          ],
        },
        { name: 'x', type: 'bytes32' },
        { name: 'y', type: 'bytes32' },
      ],
      data,
    )

    expect(decodedX).toBe(x)
    expect(decodedY).toBe(y)
    expect(auth.r).toBe(r)
    expect(auth.s).toBe(s)
    expect(auth.challengeIndex).toBe(23n)
    expect(auth.typeIndex).toBe(1n)
    expect(auth.authenticatorData).toBe(authenticatorData)
    expect(auth.clientDataJSON).toBe(clientDataJSON)
  })

  test('accepts a 64-byte `x || y` public key hex', async () => {
    const signer = toWebAuthnSigner({
      ...source,
      publicKey: `0x${x.slice(2)}${y.slice(2)}`,
    })
    expect(signer.publicKey).toEqual({ x, y })
  })
})
