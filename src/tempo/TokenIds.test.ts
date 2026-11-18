import { TokenIds } from 'viem/tempo'
import { expect, test } from 'vitest'

test('compute', () => {
  // Expected address read from `tip20Factory.getTokenAddress` on moderato.
  const id = TokenIds.compute({
    salt: '0x0000000000000000000000000000000000000000000000000000000000000001',
    sender: '0x1234567890123456789012345678901234567890',
  })

  expect(id).toMatchInlineSnapshot(`17025840234944183952n`)
  expect(TokenIds.toAddress(id)).toMatchInlineSnapshot(
    `"0x20c000000000000000000000ec47ef7ca666be90"`,
  )
})

test('toAddress', () => {
  expect(TokenIds.toAddress(TokenIds.pathUsd)).toMatchInlineSnapshot(
    `"0x20c0000000000000000000000000000000000000"`,
  )
  expect(TokenIds.toAddress(0x1_0000_0000n)).toMatchInlineSnapshot(
    `"0x20c0000000000000000000000000000100000000"`,
  )
  expect(
    TokenIds.toAddress('0x20c0000000000000000000000000000000000001'),
  ).toMatchInlineSnapshot(`"0x20c0000000000000000000000000000000000001"`)
  expect(() =>
    TokenIds.toAddress('0x20c0'),
  ).toThrowErrorMatchingInlineSnapshot(`
    [Address.InvalidAddressError: Address "0x20c0" is invalid.

    Details: Address is not a 20 byte (40 hexadecimal character) value.]
  `)
})
