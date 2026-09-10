import { describe, expect, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { encodeAbiParameters } from '../../utils/abi/encodeAbiParameters.js'
import { size } from '../../utils/data/size.js'
import { slice } from '../../utils/data/slice.js'
import { stringToHex } from '../../utils/encoding/toHex.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import { hashMessage } from '../../utils/signature/hashMessage.js'
import { isErc6492Signature } from '../../utils/signature/isErc6492Signature.js'
import { parseErc6492Signature } from '../../utils/signature/parseErc6492Signature.js'
import { recoverAddress } from '../../utils/signature/recoverAddress.js'
import {
  canonicalAuthenticators,
  ecrecoverAuthenticator,
  keystoreAddress,
} from '../constants.js'
import { key } from '../keys.js'
import { erc1167Bytecode } from './proxy.js'
import {
  getSignatureEnvelopeHash,
  multichainId,
  parseSignatureEnvelope,
  replaySafeHash,
  signatureType,
  signedMessageTypehash,
  signMessageEnvelope,
  signTypedDataEnvelope,
  wrapCounterfactualSignature,
  wrapSignatureEnvelope,
} from './signMessage.js'

const account = '0x000000000000000000000000000000000000a130' as const
const owner = privateKeyToAccount(`0x${'11'.repeat(32)}`)
const hash = keccak256(stringToHex('app hash'))

describe('signedMessageTypehash', () => {
  test('matches keccak256 of the SignedMessageEnvelope type string', () => {
    expect(signedMessageTypehash).toBe(
      keccak256(
        stringToHex(
          'SignedMessageEnvelope(address account,uint256 chainId,bytes32 hash)',
        ),
      ),
    )
  })
})

describe('replaySafeHash', () => {
  test('equals keccak256(abi.encode(typehash, account, chainId, hash))', () => {
    const chainId = 8453n
    expect(replaySafeHash({ account, chainId, hash })).toBe(
      keccak256(
        encodeAbiParameters(
          [
            { type: 'bytes32' },
            { type: 'address' },
            { type: 'uint256' },
            { type: 'bytes32' },
          ],
          [signedMessageTypehash, account, chainId, hash],
        ),
      ),
    )
  })

  test('local vs multichain bind different chain ids', () => {
    expect(replaySafeHash({ account, chainId: 0n, hash })).not.toBe(
      replaySafeHash({ account, chainId: 8453n, hash }),
    )
  })
})

describe('getSignatureEnvelopeHash', () => {
  test('multichain binds chainId 0', () => {
    expect(getSignatureEnvelopeHash({ account, hash })).toBe(
      replaySafeHash({ account, chainId: multichainId, hash }),
    )
  })

  test('local binds the supplied chainId', () => {
    expect(
      getSignatureEnvelopeHash({
        account,
        hash,
        sigType: 'local',
        chainId: 10n,
      }),
    ).toBe(replaySafeHash({ account, chainId: 10n, hash }))
  })

  test('local requires a chainId', () => {
    expect(() =>
      getSignatureEnvelopeHash({ account, hash, sigType: 'local' }),
    ).toThrow('`chainId` is required')
  })
})

describe('wrap / parse signature envelope', () => {
  test('round-trips sigType || authenticator || data', () => {
    const signature = `0x${'ab'.repeat(65)}` as const
    const envelope = wrapSignatureEnvelope({
      sigType: 'local',
      authenticator: ecrecoverAuthenticator,
      signature,
    })
    // 1 (sigType) + 20 (authenticator) + 65 (sig) = 86 bytes
    expect(size(envelope)).toBe(86)
    expect(slice(envelope, 0, 1)).toBe('0x01')
    expect(parseSignatureEnvelope(envelope)).toEqual({
      sigType: 'local',
      authenticator: ecrecoverAuthenticator,
      signature,
    })
  })

  test('multichain leading byte is 0x02', () => {
    const envelope = wrapSignatureEnvelope({
      sigType: 'multichain',
      authenticator: ecrecoverAuthenticator,
      signature: `0x${'cd'.repeat(65)}`,
    })
    expect(slice(envelope, 0, 1)).toBe('0x02')
    expect(parseSignatureEnvelope(envelope).sigType).toBe('multichain')
  })

  test('rejects an unknown type byte', () => {
    expect(() => parseSignatureEnvelope(`0x00${'ab'.repeat(20)}`)).toThrow(
      'Unknown signature envelope type byte',
    )
  })
})

describe('signMessageEnvelope', () => {
  test('default multichain: signs the replay-safe digest, recovers the k1 signer', async () => {
    const envelope = await signMessageEnvelope({
      signer: owner,
      account,
      message: 'hello world',
    })
    const { sigType, authenticator, signature } =
      parseSignatureEnvelope(envelope)
    expect(sigType).toBe('multichain')
    expect(authenticator).toBe(ecrecoverAuthenticator)

    // The k1 authenticator data is a raw 65-byte ECDSA signature over the
    // account/chain-scoped digest — recoverable back to the owner.
    const digest = replaySafeHash({
      account,
      chainId: multichainId,
      hash: hashMessage('hello world'),
    })
    expect(
      (await recoverAddress({ hash: digest, signature })).toLowerCase(),
    ).toBe(owner.address.toLowerCase())
  })

  test('local envelope binds the chain id', async () => {
    const envelope = await signMessageEnvelope({
      signer: owner,
      account,
      message: 'hi',
      sigType: 'local',
      chainId: 8453n,
    })
    const { signature } = parseSignatureEnvelope(envelope)
    const digest = replaySafeHash({
      account,
      chainId: 8453n,
      hash: hashMessage('hi'),
    })
    expect(
      (await recoverAddress({ hash: digest, signature })).toLowerCase(),
    ).toBe(owner.address.toLowerCase())
  })

  test('accepts a pre-computed hash', async () => {
    const a = await signMessageEnvelope({ signer: owner, account, hash })
    const b = await signMessageEnvelope({
      signer: owner,
      account,
      hash,
      sigType: 'multichain',
    })
    expect(a).toBe(b)
  })
})

describe('wrapCounterfactualSignature', () => {
  test('wraps the envelope in an ERC-6492 sig with the keystore deploy call', async () => {
    const userSalt = `0x${'01'.padStart(64, '0')}` as const
    const code = erc1167Bytecode('0x00000000000000000000000000000000000000Ec')
    const initialActors = [
      { ...key.k1(owner.address), authenticator: canonicalAuthenticators.k1 },
    ]
    const envelope = await signMessageEnvelope({
      signer: owner,
      account,
      message: 'gm',
    })
    const wrapped = wrapCounterfactualSignature({
      signature: envelope,
      userSalt,
      code,
      initialActors,
    })

    expect(isErc6492Signature(wrapped)).toBe(true)
    const { address, signature } = parseErc6492Signature(wrapped)
    // Factory is the enshrined keystore; inner sig is the original envelope.
    expect(address).toBe(keystoreAddress)
    expect(signature).toBe(envelope)
  })
})

describe('signTypedDataEnvelope', () => {
  test('wraps hashTypedData into the same envelope', async () => {
    const typedData = {
      domain: { name: 'App', version: '1', chainId: 8453 },
      types: { Mail: [{ name: 'contents', type: 'string' }] },
      primaryType: 'Mail',
      message: { contents: 'gm' },
    } as const

    const envelope = await signTypedDataEnvelope({
      signer: owner,
      account,
      ...typedData,
    })
    expect(parseSignatureEnvelope(envelope).sigType).toBe('multichain')
    expect(parseSignatureEnvelope(envelope).authenticator).toBe(
      ecrecoverAuthenticator,
    )
    expect(signatureType.multichain).toBe(0x02)
  })
})
