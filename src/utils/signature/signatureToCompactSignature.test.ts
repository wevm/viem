import { compactSignatureToSignature, recoverAddress } from 'viem'
import { expect, test } from 'vitest'
import type { Signature } from '../../types/misc.js'
import { signatureToCompactSignature } from './signatureToCompactSignature.js'

test('default', () => {
  const signature0: Signature = {
    r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
    s: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
    v: 27n,
  }
  const signature1: Signature = {
    r: '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76',
    s: '0x139c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
    v: 28n,
  }
  const signature2: Signature = {
    r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
    s: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
    yParity: 0,
  }
  const signature3: Signature = {
    r: '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76',
    s: '0x139c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
    yParity: 1,
  }
  expect(signatureToCompactSignature(signature0)).toEqual({
    r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
    yParityAndS:
      '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
  })
  expect(signatureToCompactSignature(signature1)).toEqual({
    r: '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76',
    yParityAndS:
      '0x939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
  })
  expect(signatureToCompactSignature(signature2)).toEqual({
    r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
    yParityAndS:
      '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
  })
  expect(signatureToCompactSignature(signature3)).toEqual({
    r: '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76',
    yParityAndS:
      '0x939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
  })
})

test('behavior: legacy `v` with chain id', () => {
  expect(
    signatureToCompactSignature({
      r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
      s: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
      v: 37n,
    }),
  ).toMatchInlineSnapshot(`
    {
      "r": "0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90",
      "yParityAndS": "0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064",
    }
  `)
  expect(
    signatureToCompactSignature({
      r: '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76',
      s: '0x139c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
      v: 38n,
    }),
  ).toMatchInlineSnapshot(`
    {
      "r": "0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76",
      "yParityAndS": "0x939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793",
    }
  `)
})

test('behavior: `s` shorter than 32 bytes', async () => {
  const hash =
    '0x44caf484852acee09d52b2802dba26d3c8ab3d28c7abcc1398b87898115633ec'
  const compactSignature = signatureToCompactSignature({
    r: '0xdf1cdb3cbf94c7059e0e16d2ba046daef144d77384995a66f379194b638fc07e',
    s: '0xc3d1ccd2c334876b9f8ef0ba3725c30dd5e1def225df36efa406d881ed610b',
    yParity: 1,
  })

  expect(compactSignature).toMatchInlineSnapshot(`
    {
      "r": "0xdf1cdb3cbf94c7059e0e16d2ba046daef144d77384995a66f379194b638fc07e",
      "yParityAndS": "0x80c3d1ccd2c334876b9f8ef0ba3725c30dd5e1def225df36efa406d881ed610b",
    }
  `)
  expect(
    await recoverAddress({
      hash,
      signature: compactSignatureToSignature(compactSignature),
    }),
  ).toMatchInlineSnapshot(`"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"`)
})

test('behavior: `r` and `s` shorter than 32 bytes with yParity 0', () => {
  const compactSignature = signatureToCompactSignature({
    r: '0x1cdb3cbf94c7059e0e16d2ba046daef144d77384995a66f379194b638fc07e',
    s: '0xc3d1ccd2c334876b9f8ef0ba3725c30dd5e1def225df36efa406d881ed610b',
    yParity: 0,
  })

  expect(compactSignature).toMatchInlineSnapshot(`
    {
      "r": "0x001cdb3cbf94c7059e0e16d2ba046daef144d77384995a66f379194b638fc07e",
      "yParityAndS": "0x00c3d1ccd2c334876b9f8ef0ba3725c30dd5e1def225df36efa406d881ed610b",
    }
  `)
  expect(compactSignatureToSignature(compactSignature)).toMatchInlineSnapshot(`
    {
      "r": "0x001cdb3cbf94c7059e0e16d2ba046daef144d77384995a66f379194b638fc07e",
      "s": "0x00c3d1ccd2c334876b9f8ef0ba3725c30dd5e1def225df36efa406d881ed610b",
      "yParity": 0,
    }
  `)
})

test('behavior: `v` as yParity', () => {
  expect(
    signatureToCompactSignature({
      r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
      s: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
      v: 0n,
    }),
  ).toMatchInlineSnapshot(`
    {
      "r": "0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90",
      "yParityAndS": "0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064",
    }
  `)
  expect(
    signatureToCompactSignature({
      r: '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76',
      s: '0x139c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
      v: 1n,
    }),
  ).toMatchInlineSnapshot(`
    {
      "r": "0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76",
      "yParityAndS": "0x939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793",
    }
  `)
})

test('error: invalid `v`', () => {
  expect(() =>
    signatureToCompactSignature({
      r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
      s: '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
      v: 29n,
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Invalid \`v\` or \`yParity\` value]`,
  )
})

test('error: high `s`', () => {
  expect(() =>
    signatureToCompactSignature({
      r: '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76',
      s: '0x939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
      yParity: 0,
    }),
  ).toThrowErrorMatchingInlineSnapshot(`[Error: Invalid \`s\` value]`)
})
