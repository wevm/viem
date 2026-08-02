import { Bytes, Hex, PublicKey, Secp256k1 } from 'ox'
import type { Address } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { WriteParameters } from '../../internal/types.js'
import type { EncryptedPayload } from './types.js'

const zeroHash =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

export type ZoneWriteParameters<
  account extends Account.Account | undefined = Account.Account | undefined,
> = WriteParameters & { account?: account | Account.Account | undefined }

export type ReceiptReturn<receipt> = {
  /** Transaction receipt. */
  receipt: receipt
}

export function getChain<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: { chain?: Chain.Chain | null | undefined },
) {
  const chain =
    options.chain === null ? undefined : (options.chain ?? client.chain)
  if (!chain) throw new Error('`chain` is required.')
  return chain
}

export function getAccount(account: Account.Account | undefined) {
  if (!account) throw new Error('`account` is required.')
  return account
}

export function getAddress(account: Account.Account) {
  return account.address
}

export async function encryptDepositPayload(
  publicKey: { prefix: 2 | 3; x: Hex.Hex },
  recipient: Address.Address,
  portalAddress: Address.Address,
  keyIndex: bigint,
  memo: Hex.Hex = zeroHash,
): Promise<EncryptedPayload> {
  const sequencerPublicKey = PublicKey.from({
    prefix: publicKey.prefix,
    x: publicKey.x,
  })

  const { privateKey: ephemeralPrivateKey, publicKey: ephemeralPublicKey } =
    Secp256k1.createKeyPair()
  const compressedEphemeral = PublicKey.compress(ephemeralPublicKey)

  const sharedSecret = Secp256k1.getSharedSecret({
    privateKey: ephemeralPrivateKey,
    publicKey: sequencerPublicKey,
    as: 'Bytes',
  })

  const hkdfKey = await globalThis.crypto.subtle.importKey(
    'raw',
    sharedSecret.slice(1),
    'HKDF',
    false,
    ['deriveKey'],
  )
  const ephemeralPubkeyX = compressedEphemeral.x
  const aesKey = await globalThis.crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new TextEncoder().encode('ecies-aes-key'),
      info: buildDepositHkdfInfo(
        portalAddress,
        keyIndex,
        ephemeralPubkeyX,
      ) as BufferSource,
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  )

  const nonce = Bytes.random(12)
  const plaintext = buildDepositPlaintext(recipient, memo)
  const ciphertextWithTag = new Uint8Array(
    await globalThis.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce as BufferSource, tagLength: 128 },
      aesKey,
      Bytes.from(plaintext) as BufferSource,
    ),
  )

  const ciphertext = ciphertextWithTag.slice(0, -16)
  const tag = ciphertextWithTag.slice(-16)

  return {
    ciphertext: Hex.fromBytes(ciphertext),
    ephemeralPubkeyX,
    ephemeralPubkeyYParity: compressedEphemeral.prefix,
    nonce: Hex.fromBytes(nonce),
    tag: Hex.fromBytes(tag),
  }
}

function buildDepositPlaintext(
  recipient: Address.Address,
  memo: Hex.Hex,
): Bytes.Bytes {
  return Bytes.concat(
    Bytes.from(recipient),
    Bytes.from(memo),
    new Uint8Array(12),
  )
}

function buildDepositHkdfInfo(
  portalAddress: Address.Address,
  keyIndex: bigint,
  ephemeralPubkeyX: Hex.Hex,
): Bytes.Bytes {
  return Bytes.concat(
    Bytes.from(portalAddress),
    Bytes.fromNumber(keyIndex, { size: 32 }),
    Bytes.from(ephemeralPubkeyX),
  )
}
