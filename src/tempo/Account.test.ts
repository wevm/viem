import {
  Address,
  Authorization,
  Bytes,
  Hash,
  Hex,
  P256,
  PersonalMessage,
  PublicKey,
  Secp256k1,
  Signature,
  TransactionEnvelope as TxEnvelope,
  TypedData,
  WebAuthnP256,
  WebCryptoP256,
} from 'ox'
import {
  Channel,
  KeyAuthorization,
  MultisigConfig,
  SignatureEnvelope,
  TxEnvelopeTempo,
} from 'ox/tempo'
import * as tempo from '~test/tempo.js'
import { afterAll, describe, expect, test } from 'vitest'

import { Actions } from 'viem'

import * as Account from './Account.js'

const privateKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const privateKey_p256 =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

const parent = Account.fromSecp256k1(privateKey)

const envelope = {
  calls: [
    {
      to: '0x0000000000000000000000000000000000000000',
      value: 0n,
    },
  ],
  chainId: 1337,
  gas: 21_000n,
  maxFeePerGas: 1_000_000_000n,
  nonce: 0n,
  type: 'tempo',
} as const satisfies TxEnvelopeTempo.TxEnvelopeTempo

const hash = Hash.keccak256(Hex.fromString('hello tempo'))

describe('fromSecp256k1', () => {
  test('default', async () => {
    const account = Account.fromSecp256k1(privateKey)

    expect(account.address).toMatchInlineSnapshot(
      `"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"`,
    )
    expect(account.keyType).toBe('secp256k1')
    expect(account.source).toBe('root')
    expect(account.type).toBe('local')
    // Public key is hex-encoded without the uncompressed prefix.
    expect(account.publicKey.startsWith('0x04')).toBe(false)
    expect(Hex.size(account.publicKey)).toBe(64)

    const signature = await account.sign({ hash })
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('secp256k1')
    if (envelope.type !== 'secp256k1') throw new Error('unreachable')
    expect(
      Address.checksum(
        Secp256k1.recoverAddress({
          payload: hash,
          signature: envelope.signature,
        }),
      ),
    ).toBe(account.address)
  })

  test('behavior: access key', async () => {
    const account = Account.fromSecp256k1(privateKey_p256, {
      access: parent,
    })

    expect(account.source).toBe('accessKey')
    expect(account.address).toBe(parent.address)
    expect(account.accessKeyAddress).not.toBe(parent.address)

    const signature = await account.sign({ hash })
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('keychain')
    if (envelope.type !== 'keychain') throw new Error('unreachable')
    expect(envelope.userAddress).toBe(parent.address)
    expect(envelope.version).toBe('v2')
    expect(envelope.inner.type).toBe('secp256k1')
    if (envelope.inner.type !== 'secp256k1') throw new Error('unreachable')

    // The inner signature signs `keccak256(0x04 || hash || parent)`.
    const innerHash = Hash.keccak256(Hex.concat('0x04', hash, parent.address))
    expect(
      Address.checksum(
        Secp256k1.recoverAddress({
          payload: innerHash,
          signature: envelope.inner.signature,
        }),
      ),
    ).toBe(account.accessKeyAddress)
  })

  test('behavior: access key raw signature', async () => {
    const account = Account.fromSecp256k1(privateKey_p256, {
      access: parent,
    })

    const signature = await account.sign({ hash, raw: true })
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('secp256k1')
    if (envelope.type !== 'secp256k1') throw new Error('unreachable')
    expect(
      Address.checksum(
        Secp256k1.recoverAddress({
          payload: hash,
          signature: envelope.signature,
        }),
      ),
    ).toBe(account.accessKeyAddress)
  })
})

describe('fromP256', () => {
  const publicKey = P256.getPublicKey({ privateKey: privateKey_p256 })

  test('default', async () => {
    const account = Account.fromP256(privateKey_p256)

    expect(account.keyType).toBe('p256')
    expect(account.source).toBe('root')

    const signature = await account.sign({ hash })
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('p256')
    if (envelope.type !== 'p256') throw new Error('unreachable')
    expect(
      P256.verify({
        payload: hash,
        publicKey,
        signature: envelope.signature,
      }),
    ).toBe(true)
  })

  test('behavior: access key', async () => {
    const account = Account.fromP256(privateKey_p256, { access: parent })

    const signature = await account.sign({ hash })
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('keychain')
    if (envelope.type !== 'keychain') throw new Error('unreachable')
    expect(envelope.inner.type).toBe('p256')
    if (envelope.inner.type !== 'p256') throw new Error('unreachable')

    const innerHash = Hash.keccak256(Hex.concat('0x04', hash, parent.address))
    expect(
      P256.verify({
        payload: innerHash,
        publicKey,
        signature: envelope.inner.signature,
      }),
    ).toBe(true)
  })

  test('behavior: access key raw signature', async () => {
    const account = Account.fromP256(privateKey_p256, { access: parent })

    const signature = await account.sign({ hash, raw: true })
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('p256')
    if (envelope.type !== 'p256') throw new Error('unreachable')
    expect(
      P256.verify({
        payload: hash,
        publicKey,
        signature: envelope.signature,
      }),
    ).toBe(true)
  })
})

