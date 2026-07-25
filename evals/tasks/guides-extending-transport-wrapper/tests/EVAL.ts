import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
test('exports a zero-input Viem example', () => {
  expect(sourceText).toMatch(/from ['"]viem/)
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expect(sourceText).toMatch(/\bTransport\.from\s*\(/)
  expect(sourceText).toMatch(/\bcacheTime\s*:\s*0\b/)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('counts requests forwarded through the transport wrapper', async () => {
  const { first, second } = await example()
  expect(first.blockNumber).toBeGreaterThanOrEqual(24_000_000n)
  expect(first.requestCount).toBeGreaterThanOrEqual(1)
  expect(second.blockNumber).toBeGreaterThanOrEqual(first.blockNumber)
  expect(second.requestCount).toBeGreaterThanOrEqual(first.requestCount + 1)
}, 60_000)
