import { expect, test } from 'vitest'

import { BlockNotFoundError } from './block.js'

test('BlockNotFoundError', () => {
  expect(
    new BlockNotFoundError({ blockNumber: 69420n }),
  ).toMatchInlineSnapshot(`
    [BlockNotFoundError: Block at number "69420" could not be found.

    Version: viem@x.y.z]
  `)
  expect(
    new BlockNotFoundError({ blockHash: '0x69420' }),
  ).toMatchInlineSnapshot(`
    [BlockNotFoundError: Block at hash "0x69420" could not be found.

    Version: viem@x.y.z]
  `)
  expect(new BlockNotFoundError({})).toMatchInlineSnapshot(`
    [BlockNotFoundError: Block could not be found.

    Version: viem@x.y.z]
  `)
})
