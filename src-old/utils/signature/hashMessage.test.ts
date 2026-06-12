import { expect, test } from 'vitest'

import { hashMessage } from './hashMessage.js'

test('to hex', () => {
  expect(hashMessage('hello world')).toMatchInlineSnapshot(
    '"0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68"',
  )
  expect(hashMessage('🤗')).toMatchInlineSnapshot(
    '"0x716ce69c5d2d629c168bc02e24a961456bdc5a362d366119305aea73978a0332"',
  )
  expect(hashMessage('0xdeadbeef')).toMatchInlineSnapshot(
    '"0xefedd0a9a0294228c3977d7fbb68c7d40279f8b408cf3e24ef1823b179709e58"',
  )

  expect(
    hashMessage({ raw: '0x68656c6c6f20776f726c64' }),
  ).toMatchInlineSnapshot(
    '"0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68"',
  )
  expect(
    hashMessage({
      raw: Uint8Array.from([
        104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
      ]),
    }),
  ).toMatchInlineSnapshot(
    '"0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68"',
  )
})

test('to bytes', () => {
  expect(hashMessage('hello world', 'bytes')).toMatchInlineSnapshot(
    `
    Uint8Array [
      217,
      235,
      161,
      110,
      208,
      236,
      174,
      67,
      43,
      113,
      254,
      0,
      140,
      152,
      204,
      135,
      43,
      180,
      204,
      33,
      77,
      50,
      32,
      163,
      111,
      54,
      83,
      38,
      207,
      128,
      125,
      104,
    ]
  `,
  )
  expect(hashMessage('🤗', 'bytes')).toMatchInlineSnapshot(
    `
    Uint8Array [
      113,
      108,
      230,
      156,
      93,
      45,
      98,
      156,
      22,
      139,
      192,
      46,
      36,
      169,
      97,
      69,
      107,
      220,
      90,
      54,
      45,
      54,
      97,
      25,
      48,
      90,
      234,
      115,
      151,
      138,
      3,
      50,
    ]
  `,
  )
  expect(hashMessage('0xdeadbeef', 'bytes')).toMatchInlineSnapshot(
    `
    Uint8Array [
      239,
      237,
      208,
      169,
      160,
      41,
      66,
      40,
      195,
      151,
      125,
      127,
      187,
      104,
      199,
      212,
      2,
      121,
      248,
      180,
      8,
      207,
      62,
      36,
      239,
      24,
      35,
      177,
      121,
      112,
      158,
      88,
    ]
  `,
  )

  expect(
    hashMessage({ raw: '0x68656c6c6f20776f726c64' }, 'bytes'),
  ).toMatchInlineSnapshot(
    `
    Uint8Array [
      217,
      235,
      161,
      110,
      208,
      236,
      174,
      67,
      43,
      113,
      254,
      0,
      140,
      152,
      204,
      135,
      43,
      180,
      204,
      33,
      77,
      50,
      32,
      163,
      111,
      54,
      83,
      38,
      207,
      128,
      125,
      104,
    ]
  `,
  )
  expect(
    hashMessage(
      {
        raw: Uint8Array.from([
          104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
        ]),
      },
      'bytes',
    ),
  ).toMatchInlineSnapshot(
    `
    Uint8Array [
      217,
      235,
      161,
      110,
      208,
      236,
      174,
      67,
      43,
      113,
      254,
      0,
      140,
      152,
      204,
      135,
      43,
      180,
      204,
      33,
      77,
      50,
      32,
      163,
      111,
      54,
      83,
      38,
      207,
      128,
      125,
      104,
    ]
  `,
  )
})