describe('fromHeadlessWebAuthn', () => {
  const options = {
    origin: 'http://localhost',
    rpId: 'localhost',
  } as const
  const publicKey = P256.getPublicKey({ privateKey: privateKey_p256 })

  test('default', async () => {
    const account = Account.fromHeadlessWebAuthn(privateKey_p256, options)

    expect(account.keyType).toBe('webAuthn')
    expect(account.source).toBe('root')

    const signature = await account.sign({ hash })
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('webAuthn')
    if (envelope.type !== 'webAuthn') throw new Error('unreachable')
    expect(
      WebAuthnP256.verify({
        challenge: hash,
        metadata: envelope.metadata,
        publicKey,
        signature: envelope.signature,
      }),
    ).toBe(true)
  })

  test('behavior: access key', async () => {
    const account = Account.fromHeadlessWebAuthn(privateKey_p256, {
      ...options,
      access: parent,
    })

    const signature = await account.sign({ hash })
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('keychain')
    if (envelope.type !== 'keychain') throw new Error('unreachable')
    expect(envelope.inner.type).toBe('webAuthn')
    if (envelope.inner.type !== 'webAuthn') throw new Error('unreachable')

    const innerHash = Hash.keccak256(Hex.concat('0x04', hash, parent.address))
    expect(
      WebAuthnP256.verify({
        challenge: innerHash,
        metadata: envelope.inner.metadata,
        publicKey,
        signature: envelope.inner.signature,
      }),
    ).toBe(true)
  })
})

describe('fromWebAuthnP256', () => {
  const publicKey = P256.getPublicKey({ privateKey: privateKey_p256 })

  /** Fake authenticator: signs assertion requests with the fixture key. */
  type GetFn = NonNullable<Account.fromWebAuthnP256.Options['getFn']>

  const getFn: GetFn = async (options) => {
    const challenge = Hex.fromBytes(
      new Uint8Array(options!.publicKey!.challenge as ArrayBuffer),
    )
    const { metadata, payload } = WebAuthnP256.getSignPayload({
      challenge,
      origin: 'http://localhost',
      rpId: 'localhost',
    })
    const signature = P256.sign({
      hash: true,
      payload,
      privateKey: privateKey_p256,
    })
    return {
      id: 'test-credential',
      response: {
        authenticatorData: Bytes.fromHex(metadata.authenticatorData)
          .buffer as ArrayBuffer,
        clientDataJSON: Bytes.fromString(metadata.clientDataJSON)
          .buffer as ArrayBuffer,
        signature: Signature.toDerBytes(signature).buffer as ArrayBuffer,
      },
      type: 'public-key',
    } as unknown as Credential
  }

  test('default', async () => {
    const account = Account.fromWebAuthnP256(
      {
        id: 'test-credential',
        publicKey: PublicKey.toHex(publicKey),
      },
      { getFn, rpId: 'localhost' },
    )

    expect(account.keyType).toBe('webAuthn')
    expect(account.source).toBe('root')

    const signature = await account.sign({ hash })
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('webAuthn')
    if (envelope.type !== 'webAuthn') throw new Error('unreachable')
    expect(
      WebAuthnP256.verify({
        challenge: hash,
        metadata: envelope.metadata,
        publicKey,
        signature: envelope.signature,
      }),
    ).toBe(true)
  })
})

