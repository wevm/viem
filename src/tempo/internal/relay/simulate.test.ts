import type { Capabilities as TempoCapabilities_ } from 'viem/tempo'
import { http as tempoHttp_ } from 'viem/tempo'
import { AbiEvent } from 'ox'
import { Client as CoreClient_ } from 'viem'
import { encode as encodeAbiParameters } from 'ox/AbiParameters'
import type { Log } from 'ox/Log'
import { from as parseUnits } from 'ox/Value'
import { Actions as CoreActions_ } from 'viem'
import { tempoLocalnet as chain_ } from 'viem/chains'
import { Account as TempoAccount_ } from 'viem/tempo'
import { createRequestListener } from '@remix-run/node-fetch-server'
import { Hex } from 'ox'
import { http } from 'viem'

import { tempoLocalnet } from 'viem/chains'
import { Abis, Actions, Relay, Store, withRelay } from 'viem/tempo'
import { beforeAll, describe, expect, onTestFinished, test } from 'vitest'
import * as Tempo from '~test/tempo.js'
import { createServer as createHttpServer } from '~test/http.js'
import * as Cache from './cache.js'
import { buildBalanceDiffs } from './simulate.js'

const userAccount = TempoAccount_.fromSecp256k1(Tempo.accounts[9]!.privateKey)
const recipient = TempoAccount_.fromSecp256k1(Tempo.accounts[7]!.privateKey)

const caller = Tempo.getClient({})

beforeAll(async () => {
  await Actions.faucet.fundSync(caller, {
    account: userAccount,
    timeout: 60_000,
  })
})

test('returns fees and balance changes without executing the transfer', async () => {
  const client = CoreClient_.create({
    chain: chain_,
    transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
      plugins: [Relay.simulate()],
    }),
  })
  const before = await Actions.token.getBalance(caller, {
    account: recipient.address,
    token: Tempo.alphaUsd,
  })
  const { capabilities } = await CoreActions_.transaction.fill(client, {
    account: userAccount.address,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
    feeToken: Tempo.alphaUsd,
  })
  expect(
    (capabilities as TempoCapabilities_.FillTransactionCapabilities | undefined)
      ?.fee?.symbol,
  ).toBe('AlphaUSD')
  expect(
    Object.values(
      (
        capabilities as
          | TempoCapabilities_.FillTransactionCapabilities
          | undefined
      )?.balanceDiffs ?? {},
    ).flat(),
  ).toMatchObject([
    {
      address: Tempo.alphaUsd,
      direction: 'outgoing',
      value: '0x1',
    },
  ])
  expect(
    await Actions.token.getBalance(caller, {
      account: recipient.address,
      token: Tempo.alphaUsd,
    }),
  ).toEqual(before)
})

test.each([50n, 200n])(
  'retains approval exposure after a direct transfer of %s',
  async (amount) => {
    const client = CoreClient_.create({
      chain: chain_,
      transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
        plugins: [Relay.simulate()],
      }),
    })
    const { capabilities } = await CoreActions_.transaction.fill(client, {
      account: userAccount.address,
      feeToken: Tempo.alphaUsd,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.alphaUsd,
          to: recipient.address,
          amount,
        }),
        Actions.token.approve.call(caller, {
          token: Tempo.alphaUsd,
          spender: recipient.address,
          amount: 200n,
        }),
      ],
    })
    expect(
      Object.values(
        (
          capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.balanceDiffs ?? {},
      ).flat(),
    ).toMatchObject([
      {
        address: Tempo.alphaUsd,
        direction: 'outgoing',
        value: amount === 50n ? '0xfa' : '0x190',
      },
    ])
  },
)

test.each([
  { amounts: [100n, 200n], value: '0xc8' },
  { amounts: [200n, 100n], value: '0x64' },
  { amounts: [200n, 0n], value: undefined },
  { amounts: [0n, 200n], value: '0xc8' },
])('reports final approval exposure: $amounts', async ({ amounts, value }) => {
  const client = CoreClient_.create({
    chain: chain_,
    transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
      plugins: [Relay.simulate()],
    }),
  })
  const { capabilities } = await CoreActions_.transaction.fill(client, {
    account: userAccount.address,
    feeToken: Tempo.alphaUsd,
    calls: amounts.map((amount) =>
      Actions.token.approve.call(caller, {
        token: Tempo.alphaUsd,
        spender: recipient.address,
        amount,
      }),
    ),
  })
  const diffs = Object.values(
    (capabilities as TempoCapabilities_.FillTransactionCapabilities | undefined)
      ?.balanceDiffs ?? {},
  ).flat()
  if (value === undefined) expect(diffs).toEqual([])
  else
    expect(diffs).toMatchObject([
      {
        address: Tempo.alphaUsd,
        direction: 'outgoing',
        recipients: [recipient.address],
        value,
      },
    ])
})

