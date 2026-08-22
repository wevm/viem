import { describe, expect, test } from 'vitest'
import { decodeAbiParameters } from '../../utils/abi/decodeAbiParameters.js'
import { slice } from '../../utils/data/slice.js'
import { stringToHex } from '../../utils/encoding/toHex.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import { actorScope, canonicalAuthenticators } from '../constants.js'
import { authorizeActor, key, revokeActor } from '../keys.js'
import { encodeChangePayload } from './actorChangeData.js'
import {
  encodeSignedActorChangesSignature,
  signedActorChangesMagic,
} from './signedActorChangesSignature.js'

const pubKey = {
  x: '0x1111111111111111111111111111111111111111111111111111111111111111',
  y: '0x2222222222222222222222222222222222222222222222222222222222222222',
} as const

const decodeParameters = [
  { type: 'bytes32' },
  {
    type: 'tuple[]',
    components: [
      {
        name: 'changes',
        type: 'tuple[]',
        components: [
          { name: 'changeType', type: 'uint8' },
          { name: 'payload', type: 'bytes' },
        ],
      },
      { name: 'auth', type: 'bytes' },
    ],
  },
  { name: 'opAuth', type: 'bytes' },
] as const

describe('signedActorChangesMagic', () => {
  test('matches the contract discriminator', () => {
    expect(signedActorChangesMagic).toBe(
      keccak256(stringToHex('ERC4337Account.signedActorChanges.v1')),
    )
  })
})

describe('encodeSignedActorChangesSignature', () => {
  test('prefixes the 32-byte magic', () => {
    const signature = encodeSignedActorChangesSignature(
      [
        {
          changes: [authorizeActor(key.p256(pubKey))],
          auth: '0xdeadbeef',
        },
      ],
      '0x',
    )
    expect(slice(signature, 0, 32)).toBe(signedActorChangesMagic)
  })

  test('round-trips a single set through abi.decode', () => {
    const change = authorizeActor(key.p256(pubKey), {
      scope: actorScope.sender,
    })
    const auth = '0xc0ffee'
    const opAuth = '0xdeadbeef'
    const signature = encodeSignedActorChangesSignature(
      [{ changes: [change], auth }],
      opAuth,
    )

    const [magic, changeSets, decodedOpAuth] = decodeAbiParameters(
      decodeParameters,
      signature,
    )

    expect(magic).toBe(signedActorChangesMagic)
    expect(changeSets).toHaveLength(1)
    expect(changeSets[0].auth).toBe(auth)
    expect(changeSets[0].changes).toHaveLength(1)
    expect(changeSets[0].changes[0].changeType).toBe(change.changeType)
    expect(changeSets[0].changes[0].payload).toBe(encodeChangePayload(change))
    expect(decodedOpAuth).toBe(opAuth)
  })

  test('encodes multiple sets in order (chained rotations)', () => {
    const setA = {
      changes: [authorizeActor(key.p256(pubKey))],
      auth: '0xaaaa',
    } as const
    const revoke = revokeActor(key.p256(pubKey))
    const setB = {
      changes: [
        revoke,
        authorizeActor(key.k1('0x0000000000000000000000000000000000000abc')),
      ],
      auth: '0xbbbb',
    } as const

    const signature = encodeSignedActorChangesSignature([setA, setB], '0x1234')
    const [, changeSets] = decodeAbiParameters(decodeParameters, signature)

    expect(changeSets).toHaveLength(2)
    expect(changeSets[0].auth).toBe(setA.auth)
    expect(changeSets[1].auth).toBe(setB.auth)
    // revokeActor payload is `abi.encode(bytes32 actorId)`.
    expect(changeSets[1].changes[0].payload).toBe(encodeChangePayload(revoke))
    expect(changeSets[1].changes[0].changeType).toBe(0x01)
    // authorizeActor is ChangeType 0x00.
    expect(changeSets[1].changes[1].changeType).toBe(0x00)
  })

  test('p256 authorize payload carries the canonical authenticator', () => {
    const change = authorizeActor(key.p256(pubKey))
    const signature = encodeSignedActorChangesSignature(
      [{ changes: [change], auth: '0x' }],
      '0x',
    )
    const [, changeSets] = decodeAbiParameters(decodeParameters, signature)
    expect(changeSets[0].changes[0].payload.toLowerCase()).toContain(
      canonicalAuthenticators.p256.slice(2).toLowerCase(),
    )
  })
})
