import { describe, expect, test } from 'vitest'
import {
  accounts,
  addresses,
  chain,
  feeToken,
  getClient,
  setupFeeToken,
  setupTokenPair,
} from '~test/tempo/config.js'
import { parseUnits } from '../../utils/index.js'
import { Addresses, Tick } from '../index.js'
import * as actions from './index.js'

const account = accounts[0]

const client = getClient({
  account,
  chain: chain.extend({ feeToken }),
})

describe('simulateBlocks', () => {
  test('default', async () => {
    const result = await actions.simulate.simulateBlocks(client, {
      blocks: [
        {
          calls: [
            actions.token.getBalance.call({
              token: addresses.alphaUsd,
              account: account.address,
            }),
          ],
        },
      ],
    })

    const call = result.blocks[0].calls[0]
    const { data: _data, result: _result, ...callWithoutDynamic } = call

    expect({
      calls: [callWithoutDynamic],
      tokenMetadata: result.tokenMetadata,
    }).toMatchInlineSnapshot(`
      {
        "calls": [
          {
            "gasUsed": 22080n,
            "logs": [],
            "status": "success",
          },
        ],
        "tokenMetadata": {
          "0x20c0000000000000000000000000000000000001": {
            "currency": "USD",
            "name": "AlphaUSD",
            "symbol": "AlphaUSD",
          },
        },
      }
    `)

    expect(call.data).toBeTypeOf('string')
    expect(call.result).toBeTypeOf('bigint')
  })

  test('behavior: tip20 transfer', async () => {
    const result = await actions.simulate.simulateBlocks(client, {
      blocks: [
        {
          calls: [
            actions.token.transfer.call({
              token: addresses.alphaUsd,
              to: accounts[1].address,
              amount: parseUnits('1', 6),
            }),
          ],
        },
      ],
    })

    const call = result.blocks[0].calls[0]
    const { data: _, ...callWithoutData } = call
    const log = call.logs![0]

    expect({
      ...callWithoutData,
      logs: callWithoutData.logs?.map(
        ({ blockHash, blockNumber, blockTimestamp, ...l }) => l,
      ),
    }).toMatchInlineSnapshot(`
      {
        "gasUsed": 297770n,
        "logs": [
          {
            "address": "0x20c0000000000000000000000000000000000001",
            "data": "0x00000000000000000000000000000000000000000000000000000000000f4240",
            "logIndex": 0,
            "removed": false,
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
              "0x0000000000000000000000008c8d35429f74ec245f8ef2f4fd1e551cff97d650",
            ],
            "transactionHash": "0x1cf44b23d9c272c374ae0e2539b96673f0bf2e07a17afc696e4e3a4e256b7cef",
            "transactionIndex": 0,
          },
        ],
        "result": true,
        "status": "success",
      }
    `)

    expect(log.blockHash).toBeDefined()
    expect(log.blockNumber).toBeTypeOf('bigint')
    expect(log.blockTimestamp).toBeTypeOf('bigint')

    expect(result.tokenMetadata).toMatchInlineSnapshot(`
      {
        "0x20c0000000000000000000000000000000000001": {
          "currency": "USD",
          "name": "AlphaUSD",
          "symbol": "AlphaUSD",
        },
      }
    `)
  })

  test('behavior: tokenMetadata', async () => {
    const result = await actions.simulate.simulateBlocks(client, {
      blocks: [
        {
          calls: [
            actions.token.transfer.call({
              token: addresses.alphaUsd,
              to: accounts[1].address,
              amount: parseUnits('1', 6),
            }),
          ],
        },
      ],
      traceTransfers: true,
    })

    expect(result.tokenMetadata).toMatchInlineSnapshot(`
      {
        "0x20c0000000000000000000000000000000000001": {
          "currency": "USD",
          "name": "AlphaUSD",
          "symbol": "AlphaUSD",
        },
      }
    `)
  })

  test('behavior: multiple blocks', async () => {
    const result = await actions.simulate.simulateBlocks(client, {
      blocks: [
        {
          calls: [
            actions.token.transfer.call({
              token: addresses.alphaUsd,
              to: accounts[1].address,
              amount: parseUnits('1', 6),
            }),
          ],
        },
        {
          calls: [
            actions.token.transfer.call({
              token: addresses.alphaUsd,
              to: accounts[2].address,
              amount: parseUnits('2', 6),
            }),
          ],
        },
      ],
    })

    expect(result.blocks.map((b) => b.calls[0].status)).toMatchInlineSnapshot(`
      [
        "success",
        "success",
      ]
    `)
  })

  test('behavior: failed call', async () => {
    const result = await actions.simulate.simulateBlocks(client, {
      blocks: [
        {
          calls: [
            {
              account: accounts[1].address,
              ...actions.token.transfer.call({
                token: addresses.alphaUsd,
                to: accounts[2].address,
                amount: parseUnits('999999999999', 6),
              }),
            },
          ],
        },
      ],
    })

    expect({
      status: result.blocks[0].calls[0].status,
      hasError: !!result.blocks[0].calls[0].error,
    }).toMatchInlineSnapshot(`
      {
        "hasError": true,
        "status": "failure",
      }
    `)
  })

  test('behavior: stateOverrides', async () => {
    const result = await actions.simulate.simulateBlocks(client, {
      blocks: [
        {
          calls: [
            actions.token.getBalance.call({
              token: addresses.alphaUsd,
              account: account.address,
            }),
          ],
          stateOverrides: [
            {
              address: account.address,
              balance: 0n,
            },
          ],
        },
      ],
    })

    expect({
      status: result.blocks[0].calls[0].status,
      resultType: typeof result.blocks[0].calls[0].result,
    }).toMatchInlineSnapshot(`
      {
        "resultType": "bigint",
        "status": "success",
      }
    `)
  })

  test('behavior: abi decoding', async () => {
    const result = await actions.simulate.simulateBlocks(client, {
      blocks: [
        {
          calls: [
            actions.token.getBalance.call({
              token: addresses.alphaUsd,
              account: account.address,
            }),
          ],
        },
      ],
    })

    expect({
      status: result.blocks[0].calls[0].status,
      resultType: typeof result.blocks[0].calls[0].result,
    }).toMatchInlineSnapshot(`
      {
        "resultType": "bigint",
        "status": "success",
      }
    `)
  })
})

