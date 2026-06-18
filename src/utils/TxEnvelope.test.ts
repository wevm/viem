import { describe, expect, test } from 'vitest'

import { accounts } from '~test/constants.js'
import { Secp256k1, TxEnvelope } from 'viem'

const account = accounts[0]

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
        signature,
      }),
    ).toBe(account.address.toLowerCase())
  })
})
