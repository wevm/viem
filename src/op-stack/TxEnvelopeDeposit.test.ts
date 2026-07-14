import { Hex, Rlp } from 'ox'
import { describe, expect, test } from 'vitest'

import { TxEnvelopeDeposit } from 'viem/op-stack'

const envelope = {
  data: '0xdeadbeef',
  from: '0x977f82a600a1414e583f7f13623f1ac5d58b1c0b',
  gas: 69_420n,
  isSystemTx: true,
  mint: 42n,
  sourceHash:
    '0x18040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d7104319',
  to: '0xaabbccddeeff00112233445566778899aabbccdd',
  type: 'deposit',
  value: 1n,
} as const satisfies TxEnvelopeDeposit.TxEnvelopeDeposit

test('serialize: encodes the deposit fields in wire order', () => {
  expect(TxEnvelopeDeposit.serialize(envelope)).toMatchInlineSnapshot(
    `"0x7ef857a018040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d710431994977f82a600a1414e583f7f13623f1ac5d58b1c0b94aabbccddeeff00112233445566778899aabbccdd2a0183010f2c0184deadbeef"`,
  )
})

test('deserialize: decodes every deposit field', () => {
  expect(TxEnvelopeDeposit.deserialize(TxEnvelopeDeposit.serialize(envelope)))
    .toMatchInlineSnapshot(`
    {
      "data": "0xdeadbeef",
      "from": "0x977f82a600a1414e583f7f13623f1ac5d58b1c0b",
      "gas": 69420n,
      "isSystemTx": true,
      "mint": 42n,
      "sourceHash": "0x18040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d7104319",
      "to": "0xaabbccddeeff00112233445566778899aabbccdd",
      "type": "deposit",
      "value": 1n,
    }
  `)
})

test('serialize: omits empty fields', () => {
  const minimal = {
    from: envelope.from,
    sourceHash: envelope.sourceHash,
    type: 'deposit',
  } as const satisfies TxEnvelopeDeposit.TxEnvelopeDeposit
  expect(TxEnvelopeDeposit.serialize(minimal)).toMatchInlineSnapshot(
    `"0x7ef83ca018040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d710431994977f82a600a1414e583f7f13623f1ac5d58b1c0b808080808080"`,
  )
  expect(
    TxEnvelopeDeposit.deserialize(TxEnvelopeDeposit.serialize(minimal)),
  ).toEqual(minimal)
})

test('is', () => {
  expect(TxEnvelopeDeposit.is(null)).toBe(false)
  expect(TxEnvelopeDeposit.is({ type: 'eip1559' })).toBe(false)
  expect(
    TxEnvelopeDeposit.is({
      sourceHash: envelope.sourceHash,
      type: 'eip1559',
    }),
  ).toBe(false)
  expect(TxEnvelopeDeposit.is({ type: 'deposit' })).toBe(true)
  expect(TxEnvelopeDeposit.is({ sourceHash: envelope.sourceHash })).toBe(true)
})

describe('errors', () => {
  test('invalid from address', () => {
    expect(() => TxEnvelopeDeposit.assert({ ...envelope, from: '0xdeadbeef' }))
      .toThrowErrorMatchingInlineSnapshot(`
      [Address.InvalidAddressError: Address "0xdeadbeef" is invalid.

      Details: Address is not a 20 byte (40 hexadecimal character) value.]
    `)
  })

  test('invalid to address', () => {
    expect(() => TxEnvelopeDeposit.assert({ ...envelope, to: '0xdeadbeef' }))
      .toThrowErrorMatchingInlineSnapshot(`
      [Address.InvalidAddressError: Address "0xdeadbeef" is invalid.

      Details: Address is not a 20 byte (40 hexadecimal character) value.]
    `)
  })

  test('invalid source hash size', () => {
    expect(() =>
      TxEnvelopeDeposit.assert({ ...envelope, sourceHash: '0xdeadbeef' }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [TxEnvelopeDeposit.InvalidSourceHashSizeError: Deposit source hash must be 32 bytes.

      Source Hash: "0xdeadbeef"

      Version: viem@2.52.1]
    `)
  })

  test('invalid serialized type', () => {
    expect(() =>
      TxEnvelopeDeposit.deserialize('0x02c0' as TxEnvelopeDeposit.Serialized),
    ).toThrowErrorMatchingInlineSnapshot(`
        [TxEnvelopeDeposit.InvalidSerializedError: Invalid serialized OP Stack deposit transaction.

        Serialized Transaction: "0x02c0"

        Version: viem@2.52.1]
      `)
  })

  test('invalid serialized field count', () => {
    expect(() => TxEnvelopeDeposit.deserialize('0x7ec0'))
      .toThrowErrorMatchingInlineSnapshot(`
        [TxEnvelopeDeposit.InvalidSerializedError: Invalid serialized OP Stack deposit transaction.

        Serialized Transaction: "0x7ec0"

        Version: viem@2.52.1]
      `)
  })

  test('nested serialized field', () => {
    const serialized = Hex.concat(
      TxEnvelopeDeposit.serializedType,
      Rlp.from([[], envelope.from, '0x', '0x', '0x', '0x', '0x', '0x'], {
        as: 'Hex',
      }),
    ) as TxEnvelopeDeposit.Serialized
    expect(() => TxEnvelopeDeposit.deserialize(serialized))
      .toThrowErrorMatchingInlineSnapshot(`
        [TxEnvelopeDeposit.InvalidSerializedError: Invalid serialized OP Stack deposit transaction.

        Serialized Transaction: "0x7edcc094977f82a600a1414e583f7f13623f1ac5d58b1c0b808080808080"

        Version: viem@2.52.1]
      `)
  })

  test('invalid system transaction flag', () => {
    const serialized = Hex.concat(
      TxEnvelopeDeposit.serializedType,
      Rlp.from(
        [
          envelope.sourceHash,
          envelope.from,
          '0x',
          '0x',
          '0x',
          '0x',
          '0x2',
          '0x',
        ],
        { as: 'Hex' },
      ),
    ) as TxEnvelopeDeposit.Serialized
    expect(() => TxEnvelopeDeposit.deserialize(serialized))
      .toThrowErrorMatchingInlineSnapshot(`
      [Hex.InvalidHexBooleanError: Hex value \`"0x02"\` is not a valid boolean.

      The hex value must be \`"0x0"\` (false) or \`"0x1"\` (true).]
    `)
  })
})
