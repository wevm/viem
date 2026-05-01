import type { Address } from 'abitype'
import * as Bytes from 'ox/Bytes'
import * as Hex from 'ox/Hex'
import * as PublicKey from 'ox/PublicKey'
import * as Secp256k1 from 'ox/Secp256k1'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { tempoModerato } from '../../chains/definitions/tempoModerato.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import type { Hex as HexType } from '../../types/misc.js'
import { getPortalAddress } from '../zones/zone.js'
import type { EncryptedPayload } from './zone.js'
import * as zoneActions from './zone.js'

const mocks = vi.hoisted(() => ({
  createKeyPair: vi.fn(),
  readContract: vi.fn(),
  sendTransaction: vi.fn(),
}))

vi.mock('../../actions/public/readContract.js', () => ({
  readContract: mocks.readContract,
}))

vi.mock('../../actions/wallet/sendTransaction.js', () => ({
  sendTransaction: mocks.sendTransaction,
}))

vi.mock('ox/Secp256k1', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ox/Secp256k1')>()
  return {
    ...actual,
    createKeyPair: mocks.createKeyPair,
  }
})

describe('encryptedDeposit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('behavior: encrypts payload with zone deposit plaintext and HKDF context', async () => {
    const account = privateKeyToAccount(
      '0x1111111111111111111111111111111111111111111111111111111111111111',
    )
    const client = createClient({
      account,
      chain: tempoModerato,
      transport: http(),
    })
    const sequencerPrivateKey =
      '0x2222222222222222222222222222222222222222222222222222222222222222'
    const ephemeralPrivateKey =
      '0x3333333333333333333333333333333333333333333333333333333333333333'
    const sequencerPublicKey = PublicKey.compress(
      Secp256k1.getPublicKey({ privateKey: sequencerPrivateKey }),
    )
    const ephemeralPublicKey = Secp256k1.getPublicKey({
      privateKey: ephemeralPrivateKey,
    })
    const recipient = '0x4444444444444444444444444444444444444444'
    const memo =
      '0x5555555555555555555555555555555555555555555555555555555555555555'

    mocks.createKeyPair.mockReturnValue({
      privateKey: ephemeralPrivateKey,
      publicKey: ephemeralPublicKey,
    })
    mocks.readContract.mockImplementation((_client, parameters) => {
      if (parameters.functionName === 'sequencerEncryptionKey')
        return [
          Hex.fromNumber(sequencerPublicKey.x, { size: 32 }),
          sequencerPublicKey.prefix,
        ]
      if (parameters.functionName === 'encryptionKeyCount') return 3n
      throw new Error(`unexpected function ${parameters.functionName}`)
    })
    mocks.sendTransaction.mockResolvedValue(
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    )

    await zoneActions.encryptedDeposit(client, {
      amount: 1n,
      memo,
      recipient,
      token: '0x20c0000000000000000000000000000000000000',
      zoneId: 7,
    })

    const sendParameters = mocks.sendTransaction.mock.calls[0]![1] as {
      calls: readonly { args: readonly unknown[]; functionName: string }[]
    }
    const depositCall = sendParameters.calls[1]!
    const encrypted = depositCall.args[3] as EncryptedPayload
    const portalAddress = getPortalAddress(tempoModerato.id, 7)

    expect(depositCall.functionName).toBe('depositEncrypted')
    expect(depositCall.args[2]).toBe(2n)
    expect(Bytes.from(encrypted.ciphertext)).toHaveLength(64)

    const plaintext = await decryptDepositPayload({
      encrypted,
      keyIndex: 2n,
      portalAddress,
      sequencerPrivateKey,
    })

    expect(Hex.fromBytes(plaintext)).toBe(
      Hex.fromBytes(
        Bytes.concat(
          Bytes.from(recipient),
          Bytes.from(memo),
          new Uint8Array(12),
        ),
      ),
    )
  })
})

async function decryptDepositPayload(parameters: {
  encrypted: EncryptedPayload
  keyIndex: bigint
  portalAddress: Address
  sequencerPrivateKey: HexType
}): Promise<Bytes.Bytes> {
  const { encrypted, keyIndex, portalAddress, sequencerPrivateKey } = parameters
  const ephemeralPublicKey = PublicKey.from({
    prefix: encrypted.ephemeralPubkeyYParity,
    x: Hex.toBigInt(encrypted.ephemeralPubkeyX),
  })
  const sharedSecret = Secp256k1.getSharedSecret({
    as: 'Bytes',
    privateKey: sequencerPrivateKey,
    publicKey: ephemeralPublicKey,
  })
  const hkdfKey = await globalThis.crypto.subtle.importKey(
    'raw',
    sharedSecret.slice(1),
    'HKDF',
    false,
    ['deriveKey'],
  )
  const aesKey = await globalThis.crypto.subtle.deriveKey(
    {
      hash: 'SHA-256',
      info: Bytes.concat(
        Bytes.from(portalAddress),
        Bytes.fromNumber(keyIndex, { size: 32 }),
        Bytes.from(encrypted.ephemeralPubkeyX),
      ) as BufferSource,
      name: 'HKDF',
      salt: new TextEncoder().encode('ecies-aes-key'),
    },
    hkdfKey,
    { length: 256, name: 'AES-GCM' },
    false,
    ['decrypt'],
  )
  return new Uint8Array(
    await globalThis.crypto.subtle.decrypt(
      {
        iv: Bytes.from(encrypted.nonce) as BufferSource,
        name: 'AES-GCM',
        tagLength: 128,
      },
      aesKey,
      Bytes.concat(
        Bytes.from(encrypted.ciphertext),
        Bytes.from(encrypted.tag),
      ) as BufferSource,
    ),
  )
}
