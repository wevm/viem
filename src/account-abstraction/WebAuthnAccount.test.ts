import {
  Bytes,
  Hex,
  P256,
  PersonalMessage,
  PublicKey,
  Signature,
  TypedData,
  WebAuthnP256,
} from 'ox'
import { expect, test } from 'vitest'

import { typedData } from '~test/constants.js'
import * as WebAuthnAccount from './WebAuthnAccount.js'

const credentialId = 'test-credential'
const hash =
  '0x6c3a75d4c4cf2c5393cbce29eaf82268d06b3a670f047be6f6b8e3e7b5d5872f'
const privateKey =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
const publicKey = P256.getPublicKey({ privateKey })

type GetFn = NonNullable<WebAuthnAccount.from.Options['getFn']>

const getFn: GetFn = async (options) => {
  if (!options?.publicKey) throw new Error('Public key options are required.')

  const source = options.publicKey.challenge
  const bytes =
    source instanceof ArrayBuffer
      ? new Uint8Array(source)
      : new Uint8Array(source.buffer, source.byteOffset, source.byteLength)
  const challenge = Hex.fromBytes(bytes)
  const rpId = options.publicKey.rpId ?? 'localhost'
  const { metadata, payload } = WebAuthnP256.getSignPayload({
    challenge,
    origin: `https://${rpId}`,
    rpId,
  })
  const signature = P256.sign({
    hash: true,
    payload,
    privateKey,
  })
  return {
    id: credentialId,
    response: {
      authenticatorData: Bytes.fromHex(metadata.authenticatorData)
        .buffer as ArrayBuffer,
      clientDataJSON: Bytes.fromString(metadata.clientDataJSON)
        .buffer as ArrayBuffer,
      signature: Signature.toDerBytes(signature).buffer as ArrayBuffer,
    },
    type: 'public-key',
  } as unknown as WebAuthnP256.Credential
}

test('default', () => {
  const account = WebAuthnAccount.from({
    id: credentialId,
    publicKey,
  })

  expect(account).toMatchInlineSnapshot(`
    {
      "id": "test-credential",
      "publicKey": "0x6be721f937cb44266945d5089b0600afd8d61b7a1720f2d0ac7470d270b9c180a579d341e6892fba35fff360829947d101fb41f64fb3e5c9843e587b2365b0d8",
      "sign": [Function],
      "signMessage": [Function],
      "signTypedData": [Function],
      "type": "webAuthn",
    }
  `)
})

test('behavior: persisted credential', () => {
  const account = WebAuthnAccount.from({
    id: credentialId,
    publicKey: PublicKey.toHex(publicKey),
  })

  expect(account.publicKey).toMatchInlineSnapshot(
    `"0x6be721f937cb44266945d5089b0600afd8d61b7a1720f2d0ac7470d270b9c180a579d341e6892fba35fff360829947d101fb41f64fb3e5c9843e587b2365b0d8"`,
  )
})

test('behavior: compressed public key', () => {
  expect(() =>
    WebAuthnAccount.from({
      id: credentialId,
      publicKey: PublicKey.toHex(PublicKey.compress(publicKey)),
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `[PublicKey.InvalidError: Value \`{"prefix":2,"x":"0x6be721f937cb44266945d5089b0600afd8d61b7a1720f2d0ac7470d270b9c180"}\` is not a valid public key.\n\nPublic key must contain:\n- an \`x\` and \`prefix\` value (compressed)\n- an \`x\`, \`y\`, and \`prefix\` value (uncompressed)]`,
  )
})

test('sign', async () => {
  const account = WebAuthnAccount.from(
    {
      id: credentialId,
      publicKey: PublicKey.toHex(publicKey, { includePrefix: false }),
    },
    { getFn, rpId: 'example.com' },
  )

  const { raw, ...result } = await account.sign({ hash })
  expect({ ...result, raw: { id: raw.id, type: raw.type } })
    .toMatchInlineSnapshot(`
      {
        "raw": {
          "id": "test-credential",
          "type": "public-key",
        },
        "signature": "0xa3225fbd4dd7f30e42aae7717bd0ddb561b2cf6b55bbbaddacfe9dd6e3a077ff38db2d1d0ce3fa7c57fba54be7fdc82cd72aacbb079b140998f462b6acf06cc5",
        "webauthn": {
          "authenticatorData": "0xa379a6f6eeafb9a55e378c118034e2751e682fab9f2d30ab13d2125586ce19470500000000",
          "challengeIndex": 23,
          "clientDataJSON": "{"type":"webauthn.get","challenge":"bDp11MTPLFOTy84p6vgiaNBrOmcPBHvm9rjj57XVhy8","origin":"https://example.com","crossOrigin":false}",
          "typeIndex": 1,
          "userVerificationRequired": true,
        },
      }
    `)

  expect(
    WebAuthnP256.verify({
      challenge: hash,
      metadata: result.webauthn,
      publicKey,
      signature: Signature.fromHex(result.signature),
    }),
  ).toMatchInlineSnapshot(`true`)
})

test('signMessage', async () => {
  const account = WebAuthnAccount.from(
    { id: credentialId, publicKey },
    { getFn, rpId: 'localhost' },
  )

  const result = await account.signMessage({ message: 'hello world' })
  expect(
    WebAuthnP256.verify({
      challenge: PersonalMessage.getSignPayload(Hex.fromString('hello world')),
      metadata: result.webauthn,
      publicKey,
      signature: Signature.fromHex(result.signature),
    }),
  ).toMatchInlineSnapshot(`true`)
})

test('signMessage: raw', async () => {
  const account = WebAuthnAccount.from(
    { id: credentialId, publicKey },
    { getFn, rpId: 'localhost' },
  )
  const message = { raw: '0xdeadbeef' } as const

  const result = await account.signMessage({ message })
  expect(
    WebAuthnP256.verify({
      challenge: PersonalMessage.getSignPayload(message.raw),
      metadata: result.webauthn,
      publicKey,
      signature: Signature.fromHex(result.signature),
    }),
  ).toMatchInlineSnapshot(`true`)
})

test('signTypedData', async () => {
  const account = WebAuthnAccount.from(
    { id: credentialId, publicKey },
    { getFn, rpId: 'localhost' },
  )
  const value = {
    ...typedData.basic,
    primaryType: 'Mail',
  } as const

  const result = await account.signTypedData(value)
  expect(
    WebAuthnP256.verify({
      challenge: TypedData.getSignPayload(value),
      metadata: result.webauthn,
      publicKey,
      signature: Signature.fromHex(result.signature),
    }),
  ).toMatchInlineSnapshot(`true`)
})
