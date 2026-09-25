import { Addresses, Funding } from 'viem/tempo'
import { describe, expect, test } from 'vitest'

describe('defaultRoute', () => {
  test('selects known parity inputs on 4217', () => {
    expect(
      Funding.defaultRoute({ chainId: 4217, token: Addresses.pathUsd }),
    ).toMatchInlineSnapshot(`
      {
        "sources": [
          {
            "data": "0x00000000000000000000000020c0000000000000000000000520792dccccccccffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c0000000000000000000006fd9a167923ba194ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c0000000000000000000003554d28269e0f3c2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c0000000000000000000005c0bac7cef389a11ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c000000000000000000000ab02d39df30bd17effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c000000000000000000000383a23bacb546ab9ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c0000000000000000000007f7ba549dd0251b9ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c000000000000000000000ae247a1130450f09ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c000000000000000000000111111111e910f0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c0000000000000000000003158081efd85bfc2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c000000000000000000000b9537d11c60e8b50ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c0000000000000000000002f52d5cc21a3207bffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c00000000000000000000014f22ca97301eb73ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
        ],
      }
    `)
  })

  test('selects known parity inputs on 42431', () => {
    expect(
      Funding.defaultRoute({ chainId: 42431, token: Addresses.pathUsd }),
    ).toMatchInlineSnapshot(`
      {
        "sources": [
          {
            "data": "0x00000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c0000000000000000000000000000000000002ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c0000000000000000000000000000000000003ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c0000000000000000000009e8d7eb59b783726ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
        ],
      }
    `)
  })

  test('selects standard localnet inputs', () => {
    expect(
      Funding.defaultRoute({ chainId: 1337, token: Addresses.pathUsd }),
    ).toMatchInlineSnapshot(`
      {
        "sources": [
          {
            "data": "0x00000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c0000000000000000000000000000000000002ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
          {
            "data": "0x00000000000000000000000020c0000000000000000000000000000000000003ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "to": "0x1120000000000000000000000000000000000001",
          },
        ],
      }
    `)
  })

  test('matches output addresses case-insensitively', () => {
    expect(
      Funding.defaultRoute({
        chainId: 42431,
        token: Addresses.pathUsd
          .toUpperCase()
          .replace('0X', '0x') as `0x${string}`,
      }),
    ).toEqual(
      Funding.defaultRoute({ chainId: 42431, token: Addresses.pathUsd }),
    )
  })

  test.each([1, 10000000])('requires a custom route on %s', (chainId) => {
    expect(
      Funding.defaultRoute({ chainId, token: Addresses.pathUsd }),
    ).toMatchInlineSnapshot('undefined')
  })

  test('requires a custom route for unknown output tokens', () => {
    expect(
      Funding.defaultRoute({
        chainId: 4217,
        token: '0x20c000000000000000000000000000000000ffff',
      }),
    ).toMatchInlineSnapshot('undefined')
  })
})
