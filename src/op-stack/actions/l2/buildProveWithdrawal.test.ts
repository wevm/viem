import { Rlp } from 'ox'
import { expect, test } from 'vitest'

import { maybeAddProofNode } from './buildProveWithdrawal.js'

test('appends an embedded proof node from a branch', () => {
  const node = ['0x20ab', '0x01'] as const
  const branch = [
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    node,
  ] as const
  const proof = [Rlp.fromHex(branch)]
  const key =
    '0x00000000000000000000000000000000000000000000000000000000000000ab'

  expect(maybeAddProofNode(key, proof)).toMatchInlineSnapshot(`
    [
      "0xd580808080808080808080808080808080c48220ab01",
      "0xc48220ab01",
    ]
  `)
})

test('preserves a proof ending in a leaf', () => {
  const proof = [Rlp.fromHex(['0x20ab', '0x01'])]
  const key =
    '0x00000000000000000000000000000000000000000000000000000000000000ab'

  expect(maybeAddProofNode(key, proof)).toMatchInlineSnapshot(`
    [
      "0xc48220ab01",
    ]
  `)
})