test('keeps replacement approvals separate across tokens and spenders', async () => {
  const client = CoreClient_.create({
    chain: chain_,
    transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
      plugins: [Relay.simulate()],
    }),
  })
  const { capabilities } = await CoreActions_.transaction.fill(client, {
    account: userAccount.address,
    feeToken: Tempo.alphaUsd,
    calls: [
      Actions.token.approve.call(caller, {
        token: Tempo.alphaUsd,
        spender: recipient.address,
        amount: 100n,
      }),
      Actions.token.approve.call(caller, {
        token: Tempo.pathUsd,
        spender: recipient.address,
        amount: 400n,
      }),
      Actions.token.approve.call(caller, {
        token: Tempo.alphaUsd,
        spender: TempoAccount_.fromSecp256k1(Tempo.accounts[6]!.privateKey)
          .address,
        amount: 300n,
      }),
      Actions.token.approve.call(caller, {
        token: Tempo.alphaUsd,
        spender: recipient.address,
        amount: 200n,
      }),
      Actions.token.transfer.call(caller, {
        token: Tempo.alphaUsd,
        to: recipient.address,
        amount: 50n,
      }),
    ],
  })
  expect(
    Object.values(
      (
        capabilities as
          | TempoCapabilities_.FillTransactionCapabilities
          | undefined
      )?.balanceDiffs ?? {},
    ).flat(),
  ).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        address: Tempo.alphaUsd,
        direction: 'outgoing',
        value: '0x226',
      }),
      expect.objectContaining({
        address: Tempo.pathUsd,
        direction: 'outgoing',
        value: '0x190',
      }),
    ]),
  )
})

test.each([
  { gas: 1_000_000n, amount: '0x1', formatted: '0.000001' },
  { gas: 1_000_001n, amount: '0x2', formatted: '0.000002' },
])('rounds the reported fee up: $gas', async ({ gas, amount, formatted }) => {
  const client = CoreClient_.create({
    chain: chain_,
    transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
      plugins: [
        Relay.simulate(),
        Relay.feePayer({
          account: TempoAccount_.fromSecp256k1(Tempo.accounts[0]!.privateKey),
          feeToken: Tempo.alphaUsd,
        }),
      ],
    }),
  })
  const { capabilities } = await CoreActions_.transaction.fill(client, {
    account: userAccount.address,
    feePayer: true,
    feeToken: Tempo.alphaUsd,
    gas,
    nonce: 0,
    maxFeePerGas: 1_000_000n,
    maxPriorityFeePerGas: 0n,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  expect(
    (capabilities as TempoCapabilities_.FillTransactionCapabilities | undefined)
      ?.fee,
  ).toMatchObject({ amount, formatted })
})

test.each([undefined, false])(
  'returns transfer capabilities through Fetch, balanceDiffs: %s',
  async (balanceDiffs) => {
    const relay = Relay.create({ client: caller, plugins: [Relay.simulate()] })
    const response = await relay.fetch(
      new Request('https://relay.example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_fillTransaction',
          params: [
            {
              from: userAccount.address,
              feeToken: Tempo.alphaUsd,
              calls: [
                {
                  to: Tempo.alphaUsd,
                  value: '0x0',
                  data: Actions.token.transfer.call(caller, {
                    token: Tempo.alphaUsd,
                    to: recipient.address,
                    amount: parseUnits('100', 6),
                  }).data,
                },
              ],
              capabilities: { balanceDiffs },
            },
          ],
        }),
      }),
    )
    const { result, error } = await response.json()
    expect(error).toBeUndefined()
    expect(result.capabilities.fee).toMatchObject({
      decimals: 6,
      symbol: 'AlphaUSD',
    })
    expect(BigInt(result.capabilities.fee.amount)).toBeGreaterThan(0n)
    expect(Number(result.capabilities.fee.formatted)).toBeGreaterThan(0)
    if (balanceDiffs === false)
      expect(result.capabilities.balanceDiffs).toBeUndefined()
    else
      expect(result.capabilities.balanceDiffs[userAccount.address]).toEqual([
        {
          address: Tempo.alphaUsd,
          decimals: 6,
          direction: 'outgoing',
          formatted: '100',
          name: 'AlphaUSD',
          recipients: [recipient.address],
          symbol: 'AlphaUSD',
          value: '0x5f5e100',
        },
      ])
  },
)

