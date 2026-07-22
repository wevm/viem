import {
  Address,
  Hash,
  Hex,
  P256,
  Secp256k1,
  Signature,
  WebCryptoP256,
} from 'ox'
import { MultisigConfig, SignatureEnvelope, TxEnvelopeTempo } from 'ox/tempo'
import * as tempo from '~test/tempo.js'
import { afterAll, describe, expect, test } from 'vitest'

import { Client, http } from 'viem'
import { tempoLocalnet, tempoModerato } from 'viem/chains'
import { Account, Actions, KeyAuthorizationManager } from 'viem/tempo'

import { chainConfig, type Envelope } from './chainConfig.js'

const privateKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const sender: Address.Address = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'

const { fromRpc, toRpc } = chainConfig.codecs.transactionRequest
const { transaction } = chainConfig
const [prepare] = transaction.prepare

// Tempo-path helpers; the hooks return `undefined` only for non-tempo shapes.
const toEnvelope = (request: Parameters<typeof transaction.toEnvelope>[0]) =>
  transaction.toEnvelope(request)!
const getSignPayload = (envelope: Envelope) =>
  transaction.getSignPayload(envelope)!
const serialize = (
  envelope: Envelope,
  options?: Parameters<typeof transaction.serialize>[1],
) => transaction.serialize(envelope, options)!

/** A client for hermetic prepare-hook branches (never dispatches). */
const client = Client.create({ transport: http('http://localhost') })

// Node-backed suites boot one dedicated Tempo node for this file.
const node = tempo.defineNode()
afterAll(() => node.stop())

const baseRequest = {
  calls: [
    {
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: 69n,
      data: '0xdeadbeef',
    },
  ],
  chainId: 1337,
  gas: 21000n,
  maxFeePerGas: 1000000000n,
  maxPriorityFeePerGas: 100000000n,
  nonce: 7,
  feeToken: '0x20c0000000000000000000000000000000000000',
} as const

// Signed vectors are unavailable: the reference uses bigints while ox uses hex.
const v2 = {
  unsigned:
    '0x76f8498205398405f5e100843b9aca00825208dcdb9470997970c51812dc3a010c7d01b50e0d17dc79c84584deadbeefc0800780809420c000000000000000000000000000000000000080c0',
  signPayload:
    '0x8c1d0f4b0de98848bacdc07a4f5c35e7e6acccc2e55dc55102af100ac4a6af4a',
  feePayerUnsigned:
    '0x76f58205398405f5e100843b9aca00825208dcdb9470997970c51812dc3a010c7d01b50e0d17dc79c84584deadbeefc0800780808000c0',
  feePayerSignPayload:
    '0x27a1d2cc435a884343962c59c5decc918ec2aaa2bc057503c1151d2c69eb89e2',
  expiring:
    '0x76f86d8205398405f5e100843b9aca00825208dcdb9470997970c51812dc3a010c7d01b50e0d17dc79c84584deadbeefc0a0ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8084686b0e00809420c000000000000000000000000000000000000080c0',
  window:
    '0x76f8868205398405f5e100843b9aca00825208dcdb9470997970c51812dc3a010c7d01b50e0d17dc79c84584deadbeeff838f79470997970c51812dc3a010c7d01b50e0d17dc79c8e1a0000000000000000000000000000000000000000000000000000000000000000180078084686af5009420c000000000000000000000000000000000000080c0',
  lifted:
    '0x76f8458205398405f5e100843b9aca00825208d8d79470997970c51812dc3a010c7d01b50e0d17dc79c84580c0800780809420c000000000000000000000000000000000000080c0',
  zeroCall:
    '0x76f8458205398405f5e100843b9aca00825208d8d79400000000000000000000000000000000000000008080c0800780809420c000000000000000000000000000000000000080c0',
} as const

