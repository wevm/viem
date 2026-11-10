import { KeyAuthorization, SignaturePreAuthorized } from 'ox/tempo'
import { describe, expect, test } from 'vitest'
import * as internal from './preAuthorized.js'

const account = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
const token = '0x20c0000000000000000000000000000000000001'
const transfer = '0xa9059cbb'

function address(index: number, prefix = '0x00000000') {
  return (prefix +
    index.toString(16).padStart(42 - prefix.length, '0')) as `0x${string}`
}

function authorization(
  parameters: Partial<KeyAuthorization.KeyAuthorization> = {},
) {
  return KeyAuthorization.from({
    address: '0x72989d24e6e1f0bbe29a5f304d0db21a318c012e',
    chainId: 4217n,
    type: 'secp256k1',
    ...parameters,
  } as KeyAuthorization.KeyAuthorization) as KeyAuthorization.Signed
}

describe('isPreAuthorized', () => {
  test('default', () => {
    expect(
      [
        `0x00${SignaturePreAuthorized.magicBytes.slice(2)}`,
        SignaturePreAuthorized.magicBytes,
        `0x00${SignaturePreAuthorized.magicBytes.slice(4)}`,
        '0x04',
      ].map((signature) => internal.isPreAuthorized(signature as never)),
    ).toMatchInlineSnapshot(`
      [
        true,
        false,
        false,
        false,
      ]
    `)
  })
})

describe('isRegistrable', () => {
  test('behavior: valid authorizations', () => {
    expect(
      [
        authorization(),
        authorization({ account }),
        authorization({
          limits: Array.from({ length: 256 }, (_, i) => ({
            limit: 2n ** 128n - 1n,
            token: address(i + 1, '0x20c0'),
          })),
        }),
        authorization({
          scopes: Array.from({ length: 64 }, (_, i) => ({
            address: address(i + 1),
          })),
        }),
        authorization({
          scopes: Array.from({ length: 64 }, (_, i) => ({
            address: address(1),
            selector: `0x${(i + 1).toString(16).padStart(8, '0')}` as const,
          })),
        }),
        authorization({
          scopes: [
            {
              address: token,
              recipients: Array.from({ length: 64 }, (_, i) => address(i + 1)),
              selector: transfer,
            },
            { address: token, selector: '0x095ea7b3' },
          ],
        }),
      ].map((value) => internal.isRegistrable(value, account)),
    ).toMatchInlineSnapshot(`
      [
        true,
        true,
        true,
        true,
        true,
        true,
      ]
    `)
  })

  test('behavior: invalid authorizations', () => {
    const invalid = {
      'zero key id': authorization({
        address: '0x0000000000000000000000000000000000000000',
      }),
      'account mismatch': authorization({ account: address(1) }),
      admin: authorization({ isAdmin: true }),
      'too many limits': authorization({
        limits: Array.from({ length: 257 }, (_, i) => ({
          limit: 1n,
          token: address(i + 1, '0x20c0'),
        })),
      }),
      'duplicate token': authorization({
        limits: [
          { limit: 1n, token },
          { limit: 2n, token },
        ],
      }),
      'limit too large': authorization({
        limits: [{ limit: 2n ** 128n, token }],
      }),
      'zero target': authorization({
        scopes: [{ address: '0x0000000000000000000000000000000000000000' }],
      }),
      'too many targets': authorization({
        scopes: Array.from({ length: 65 }, (_, i) => ({
          address: address(i + 1),
        })),
      }),
      'too many selectors': authorization({
        scopes: Array.from({ length: 65 }, (_, i) => ({
          address: address(1),
          selector: `0x${(i + 1).toString(16).padStart(8, '0')}` as const,
        })),
      }),
      'duplicate selector': authorization({
        scopes: [
          { address: address(1), selector: transfer },
          { address: address(1), selector: transfer },
        ],
      }),
      'selector size': authorization({
        scopes: [{ address: address(1), selector: '0xa9059c' }],
      }),
      'recipients on a non-TIP-20 target': authorization({
        scopes: [
          { address: address(1), recipients: [address(2)], selector: transfer },
        ],
      }),
      'recipients on another selector': authorization({
        scopes: [
          { address: token, recipients: [address(2)], selector: '0x23b872dd' },
        ],
      }),
      'zero recipient': authorization({
        scopes: [
          {
            address: token,
            recipients: ['0x0000000000000000000000000000000000000000'],
            selector: transfer,
          },
        ],
      }),
      'duplicate recipient': authorization({
        scopes: [
          {
            address: token,
            recipients: [address(2), address(2)],
            selector: transfer,
          },
        ],
      }),
      'too many recipients': authorization({
        scopes: [
          {
            address: token,
            recipients: Array.from({ length: 65 }, (_, i) => address(i + 1)),
            selector: transfer,
          },
        ],
      }),
      // Within every pool cap: 5,000 + 7,000 × 64 + 7,000 × 4,096 + 5,000 × 64 × 64 = 49,605,000 gas of call scope surcharge.
      'call scope gas over the transaction gas limit cap': authorization({
        scopes: Array.from({ length: 64 }, (_, target) =>
          Array.from({ length: 64 }, (_, rule) => ({
            address: address(target + 1, '0x20c0'),
            selector: (rule === 0
              ? transfer
              : `0x${(rule + 1).toString(16).padStart(8, '0')}`) as `0x${string}`,
            ...(rule === 0
              ? {
                  recipients: Array.from({ length: 64 }, (_, i) =>
                    address(i + 1),
                  ),
                }
              : {}),
          })),
        ).flat(),
      }),
    }

    expect(
      Object.entries(invalid).map(([name, value]) => [
        name,
        internal.isRegistrable(value, account),
      ]),
    ).toMatchInlineSnapshot(`
      [
        [
          "zero key id",
          false,
        ],
        [
          "account mismatch",
          false,
        ],
        [
          "admin",
          false,
        ],
        [
          "too many limits",
          false,
        ],
        [
          "duplicate token",
          false,
        ],
        [
          "limit too large",
          false,
        ],
        [
          "zero target",
          false,
        ],
        [
          "too many targets",
          false,
        ],
        [
          "too many selectors",
          false,
        ],
        [
          "duplicate selector",
          false,
        ],
        [
          "selector size",
          false,
        ],
        [
          "recipients on a non-TIP-20 target",
          false,
        ],
        [
          "recipients on another selector",
          false,
        ],
        [
          "zero recipient",
          false,
        ],
        [
          "duplicate recipient",
          false,
        ],
        [
          "too many recipients",
          false,
        ],
        [
          "call scope gas over the transaction gas limit cap",
          false,
        ],
      ]
    `)
  })
})
