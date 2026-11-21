import { expect, test } from 'vitest'

import { compactSignatureToSignature } from './compactSignatureToSignature.js'

test('default', () => {
  expect(
    compactSignatureToSignature({
      r: '0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90',
      yParityAndS:
        '0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
    }),
  ).toMatchInlineSnapshot(
    `
    {
      "r": "0x68a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b90",
      "s": "0x7e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064",
      "yParity": 0,
    }
  `,
  )

  expect(
    compactSignatureToSignature({
      r: '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76',
      yParityAndS:
        '0x939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
    }),
  ).toMatchInlineSnapshot(
    `
    {
      "r": "0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76",
      "s": "0x139c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793",
      "yParity": 1,
    }
  `,
  )
})

test('behavior: `r` and `yParityAndS` shorter than 32 bytes', () => {
  expect(
    compactSignatureToSignature({
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
