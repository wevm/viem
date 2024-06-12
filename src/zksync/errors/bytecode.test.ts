import { expect, test } from 'vitest'
import { BytecodeLengthExceedsMaxSizeError } from './bytecode.js'

test('BytecodeLengthExceedsMaxSizeError', () => {
  expect(
    new BytecodeLengthExceedsMaxSizeError({
      givenLength: 100,
      maxBytecodeSize: 50n,
    }),
  ).toMatchInlineSnapshot(`
    [BytecodeLengthExceedsMaxSizeError: Bytecode cannot be longer than 50 bytes. Given length: 100

    Version: viem@x.y.z]
  `)
})
