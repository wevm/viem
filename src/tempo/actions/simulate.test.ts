import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Actions } from 'viem'

import * as Account from '../Account.js'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

const transferCall = {
  ...Actions.token.transfer.call(client, {
    amount: 1_000_000n,
    to: account2.address,
    token: tempo.alphaUsd,
  }),
  feeToken: tempo.pathUsd,
  type: 'tempo',
} as const

describe('block.simulate', () => {
  test('encodes tempo transaction requests', async () => {
    const calls: readonly unknown[] = [transferCall]
    const [block] = await Actions.block.simulate(client, {
      blocks: [{ calls }],
    })

    const call = block!.calls[0]
    const { data: _data, gasUsed: _gasUsed, logs, ...result } = call

    expect({
      ...result,
      logs: logs?.map(
        ({ blockHash, blockNumber, blockTimestamp, transactionHash, ...log }) =>
          log,
      ),
    }).toMatchInlineSnapshot(`
      {
        "logs": [
          {
            "address": "0x20c0000000000000000000000000000000000001",
            "data": "0x00000000000000000000000000000000000000000000000000000000000f4240",
            "logIndex": 0,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
              "0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8",
            ],
            "transactionIndex": 0,
          },
        ],
        "result": true,
        "status": "success",
      }
    `)
  })
})

describe('multicall', () => {
  test('simulate mode delegates tempo request encoding', async () => {
    const calls: readonly unknown[] = [transferCall]
    const { results } = await Actions.multicall(client, {
      calls,
      mode: 'simulate',
    })

    expect(results.map(({ status }) => status)).toMatchInlineSnapshot(`
      [
        "success",
      ]
    `)
  })
})
