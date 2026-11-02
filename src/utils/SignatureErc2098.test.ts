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

test('behavior: `r` and `s` shorter than 32 bytes', () => {
  const compact = SignatureErc2098.from({
    r: '0x1cdb3cbf94c7059e0e16d2ba046daef144d77384995a66f379194b638fc07e',
    s: '0xc3d1ccd2c334876b9f8ef0ba3725c30dd5e1def225df36efa406d881ed610b',
    yParity: 1,
  })

  expect({
    compact,
    signature: SignatureErc2098.toSignature(compact),
  }).toMatchInlineSnapshot(`
    {
      "compact": {
        "r": "0x001cdb3cbf94c7059e0e16d2ba046daef144d77384995a66f379194b638fc07e",
        "yParityAndS": "0x80c3d1ccd2c334876b9f8ef0ba3725c30dd5e1def225df36efa406d881ed610b",
      },
      "signature": {
        "r": "0x001cdb3cbf94c7059e0e16d2ba046daef144d77384995a66f379194b638fc07e",
        "s": "0x00c3d1ccd2c334876b9f8ef0ba3725c30dd5e1def225df36efa406d881ed610b",
        "yParity": 1,
      },
    }
  `)
})

test('behavior: `r` and `yParityAndS` shorter than 32 bytes', () => {
  expect(
    SignatureErc2098.toSignature({
      r: '0x1cdb3cbf94c7059e0e16d2ba046daef144d77384995a66f379194b638fc07e',
      yParityAndS:
        '0xc3d1ccd2c334876b9f8ef0ba3725c30dd5e1def225df36efa406d881ed610b',
    }),
  ).toMatchInlineSnapshot(`
    {
      "r": "0x001cdb3cbf94c7059e0e16d2ba046daef144d77384995a66f379194b638fc07e",
      "s": "0x00c3d1ccd2c334876b9f8ef0ba3725c30dd5e1def225df36efa406d881ed610b",
      "yParity": 0,
    }
  `)
})

test('error: high `s`', () => {
  expect(() =>
    SignatureErc2098.from({
      r: '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76',
      s: '0x939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
      yParity: 0,
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `[SignatureErc2098.InvalidSError: Value \`0x939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793\` is an invalid s value. s must be less than 2^255 to be packed with the yParity bit.]`,
  )
})

test('error: invalid `yParity`', () => {
  expect(() =>
    SignatureErc2098.from({
      r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
      s: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
      yParity: 27,
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Signature.InvalidYParityError: Value \`27\` is an invalid y-parity value. Y-parity must be 0 or 1.]`,
  )
})
