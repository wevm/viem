import { describe, expect, test } from 'vitest'
import { decodeAbiParameters } from '../../../utils/abi/decodeAbiParameters.js'
import { slice } from '../../../utils/data/slice.js'
import { stringToHex } from '../../../utils/encoding/toHex.js'
import { keccak256 } from '../../../utils/hash/keccak256.js'
import { actorScope, canonicalAuthenticators } from '../constants.js'
import { authorizeActor, key, revokeActor } from '../keys.js'
import { encodeActorChangeData } from './actorChangeData.js'
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
          { name: 'actorId', type: 'bytes32' },
          { name: 'data', type: 'bytes' },
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
          actorChanges: [authorizeActor(key.p256(pubKey))],
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
      [{ actorChanges: [change], auth }],
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
    expect(changeSets[0].changes[0].actorId).toBe(change.actorId)
    expect(changeSets[0].changes[0].data).toBe(encodeActorChangeData(change))
    expect(decodedOpAuth).toBe(opAuth)
  })

  test('encodes multiple sets in order (chained rotations)', () => {
    const setA = {
      actorChanges: [authorizeActor(key.p256(pubKey))],
      auth: '0xaaaa',
    } as const
    const setB = {
      actorChanges: [
        revokeActor(key.p256(pubKey)),
        authorizeActor(key.k1('0x0000000000000000000000000000000000000abc')),
      ],
      auth: '0xbbbb',
    } as const

    const signature = encodeSignedActorChangesSignature([setA, setB], '0x1234')
    const [, changeSets] = decodeAbiParameters(decodeParameters, signature)

    expect(changeSets).toHaveLength(2)
    expect(changeSets[0].auth).toBe(setA.auth)
    expect(changeSets[1].auth).toBe(setB.auth)
    expect(changeSets[1].changes[0].data).toBe('0x')
    expect(changeSets[1].changes[1].changeType).toBe(0x01)
  })

  test('p256 authorize data carries the canonical authenticator', () => {
    const change = authorizeActor(key.p256(pubKey))
    const signature = encodeSignedActorChangesSignature(
      [{ actorChanges: [change], auth: '0x' }],
      '0x',
    )
    const [, changeSets] = decodeAbiParameters(decodeParameters, signature)
    expect(changeSets[0].changes[0].data.toLowerCase()).toContain(
      canonicalAuthenticators.p256.slice(2).toLowerCase(),
    )
  })
})
