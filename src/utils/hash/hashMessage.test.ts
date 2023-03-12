import { expect, test } from 'vitest'
import { hashMessage } from './hashMessage'

test('to hex', () => {
  expect(hashMessage('Some data')).toMatchInlineSnapshot(
    '"0x1da44b586eb0729ff70a73c326926f6ed5a25f5b056e7f47fbc6e58d86871655"',
  )
  expect(hashMessage('🤗')).toMatchInlineSnapshot(
    '"0x716ce69c5d2d629c168bc02e24a961456bdc5a362d366119305aea73978a0332"',
  )
})

test('to bytes', () => {
  expect(hashMessage('Some data', 'bytes')).toMatchInlineSnapshot(
    `
    Uint8Array [
      29,
      164,
      75,
      88,
      110,
      176,
      114,
      159,
      247,
      10,
      115,
      195,
      38,
      146,
      111,
      110,
      213,
      162,
      95,
      91,
      5,
      110,
      127,
      71,
      251,
      198,
      229,
      141,
      134,
      135,
      22,
      85,
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
