import { describe, expect, test } from 'vp/test'

import { InvalidBlockParameterError, toRpcBlock } from './toRpcBlock.js'

const blockHash =
  '0xf65631529d476553ca5b0056d6480c3970dd5ac884fee51d5b30ca7fceab8894'

describe('toRpcBlock', () => {
  test('behavior: returns a block tag', () => {
    expect({
      default: toRpcBlock(),
      explicit: toRpcBlock({ blockTag: 'safe' }),
    }).toMatchInlineSnapshot(`
      {
        "default": "latest",
        "explicit": "safe",
      }
    `)
  })

  test('behavior: returns a hex block number', () => {
    expect(toRpcBlock({ blockNumber: 69_420n })).toMatchInlineSnapshot(
      `"0x10f2c"`,
    )
  })

  test('behavior: returns a block hash identifier', () => {
    expect({
      canonical: toRpcBlock({ blockHash, requireCanonical: true }),
      noncanonical: toRpcBlock({ blockHash, requireCanonical: false }),
      unspecified: toRpcBlock({ blockHash }),
    }).toMatchInlineSnapshot(`
      {
        "canonical": {
          "blockHash": "0xf65631529d476553ca5b0056d6480c3970dd5ac884fee51d5b30ca7fceab8894",
          "requireCanonical": true,
        },
        "noncanonical": {
          "blockHash": "0xf65631529d476553ca5b0056d6480c3970dd5ac884fee51d5b30ca7fceab8894",
        },
        "unspecified": {
          "blockHash": "0xf65631529d476553ca5b0056d6480c3970dd5ac884fee51d5b30ca7fceab8894",
        },
      }
    `)
  })

  test('behavior: rejects requireCanonical without a block hash', () => {
    const error = (() => {
      try {
        toRpcBlock({ blockTag: 'latest', requireCanonical: true } as never)
      } catch (error) {
        return error as InvalidBlockParameterError
      }
      throw new Error('Expected toRpcBlock to throw.')
    })()

    expect({
      name: error.name,
      shortMessage: error.shortMessage,
    }).toMatchInlineSnapshot(`
      {
        "name": "actions.public.InvalidBlockParameterError",
        "shortMessage": "\`requireCanonical\` can only be provided when \`blockHash\` is set.",
      }
    `)
  })
})