describe('simulateCalls', () => {
  test('default', async () => {
    const result = await actions.simulate.simulateCalls(client, {
      calls: [
        actions.token.getBalance.call({
          token: addresses.alphaUsd,
          account: account.address,
        }),
        actions.token.getBalance.call({
          token: addresses.pathUsd,
          account: account.address,
        }),
      ],
    })

    expect({
      statuses: result.results.map((r) => r.status),
      resultTypes: result.results.map((r) => typeof r.result),
      hasBlock: !!result.block,
      tokenMetadata: result.tokenMetadata,
    }).toMatchInlineSnapshot(`
      {
        "hasBlock": true,
        "resultTypes": [
          "bigint",
          "bigint",
        ],
        "statuses": [
          "success",
          "success",
        ],
        "tokenMetadata": {
          "0x20c0000000000000000000000000000000000000": {
            "currency": "USD",
            "name": "pathUSD",
            "symbol": "pathUSD",
          },
          "0x20c0000000000000000000000000000000000001": {
            "currency": "USD",
            "name": "AlphaUSD",
            "symbol": "AlphaUSD",
          },
        },
      }
    `)
  })

  test('behavior: account sets from', async () => {
    const { results } = await actions.simulate.simulateCalls(client, {
      calls: [
        actions.token.transfer.call({
          token: addresses.alphaUsd,
          to: accounts[1].address,
          amount: parseUnits('1', 6),
        }),
      ],
    })

    expect({
      status: results[0].status,
      result: results[0].result,
    }).toMatchInlineSnapshot(`
      {
        "result": true,
        "status": "success",
      }
    `)
  })

  test('behavior: tokenMetadata passthrough', async () => {
    const result = await actions.simulate.simulateCalls(client, {
      calls: [
        actions.token.transfer.call({
          token: addresses.alphaUsd,
          to: accounts[1].address,
          amount: parseUnits('1', 6),
        }),
      ],
      traceTransfers: true,
    })

    expect(result.tokenMetadata).toMatchInlineSnapshot(`
      {
        "0x20c0000000000000000000000000000000000001": {
          "currency": "USD",
          "name": "AlphaUSD",
          "symbol": "AlphaUSD",
        },
      }
    `)
  })

  test('behavior: stateOverrides', async () => {
    const { results } = await actions.simulate.simulateCalls(client, {
      calls: [
        actions.token.getBalance.call({
          token: addresses.alphaUsd,
          account: account.address,
        }),
      ],
      stateOverrides: [
        {
          address: account.address,
          balance: 0n,
        },
      ],
    })

    expect({
      status: results[0].status,
      resultType: typeof results[0].result,
    }).toMatchInlineSnapshot(`
      {
        "resultType": "bigint",
        "status": "success",
      }
    `)
  })

  test('behavior: approve + dex swap + transfer', async () => {
    // Set up token pair + liquidity on-chain
    const { base, quote } = await setupTokenPair(client as never)

    // Place sell order so there's liquidity to buy against
    await actions.dex.placeSync(client, {
      token: base,
      amount: parseUnits('500', 6),
      type: 'sell',
      tick: Tick.fromPrice('1.001'),
    })

    const buyAmount = parseUnits('10', 6)

    // Simulate: approve DEX → buy → transfer out
    const result = await actions.simulate.simulateCalls(client, {
      calls: [
        // 1. approve stablecoin DEX to spend quote token
        actions.token.approve.call({
          token: quote,
          spender: Addresses.stablecoinDex,
          amount: parseUnits('100', 6),
        }),
        // 2. buy base tokens with quote tokens
        actions.dex.buy.call({
          tokenIn: quote,
          tokenOut: base,
          amountOut: buyAmount,
          maxAmountIn: parseUnits('100', 6),
        }),
        // 3. transfer bought tokens to another account
        actions.token.transfer.call({
          token: base,
          to: accounts[1].address,
          amount: buyAmount,
        }),
      ],
      traceTransfers: true,
    })

    expect({
      statuses: result.results.map((r) => r.status),
      results: result.results.map((r) => r.result),
    }).toMatchInlineSnapshot(`
      {
        "results": [
          true,
          10010000n,
          true,
        ],
        "statuses": [
          "success",
          "success",
          "success",
        ],
      }
    `)
  })

  test('behavior: balance diff across approve + dex swap + transfer', async () => {
    const seller = accounts[2]
    const sellerClient = getClient({
      account: seller,
      chain: chain.extend({ feeToken }),
    })

    // Fund seller with fee tokens for gas
    await setupFeeToken(client, { account: seller })

    // Set up token pair + liquidity on-chain
    const { base, quote } = await setupTokenPair(client as never)

    // Fund seller with base tokens and approve DEX
    await actions.token.transferSync(client, {
      token: base,
      to: seller.address,
      amount: parseUnits('500', 6),
    })
    await actions.token.approveSync(sellerClient, {
      token: base,
      spender: Addresses.stablecoinDex,
      amount: parseUnits('500', 6),
    })

    // Seller places sell order so there's liquidity to buy against
    await actions.dex.placeSync(sellerClient, {
      token: base,
      amount: parseUnits('500', 6),
      type: 'sell',
      tick: Tick.fromPrice('1.001'),
    })

    const buyAmount = parseUnits('10', 6)

    // Get balances before
    const [senderBaseBefore, senderQuoteBefore, recipientBaseBefore] =
      await Promise.all([
        actions.token.getBalance(client, {
          token: base,
          account: account.address,
        }),
        actions.token.getBalance(client, {
          token: quote,
          account: account.address,
        }),
        actions.token.getBalance(client, {
          token: base,
          account: accounts[1].address,
        }),
      ])

    // Execute: approve DEX → buy → transfer out
    await actions.token.approveSync(client, {
      token: quote,
      spender: Addresses.stablecoinDex,
      amount: parseUnits('100', 6),
    })

    await actions.dex.buySync(client, {
      tokenIn: quote,
      tokenOut: base,
      amountOut: buyAmount,
      maxAmountIn: parseUnits('100', 6),
    })

    await actions.token.transferSync(client, {
      token: base,
      to: accounts[1].address,
      amount: buyAmount,
    })

    // Get balances after
    const [senderBaseAfter, senderQuoteAfter, recipientBaseAfter] =
      await Promise.all([
        actions.token.getBalance(client, {
          token: base,
          account: account.address,
        }),
        actions.token.getBalance(client, {
          token: quote,
          account: account.address,
        }),
        actions.token.getBalance(client, {
          token: base,
          account: accounts[1].address,
        }),
      ])

    // Sender's base balance should be unchanged (bought and then transferred out)
    expect(senderBaseAfter).toBe(senderBaseBefore)

    // Sender's quote balance should have decreased (spent on buy)
    expect(senderQuoteAfter).toBeLessThan(senderQuoteBefore)

    // Recipient's base balance should have increased by buyAmount
    expect(recipientBaseAfter - recipientBaseBefore).toBe(buyAmount)
  })

  test('behavior: multiple getBalance reads', async () => {
    const result = await actions.simulate.simulateCalls(client, {
      calls: [
        actions.token.getBalance.call({
          token: addresses.alphaUsd,
          account: account.address,
        }),
        actions.token.getBalance.call({
          token: addresses.alphaUsd,
          account: accounts[1].address,
        }),
        actions.token.getBalance.call({
          token: addresses.pathUsd,
          account: account.address,
        }),
      ],
    })

    expect({
      statuses: result.results.map((r) => r.status),
      resultTypes: result.results.map((r) => typeof r.result),
    }).toMatchInlineSnapshot(`
      {
        "resultTypes": [
          "bigint",
          "bigint",
          "bigint",
        ],
        "statuses": [
          "success",
          "success",
          "success",
        ],
      }
    `)
  })
})
