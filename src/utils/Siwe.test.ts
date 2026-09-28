import { Siwe } from 'viem/utils'
import { expect, test } from 'vitest'

const message = {
  address: '0x0000000000000000000000000000000000000001',
  chainId: 1,
  domain: 'example.com',
  issuedAt: new Date('2026-01-01T00:00:00Z'),
  nonce: 'abcdefgh',
  uri: 'https://example.com',
  version: '1',
} as const

test('rejects a comma in the scheme', () => {
  expect(() => Siwe.createMessage({ ...message, scheme: 'ht,tps' })).toThrow(
    Siwe.InvalidMessageFieldError,
  )
  const text = Siwe.createMessage({ ...message, scheme: 'https' }).replace(
    'https://example.com wants',
    'ht,tps://example.com wants',
  )
  const parsed = Siwe.parseMessage(text)
  expect(parsed).not.toHaveProperty('scheme')
  expect(parsed).not.toHaveProperty('domain')
  expect(parsed).not.toHaveProperty('address')
  expect(parsed).not.toHaveProperty('statement')
  expect(parsed.uri).toBe('https://example.com')
  expect(Siwe.schemeRegex.test('ht,tps')).toBe(false)
  expect(Siwe.prefixRegex.test(text)).toBe(false)
})

test.each(['https', 'a+b', 'a-b', 'a.b'])(
  'round-trips the scheme %s',
  (scheme) => {
    const parsed = Siwe.parseMessage(Siwe.createMessage({ ...message, scheme }))
    expect(parsed).toEqual({ ...message, scheme })
  },
)

test('round-trips without a scheme', () => {
  expect(Siwe.parseMessage(Siwe.createMessage(message))).toEqual(message)
})

test('reads resources from their field, ignoring Resources: in the statement', () => {
  const value = {
    ...message,
    statement: 'Resources: are listed below',
    resources: ['https://example.com/resource'],
  }
  expect(Siwe.parseMessage(Siwe.createMessage(value))).toEqual(value)
})