test('reports the exact deficit for a partially funded transfer', async () => {
  const { token } = await Actions.token.createSync(caller, {
    account: userAccount,
    admin: userAccount.address,
    name: 'Deficit USD',
    symbol: 'DEF',
    currency: 'USD',
    quoteToken: Tempo.alphaUsd,
  })
  await Actions.token.grantRolesSync(caller, {
    account: userAccount,
    token,
    roles: ['issuer'],
    to: userAccount.address,
  })
  await Actions.token.mintSync(caller, {
    account: userAccount,
    token,
    to: userAccount.address,
    amount: parseUnits('40', 6),
  })
  const relay = Relay.create({ client: caller, plugins: [Relay.simulate()] })
  for (const errors of [undefined, false, true]) {
    const response = await relay.fetch(
      new Request('https://relay.example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_fillTransaction',
          params: [
            {
              from: userAccount.address,
              feeToken: Tempo.alphaUsd,
              calls: [
                {
                  to: token,
                  value: '0x0',
                  data: Actions.token.transfer.call(caller, {
                    token,
                    to: recipient.address,
                    amount: parseUnits('100', 6),
                  }).data,
                },
              ],
              capabilities: { errors },
            },
          ],
        }),
      }),
    )
    const { result, error } = await response.json()
    if (!errors) {
      expect(result).toBeUndefined()
      expect(error).toMatchObject({ code: 3 })
      continue
    }
    expect(error).toBeUndefined()
    expect(result.capabilities.error.errorName).toBe('InsufficientBalance')
    const { token: deficitToken, ...insufficientFunds } =
      result.capabilities.insufficientFunds
    expect(deficitToken.toLowerCase()).toBe(token.toLowerCase())
    expect(insufficientFunds).toMatchInlineSnapshot(`
      {
        "amount": "0x3938700",
        "decimals": 6,
        "formatted": "60",
        "symbol": "DEF",
      }
    `)
  }
  expect(
    (
      await Actions.token.getBalance(caller, {
        account: userAccount.address,
        token,
      })
    ).amount,
  ).toBe(parseUnits('40', 6))
})

describe('metadata', () => {
  const client = CoreClient_.create({ chain: tempoLocalnet, transport: http() })
  const account = '0x0000000000000000000000000000000000000001'
  const recipient = '0x0000000000000000000000000000000000000002'

  function transfer(index: number): Log<boolean> {
    return {
      address: Hex.fromNumber(index + 1000, { size: 20 }),
      blockHash: null,
      blockNumber: null,
      data: encodeAbiParameters([{ type: 'uint256' }], [1_000_000n]),
      logIndex: null,
      removed: false,
      topics: AbiEvent.encode(AbiEvent.fromAbi(Abis.tip20, 'Transfer'), {
        from: account,
        to: recipient,
      }).topics as Log<boolean>['topics'],
      transactionHash: null,
      transactionIndex: null,
    }
  }

  async function metadata(store: Store.Store, logs: readonly Log<boolean>[]) {
    for (const log of logs)
      await Cache.memoize(
        async () => ({ decimals: 6, name: 'Dollar', symbol: 'USD' }),
        {
          key: `tokenMetadata:${tempoLocalnet.id}:${log.address}`,
          store,
          ttl: 60_000,
        },
      )
  }

  test('uses simulation metadata for 100 TIP-20 tokens without RPC or cache reads', async () => {
    const logs = Array.from({ length: 100 }, (_, index) => ({
      ...transfer(index),
      address: `0x20c0${(index + 100).toString(16).padStart(36, '0')}` as const,
    }))
    let requests = 0
    const client = CoreClient_.create({
      chain: tempoLocalnet,
      transport: http('http://127.0.0.1:1', {
        retryCount: 0,
        onFetchRequest() {
          requests++
        },
      }),
    })
    const result = await buildBalanceDiffs(client, {
      account,
      logs,
      tokenMetadata: Object.fromEntries(
        logs.map((log) => [
          log.address,
          {
            name: 'Dollar',
            symbol: 'USD',
            currency: 'USD',
          },
        ]),
      ),
    })
    expect(requests).toBe(0)
    expect(result?.[account]).toHaveLength(100)
    expect(result?.[account]?.[0]).toMatchObject({
      decimals: 6,
      formatted: '1',
      name: 'Dollar',
      symbol: 'USD',
    })
  })

  test('omits the entire preview when its token count exceeds the budget', async () => {
    const store = Store.memory()
    const logs = Array.from({ length: 101 }, (_, i) => transfer(i))
    await metadata(store, logs)
    expect(
      await buildBalanceDiffs(client, {
        account,
        logs,
        store,
        tokenMetadata: {},
      }),
    ).toMatchInlineSnapshot('undefined')
  })

  test('resolves token metadata within the store concurrency budget', async () => {
    const memory = Store.memory()
    const logs = Array.from({ length: 30 }, (_, i) => transfer(i))
    await metadata(memory, logs)
    const active = new Set<symbol>()
    const store: Store.Store = {
      ...memory,
      async getItem(key) {
        const slot = Symbol()
        active.add(slot)
        try {
          if (active.size > 10) throw new Error('Store concurrency exceeded')
          // Keep reads pending together so exceeding the budget is observable.
          await new Promise((resolve) => setTimeout(resolve, 0))
          return await memory.getItem(key)
        } finally {
          active.delete(slot)
        }
      },
    }
    const result = await buildBalanceDiffs(client, {
      account,
      logs,
      store,
      tokenMetadata: {},
    })
    expect(result?.[account]).toEqual(
      logs.map((log) => ({
        address: log.address,
        decimals: 6,
        direction: 'outgoing',
        formatted: '1',
        name: 'Dollar',
        recipients: [recipient],
        symbol: 'USD',
        value: '0xf4240',
      })),
    )
  })

  test('omits balance diffs when one token has unavailable metadata', async () => {
    const memory = Store.memory()
    const logs = [transfer(0), transfer(1)]
    await metadata(memory, logs)
    const store: Store.Store = {
      ...memory,
      async getItem(key) {
        if (key.endsWith(logs[1]!.address)) throw new Error('Store unavailable')
        return memory.getItem(key)
      },
    }
    expect(
      await buildBalanceDiffs(client, {
        account,
        logs,
        store,
        tokenMetadata: {},
      }),
    ).toMatchInlineSnapshot('undefined')
  })
})