describe('fromWebCryptoP256', () => {
  test('default', async () => {
    const keyPair = await WebCryptoP256.createKeyPair()
    const account = Account.fromWebCryptoP256(keyPair)

    expect(account.keyType).toBe('p256')
    expect(account.source).toBe('root')

    const signature = await account.sign({ hash })
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('p256')
    if (envelope.type !== 'p256') throw new Error('unreachable')
    expect(envelope.prehash).toBe(true)
    expect(
      P256.verify({
        hash: true,
        payload: hash,
        publicKey: keyPair.publicKey,
        signature: envelope.signature,
      }),
    ).toBe(true)
  })

  test('behavior: access key', async () => {
    const keyPair = await WebCryptoP256.createKeyPair()
    const account = Account.fromWebCryptoP256(keyPair, { access: parent })

    expect(account.source).toBe('accessKey')
    expect(account.address).toBe(parent.address)

    const signature = await account.sign({ hash })
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('keychain')
  })
})

describe('signMessage', () => {
  const message = 'hello world'
  const payload = PersonalMessage.getSignPayload(Hex.fromString(message))

  test('default', async () => {
    const account = Account.fromSecp256k1(privateKey)
    const signature = await account.signMessage({ message })
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('secp256k1')
    if (envelope.type !== 'secp256k1') throw new Error('unreachable')
    expect(
      Address.checksum(
        Secp256k1.recoverAddress({
          payload,
          signature: envelope.signature,
        }),
      ),
    ).toBe(account.address)
  })

  test('behavior: raw message', async () => {
    const account = Account.fromSecp256k1(privateKey)
    const signature = await account.signMessage({
      message: { raw: Hex.fromString(message) },
    })
    const envelope = SignatureEnvelope.from(signature)
    if (envelope.type !== 'secp256k1') throw new Error('unreachable')
    expect(
      Address.checksum(
        Secp256k1.recoverAddress({
          payload,
          signature: envelope.signature,
        }),
      ),
    ).toBe(account.address)
  })

  test('behavior: p256', async () => {
    const account = Account.fromP256(privateKey_p256)
    const signature = await account.signMessage({ message })
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('p256')
    if (envelope.type !== 'p256') throw new Error('unreachable')
    expect(
      P256.verify({
        payload,
        publicKey: P256.getPublicKey({ privateKey: privateKey_p256 }),
        signature: envelope.signature,
      }),
    ).toBe(true)
  })

  test('behavior: webAuthn', async () => {
    const account = Account.fromHeadlessWebAuthn(privateKey_p256, {
      origin: 'http://localhost',
      rpId: 'localhost',
    })
    const signature = await account.signMessage({ message })
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('webAuthn')
    if (envelope.type !== 'webAuthn') throw new Error('unreachable')
    expect(
      WebAuthnP256.verify({
        challenge: payload,
        metadata: envelope.metadata,
        publicKey: P256.getPublicKey({ privateKey: privateKey_p256 }),
        signature: envelope.signature,
      }),
    ).toBe(true)
  })
})

describe('signTypedData', () => {
  const typedData = {
    domain: { name: 'Tempo', version: '1', chainId: 1337 },
    types: {
      Mail: [
        { name: 'from', type: 'address' },
        { name: 'contents', type: 'string' },
      ],
    },
    primaryType: 'Mail',
    message: {
      from: '0x0000000000000000000000000000000000000001',
      contents: 'gm',
    },
  } as const
  const payload = TypedData.getSignPayload(typedData)

  test('default', async () => {
    const account = Account.fromSecp256k1(privateKey)
    const signature = await account.signTypedData(typedData)
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('secp256k1')
    if (envelope.type !== 'secp256k1') throw new Error('unreachable')
    expect(
      Address.checksum(
        Secp256k1.recoverAddress({
          payload,
          signature: envelope.signature,
        }),
      ),
    ).toBe(account.address)
  })

  test('behavior: webAuthn', async () => {
    const account = Account.fromHeadlessWebAuthn(privateKey_p256, {
      origin: 'http://localhost',
      rpId: 'localhost',
    })
    const signature = await account.signTypedData(typedData)
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('webAuthn')
    if (envelope.type !== 'webAuthn') throw new Error('unreachable')
    expect(
      WebAuthnP256.verify({
        challenge: payload,
        metadata: envelope.metadata,
        publicKey: P256.getPublicKey({ privateKey: privateKey_p256 }),
        signature: envelope.signature,
      }),
    ).toBe(true)
  })

  test('behavior: p256', async () => {
    const account = Account.fromP256(privateKey_p256)
    const signature = await account.signTypedData(typedData)
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('p256')
    if (envelope.type !== 'p256') throw new Error('unreachable')
    expect(
      P256.verify({
        payload,
        publicKey: P256.getPublicKey({ privateKey: privateKey_p256 }),
        signature: envelope.signature,
      }),
    ).toBe(true)
  })
})