describe('codecs.transactionRequest', () => {
  test('encodes a tempo request', () => {
    expect(toRpc({ ...baseRequest, from: sender })).toMatchInlineSnapshot(`
        {
          "calls": [
            {
              "data": "0xdeadbeef",
              "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
              "value": "0x45",
            },
          ],
          "chainId": "0x539",
          "feeToken": "0x20c0000000000000000000000000000000000000",
          "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          "gas": "0x5208",
          "maxFeePerGas": "0x3b9aca00",
          "maxPriorityFeePerGas": "0x5f5e100",
          "nonce": "0x7",
          "type": "0x76",
        }
      `)
  })

  test('lifts flat `to`/`value`/`data` into `calls`', () => {
    const rpc = toRpc({
      feeToken: baseRequest.feeToken,
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: 69n,
    }) as Record<string, unknown>
    expect(rpc.calls).toMatchInlineSnapshot(`
      [
        {
          "data": "0x",
          "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
          "value": "0x45",
        },
      ]
    `)
    expect(rpc.to).toBeUndefined()
    expect(rpc.value).toBeUndefined()
    expect(rpc.data).toBeUndefined()
  })

  test('defaults a call-less request to the zero address', () => {
    const rpc = toRpc({
      feeToken: baseRequest.feeToken,
    }) as Record<string, unknown>
    expect(rpc.calls).toMatchInlineSnapshot(`
      [
        {
          "data": "0x",
          "to": "0x0000000000000000000000000000000000000000",
          "value": "0x",
        },
      ]
    `)
  })

  test('threads wire fields the generic encoding drops', () => {
    const rpc = toRpc({
      ...baseRequest,
      capabilities: { balanceDiffs: true },
      keyData: '0x0578',
      keyId: '0xcccccccccccccccccccccccccccccccccccccccc',
      keyType: 'webAuthn',
      multisigInit: {
        salt: MultisigConfig.zeroSalt,
        threshold: 2,
        owners: [
          { owner: sender, weight: 1 },
          { owner: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', weight: 1 },
        ],
      },
      multisigSignatureCount: 2,
    }) as Record<string, unknown>
    expect(rpc.capabilities).toEqual({ balanceDiffs: true })
    expect(rpc.keyData).toBe('0x0578')
    expect(rpc.keyId).toBe('0xcccccccccccccccccccccccccccccccccccccccc')
    expect(rpc.keyType).toBe('webAuthn')
    expect(rpc.multisigInit).toMatchObject({ threshold: 2 })
    expect(rpc.multisigSignatureCount).toBe(2)
  })

  test('shims key data longer than 4 bytes into a length hint', () => {
    const rpc = toRpc({
      ...baseRequest,
      keyData: `0x${'aa'.repeat(1400)}`,
      keyType: 'webAuthn',
    }) as Record<string, unknown>
    // 1400 bytes → 0x0578 big-endian length hint.
    expect(rpc.keyData).toBe('0x0578')
    // 4 bytes and below pass through.
    expect(
      (
        toRpc({ ...baseRequest, keyData: '0x01020304' }) as Record<
          string,
          unknown
        >
      ).keyData,
    ).toBe('0x01020304')
  })

  test('feePayer: strips `feeToken` until the fee payer has signed', () => {
    const pending = toRpc({
      ...baseRequest,
      feePayer: true,
    }) as Record<string, unknown>
    expect(pending.feeToken).toBeUndefined()
    expect(pending.feePayer).toBe(true)

    const signed = toRpc({
      ...baseRequest,
      feePayer: true,
      feePayerSignature: {
        r: '0x1111111111111111111111111111111111111111111111111111111111111111',
        s: '0x2222222222222222222222222222222222222222222222222222222222222222',
        yParity: 1,
      },
    }) as Record<string, unknown>
    expect(signed.feeToken).toBe(baseRequest.feeToken)
  })

  test('feePayer: encodes a fee payer account as `true`', () => {
    const rpc = toRpc({
      ...baseRequest,
      feePayer: { address: sender, type: 'json-rpc' },
    }) as Record<string, unknown>
    expect(rpc.feePayer).toBe(true)
    expect(rpc.feeToken).toBe(baseRequest.feeToken)
  })

  test('strips client-side multisig fields', () => {
    const rpc = toRpc({
      ...baseRequest,
      multisig: {
        threshold: 1,
        owners: [{ owner: sender, weight: 1 }],
      },
      signatures: ['0xdeadbeef'],
    }) as Record<string, unknown>
    expect(rpc.multisig).toBeUndefined()
    expect(rpc.signatures).toBeUndefined()
  })

  test('routes non-tempo requests to the generic encoding', () => {
    expect(
      toRpc({
        from: sender,
        gas: 21000n,
        maxFeePerGas: 1000000000n,
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
        type: 'eip1559',
        value: 1n,
      }),
    ).toMatchInlineSnapshot(`
      {
        "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "gas": "0x5208",
        "maxFeePerGas": "0x3b9aca00",
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "0x2",
        "value": "0x1",
      }
    `)
  })

  test('decodes an RPC request', () => {
    const request = fromRpc({
      calls: [
        {
          data: '0xdeadbeef',
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: '0x45',
        },
      ],
      chainId: '0x539',
      feeToken: '0x20c0000000000000000000000000000000000000',
      keyId: '0xcccccccccccccccccccccccccccccccccccccccc',
      nonce: '0x7',
      type: '0x76',
    }) as Record<string, unknown>
    expect(request).toMatchInlineSnapshot(`
      {
        "calls": [
          {
            "data": "0xdeadbeef",
            "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
            "value": 69n,
          },
        ],
        "chainId": 1337,
        "feeToken": "0x20c0000000000000000000000000000000000000",
        "keyId": "0xcccccccccccccccccccccccccccccccccccccccc",
        "nonce": 7n,
        "type": "tempo",
      }
    `)
  })

  test('chain definitions carry the converter', () => {
    const rpc = tempoModerato.codecs.transactionRequest.toRpc(
      baseRequest,
    ) as Record<string, unknown>
    expect(rpc.type).toBe('0x76')
    expect(rpc.feeToken).toBe(baseRequest.feeToken)
  })
})

describe('transaction.toEnvelope', () => {
  test('builds a tempo envelope (lifting flat fields)', () => {
    const envelope = toEnvelope({
      chainId: 1337,
      feeToken: baseRequest.feeToken,
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: 69n,
    } as never)
    expect(envelope).toMatchInlineSnapshot(`
      {
        "calls": [
          {
            "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
            "value": 69n,
          },
        ],
        "chainId": 1337,
        "feeToken": "0x20c0000000000000000000000000000000000000",
        "type": "tempo",
      }
    `)
  })

  test('defaults a data-less call to the zero address', () => {
    const envelope = toEnvelope({
      chainId: 1337,
      feeToken: baseRequest.feeToken,
    } as never)
    expect(envelope.calls).toMatchInlineSnapshot(`
      [
        {
          "to": "0x0000000000000000000000000000000000000000",
        },
      ]
    `)
  })

  test('threads structural metadata and strips wire hints', () => {
    const multisig = {
      threshold: 1,
      owners: [{ owner: sender, weight: 1 }],
    }
    const envelope = toEnvelope({
      ...baseRequest,
      feePayer: true,
      keyData: '0x0578',
      keyId: '0xcccccccccccccccccccccccccccccccccccccccc',
      keyType: 'webAuthn',
      multisig,
      multisigInit: { salt: MultisigConfig.zeroSalt, threshold: 1, owners: [] },
      multisigSignatureCount: 1,
      signatures: ['0xdeadbeef'],
    } as never) as Envelope & Record<string, unknown>
    expect(envelope.feePayer).toBe(true)
    expect(envelope.multisig).toEqual(multisig)
    expect(envelope.signatures).toEqual(['0xdeadbeef'])
    expect(envelope.keyData).toBeUndefined()
    expect(envelope.keyId).toBeUndefined()
    expect(envelope.keyType).toBeUndefined()
    expect(envelope.multisigInit).toBeUndefined()
    expect(envelope.multisigSignatureCount).toBeUndefined()
    // Sponsorship pre-sign marker.
    expect(envelope.feePayerSignature).toBeNull()
  })

  test('delegates non-tempo requests to the core default', () => {
    expect(
      transaction.toEnvelope({
        chainId: 1,
        maxFeePerGas: 1000000000n,
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
        type: 'eip1559',
        value: 1n,
      }),
    ).toBeUndefined()
  })
})

describe('transaction.getSignPayload', () => {
  test('matches the v2 sign payload', () => {
    expect(getSignPayload(toEnvelope(baseRequest as never))).toBe(
      v2.signPayload,
    )
  })

  test('sponsorship: excludes `feeToken` from the sender payload', () => {
    const payload = getSignPayload(
      toEnvelope({ ...baseRequest, feePayer: true } as never),
    )
    expect(payload).toBe(v2.feePayerSignPayload)
    expect(payload).not.toBe(v2.signPayload)
  })

  test('delegates non-tempo envelopes to the core default', () => {
    expect(
      transaction.getSignPayload({
        chainId: 1,
        maxFeePerGas: 1000000000n,
        nonce: 0n,
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
        type: 'eip1559',
        value: 1n,
      }),
    ).toBeUndefined()
  })
})

describe('transaction.serialize', () => {
  test('matches the v2 unsigned serialization', () => {
    expect(serialize(toEnvelope(baseRequest as never))).toBe(v2.unsigned)
  })

  test('matches the v2 sponsorship presign serialization', () => {
    expect(
      serialize(toEnvelope({ ...baseRequest, feePayer: true } as never)),
    ).toBe(v2.feePayerUnsigned)
  })

  test('matches the v2 prefilled fee-payer presign serialization', () => {
    // Fee payer signature prefilled (e.g. by `eth_fillTransaction`), sender
    // not yet signed: the presign form keeps the fee-payer marker.
    const envelope = toEnvelope({
      ...baseRequest,
      feePayerSignature: {
        r: '0x1111111111111111111111111111111111111111111111111111111111111111',
        s: '0x2222222222222222222222222222222222222222222222222222222222222222',
        yParity: 1,
      },
    } as never)
    expect(serialize({ ...envelope, feePayerSignature: null })).toBe(
      v2.feePayerUnsigned,
    )
  })

  test('matches the v2 expiring-nonce serialization', () => {
    expect(
      serialize(
        toEnvelope({
          ...baseRequest,
          nonce: 0,
          nonceKey: 2n ** 256n - 1n,
          validBefore: 1751846400,
        } as never),
      ),
    ).toBe(v2.expiring)
  })

  test('matches the v2 validAfter + accessList serialization', () => {
    expect(
      serialize(
        toEnvelope({
          ...baseRequest,
          accessList: [
            {
              address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
              storageKeys: [
                '0x0000000000000000000000000000000000000000000000000000000000000001',
              ],
            },
          ],
          validAfter: 1751840000,
        } as never),
      ),
    ).toBe(v2.window)
  })

  test('matches the v2 lifted-call serialization', () => {
    expect(
      serialize(
        toEnvelope({
          chainId: 1337,
          gas: 21000n,
          maxFeePerGas: 1000000000n,
          maxPriorityFeePerGas: 100000000n,
          nonce: 7,
          feeToken: baseRequest.feeToken,
          to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
          value: 69n,
        } as never),
      ),
    ).toBe(v2.lifted)
  })

  test('matches the v2 zero-call serialization', () => {
    expect(
      serialize(
        toEnvelope({
          chainId: 1337,
          gas: 21000n,
          maxFeePerGas: 1000000000n,
          maxPriorityFeePerGas: 100000000n,
          nonce: 7,
          feeToken: baseRequest.feeToken,
        } as never),
      ),
    ).toBe(v2.zeroCall)
  })

  test('signed: the sender is recoverable from the serialization', () => {
    const envelope = toEnvelope(baseRequest as never)
    const signature = Secp256k1.sign({
      payload: getSignPayload(envelope),
      privateKey,
    })
    const serialized = serialize(envelope, {
      signature: SignatureEnvelope.from(signature),
    })
    const deserialized = TxEnvelopeTempo.deserialize(
      serialized as `0x76${string}`,
    )
    expect(deserialized.signature?.type).toBe('secp256k1')
    expect(
      SignatureEnvelope.extractAddress({
        payload: getSignPayload(envelope),
        signature: deserialized.signature!,
      }).toLowerCase(),
    ).toBe(sender)
  })

  test('sponsorship handoff: serializes in the fee payer format', () => {
    const envelope = toEnvelope({ ...baseRequest, feePayer: true } as never)
    const signature = Secp256k1.sign({
      payload: getSignPayload(envelope),
      privateKey,
    })
    const serialized = serialize(envelope, {
      signature: SignatureEnvelope.from(signature),
    })
    expect(serialized.startsWith('0x78')).toBe(true)
    // The sender address is embedded so the fee payer knows which account to
    // cover fees for.
    expect(serialized.includes(sender.slice(2))).toBe(true)
  })

  test('sponsorship complete: both signatures ride the broadcast envelope', () => {
    const envelope = toEnvelope(baseRequest as never)
    const signature = Secp256k1.sign({
      payload: getSignPayload({ ...envelope, feePayerSignature: null }),
      privateKey,
    })
    const serialized = serialize({ ...envelope, feePayer: true } as Envelope, {
      signature: SignatureEnvelope.from(signature),
    })
    const withFeePayer = serialize(
      {
        ...envelope,
        feePayer: true,
        feePayerSignature: Signature.from({
          r: '0x1111111111111111111111111111111111111111111111111111111111111111',
          s: '0x2222222222222222222222222222222222222222222222222222222222222222',
          yParity: 1,
        }),
      } as Envelope,
      { signature: SignatureEnvelope.from(signature) },
    )
    const deserialized = TxEnvelopeTempo.deserialize(
      withFeePayer as `0x76${string}`,
    )
    expect(deserialized.feePayerSignature).toBeTruthy()
    // The broadcast envelope carries `feeToken` again (the fee payer signed
    // over it); the handoff envelope does not.
    expect(deserialized.feeToken).toBe(baseRequest.feeToken)
    expect(serialized.startsWith('0x78')).toBe(true)
  })

  test('multisig: combines owner approvals into the signature envelope', () => {
    const ownerKeys = [
      privateKey,
      '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    ] as const
    const config = MultisigConfig.from({
      threshold: 2,
      owners: ownerKeys.map((privateKey) => ({
        owner: Address.fromPublicKey(Secp256k1.getPublicKey({ privateKey })),
        weight: 1,
      })),
    })

    const envelope = toEnvelope({
      ...baseRequest,
      from: MultisigConfig.getAddress(config),
      multisig: config,
      nonce: 0,
    } as never)

    const payload = getSignPayload(envelope)
    const digest = MultisigConfig.getSignPayload({
      payload,
      genesisConfig: config,
    })
    const signatures = ownerKeys.map((privateKey) =>
      Signature.toHex(Secp256k1.sign({ payload: digest, privateKey })),
    )

    const serialized = serialize({ ...envelope, signatures } as Envelope)
    const deserialized = TxEnvelopeTempo.deserialize(
      serialized as `0x76${string}`,
    )
    expect(deserialized.signature?.type).toBe('multisig')
    // Bootstrap deployment (`init`, carrying the genesis config) is detected
    // from nonce 0 on the default nonce key.
    expect(
      (deserialized.signature as { init?: MultisigConfig.Config }).init,
    ).toMatchObject({ threshold: 2 })
  })

  test('multisig: omits `init` for an explicit nonce key', () => {
    const config = MultisigConfig.from({
      threshold: 1,
      owners: [{ owner: sender, weight: 1 }],
    })

    // Nonce 0 on a fresh 2D nonce key is not a bootstrap: the multisig is
    // already deployed.
    const envelope = toEnvelope({
      ...baseRequest,
      from: MultisigConfig.getAddress(config),
      multisig: config,
      nonce: 0,
      nonceKey: 1n,
    } as never)

    const payload = getSignPayload(envelope)
    const digest = MultisigConfig.getSignPayload({
      payload,
      genesisConfig: config,
    })
    const signatures = [
      Signature.toHex(Secp256k1.sign({ payload: digest, privateKey })),
    ]

    const serialized = serialize({ ...envelope, signatures } as Envelope)
    const deserialized = TxEnvelopeTempo.deserialize(
      serialized as `0x76${string}`,
    )
    expect(deserialized.signature?.type).toBe('multisig')
    expect(
      (deserialized.signature as { init?: MultisigConfig.Config }).init,
    ).toBeUndefined()
  })

  test('2D nonces: explicit nonceKey round-trips through serialization', () => {
    const envelope = toEnvelope({
      ...baseRequest,
      nonce: 0,
      nonceKey: 69n,
    } as never)
    expect(TxEnvelopeTempo.deserialize(serialize(envelope) as `0x76${string}`))
      .toMatchInlineSnapshot(`
      {
        "calls": [
          {
            "data": "0xdeadbeef",
            "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
            "value": 69n,
          },
        ],
        "chainId": 1337,
        "feeToken": "0x20c0000000000000000000000000000000000000",
        "gas": 21000n,
        "maxFeePerGas": 1000000000n,
        "maxPriorityFeePerGas": 100000000n,
        "nonce": 0n,
        "nonceKey": 69n,
        "type": "tempo",
      }
    `)
  })

  test('delegates non-tempo envelopes to the core default', () => {
    expect(
      transaction.serialize({
        chainId: 1,
        maxFeePerGas: 1000000000n,
        nonce: 0n,
        to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
        type: 'eip1559',
        value: 1n,
      }),
    ).toBeUndefined()
  })
})

describe('transaction.prepare', () => {
  test('resolves the tempo type from tempo fields', async () => {
    const request = await prepare(
      { feeToken: baseRequest.feeToken },
      { client, phase: 'beforeFillTransaction' },
    )
    expect(request.type).toBe('tempo')
  })

  test('resolves the tempo type from the signing account', async () => {
    for (const account of [
      { address: sender, source: 'accessKey', keyType: 'secp256k1' },
      { address: sender, source: 'multisig', keyType: 'multisig' },
      { address: sender, keyType: 'p256' },
      { address: sender, keyType: 'webAuthn' },
    ]) {
      const request = await prepare(
        { account, to: sender },
        { client, phase: 'beforeFillTransaction' },
      )
      expect(request.type).toBe('tempo')
    }
    // A plain secp256k1 account does not imply tempo.
    const request = await prepare(
      { account: { address: sender, keyType: 'secp256k1' }, to: sender },
      { client, phase: 'beforeFillTransaction' },
    )
    expect(request.type).toBeUndefined()
  })

  test('derives key hints from the signing account', async () => {
    const webAuthn = await prepare(
      {
        account: {
          address: sender,
          accessKeyAddress: '0xcccccccccccccccccccccccccccccccccccccccc',
          keyType: 'webAuthn',
          source: 'accessKey',
        },
        to: sender,
      },
      { client, phase: 'beforeFillTransaction' },
    )
    expect(webAuthn.keyType).toBe('webAuthn')
    expect(webAuthn.keyData).toBe('0x0578')
    expect(webAuthn.keyId).toBe('0xcccccccccccccccccccccccccccccccccccccccc')

    const p256 = await prepare(
      { account: { address: sender, keyType: 'p256' }, to: sender },
      { client, phase: 'beforeFillTransaction' },
    )
    expect(p256.keyType).toBe('p256')
    expect(p256.keyData).toBeUndefined()

    // Unknown account kinds leave explicit request hints alone.
    const explicit = await prepare(
      {
        account: { address: sender, keyType: 'multisig', source: 'multisig' },
        keyType: 'p256',
        to: sender,
      },
      { client, phase: 'beforeFillTransaction' },
    )
    expect(explicit.keyType).toBe('p256')
  })

  test('multisig: derives the sender and gas-model hints', async () => {
    const config: MultisigConfig.Config = {
      threshold: 2,
      owners: [
        { owner: sender, weight: 2 },
        { owner: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', weight: 1 },
        { owner: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc', weight: 1 },
      ],
    }
    const request = await prepare(
      {
        account: { address: sender, keyType: 'secp256k1' },
        multisig: config,
        to: sender,
      },
      { client, phase: 'beforeFillTransaction' },
    )
    expect(request.from).toBe(
      MultisigConfig.getAddress(MultisigConfig.from(config)),
    )
    expect(request.multisigInit).toMatchObject({ threshold: 2 })
    // A single weight-2 owner meets the threshold.
    expect(request.multisigSignatureCount).toBe(1)
    // The non-multisig signing account is dropped so core fills for `from`.
    expect(request.account).toBeUndefined()
  })

  test('multisig: inferred from a multisig account (which is kept)', async () => {
    const config: MultisigConfig.Config = {
      threshold: 2,
      owners: [
        { owner: sender, weight: 1 },
        { owner: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', weight: 1 },
      ],
    }
    const account = {
      address: MultisigConfig.getAddress(MultisigConfig.from(config)),
      config,
      keyType: 'multisig',
      source: 'multisig',
    }
    const request = await prepare(
      { account, to: sender },
      { client, phase: 'beforeFillTransaction' },
    )
    expect(request.from).toBe(account.address)
    expect(request.multisigSignatureCount).toBe(2)
    expect(request.account).toBe(account)
  })

  test('expiring nonce: explicit `nonceKey: expiring`', async () => {
    const request = await prepare(
      { feeToken: baseRequest.feeToken, nonceKey: 'expiring' },
      { client, phase: 'beforeFillTransaction' },
    )
    expect(request.nonceKey).toBe(2n ** 256n - 1n)
    expect(request.nonce).toBe(0)
    expect(request.validAfter).toBeLessThan(Date.now() / 1000)
    expect(request.validBefore).toBeGreaterThan(Date.now() / 1000)
  })

  test('expiring nonce: implied by a fee payer', async () => {
    const request = await prepare(
      { feePayer: true, feeToken: baseRequest.feeToken },
      { client, phase: 'beforeFillTransaction' },
    )
    expect(request.nonceKey).toBe(2n ** 256n - 1n)
  })

  test('expiring nonce: explicit validity window is preserved', async () => {
    const request = await prepare(
      {
        feeToken: baseRequest.feeToken,
        nonceKey: 'expiring',
        validAfter: 21,
        validBefore: 42,
      },
      { client, phase: 'beforeFillTransaction' },
    )
    expect(request.nonceKey).toBe(2n ** 256n - 1n)
    expect(request.validAfter).toBe(21)
    expect(request.validBefore).toBe(42)
  })

  test('expiring nonce: explicit nonceKey wins over a fee payer', async () => {
    const request = await prepare(
      { feePayer: true, feeToken: baseRequest.feeToken, nonceKey: 69n },
      { client, phase: 'beforeFillTransaction' },
    )
    expect(request.nonceKey).toBe(69n)
    expect(request.nonce).toBe(0)
  })

  test('multisig: explicit multisigSignatureCount is preserved', async () => {
    const request = await prepare(
      {
        multisig: { threshold: 1, owners: [{ owner: sender, weight: 1 }] },
        multisigSignatureCount: 3,
      },
      { client, phase: 'beforeFillTransaction' },
    )
    expect(request.multisigSignatureCount).toBe(3)
  })

  test('expiring nonce: never for multisig senders', async () => {
    const request = await prepare(
      {
        feePayer: true,
        multisig: { threshold: 1, owners: [{ owner: sender, weight: 1 }] },
      },
      { client, phase: 'beforeFillTransaction' },
    )
    expect(request.nonceKey).toBeUndefined()
  })

  test('explicit nonceKey (2D nonces) defaults the nonce', async () => {
    const request = await prepare(
      { feeToken: baseRequest.feeToken, nonceKey: 69n },
      { client, phase: 'beforeFillTransaction' },
    )
    expect(request.nonceKey).toBe(69n)
    expect(request.nonce).toBe(0)
  })

  test('defaults `feeToken` from the chain', async () => {
    const chain = tempoModerato.extend({
      feeToken: '0x20c0000000000000000000000000000000000001',
    })
    const request = await prepare(
      { chain, to: sender },
      { client, phase: 'beforeFillTransaction' },
    )
    expect(request.feeToken).toBe('0x20c0000000000000000000000000000000000001')
  })

  test('afterFillParameters: bumps gas for sponsored large signatures', async () => {
    const webAuthn = await prepare(
      {
        feePayer: true,
        gas: 100_000n,
        keyAuthorization: { signature: { type: 'webAuthn' } },
      },
      { client, phase: 'afterFillParameters' },
    )
    expect(webAuthn.gas).toBe(120_000n)

    const accessKey = await prepare(
      {
        account: { address: sender, source: 'accessKey' },
        feePayer: true,
        gas: 100_000n,
      },
      { client, phase: 'afterFillParameters' },
    )
    expect(accessKey.gas).toBe(110_000n)

    const signed = await prepare(
      {
        account: { address: sender, source: 'accessKey' },
        feePayer: true,
        feePayerSignature: { r: '0x1', s: '0x1', yParity: 0 },
        gas: 100_000n,
      },
      { client, phase: 'afterFillParameters' },
    )
    expect(signed.gas).toBe(100_000n)

    // No fee payer, no bump.
    const plain = await prepare(
      {
        account: { address: sender, source: 'accessKey' },
        gas: 100_000n,
      },
      { client, phase: 'afterFillParameters' },
    )
    expect(plain.gas).toBe(100_000n)
  })

  // The pending key authorization refresh reads the on-chain
  // AccountKeychain (`getKey`) before attaching or dropping.
  test(
    'keyAuthorization: attaches a pending authorization (tempo node)',
    { timeout: 120_000 },
    async () => {
      const client = tempo.getClient({ rpcUrl: await node.start() })
      const root = Account.fromSecp256k1(privateKey)
      const manager = KeyAuthorizationManager.memory()
      const accessKey = Account.fromP256(P256.randomPrivateKey(), {
        access: root,
        keyAuthorizationManager: manager,
      })
      const keyAuthorization = await Account.signKeyAuthorization(root, {
        chainId: tempoLocalnet.id,
        key: accessKey,
      })
      const key = {
        address: root.address,
        accessKey: accessKey.accessKeyAddress!,
        chainId: tempoLocalnet.id,
      }
      await manager.set(key, keyAuthorization)

      const request = await prepare(
        { account: accessKey, chainId: tempoLocalnet.id, to: sender },
        { client, phase: 'beforeFillTransaction' },
      )
      expect(request.keyAuthorization).toEqual(keyAuthorization)
      expect(await manager.get(key)).toEqual(keyAuthorization)
    },
  )

  test(
    'keyAuthorization: reads keychain metadata without a client account (tempo node)',
    { timeout: 120_000 },
    async () => {
      const client = Client.create({
        chain: tempoLocalnet,
        transport: http(await node.start()),
      })
      const root = Account.fromSecp256k1(privateKey)
      const manager = KeyAuthorizationManager.memory()
      const accessKey = Account.fromP256(P256.randomPrivateKey(), {
        access: root,
        keyAuthorizationManager: manager,
      })
      const keyAuthorization = await Account.signKeyAuthorization(root, {
        chainId: tempoLocalnet.id,
        key: accessKey,
      })
      await manager.set(
        {
          address: root.address,
          accessKey: accessKey.accessKeyAddress!,
          chainId: tempoLocalnet.id,
        },
        keyAuthorization,
      )

      const request = await prepare(
        { account: accessKey, chainId: tempoLocalnet.id, to: sender },
        { client, phase: 'beforeFillTransaction' },
      )
      expect(request.keyAuthorization).toEqual(keyAuthorization)
    },
  )

  test(
    'keyAuthorization: removes the pending authorization once the key is registered on-chain (tempo node)',
    { timeout: 120_000 },
    async () => {
      const root = Account.fromSecp256k1(privateKey)
      const client = tempo.getClient({
        account: root,
        feeToken: tempo.pathUsd,
        rpcUrl: await node.start(),
      })
      const manager = KeyAuthorizationManager.memory()
      const accessKey = Account.fromP256(P256.randomPrivateKey(), {
        access: root,
        keyAuthorizationManager: manager,
      })
      await Actions.accessKey.authorizeSync(client, {
        accessKey,
        expiry: Math.floor(Date.now() / 1000) + 3600,
      })

      const keyAuthorization = await Account.signKeyAuthorization(root, {
        chainId: tempoLocalnet.id,
        key: accessKey,
      })
      const key = {
        address: root.address,
        accessKey: accessKey.accessKeyAddress!,
        chainId: tempoLocalnet.id,
      }
      await manager.set(key, keyAuthorization)

      const request = await prepare(
        { account: accessKey, chainId: tempoLocalnet.id, to: sender },
        { client, phase: 'beforeFillTransaction' },
      )
      expect(request.keyAuthorization).toBeUndefined()
      expect(await manager.get(key)).toBeUndefined()
    },
  )

  test('keyAuthorization: drops expired pending authorizations', async () => {
    const { memory } = await import('./KeyAuthorizationManager.js')
    const manager = memory()
    const accessKey: Address.Address =
      '0xcccccccccccccccccccccccccccccccccccccccc'
    const key = { address: sender, accessKey, chainId: 1337 }
    await manager.set(key, {
      address: accessKey,
      chainId: 1337,
      expiry: 1, // long expired
      signature: { type: 'secp256k1', signature: { r: 1n, s: 2n, yParity: 0 } },
      type: 'secp256k1',
    } as never)

    const request = await prepare(
      {
        account: {
          address: sender,
          accessKeyAddress: accessKey,
          keyAuthorizationManager: manager,
          keyType: 'secp256k1',
          source: 'accessKey',
        },
        chainId: 1337,
        to: sender,
      },
      { client, phase: 'beforeFillTransaction' },
    )
    expect(request.keyAuthorization).toBeUndefined()
    expect(await manager.get(key)).toBeUndefined()
  })
})

// Keychain lookups (`getKey`) and code probes back the envelope
// verification modes.
describe('verifyHash', () => {
  const hash = Hash.keccak256(Hex.fromString('hello tempo'))
  const otherHash = Hash.keccak256(Hex.fromString('other payload'))
  const expiry = () => Math.floor(Date.now() / 1000) + 3600

  test('p256: valid signature (tempo node)', { timeout: 120_000 }, async () => {
    const client = tempo.getClient({ rpcUrl: await node.start() })
    const account = Account.fromP256(P256.randomPrivateKey())
    const signature = await account.sign({ hash })
    await expect(
      chainConfig.verifyHash(client, {
        address: account.address,
        hash,
        signature,
      }),
    ).resolves.toBe(true)
  })

  test(
    'p256: invalid signature returns false (tempo node)',
    { timeout: 120_000 },
    async () => {
      const client = tempo.getClient({ rpcUrl: await node.start() })
      const account = Account.fromP256(P256.randomPrivateKey())
      const signature = await account.sign({ hash: otherHash })
      await expect(
        chainConfig.verifyHash(client, {
          address: account.address,
          hash,
          signature,
        }),
      ).resolves.toBe(false)
    },
  )

  test(
    'p256: wrong address returns false (tempo node)',
    { timeout: 120_000 },
    async () => {
      const client = tempo.getClient({ rpcUrl: await node.start() })
      const account = Account.fromP256(P256.randomPrivateKey())
      const other = Account.fromP256(P256.randomPrivateKey())
      const signature = await account.sign({ hash })
      await expect(
        chainConfig.verifyHash(client, {
          address: other.address,
          hash,
          signature,
        }),
      ).resolves.toBe(false)
    },
  )

  test(
    'webCrypto: valid signature (tempo node)',
    { timeout: 120_000 },
    async () => {
      const client = tempo.getClient({ rpcUrl: await node.start() })
      const account = Account.fromWebCryptoP256(
        await WebCryptoP256.createKeyPair(),
      )
      const signature = await account.sign({ hash })
      await expect(
        chainConfig.verifyHash(client, {
          address: account.address,
          hash,
          signature,
        }),
      ).resolves.toBe(true)
    },
  )

  test(
    'webCrypto: invalid signature returns false (tempo node)',
    { timeout: 120_000 },
    async () => {
      const client = tempo.getClient({ rpcUrl: await node.start() })
      const account = Account.fromWebCryptoP256(
        await WebCryptoP256.createKeyPair(),
      )
      const signature = await account.sign({ hash: otherHash })
      await expect(
        chainConfig.verifyHash(client, {
          address: account.address,
          hash,
          signature,
        }),
      ).resolves.toBe(false)
    },
  )

  test(
    'webCrypto: wrong address returns false (tempo node)',
    { timeout: 120_000 },
    async () => {
      const client = tempo.getClient({ rpcUrl: await node.start() })
      const account = Account.fromWebCryptoP256(
        await WebCryptoP256.createKeyPair(),
      )
      const other = Account.fromP256(P256.randomPrivateKey())
      const signature = await account.sign({ hash })
      await expect(
        chainConfig.verifyHash(client, {
          address: other.address,
          hash,
          signature,
        }),
      ).resolves.toBe(false)
    },
  )

  test(
    'headlessWebAuthn: valid signature (tempo node)',
    { timeout: 120_000 },
    async () => {
      const client = tempo.getClient({ rpcUrl: await node.start() })
      const account = Account.fromHeadlessWebAuthn(P256.randomPrivateKey(), {
        origin: 'https://localhost',
        rpId: 'localhost',
      })
      const signature = await account.sign({ hash })
      await expect(
        chainConfig.verifyHash(client, {
          address: account.address,
          hash,
          signature,
        }),
      ).resolves.toBe(true)
    },
  )

  test(
    'headlessWebAuthn: invalid signature returns false (tempo node)',
    { timeout: 120_000 },
    async () => {
      const client = tempo.getClient({ rpcUrl: await node.start() })
      const account = Account.fromHeadlessWebAuthn(P256.randomPrivateKey(), {
        origin: 'https://localhost',
        rpId: 'localhost',
      })
      const signature = await account.sign({ hash: otherHash })
      await expect(
        chainConfig.verifyHash(client, {
          address: account.address,
          hash,
          signature,
        }),
      ).resolves.toBe(false)
    },
  )

  test(
    'headlessWebAuthn: wrong address returns false (tempo node)',
    { timeout: 120_000 },
    async () => {
      const client = tempo.getClient({ rpcUrl: await node.start() })
      const account = Account.fromHeadlessWebAuthn(P256.randomPrivateKey(), {
        origin: 'https://localhost',
        rpId: 'localhost',
      })
      const other = Account.fromP256(P256.randomPrivateKey())
      const signature = await account.sign({ hash })
      await expect(
        chainConfig.verifyHash(client, {
          address: other.address,
          hash,
          signature,
        }),
      ).resolves.toBe(false)
    },
  )

  test(
    'accessKey (keychain): valid signature (tempo node)',
    { timeout: 120_000 },
    async () => {
      const root = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
      const client = tempo.getClient({
        account: root,
        feeToken: tempo.pathUsd,
        rpcUrl: await node.start(),
      })
      const accessKey = Account.fromP256(P256.randomPrivateKey(), {
        access: root,
      })
      await Actions.accessKey.authorizeSync(client, {
        accessKey,
        expiry: expiry(),
      })

      const signature = await accessKey.sign({ hash })
      await expect(
        chainConfig.verifyHash(client, {
          address: root.address,
          hash,
          mode: 'allowAccessKey',
          signature,
        }),
      ).resolves.toBe(true)
    },
  )

  test(
    'accessKey (keychain): secp256k1 valid signature (tempo node)',
    { timeout: 120_000 },
    async () => {
      const root = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
      const client = tempo.getClient({
        account: root,
        feeToken: tempo.pathUsd,
        rpcUrl: await node.start(),
      })
      const accessKey = Account.fromSecp256k1(Secp256k1.randomPrivateKey(), {
        access: root,
      })
      await Actions.accessKey.authorizeSync(client, {
        accessKey,
        expiry: expiry(),
      })

      const signature = await accessKey.sign({ hash })
      await expect(
        chainConfig.verifyHash(client, {
          address: root.address,
          hash,
          mode: 'allowAccessKey',
          signature,
        }),
      ).resolves.toBe(true)
    },
  )

  test(
    'accessKey (keychain): invalid signature returns false (tempo node)',
    { timeout: 120_000 },
    async () => {
      const root = Account.fromSecp256k1(tempo.accounts[3]!.privateKey)
      const client = tempo.getClient({
        account: root,
        feeToken: tempo.pathUsd,
        rpcUrl: await node.start(),
      })
      const accessKey = Account.fromP256(P256.randomPrivateKey(), {
        access: root,
      })
      await Actions.accessKey.authorizeSync(client, {
        accessKey,
        expiry: expiry(),
      })

      const signature = await accessKey.sign({ hash: otherHash })
      await expect(
        chainConfig.verifyHash(client, {
          address: root.address,
          hash,
          mode: 'allowAccessKey',
          signature,
        }),
      ).resolves.toBe(false)
    },
  )

  test(
    'accessKey (keychain): revoked key returns false (tempo node)',
    { timeout: 120_000 },
    async () => {
      const root = Account.fromSecp256k1(tempo.accounts[4]!.privateKey)
      const client = tempo.getClient({
        account: root,
        feeToken: tempo.pathUsd,
        rpcUrl: await node.start(),
      })
      const accessKey = Account.fromP256(P256.randomPrivateKey(), {
        access: root,
      })
      await Actions.accessKey.authorizeSync(client, {
        accessKey,
        expiry: expiry(),
      })
      await Actions.accessKey.revokeSync(client, { accessKey })

      const signature = await accessKey.sign({ hash })
      await expect(
        chainConfig.verifyHash(client, {
          address: root.address,
          hash,
          mode: 'allowAccessKey',
          signature,
        }),
      ).resolves.toBe(false)
    },
  )

  test(
    'falls back to `verifyDefault` for non-envelope signatures (tempo node)',
    { timeout: 120_000 },
    async () => {
      const client = tempo.getClient({ rpcUrl: await node.start() })
      const signature = Signature.toHex(
        Secp256k1.sign({ payload: hash, privateKey }),
      )
      await expect(
        chainConfig.verifyHash(client, { address: sender, hash, signature }),
      ).resolves.toBe(true)
    },
  )
})
