import { describe, expect, test } from 'vitest'
import { inferRequireFunds } from './utils.js'

const token = '0x20c0000000000000000000000000000000000000'

describe('inferRequireFunds', () => {
  test('infers a target balance from true without selecting sources', () => {
    expect(inferRequireFunds(true, { amount: 50n, token })).toEqual([
      { amount: 50n, token },
    ])
  })

  test('infers the amount for a token-only requirement', () => {
    expect(
      inferRequireFunds([{ token }], { amount: 50n, token }),
    ).toMatchInlineSnapshot(`
      [
        {
          "amount": 50n,
          "token": "0x20c0000000000000000000000000000000000000",
        },
      ]
    `)
  })

  test('preserves omitted and empty requirements', () => {
    expect(inferRequireFunds(undefined, { amount: 50n, token })).toBeUndefined()
    expect(inferRequireFunds([], { amount: 50n, token })).toEqual([])
  })

  test('preserves explicit amounts and empty sources', () => {
    expect(
      inferRequireFunds([{ amount: 0n, sources: [] }], {
        amount: 50n,
        token,
      }),
    ).toEqual([{ amount: 0n, sources: [], token }])
  })
})