describe('signTransaction', () => {
  test('default', async () => {
    const account = Account.fromSecp256k1(privateKey)
    const serialized = await account.signTransaction(envelope as never)

    expect(serialized.startsWith('0x76')).toBe(true)

    const deserialized = TxEnvelopeTempo.deserialize(
      serialized as TxEnvelopeTempo.Serialized,
    )
    expect(deserialized.signature).toBeDefined()
    expect(deserialized.signature?.type).toBe('secp256k1')

    const payload = TxEnvelopeTempo.getSignPayload(envelope)
    if (deserialized.signature?.type !== 'secp256k1')
      throw new Error('unreachable')
    expect(
      Address.checksum(
        Secp256k1.recoverAddress({
          payload,
          signature: deserialized.signature.signature,
        }),
      ),
    ).toBe(account.address)
  })

  test('behavior: chain transaction hooks drive payload and serialization', async () => {
    const account = Account.fromSecp256k1(privateKey)

    const chain = {
      transaction: {
        getSignPayload: () => hash,
        serialize: (_envelope: never, options?: unknown) =>
          Hex.concat(
            '0xbeef',
            SignatureEnvelope.serialize(
              (options as { signature: SignatureEnvelope.SignatureEnvelope })
                .signature,
            ),
          ),
      },
    }

    const serialized = await account.signTransaction(envelope as never, {
      chain: chain as never,
    })
    expect(serialized.startsWith('0xbeef')).toBe(true)

    const signature = SignatureEnvelope.deserialize(
      `0x${serialized.slice(6)}` as Hex.Hex,
    )
    if (signature.type !== 'secp256k1') throw new Error('unreachable')
    expect(
      Address.checksum(
        Secp256k1.recoverAddress({
          payload: hash,
          signature: signature.signature,
        }),
      ),
    ).toBe(account.address)
  })

  test('behavior: non-tempo envelope signs via the generic path', async () => {
    const account = Account.fromSecp256k1(privateKey)
    const envelope = {
      chainId: 1,
      maxFeePerGas: 1000000000n,
      nonce: 0n,
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      type: 'eip1559',
      value: 1n,
    } as const
    const serialized = await account.signTransaction(envelope as never)

    expect(serialized.startsWith('0x02')).toBe(true)

    const deserialized = TxEnvelope.deserialize(
      serialized as TxEnvelope.Serialized,
    )
    if (deserialized.type !== 'eip1559') throw new Error('unreachable')
    const { r, s, yParity } = deserialized
    if (r === undefined || s === undefined || yParity === undefined)
      throw new Error('unreachable')
    expect(
      Address.checksum(
        Secp256k1.recoverAddress({
          payload: TxEnvelope.getSignPayload(envelope),
          signature: { r, s, yParity },
        }),
      ),
    ).toBe(account.address)
  })

  test('behavior: non-tempo envelope rejects non-secp256k1 keys', async () => {
    const account = Account.fromP256(privateKey_p256)
    await expect(
      account.signTransaction({
        chainId: 1,
        maxFeePerGas: 1000000000n,
        nonce: 0n,
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
        type: 'eip1559',
        value: 1n,
      } as never),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Unsupported signature type. Expected \`secp256k1\` but got \`p256\`.]`,
    )
  })

  test('behavior: p256', async () => {
    const account = Account.fromP256(privateKey_p256)
    const serialized = await account.signTransaction(envelope as never)

    const deserialized = TxEnvelopeTempo.deserialize(
      serialized as TxEnvelopeTempo.Serialized,
    )
    expect(deserialized.signature?.type).toBe('p256')
    if (deserialized.signature?.type !== 'p256') throw new Error('unreachable')
    expect(
      P256.verify({
        payload: TxEnvelopeTempo.getSignPayload(envelope),
        publicKey: P256.getPublicKey({ privateKey: privateKey_p256 }),
        signature: deserialized.signature.signature,
      }),
    ).toBe(true)
  })

  test('behavior: webAuthn', async () => {
    const account = Account.fromHeadlessWebAuthn(privateKey_p256, {
      origin: 'http://localhost',
      rpId: 'localhost',
    })
    const serialized = await account.signTransaction(envelope as never)

    const deserialized = TxEnvelopeTempo.deserialize(
      serialized as TxEnvelopeTempo.Serialized,
    )
    expect(deserialized.signature?.type).toBe('webAuthn')
    if (deserialized.signature?.type !== 'webAuthn')
      throw new Error('unreachable')
    expect(
      WebAuthnP256.verify({
        challenge: TxEnvelopeTempo.getSignPayload(envelope),
        metadata: deserialized.signature.metadata,
        publicKey: P256.getPublicKey({ privateKey: privateKey_p256 }),
        signature: deserialized.signature.signature,
      }),
    ).toBe(true)
  })

  test('behavior: access key signs through a keychain envelope', async () => {
    const account = Account.fromSecp256k1(privateKey_p256, { access: parent })
    const serialized = await account.signTransaction(envelope as never)

    const deserialized = TxEnvelopeTempo.deserialize(
      serialized as TxEnvelopeTempo.Serialized,
    )
    expect(deserialized.signature?.type).toBe('keychain')
  })

  test('behavior: multisig metadata returns an owner approval', async () => {
    const owner = Account.fromSecp256k1(privateKey)
    const config = MultisigConfig.from({
      owners: [{ owner: owner.address, weight: 1 }],
      threshold: 1,
    })

    const approval = await owner.signTransaction({
      ...envelope,
      multisig: config,
    } as never)

    const payload = TxEnvelopeTempo.getSignPayload(envelope)
    const digest = MultisigConfig.getSignPayload({
      genesisConfig: config,
      payload,
    })
    const signature = SignatureEnvelope.from(approval)
    if (signature.type !== 'secp256k1') throw new Error('unreachable')
    expect(
      Address.checksum(
        Secp256k1.recoverAddress({
          payload: digest,
          signature: signature.signature,
        }),
      ),
    ).toBe(owner.address)
  })
})

