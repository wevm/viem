import * as Address from 'ox/Address'
import * as P256 from 'ox/P256'
import { describe, expect, test } from 'vitest'

import { accounts } from '~test/constants.js'
import * as Curve from '../core/Curve.js'
import * as Secp256k1 from './Secp256k1.js'
import * as TxEnvelope from './TxEnvelope.js'

const account = accounts[0]

const p256PrivateKey = P256.randomPrivateKey()

function signedSerialized() {
  const envelope = TxEnvelope.from({
    chainId: 1,
    maxFeePerGas: 2n,
    maxPriorityFeePerGas: 1n,
    to: '0x0000000000000000000000000000000000000000',
    type: 'eip1559',
    value: 1n,
  })
  const signature = Secp256k1.sign({
    payload: TxEnvelope.getSignPayload(envelope),
    privateKey: account.privateKey,
  })
  return TxEnvelope.serialize(envelope, { signature })
}

describe('recoverAddress', () => {
  test('default', () => {
    expect(TxEnvelope.recoverAddress(signedSerialized())).toBe(
      account.address.toLowerCase(),
    )
  })

  test('behavior: deserialized envelope', () => {
    const envelope = TxEnvelope.from({
      chainId: 1,
      maxFeePerGas: 2n,
      maxPriorityFeePerGas: 1n,
      to: '0x0000000000000000000000000000000000000000',
      type: 'eip1559',
      value: 1n,
    })
    const signature = Secp256k1.sign({
      payload: TxEnvelope.getSignPayload(envelope),
      privateKey: account.privateKey,
    })
    expect(
      TxEnvelope.recoverAddress(TxEnvelope.from(envelope, { signature })),
    ).toBe(account.address.toLowerCase())
    expect(TxEnvelope.recoverAddress(envelope, { signature })).toBe(
      account.address.toLowerCase(),
    )
  })

  test('args: signature', () => {
    const envelope = TxEnvelope.from({
      chainId: 1,
      maxFeePerGas: 2n,
      maxPriorityFeePerGas: 1n,
      to: '0x0000000000000000000000000000000000000000',
      type: 'eip1559',
      value: 1n,
    })
    const signature = Secp256k1.sign({
      payload: TxEnvelope.getSignPayload(envelope),
      privateKey: account.privateKey,
    })
    expect(
      TxEnvelope.recoverAddress(TxEnvelope.serialize(envelope), {
        curve: Curve.secp256k1(),
        signature,
      }),
    ).toBe(account.address.toLowerCase())
  })

  test('curve: p256', () => {
    const envelope = TxEnvelope.from({
      chainId: 1,
      maxFeePerGas: 2n,
      maxPriorityFeePerGas: 1n,
      to: '0x0000000000000000000000000000000000000000',
      type: 'eip1559',
      value: 1n,
    })
    const signature = P256.sign({
      payload: TxEnvelope.getSignPayload(envelope),
      privateKey: p256PrivateKey,
    })
    expect(
      TxEnvelope.recoverAddress(TxEnvelope.serialize(envelope, { signature }), {
        curve: Curve.p256(),
      }),
    ).toBe(
      Address.fromPublicKey(
        P256.getPublicKey({ privateKey: p256PrivateKey }),
      ).toLowerCase(),
    )
  })
})
