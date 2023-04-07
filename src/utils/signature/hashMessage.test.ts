import { expect, test } from 'vitest'
import { hashMessage } from './hashMessage.js'

test('to hex', () => {
  expect(hashMessage('hello world')).toMatchInlineSnapshot(
    '"0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68"',
  )
  expect(hashMessage('🤗')).toMatchInlineSnapshot(
    '"0x716ce69c5d2d629c168bc02e24a961456bdc5a362d366119305aea73978a0332"',
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
})