test.each([50n, 100n, 200n])(
  'keeps incoming funds separate from approval exposure: %s',
  async (amount) => {
    const logs = [
      {
        address: Tempo.alphaUsd,
        data: encodeAbiParameters([{ type: 'uint256' }], [amount]),
        topics: AbiEvent.encode(AbiEvent.fromAbi(Abis.tip20, 'Transfer'), {
          from: recipient.address,
          to: userAccount.address,
        }).topics,
      },
      {
        address: Tempo.alphaUsd,
        data: encodeAbiParameters([{ type: 'uint256' }], [100n]),
        topics: AbiEvent.encode(AbiEvent.fromAbi(Abis.tip20, 'Approval'), {
          owner: userAccount.address,
          spender: recipient.address,
        }).topics,
      },
    ] as const
    const result = await buildBalanceDiffs(caller, {
      account: userAccount.address,
      logs: logs.map((log) => ({
        ...log,
        topics: log.topics as Log<boolean>['topics'],
        blockHash: null,
        blockNumber: null,
        logIndex: null,
        transactionHash: null,
        transactionIndex: null,
        removed: false,
      })),
      tokenMetadata: {},
    })
    expect(result?.[userAccount.address]).toMatchObject([
      { direction: 'incoming', value: Hex.fromNumber(amount) },
      { direction: 'outgoing', value: '0x64', recipients: [recipient.address] },
    ])
  },
)

test.skipIf('localnet' !== 'localnet')(
  'plain HTTP transport: returns balance changes without executing the transaction',
  async () => {
    const relay = Relay.create({
      client: caller,
      plugins: [Relay.simulate()],
    })

    const server = await createHttpServer(createRequestListener(relay.fetch))
    onTestFinished(async () => {
      await server.close()
    })

    const client = Tempo.getClient({
      transport: http(server.url),
    })

    const token = Tempo.alphaUsd
    const balance = await Actions.token.getBalance(client, {
      account: recipient.address,
      token,
    })

    const result = await CoreActions_.transaction.fill(client, {
      account: userAccount.address,
      feeToken: token,
      calls: [
        Actions.token.transfer.call(client, {
          token,
          to: recipient.address,
          amount: 100n,
        }),
      ],
    })

    expect(
      Object.entries(
        (
          result.capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.balanceDiffs ?? {},
      ).find(
        ([address]) =>
          address.toLowerCase() === userAccount.address.toLowerCase(),
      )?.[1],
    ).toMatchObject([{ address: token, direction: 'outgoing', value: '0x64' }])

    expect(
      (
        result.capabilities as
          | TempoCapabilities_.FillTransactionCapabilities
          | undefined
      )?.fee,
    ).toMatchObject({
      decimals: 6,
      symbol: 'AlphaUSD',
    })

    expect(
      (
        await Actions.token.getBalance(client, {
          account: recipient.address,
          token,
        })
      ).amount,
    ).toBe(balance.amount)
  },
)
