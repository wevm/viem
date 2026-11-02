import { describe, expect, test } from 'vitest'

import * as constants from '~test/constants.js'
import { Hex, Rlp, Secp256k1, TxEnvelope } from 'viem/utils'

const account = constants.accounts[0]

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

  test('error: unsigned envelope', () => {
    expect(() =>
      TxEnvelope.recoverAddress(
        TxEnvelope.from({
          chainId: 1,
          maxFeePerGas: 2n,
          maxPriorityFeePerGas: 1n,
          to: '0x0000000000000000000000000000000000000000',
          type: 'eip1559',
          value: 1n,
        }),
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      '[TxEnvelope.MissingSignatureError: Transaction envelope is unsigned. An unsigned envelope requires a `signature` option.]',
    )
  })

  test('behavior: authorization yParity above 1', () => {
    // EIP-7702 permits any authorization `y_parity` below 2**8; the protocol
    // skips such a tuple, but the transaction is still valid.
    const envelope = TxEnvelope.from({
      authorizationList: [
        {
          address: '0x0000000000000000000000000000000000000001',
          chainId: 1,
          nonce: 0n,
          r: Hex.fromNumber(1, { size: 32 }),
          s: Hex.fromNumber(2, { size: 32 }),
          yParity: 28,
        },
      ],
      chainId: 1,
      maxFeePerGas: 2n,
      maxPriorityFeePerGas: 1n,
      to: '0x0000000000000000000000000000000000000000',
      type: 'eip7702',
    })
    const signature = Secp256k1.sign({
      payload: TxEnvelope.getSignPayload(envelope),
      privateKey: account.privateKey,
    })
    const serialized = TxEnvelope.serialize(envelope, { signature })

    expect(TxEnvelope.recoverAddress(serialized)).toBe(
      account.address.toLowerCase(),
    )
  })

  test('error: tip above a zero fee cap', () => {
    // Serialize a valid transaction, then empty its `maxFeePerGas` field.
    const [chainId, nonce, tip, , ...rest] = Rlp.toHex(
      Hex.slice(signedSerialized(), 1),
    ) as Hex.Hex[]
    const serialized = Hex.concat(
      '0x02',
      Rlp.fromHex([chainId!, nonce!, tip!, '0x', ...rest]),
    )

    expect(() =>
      TxEnvelope.recoverAddress(serialized as TxEnvelope.Serialized),
    ).toThrowErrorMatchingInlineSnapshot(
      `[TransactionEnvelope.TipAboveFeeCapError: The provided tip (\`maxPriorityFeePerGas\` = 0.000000001 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 0 gwei).]`,
    )
  })
})
