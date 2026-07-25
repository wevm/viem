import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/SignatureErc2098\.from\(/)
  expect(source).toMatch(/SignatureErc2098\.toHex\(/)
  expect(source).toMatch(/SignatureErc2098\.fromHex\(/)
  expect(source).toMatch(/SignatureErc2098\.toSignature\(/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('converts and parses an ERC-2098 signature', async () => {
  const result = await example()
  expect(result.compact.toLowerCase()).toBe(
    '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76939c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
  )
  expect(result.signature.r.toLowerCase()).toBe(
    '0x9328da16089fcba9bececa81663203989f2df5fe1faa6291a45381c81bd17f76',
  )
  expect(result.signature.s.toLowerCase()).toBe(
    '0x139c6d6b623b42da56557e5e734a43dc83345ddfadec52cbe24d0cc64f550793',
  )
  expect(result.signature.yParity).toBe(1)
}, 60_000)
