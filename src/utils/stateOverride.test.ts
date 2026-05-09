import { describe, expect, test } from 'vitest'
import type { StateMapping, StateOverride } from '../types/stateOverride.js'
import {
  serializeAccountStateOverride,
  serializeStateMapping,
  serializeStateOverride,
} from './stateOverride.js'

const fourTwenty =
  '00000000000000000000000000000000000000000000000000000000000001a4'

describe('serializeStateMapping', () => {
  test('default', () => {
    const stateMapping: StateMapping = [
      {
        slot: `0x${fourTwenty}`,
        value: `0x${fourTwenty}`,
      },
    ]
    expect(serializeStateMapping(stateMapping)).toMatchInlineSnapshot(`
        {
          "0x${fourTwenty}": "0x${fourTwenty}",
        }
      `)
  })

  test('undefined', () => {
    expect(serializeStateMapping(undefined)).toMatchInlineSnapshot('undefined')
  })

  test('error: invalid key', () => {
    const stateMapping: StateMapping = [
      {
        // invalid bytes length
        slot: `0x${fourTwenty.slice(0, -1)}`,
        value: `0x${fourTwenty}`,
      },
    ]

    expect(() =>
      serializeStateMapping(stateMapping),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidBytesLengthError: Hex is expected to be 66 hex long, but is 65 hex long.

      Version: viem@x.y.z]
    `)
  })

  test('error: invalid value', () => {
    const stateMapping: StateMapping = [
      {
        slot: `0x${fourTwenty}`,
        value: `0x${fourTwenty.slice(0, -1)}`,
      },
    ]

    expect(() =>
      serializeStateMapping(stateMapping),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidBytesLengthError: Hex is expected to be 66 hex long, but is 65 hex long.

      Version: viem@x.y.z]
    `)
  })
})

describe('serializeAccountStateOverride', () => {
  test('args: code', () => {
    const stateOverride: Omit<StateOverride[number], 'address'> = {
      code: `0x${fourTwenty}`,
    }

    expect(serializeAccountStateOverride(stateOverride)).toMatchInlineSnapshot(`
        {
          "code": "0x${fourTwenty}",
        }
      `)

    const emptyStateOverride: Omit<StateOverride[number], 'address'> = {
      code: undefined,
    }

    expect(
      serializeAccountStateOverride(emptyStateOverride),
    ).toMatchInlineSnapshot(`
        {}
      `)
  })

  test('args: balance', () => {
    const stateOverride: Omit<StateOverride[number], 'address'> = {
      balance: 1n,
    }

    expect(serializeAccountStateOverride(stateOverride)).toMatchInlineSnapshot(`
        {
          "balance": "0x1",
        }
      `)

    const emptyStateOverride: Omit<StateOverride[number], 'address'> = {
      balance: undefined,
    }

    expect(
      serializeAccountStateOverride(emptyStateOverride),
    ).toMatchInlineSnapshot(`
        {}
      `)
  })

  test('args: nonce', () => {
    const stateOverride: Omit<StateOverride[number], 'address'> = {
      nonce: 1,
    }

    expect(serializeAccountStateOverride(stateOverride)).toMatchInlineSnapshot(`
        {
          "nonce": "0x1",
        }
      `)

    const emptyStateOverride: Omit<StateOverride[number], 'address'> = {
      nonce: undefined,
    }

    expect(
      serializeAccountStateOverride(emptyStateOverride),
    ).toMatchInlineSnapshot(`
        {}
      `)
  })

  test('args: stateDiff', () => {
    expect(
      serializeAccountStateOverride({
        stateDiff: [{ slot: `0x${fourTwenty}`, value: `0x${fourTwenty}` }],
      }),
    ).toMatchInlineSnapshot(`
      {
        "stateDiff": {
          "0x00000000000000000000000000000000000000000000000000000000000001a4": "0x00000000000000000000000000000000000000000000000000000000000001a4",
        },
      }
    `)
  })

  test('error: state conflict', () => {
    expect(() =>
      serializeAccountStateOverride({
        stateDiff: [{ slot: `0x${fourTwenty}`, value: `0x${fourTwenty}` }],
        state: [{ slot: `0x${fourTwenty}`, value: `0x${fourTwenty}` }],
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [StateAssignmentConflictError: state and stateDiff are set on the same account.

      Version: viem@x.y.z]
    `)
  })
})

describe('serializeStateOverride', () => {
  test('default', () => {
    expect(
      serializeStateOverride([
        {
          address: '0x0000000000000000000000000000000000000000',
        },
      ]),
    ).toMatchInlineSnapshot(`
      {
        "0x0000000000000000000000000000000000000000": {},
      }
    `)
  })

  test('undefined', () => {
    expect(serializeStateOverride(undefined)).toMatchInlineSnapshot('undefined')
  })

  test('error: address conflict', () => {
    expect(() =>
      serializeStateOverride([
        {
          address: '0x0000000000000000000000000000000000000000',
        },
        {
          address: '0x0000000000000000000000000000000000000000',
        },
      ]),
    ).toThrowErrorMatchingInlineSnapshot(`
      [AccountStateConflictError: State for account "0x0000000000000000000000000000000000000000" is set multiple times.

      Version: viem@x.y.z]
    `)
  })

  test('error: invalid address', () => {
    expect(() =>
      serializeStateOverride([
        {
          address: '0xdeadbeef',
        },
      ]),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidAddressError: Address "0xdeadbeef" is invalid.

      - Address must be a hex value of 20 bytes (40 hex characters).
      - Address must match its checksum counterpart.

      Version: viem@x.y.z]
    `)
  })
})
