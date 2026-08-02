import { expect, test } from 'vitest'

import * as SignatureErc2098 from './SignatureErc2098.js'

// Vectors from https://eips.ethereum.org/EIPS/eip-2098
const vector1 = {
  signature: {
    r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
    s: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
    yParity: 0,
  },
  compact: {
    r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
    yParityAndS:
      '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
  },
} as const

const vector2 = {
  signature: {
    r: '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76',
    s: '0x139c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
    yParity: 1,
  },
  compact: {
    r: '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76',
    yParityAndS:
      '0x939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
  },
} as const

test('from', () => {
  expect(SignatureErc2098.from(vector1.signature)).toEqual(vector1.compact)
  expect(SignatureErc2098.from(vector2.signature)).toEqual(vector2.compact)
})

test('toSignature', () => {
  expect(SignatureErc2098.toSignature(vector1.compact)).toEqual(
    vector1.signature,
  )
  expect(SignatureErc2098.toSignature(vector2.compact)).toEqual(
    vector2.signature,
  )
})

test('toHex', () => {
  expect(SignatureErc2098.toHex(vector1.compact)).toBe(
    '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b907e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
  )
  expect(SignatureErc2098.toHex(vector2.compact)).toBe(
    '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
  )
})

test('fromHex', () => {
  expect(
    SignatureErc2098.fromHex(
      '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b907e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
    ),
  ).toEqual(vector1.compact)
  expect(
    SignatureErc2098.fromHex(
      '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
    ),
  ).toEqual(vector2.compact)
})

test('round-trip', () => {
  for (const { signature } of [vector1, vector2]) {
    const compact = SignatureErc2098.from(signature)
    expect(SignatureErc2098.toSignature(compact)).toEqual(signature)
    expect(
      SignatureErc2098.toSignature(
        SignatureErc2098.fromHex(SignatureErc2098.toHex(compact)),
      ),
    ).toEqual(signature)
  }
})

test('error: invalid size', () => {
  expect(() =>
    SignatureErc2098.fromHex('0xdeadbeef'),
  ).toThrowErrorMatchingInlineSnapshot(
    '[SignatureErc2098.InvalidSerializedSizeError: Value `0xdeadbeef` is an invalid size (expected 64 bytes).]',
  )
})
