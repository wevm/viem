import * as Bytes from 'ox/Bytes'
import * as P256 from 'ox/P256'
import * as PublicKey from 'ox/PublicKey'
import { describe, expect, test } from 'vitest'

import * as WebAuthnP256 from './WebAuthnP256.js'

const privateKey =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
const publicKey = P256.getPublicKey({ privateKey })

/** DER-encoded SPKI header for an uncompressed P-256 public key. */
const spkiHeader = '0x3059301306072a8648ce3d020106082a8648ce3d030107034200'

type CreateFn = NonNullable<
  WebAuthnP256.createCredential.Parameters['createFn']
>

/** Builds a `createFn` returning a minimal WebAuthn registration credential. */
function getCreateFn() {
  const state: { options: Parameters<CreateFn>[0] } = {
    options: undefined,
  }
  const spki = Bytes.concat(
    Bytes.fromHex(spkiHeader),
    PublicKey.toBytes(publicKey),
  )
  const createFn: CreateFn = async (options) => {
    state.options = options
    return {
      id: 'test-credential-id',
      response: {
        attestationObject: new ArrayBuffer(0),
        clientDataJSON: new ArrayBuffer(0),
        getPublicKey() {
          return spki.buffer as ArrayBuffer
        },
      },
      type: 'public-key',
    } as unknown as Credential
  }
  return { createFn, state }
}

describe('createCredential', () => {
  test('returns the credential with its public key', async () => {
    const { createFn } = getCreateFn()

    const credential = await WebAuthnP256.createCredential({
      createFn,
      label: 'Example',
      rpId: 'example.com',
    })

    expect(credential.id).toBe('test-credential-id')
    expect(credential.publicKey).toBe(
      PublicKey.toHex(publicKey, { includePrefix: false }),
    )
    expect(credential.raw).toBeDefined()
  })

  test('enforces tempo credential defaults', async () => {
    const { createFn, state } = getCreateFn()

    await WebAuthnP256.createCredential({
      createFn,
      label: 'Example',
      rpId: 'example.com',
    })

    const options = state.options?.publicKey
    expect(options?.authenticatorSelection).toMatchObject({
      requireResidentKey: true,
      residentKey: 'required',
      userVerification: 'required',
    })
    expect(options?.extensions).toMatchObject({ credProps: true })
    expect(options?.rp).toMatchObject({
      id: 'example.com',
      name: 'example.com',
    })
    expect(options?.user).toMatchObject({
      displayName: 'Example',
      name: 'Example',
    })
    expect(new Uint8Array(options?.user.id as ArrayBuffer)).toStrictEqual(
      new Uint8Array(Bytes.fromString('Example')),
    )
  })

  test('honors a custom user id', async () => {
    const { createFn, state } = getCreateFn()

    await WebAuthnP256.createCredential({
      createFn,
      label: 'Example',
      rpId: 'example.com',
      userId: Bytes.fromHex('0xdeadbeef'),
    })

    expect(
      new Uint8Array(state.options?.publicKey?.user.id as ArrayBuffer),
    ).toStrictEqual(new Uint8Array(Bytes.fromHex('0xdeadbeef')))
  })

  test('errors when credential creation fails', async () => {
    await expect(
      WebAuthnP256.createCredential({
        createFn: async () => null,
        label: 'Example',
        rpId: 'example.com',
      }),
    ).rejects.toThrowError()
  })
})