describe('fromMultisig', () => {
  const owner_1 = Account.fromSecp256k1(privateKey)

  test('default', () => {
    const account = Account.fromMultisig({
      owners: [{ owner: owner_1.address, weight: 1 }],
      threshold: 1,
    })

    expect(account.source).toBe('multisig')
    expect(account.type).toBe('local')
    expect(account.address).toBe(Account.fromMultisig(account.config).address)
  })

  test('sign functions are unsupported', async () => {
    const account = Account.fromMultisig({
      owners: [{ owner: owner_1.address, weight: 1 }],
      threshold: 1,
    })

    await expect(
      account.sign({ hash }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: \`sign\` is not supported for multisig accounts.]`,
    )
    await expect(
      account.signMessage({ message: 'hello' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: \`signMessage\` is not supported for multisig accounts.]`,
    )
    await expect(
      account.signTypedData({} as never),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: \`signTypedData\` is not supported for multisig accounts.]`,
    )
  })

  test('signTransaction serializes the envelope', async () => {
    const account = Account.fromMultisig({
      owners: [{ owner: owner_1.address, weight: 1 }],
      threshold: 1,
    })

    const serialized = await account.signTransaction(envelope as never)
    expect(serialized.startsWith('0x76')).toBe(true)
    expect(
      TxEnvelopeTempo.deserialize(serialized as TxEnvelopeTempo.Serialized)
        .chainId,
    ).toBe(1337)
  })

  // End-to-end multisig sends require a multisig-capable node: the public
  // `tempo` node images (latest, nightly) reject the `0x05` multisig
  // signature envelope with `failed to decode signed transaction`. Approval
  // combining is covered hermetically in `chainConfig.test.ts`.
  test.todo('flat 2-of-2: init + subsequent')
  test.todo('2-of-3 (M-of-N): threshold subset of owners approves')
  test.todo('weighted threshold: single heavy owner meets threshold')
  test.todo('account hoisted to client: send without explicit `account`')
  test.todo('infer multisig from `account` (no `multisig` field)')
  test.todo('fee payer sponsors bootstrap multisig')
})

// End-to-end fee payer flows against a tempo node.
describe('e2e (tempo node)', () => {
  const liveTest = process.env.SKIP_GLOBAL_SETUP ? test.skip : test
  const node = tempo.defineNode()
  afterAll(() => node.stop())

  const to = '0x00000000000000000000000000000000000000ff'

  liveTest(
    'fee payer co-sign derives the sender from a p256 signature',
    { timeout: 120_000 },
    async () => {
      const sender = Account.fromP256(P256.randomPrivateKey())
      const feePayer = Account.fromSecp256k1(tempo.accounts[8]!.privateKey)
      const client = tempo.getClient({
        account: sender,
        rpcUrl: await node.start(),
      })

      // Expiring-nonce window from node time (host clocks may skew).
      const block = await Actions.block.get(client)
      const receipt = await Actions.transaction.sendSync(client, {
        calls: [{ to }],
        feePayer,
        feeToken: tempo.pathUsd,
        validBefore: Number(block.timestamp) + 25,
      })
      expect(receipt.status).toBe('success')
      expect(receipt.from.toLowerCase()).toBe(sender.address.toLowerCase())
      expect(receipt.feePayer?.toLowerCase()).toBe(
        feePayer.address.toLowerCase(),
      )
    },
  )

  liveTest(
    '`feePayer` same as sender preserves `from`',
    { timeout: 120_000 },
    async () => {
      const sender = Account.fromSecp256k1(tempo.accounts[9]!.privateKey)
      const client = tempo.getClient({
        account: sender,
        rpcUrl: await node.start(),
      })

      const serialized = await Actions.transaction.sign(client, {
        calls: [{ to }],
        feePayer: sender,
        feeToken: tempo.pathUsd,
        gas: 100_000n,
        maxFeePerGas: 1_000_000_000n,
        maxPriorityFeePerGas: 100_000_000n,
        nonce: 0,
      })
      const envelope = TxEnvelopeTempo.deserialize(
        serialized as TxEnvelopeTempo.Serialized,
      )
      expect(envelope.from?.toLowerCase()).toBe(sender.address.toLowerCase())
      expect(envelope.feePayerSignature).toBeDefined()
    },
  )
})

describe('signAuthorization', () => {
  const authorization = {
    address: '0x0000000000000000000000000000000000000001',
    chainId: 1337,
    nonce: 0n,
  } as const

  test('default', async () => {
    const account = Account.fromSecp256k1(privateKey)
    const signed = await account.signAuthorization(authorization)

    expect(signed.address).toBe(authorization.address)
    expect(signed.chainId).toBe(authorization.chainId)
    expect(signed.nonce).toBe(authorization.nonce)
    expect(
      Address.checksum(
        Secp256k1.recoverAddress({
          payload: Authorization.getSignPayload(authorization),
          signature: signed,
        }),
      ),
    ).toBe(account.address)
  })

  test('error: non-secp256k1', async () => {
    const account = Account.fromP256(privateKey_p256)
    await expect(
      account.signAuthorization(authorization),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Unsupported signature type. Expected \`secp256k1\` but got \`p256\`.]`,
    )
  })
})

describe('signVoucher', () => {
  const voucher = {
    chainId: 1337,
    channel: Hash.keccak256(Hex.fromString('channel')),
    cumulativeAmount: 100n,
  } as const
  const payload = Channel.getVoucherSignPayload({
    chainId: voucher.chainId,
    channelId: voucher.channel,
    cumulativeAmount: voucher.cumulativeAmount,
  })

  test('default', async () => {
    const account = Account.fromSecp256k1(privateKey)
    const signature = await account.signVoucher(voucher)
    const envelope = SignatureEnvelope.from(signature)
    if (envelope.type !== 'secp256k1') throw new Error('unreachable')
    expect(
      Address.checksum(
        Secp256k1.recoverAddress({ payload, signature: envelope.signature }),
      ),
    ).toBe(account.address)
  })

  test('behavior: channel descriptor', async () => {
    const account = Account.fromSecp256k1(privateKey)
    const channel = {
      authorizedSigner: '0x0000000000000000000000000000000000000000',
      expiringNonceHash: Hash.keccak256(Hex.fromString('nonce')),
      operator: '0x0000000000000000000000000000000000000000',
      payee: '0x0000000000000000000000000000000000000002',
      payer: account.address,
      salt: Hash.keccak256(Hex.fromString('salt')),
      token: '0x20c0000000000000000000000000000000000001',
    } as const

    const signature = await account.signVoucher({
      ...voucher,
      channel,
    })

    const channelId = Channel.computeId(channel, { chainId: voucher.chainId })
    const payload = Channel.getVoucherSignPayload({
      chainId: voucher.chainId,
      channelId,
      cumulativeAmount: voucher.cumulativeAmount,
    })
    const envelope = SignatureEnvelope.from(signature)
    if (envelope.type !== 'secp256k1') throw new Error('unreachable')
    expect(
      Address.checksum(
        Secp256k1.recoverAddress({ payload, signature: envelope.signature }),
      ),
    ).toBe(account.address)
  })

  test('behavior: access key signs raw', async () => {
    const account = Account.fromSecp256k1(privateKey_p256, { access: parent })
    const signature = await account.signVoucher(voucher)
    const envelope = SignatureEnvelope.from(signature)
    // Raw signature: not keychain-wrapped.
    expect(envelope.type).toBe('secp256k1')
    if (envelope.type !== 'secp256k1') throw new Error('unreachable')
    expect(
      Address.checksum(
        Secp256k1.recoverAddress({ payload, signature: envelope.signature }),
      ),
    ).toBe(account.accessKeyAddress)
  })

  test('standalone', async () => {
    const account = Account.fromSecp256k1(privateKey)
    const signature = await Account.signVoucher(account, voucher)
    const envelope = SignatureEnvelope.from(signature)
    if (envelope.type !== 'secp256k1') throw new Error('unreachable')
    expect(
      Address.checksum(
        Secp256k1.recoverAddress({ payload, signature: envelope.signature }),
      ),
    ).toBe(account.address)
  })

  test('standalone: access key', async () => {
    const account = Account.fromSecp256k1(privateKey_p256, { access: parent })
    const signature = await Account.signVoucher(account, voucher)
    const envelope = SignatureEnvelope.from(signature)
    expect(envelope.type).toBe('secp256k1')
  })
})

describe('signKeyAuthorization', () => {
  const accessKey = Account.fromP256(privateKey_p256, { access: parent })

  function verifyKeyAuthorization(
    keyAuthorization: KeyAuthorization.Signed,
    signer: Account.RootAccount | Account.AccessKeyAccount,
  ) {
    const { signature, ...unsigned } = keyAuthorization
    const payload = KeyAuthorization.getSignPayload(unsigned as never)
    if (signature.type !== 'secp256k1') throw new Error('unexpected type')
    const recovered = Address.checksum(
      Secp256k1.recoverAddress({
        payload,
        signature: signature.signature,
      }),
    )
    const expected =
      signer.source === 'accessKey' ? signer.accessKeyAddress : signer.address
    expect(recovered).toBe(expected)
  }

  test('default', async () => {
    const keyAuthorization = await parent.signKeyAuthorization(accessKey, {
      chainId: 1337,
    })

    expect(keyAuthorization.address).toBe(accessKey.accessKeyAddress)
    expect(keyAuthorization.chainId).toBe(1337)
    expect(keyAuthorization.type).toBe('p256')
    verifyKeyAuthorization(keyAuthorization, parent)
  })

  test('behavior: secp256k1 key', async () => {
    const key = Account.fromSecp256k1(
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b786a3e',
      { access: parent },
    )
    const keyAuthorization = await parent.signKeyAuthorization(key, {
      chainId: 1337,
    })
    expect(keyAuthorization.address).toBe(key.accessKeyAddress)
    expect(keyAuthorization.type).toBe('secp256k1')
    verifyKeyAuthorization(keyAuthorization, parent)
  })

  test('behavior: webAuthn key', async () => {
    const key = Account.fromHeadlessWebAuthn(privateKey_p256, {
      access: parent,
      origin: 'http://localhost',
      rpId: 'localhost',
    })
    const keyAuthorization = await parent.signKeyAuthorization(key, {
      chainId: 1337,
    })
    expect(keyAuthorization.address).toBe(key.accessKeyAddress)
    expect(keyAuthorization.type).toBe('webAuthn')
    verifyKeyAuthorization(keyAuthorization, parent)
  })

  test('behavior: expiry + limits + scopes', async () => {
    const keyAuthorization = await parent.signKeyAuthorization(accessKey, {
      chainId: 1337,
      expiry: 1_800_000_000,
      limits: [
        {
          limit: 1_000_000n,
          token: '0x20c0000000000000000000000000000000000001',
        },
        {
          limit: 2_000_000n,
          period: 86_400,
          token: '0x20c0000000000000000000000000000000000002',
        },
      ],
      scopes: [
        {
          address: '0x20c0000000000000000000000000000000000001',
          selector: '0xa9059cbb',
        },
      ],
    })

    expect(keyAuthorization.expiry).toBe(1_800_000_000)
    expect(keyAuthorization.limits).toHaveLength(2)
    expect(keyAuthorization.scopes).toHaveLength(1)
    verifyKeyAuthorization(keyAuthorization, parent)
  })

  test('behavior: witness', async () => {
    const witness = Hash.keccak256(Hex.fromString('witness'))
    const keyAuthorization = await parent.signKeyAuthorization(accessKey, {
      chainId: 1337,
      witness,
    })

    expect(keyAuthorization.witness).toBe(witness)
    verifyKeyAuthorization(keyAuthorization, parent)
  })

  test('format: { address, type }', async () => {
    const keyAuthorization = await parent.signKeyAuthorization(
      { address: accessKey.accessKeyAddress, type: 'p256' },
      { chainId: 1337 },
    )
    expect(keyAuthorization.address).toBe(accessKey.accessKeyAddress)
    expect(keyAuthorization.type).toBe('p256')
  })

  test('format: { publicKey, type }', async () => {
    const keyAuthorization = await parent.signKeyAuthorization(
      { publicKey: accessKey.publicKey, type: 'p256' },
      { chainId: 1337 },
    )
    expect(keyAuthorization.address).toBe(accessKey.accessKeyAddress)
  })

  test('standalone', async () => {
    const keyAuthorization = await Account.signKeyAuthorization(parent, {
      chainId: 1337,
      key: accessKey,
    })
    expect(keyAuthorization.address).toBe(accessKey.accessKeyAddress)
    verifyKeyAuthorization(keyAuthorization, parent)
  })

  test('standalone: periodic limit + scopes', async () => {
    const keyAuthorization = await Account.signKeyAuthorization(parent, {
      chainId: 1337,
      key: accessKey,
      limits: [
        {
          limit: 5_000_000n,
          period: 3_600,
          token: '0x20c0000000000000000000000000000000000001',
        },
      ],
      scopes: [
        {
          address: '0x20c0000000000000000000000000000000000001',
          selector: '0x095ea7b3',
        },
      ],
    })

    expect(keyAuthorization.limits).toEqual([
      {
        limit: 5_000_000n,
        period: 3_600,
        token: '0x20c0000000000000000000000000000000000001',
      },
    ])
    expect(keyAuthorization.scopes).toEqual([
      {
        address: '0x20c0000000000000000000000000000000000001',
        selector: '0x095ea7b3',
      },
    ])
    verifyKeyAuthorization(keyAuthorization, parent)
  })

  test('standalone: admin access key signer binds the account', async () => {
    const adminKey = Account.fromSecp256k1(
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b786a3e',
      { access: parent },
    )
    const keyAuthorization = await Account.signKeyAuthorization(adminKey, {
      chainId: 1337,
      key: accessKey,
    })

    // Bound to the parent account the admin key acts on behalf of.
    expect(keyAuthorization.account).toBe(parent.address)
    verifyKeyAuthorization(keyAuthorization, adminKey)
  })

  test('standalone: admin authorization drops restrictions', async () => {
    const keyAuthorization = await Account.signKeyAuthorization(parent, {
      admin: true,
      chainId: 1337,
      expiry: 1_800_000_000,
      key: accessKey,
      limits: [
        {
          limit: 1n,
          token: '0x20c0000000000000000000000000000000000001',
        },
      ],
    })

    expect(keyAuthorization.isAdmin).toBe(true)
    expect(keyAuthorization.expiry).toBeUndefined()
    expect(keyAuthorization.limits).toBeUndefined()
    verifyKeyAuthorization(keyAuthorization, parent)
  })
})

describe('resolveAccessKey', () => {
  const accessKey = Account.fromP256(privateKey_p256, { access: parent })

  test('format: AccessKeyAccount', () => {
    expect(Account.resolveAccessKey(accessKey)).toEqual({
      accessKeyAddress: accessKey.accessKeyAddress,
      keyType: 'p256',
    })
  })

  test('format: { accessKeyAddress, keyType }', () => {
    expect(
      Account.resolveAccessKey({
        accessKeyAddress: accessKey.accessKeyAddress,
        keyType: 'p256',
      }),
    ).toEqual({
      accessKeyAddress: accessKey.accessKeyAddress,
      keyType: 'p256',
    })
  })

  test('format: { address, type }', () => {
    expect(
      Account.resolveAccessKey({
        address: accessKey.accessKeyAddress,
        type: 'p256',
      }),
    ).toEqual({
      accessKeyAddress: accessKey.accessKeyAddress,
      keyType: 'p256',
    })
  })

  test('format: { publicKey, type }', () => {
    expect(
      Account.resolveAccessKey({
        publicKey: accessKey.publicKey,
        type: 'p256',
      }),
    ).toEqual({
      accessKeyAddress: accessKey.accessKeyAddress,
      keyType: 'p256',
    })
  })
})
