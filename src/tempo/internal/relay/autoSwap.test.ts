import { Secp256k1 } from 'ox'
import { parseUnits } from 'viem'
import { sendTransactionSync } from 'viem/actions'
import { Account, Actions, Relay, Tick } from 'viem/tempo'
import { beforeAll, expect, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'

const maker = Tempo.getClient({ account: Tempo.accounts[0] })
const recipient = Tempo.accounts[7]!.address
/** Holds only the quote token and the faucet's fee tokens. */
const payer = Account.fromSecp256k1(Secp256k1.randomPrivateKey())
/** Holds 2.05 of the quote token: enough for a 2.002 quote, short of a 5% ceiling of 2.1. */
const tight = Account.fromSecp256k1(Secp256k1.randomPrivateKey())

let base: `0x${string}`
let quote: `0x${string}`

beforeAll(async () => {
  const pair = await Tempo.setupTokenPair(maker)
  base = pair.base
  quote = pair.quote
  await Actions.faucet.fundSync(maker, { account: payer, timeout: 60_000 })
  await Actions.faucet.fundSync(maker, { account: tight, timeout: 60_000 })
  await sendTransactionSync(maker, {
    calls: [
      Actions.token.transfer.call(maker, {
        amount: parseUnits('10', 6),
        to: payer.address,
        token: quote,
      }),
      Actions.token.transfer.call(maker, {
        amount: parseUnits('2.05', 6),
        to: tight.address,
        token: quote,
      }),
    ],
  })
  await Actions.dex.placeSync(maker, {
    amount: parseUnits('500', 6),
    tick: Tick.fromPrice('1.001'),
    token: base,
    type: 'sell',
  })
}, 60_000)

test('buys a missing token and previews every leg', async () => {
  const relay = Relay.create({
    client: maker,
    plugins: [Relay.feeToken(), Relay.simulate(), Relay.autoSwap()],
    resolveTokens: () => [quote],
  })

  const { capabilities, tx } = (await relay.request({
    method: 'eth_fillTransaction',
    params: [
      {
        calls: [transfer(parseUnits('2', 6))],
        capabilities: { autoSwap: true, balanceDiffs: true },
        from: payer.address,
      },
    ],
  })) as Relay.Plugin.FillResult

  expect(
    (tx.calls as readonly { to: string }[]).map(({ to }) => label(to)),
  ).toMatchInlineSnapshot(`
      [
        "0xdec0000000000000000000000000000000000000",
        "0x<base>",
      ]
    `)
  const { balanceDiffs, autoSwap } = capabilities as Record<string, unknown>
  expect(label({ autoSwap, balanceDiffs })).toMatchInlineSnapshot(`
    {
      "autoSwap": {
        "calls": [
          {
            "data": "0xf0122b75000000000000000000000000<quote>000000000000000000000000<base>00000000000000000000000000000000000000000000000000000000001e84800000000000000000000000000000000000000000000000000000000000200b20",
            "to": "0xdec0000000000000000000000000000000000000",
          },
        ],
        "maxIn": {
          "decimals": 6,
          "formatted": "2.1",
          "name": "Test Quote Token",
          "symbol": "QUOTE",
          "token": "0x<quote>",
          "value": "0x200b20",
        },
        "minOut": {
          "decimals": 6,
          "formatted": "2",
          "name": "Test Base Token",
          "symbol": "BASE",
          "token": "0x<base>",
          "value": "0x1e8480",
        },
        "slippage": 0.05,
      },
      "balanceDiffs": {
        "0x<payer>": [
          {
            "address": "0x<quote>",
            "decimals": 6,
            "direction": "outgoing",
            "formatted": "2.002",
            "name": "Test Quote Token",
            "recipients": [
              "0xDEc0000000000000000000000000000000000000",
            ],
            "symbol": "QUOTE",
            "value": "0x1e8c50",
          },
          {
            "address": "0x<base>",
            "decimals": 6,
            "direction": "incoming",
            "formatted": "2",
            "name": "Test Base Token",
            "recipients": [],
            "symbol": "BASE",
            "value": "0x1e8480",
          },
          {
            "address": "0x<base>",
            "decimals": 6,
            "direction": "outgoing",
            "formatted": "2",
            "name": "Test Base Token",
            "recipients": [
              "0x<recipient>",
            ],
            "symbol": "BASE",
            "value": "0x1e8480",
          },
        ],
      },
    }
  `)
})

test('applies the configured slippage', async () => {
  const relay = Relay.create({
    client: maker,
    plugins: [
      Relay.feeToken(),
      Relay.simulate(),
      Relay.autoSwap({ slippage: 0.02 }),
    ],
    resolveTokens: () => [quote],
  })

  const { capabilities } = (await relay.request({
    method: 'eth_fillTransaction',
    params: [
      {
        calls: [transfer(parseUnits('2', 6))],
        capabilities: { autoSwap: true },
        from: payer.address,
      },
    ],
  })) as Relay.Plugin.FillResult

  const { maxIn, slippage } = capabilities?.autoSwap as {
    maxIn: { formatted: string }
    slippage: number
  }
  expect({ maxIn: maxIn.formatted, slippage }).toMatchInlineSnapshot(`
    {
      "maxIn": "2.04",
      "slippage": 0.02,
    }
  `)
})

test('never rounds the slippage bound up', async () => {
  const relay = Relay.create({
    client: maker,
    plugins: [
      Relay.feeToken(),
      Relay.simulate(),
      Relay.autoSwap({ slippage: 0.0015 }),
    ],
    resolveTokens: () => [quote],
  })

  const { capabilities } = (await relay.request({
    method: 'eth_fillTransaction',
    params: [
      {
        calls: [transfer(parseUnits('2', 6))],
        capabilities: { autoSwap: true },
        from: payer.address,
      },
    ],
  })) as Relay.Plugin.FillResult

  const { maxIn } = capabilities?.autoSwap as { maxIn: { formatted: string } }
  expect(maxIn.formatted).toMatchInlineSnapshot(`"2.003"`)
})

test('swaps from a balance that covers the quote but not the slippage bound', async () => {
  const relay = Relay.create({
    client: maker,
    plugins: [Relay.feeToken(), Relay.simulate(), Relay.autoSwap()],
    resolveTokens: () => [quote],
  })

  const { capabilities } = (await relay.request({
    method: 'eth_fillTransaction',
    params: [
      {
        calls: [transfer(parseUnits('2', 6))],
        capabilities: { autoSwap: true },
        from: tight.address,
      },
    ],
  })) as Relay.Plugin.FillResult

  const { maxIn, minOut } = capabilities?.autoSwap as {
    maxIn: { formatted: string }
    minOut: { formatted: string }
  }
  expect({
    maxIn: maxIn.formatted,
    minOut: minOut.formatted,
  }).toMatchInlineSnapshot(`
    {
      "maxIn": "2.1",
      "minOut": "2",
    }
  `)
})

test('reports the missing funds when no funded token has a route', async () => {
  const relay = Relay.create({
    client: maker,
    plugins: [Relay.feeToken(), Relay.simulate(), Relay.autoSwap()],
    resolveTokens: () => [quote],
  })

  const { capabilities } = (await relay.request({
    method: 'eth_fillTransaction',
    params: [
      {
        calls: [transfer(parseUnits('1000', 6))],
        capabilities: { autoSwap: true, errors: true },
        from: payer.address,
      },
    ],
  })) as Relay.Plugin.FillResult

  const { autoSwap, error, insufficientFunds } = capabilities as Record<
    string,
    { errorName?: string | undefined } | undefined
  >
  expect(autoSwap).toBeUndefined()
  expect(error?.errorName).toMatchInlineSnapshot(`"InsufficientBalance"`)
  expect(label(insufficientFunds)).toMatchInlineSnapshot(`
    {
      "amount": "0x3b9aca00",
      "decimals": 6,
      "formatted": "1000",
      "symbol": "BASE",
      "token": "0x<base>",
    }
  `)
})

test('leaves the revert alone without an opt-in', async () => {
  const relay = Relay.create({
    client: maker,
    plugins: [Relay.feeToken(), Relay.simulate(), Relay.autoSwap()],
    resolveTokens: () => [quote],
  })

  const { capabilities } = (await relay.request({
    method: 'eth_fillTransaction',
    params: [
      {
        calls: [transfer(parseUnits('2', 6))],
        capabilities: { errors: true },
        from: payer.address,
      },
    ],
  })) as Relay.Plugin.FillResult

  const { autoSwap, error } = capabilities as Record<
    string,
    { errorName?: string | undefined } | undefined
  >
  expect(autoSwap).toBeUndefined()
  expect(error?.errorName).toMatchInlineSnapshot(`"InsufficientBalance"`)
})

test.each([
  { configured: 0.05, maxIn: '2.02', requested: 0.01, slippage: 0.01 },
  { configured: 0.02, maxIn: '2.04', requested: 0.1, slippage: 0.02 },
])(
  'requests tighten but never loosen the bound: $configured, $requested',
  async ({ configured, maxIn: expected, requested, slippage: bound }) => {
    const relay = Relay.create({
      client: maker,
      plugins: [
        Relay.feeToken(),
        Relay.simulate(),
        Relay.autoSwap({ slippage: configured }),
      ],
      resolveTokens: () => [quote],
    })

    const { capabilities } = (await relay.request({
      method: 'eth_fillTransaction',
      params: [
        {
          calls: [transfer(parseUnits('2', 6))],
          capabilities: { autoSwap: { slippage: requested } },
          from: payer.address,
        },
      ],
    })) as Relay.Plugin.FillResult

    const { maxIn, slippage } = capabilities?.autoSwap as {
      maxIn: { formatted: string }
      slippage: number
    }
    expect({ maxIn: maxIn.formatted, slippage }).toEqual({
      maxIn: expected,
      slippage: bound,
    })
  },
)

test('error: rejects a requested slippage outside 0 and 1', async () => {
  const relay = Relay.create({
    client: maker,
    plugins: [Relay.feeToken(), Relay.simulate(), Relay.autoSwap()],
    resolveTokens: () => [quote],
  })

  await expect(
    relay.request({
      method: 'eth_fillTransaction',
      params: [
        {
          calls: [transfer(parseUnits('2', 6))],
          capabilities: { autoSwap: { slippage: 2 } },
          from: payer.address,
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[RpcResponse.InvalidParamsError: Expected \`capabilities.autoSwap.slippage\` between 0 and 1.]`,
  )
})

test('error: rejects slippage outside 0 and 1', () => {
  expect(() =>
    Relay.autoSwap({ slippage: 1.5 }),
  ).toThrowErrorMatchingInlineSnapshot(
    `[RangeError: Expected \`slippage\` between 0 and 1.]`,
  )
})

/** Encodes a base-token transfer to the recipient. */
function transfer(amount: bigint) {
  const { data, to } = Actions.token.transfer.call(maker, {
    amount,
    to: recipient,
    token: base,
  })
  return { data, to }
}

/** Replaces run-specific addresses with labels. */
function label(value: unknown) {
  const labels = { base, payer: payer.address, quote, recipient }
  const json = Object.entries(labels).reduce(
    (json, [name, address]) =>
      json.replace(new RegExp(address.slice(2), 'gi'), `<${name}>`),
    JSON.stringify(value),
  )
  return JSON.parse(json) as unknown
}
