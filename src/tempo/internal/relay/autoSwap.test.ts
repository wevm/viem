import { TxEnvelopeTempo } from 'ox/tempo'
import { type Address, createClient, parseUnits } from 'viem'
import {
  fillTransaction,
  sendRawTransactionSync,
  sendTransactionSync,
} from 'viem/actions'
import {
  Actions,
  Addresses,
  type Capabilities,
  Relay,
  Store,
  Tick,
  withRelay,
} from 'viem/tempo'
import { beforeAll, expect, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'

const userAccount = Tempo.accounts[9]!
const feePayerAccount = Tempo.accounts[0]!
const recipient = Tempo.accounts[7]!

const caller = Tempo.getClient({ chain: Tempo.chain })

beforeAll(async () => {
  await Promise.all(
    [0, 9].map((index) =>
      Actions.faucet.fundSync(Tempo.getClient({ chain: Tempo.chain }), {
        account: Tempo.accounts[index]!,
        timeout: 60_000,
      }),
    ),
  )
  // userAccount prefers alphaUsd (a faucet-funded genesis token) as its fee token.
  await Actions.fee.setUserTokenSync(caller, {
    account: userAccount,
    token: Tempo.addresses.alphaUsd,
  })
})

let token: Address

test.each([0n, parseUnits('5.25', 6), parseUnits('100', 6)])(
  'retains a user DEX approval after the injected swap: %s',
  async (amount) => {
    const client = createClient({
      chain: Tempo.chain,
      transport: withRelay(Tempo.http(), {
        plugins: [Relay.simulate(), Relay.autoSwap()],
      }),
    })
    const { capabilities } = await fillTransaction(client, {
      account: userAccount.address,
      feeToken: Tempo.addresses.alphaUsd,
      calls: [
        Actions.token.transfer.call(caller, {
          token,
          to: recipient.address,
          amount: parseUnits('5', 6),
        }),
        Actions.token.approve.call(caller, {
          token: Tempo.addresses.alphaUsd,
          spender: Addresses.stablecoinDex,
          amount,
        }),
      ],
    })
    expect(capabilities?.autoSwap).toBeDefined()
    const diffs = Object.values(
      (capabilities as Capabilities.FillTransactionCapabilities | undefined)
        ?.balanceDiffs ?? {},
    ).flat()
    const approval = diffs.find(
      (diff) => diff.address.toLowerCase() === Tempo.addresses.alphaUsd,
    )
    if (amount === 0n) expect(approval).toBeUndefined()
    else
      expect(approval).toEqual({
        address: Tempo.addresses.alphaUsd,
        decimals: 6,
        direction: 'outgoing',
        formatted: amount === parseUnits('5.25', 6) ? '5.25' : '100',
        name: 'AlphaUSD',
        recipients: [Addresses.stablecoinDex],
        symbol: 'AlphaUSD',
        value: `0x${amount.toString(16)}`,
      })
  },
)

beforeAll(async () => {
  const rpc = Tempo.getClient({
    chain: Tempo.chain,
    account: feePayerAccount,
  })
  ;({ token } = await Actions.token.createSync(rpc, {
    name: 'Plugin Swap',
    symbol: 'PLSWAP',
    currency: 'USD',
    quoteToken: Tempo.addresses.alphaUsd,
  }))
  await sendTransactionSync(rpc, {
    calls: [
      Actions.token.grantRoles.call(caller, {
        token,
        role: 'issuer',
        to: feePayerAccount.address,
      }),
      Actions.token.mint.call(caller, {
        token,
        to: feePayerAccount.address,
        amount: parseUnits('1000', 6),
      }),
      Actions.token.approve.call(caller, {
        token,
        spender: Addresses.stablecoinDex,
        amount: parseUnits('1000', 6),
      }),
    ],
  })
  await Actions.dex.createPairSync(rpc, { base: token })
  await Actions.dex.placeSync(rpc, {
    token,
    amount: parseUnits('500', 6),
    type: 'sell',
    tick: Tick.fromPrice('1.001'),
  })
})

test.each([
  'standalone',
  'feeToken',
  'feePayer + feeToken + simulate',
] as const)('fills an unfunded token transfer: %s', async (mode) => {
  const plugins = [
    ...(mode.includes('simulate') ? [Relay.simulate()] : []),
    Relay.autoSwap(),
    ...(mode.includes('feePayer')
      ? [Relay.feePayer({ account: feePayerAccount })]
      : []),
    ...(mode.includes('feeToken')
      ? [Relay.feeToken({ resolveTokens: () => [Tempo.addresses.alphaUsd] })]
      : []),
  ]
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), { plugins }),
  })
  const calls = [
    Actions.token.transfer.call(caller, {
      token,
      to: recipient.address,
      amount: parseUnits('5', 6),
    }),
  ]
  await expect(
    fillTransaction(caller, {
      account: userAccount.address,
      calls,
      feeToken: Tempo.addresses.alphaUsd,
    }),
  ).rejects.toThrow()
  const { transaction, capabilities } = await fillTransaction(client, {
    account: userAccount.address,
    calls,
    ...(mode === 'standalone' ? { feeToken: Tempo.addresses.alphaUsd } : {}),
  })
  expect(transaction.calls).toHaveLength(3)
  expect(capabilities?.autoSwap).toMatchObject({
    slippage: 0.05,
    minOut: { token, formatted: '5' },
  })
  expect(Boolean(transaction.feePayerSignature)).toBe(mode.includes('feePayer'))
  expect(Boolean(capabilities?.balanceDiffs)).toBe(mode.includes('simulate'))
  if (mode.includes('feePayer')) {
    const before = await Actions.token.getBalance(caller, {
      account: recipient.address,
      token,
    })
    const signed = await userAccount.signTransaction(transaction as never)
    const receipt = await sendRawTransactionSync(client, {
      serializedTransaction: signed,
    })
    expect(receipt.status).toBe('success')
    expect(
      (
        await Actions.token.getBalance(caller, {
          account: recipient.address,
          token,
        })
      ).amount - before.amount,
    ).toBe(parseUnits('5', 6))
  }
})

test('swaps from another token when the preferred token has an insufficient partial balance', async () => {
  const account = Tempo.accounts[8]!
  await Actions.faucet.fundSync(caller, { account, timeout: 60_000 })
  await Actions.token.mintSync(caller, {
    account: feePayerAccount,
    token,
    to: account.address,
    amount: 1n,
  })
  await Actions.fee.setUserTokenSync(caller, {
    account,
    token,
    feeToken: Tempo.addresses.alphaUsd,
  })
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [
        Relay.autoSwap(),
        Relay.feePayer({ account: feePayerAccount }),
        Relay.feeToken({
          resolveTokens: () => [token, Tempo.addresses.alphaUsd],
        }),
      ],
    }),
  })
  const { capabilities } = await fillTransaction(client, {
    account: account.address,
    feeToken: Tempo.addresses.alphaUsd,
    calls: [
      Actions.token.transfer.call(caller, {
        token,
        to: recipient.address,
        amount: parseUnits('5', 6),
      }),
    ],
  })
  expect(capabilities?.autoSwap?.maxIn.token.toLowerCase()).toBe(
    Tempo.addresses.alphaUsd.toLowerCase(),
  )
  expect(capabilities?.autoSwap?.minOut.token.toLowerCase()).toBe(
    token.toLowerCase(),
  )
})

test('swap metadata, sponsorship, and simulation overlap', async () => {
  const signing = Promise.withResolvers<void>()
  const simulated = Promise.withResolvers<void>()
  const memory = Store.memory()
  const store: Store.Store = {
    ...memory,
    async getItem(key) {
      if (key.endsWith(token.toLowerCase())) await signing.promise
      return memory.getItem(key)
    },
  }
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [
        Relay.simulate({ store }),
        Relay.feePayer({
          account: feePayerAccount,
          onSponsored: async () => {
            signing.resolve()
            await simulated.promise
          },
        }),
        Relay.autoSwap({ store }),
        Relay.feeToken({ resolveTokens: () => [Tempo.addresses.alphaUsd] }),
        (next) => async (request, options) => {
          const result = await next(request, options)
          if (request.method === 'tempo_simulateV1') simulated.resolve()
          return result
        },
      ] satisfies readonly Relay.Plugin[],
    }),
  })
  try {
    const { transaction, capabilities } = await fillTransaction(client, {
      account: userAccount.address,
      calls: [
        Actions.token.transfer.call(caller, {
          token,
          to: recipient.address,
          amount: parseUnits('5', 6),
        }),
      ],
    })
    expect(transaction.calls).toHaveLength(3)
    expect(transaction.feePayerSignature).toBeDefined()
    expect(capabilities?.autoSwap?.minOut).toMatchObject({
      token,
      formatted: '5',
    })
    expect(capabilities?.balanceDiffs).toBeDefined()
    const receipt = await sendRawTransactionSync(client, {
      serializedTransaction: await userAccount.signTransaction(
        transaction as never,
      ),
    })
    expect(receipt.status).toBe('success')
  } finally {
    signing.resolve()
    simulated.resolve()
  }
})

test('records sponsorship only after a successful fill is retried with a fee-balance swap', async () => {
  await Actions.amm.mintSync(caller, {
    account: feePayerAccount,
    feeToken: Tempo.addresses.pathUsd,
    userTokenAddress: token,
    validatorTokenAddress: Tempo.addresses.pathUsd,
    validatorTokenAmount: parseUnits('100', 6),
    to: feePayerAccount.address,
  })
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [
        Relay.autoSwap(),
        Relay.feePayer({
          account: feePayerAccount,
          feeToken: token,
          onSponsored: (event) => {
            const transaction = TxEnvelopeTempo.deserialize(
              event.transaction as `0x76${string}`,
            )
            if (transaction.calls.length !== 3)
              throw new Error('Cannot record an intermediate transaction')
          },
        }),
        Relay.feeToken({ resolveTokens: () => [Tempo.addresses.alphaUsd] }),
      ],
    }),
  })
  const { transaction, capabilities } = await fillTransaction(client, {
    account: userAccount.address,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  expect(transaction.calls).toHaveLength(3)
  expect(transaction.feePayerSignature).toBeDefined()
  expect(capabilities?.autoSwap?.minOut.token.toLowerCase()).toBe(
    token.toLowerCase(),
  )
  const receipt = await sendRawTransactionSync(client, {
    serializedTransaction: await userAccount.signTransaction(
      transaction as never,
    ),
  })
  expect(receipt.status).toBe('success')
})

test.each([
  { gas: 1_000_000n, balance: 1n, amount: undefined },
  { gas: 1_000_001n, balance: 1n, amount: '0x1' },
  { gas: 1_000_001n, balance: 0n, amount: '0x2' },
])(
  'rounds fee funding up: gas $gas, balance $balance',
  async ({ gas, balance, amount }) => {
    const account = Tempo.accounts[balance === 0n ? 5 : 4]!
    await Actions.faucet.fundSync(caller, { account, timeout: 60_000 })
    const current = await Actions.token.getBalance(caller, {
      account: account.address,
      token,
    })
    if (current.amount < balance)
      await Actions.token.mintSync(caller, {
        account: feePayerAccount,
        token,
        to: account.address,
        amount: balance - current.amount,
      })
    const client = createClient({
      chain: Tempo.chain,
      transport: withRelay(Tempo.http(), {
        plugins: [
          Relay.autoSwap(),
          Relay.feePayer({ account: feePayerAccount, feeToken: token }),
          Relay.feeToken({ resolveTokens: () => [Tempo.addresses.alphaUsd] }),
        ],
      }),
    })
    const { transaction, capabilities } = await fillTransaction(client, {
      account: account.address,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.addresses.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
      gas,
      feePayer: true,
      nonce: 0,
      maxFeePerGas: 1_000_000n,
      maxPriorityFeePerGas: 0n,
    })
    expect(capabilities?.autoSwap?.minOut.value).toBe(amount)
    expect(transaction.calls).toHaveLength(amount ? 3 : 1)
  },
)

test.each([false, true])(
  'fails the fill when swap metadata cannot be loaded, errors: %s',
  async (errors) => {
    const memory = Store.memory()
    const store: Store.Store = {
      ...memory,
      async getItem(key) {
        if (key.includes('tokenMetadata:') && key.endsWith(token.toLowerCase()))
          throw new Error('Private metadata storage failure')
        return memory.getItem(key)
      },
    }
    const relay = Relay.create({
      client: caller,
      plugins: [Relay.autoSwap({ store })],
    })
    await expect(
      relay.request({
        method: 'eth_fillTransaction',
        params: [
          {
            from: userAccount.address,
            feeToken: Tempo.addresses.alphaUsd,
            capabilities: { errors },
            calls: [
              Actions.token.transfer.call(caller, {
                token,
                to: recipient.address,
                amount: parseUnits('5', 6),
              }),
            ],
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: -32603,
      message: 'Internal error',
      data: { code: 'internal_error' },
    })
  },
)

test.each([false, true])(
  'skips an underfunded source token, explicit: %s',
  async (explicit) => {
    const account = Tempo.accounts[explicit ? 10 : 6]!
    await Actions.faucet.fundSync(caller, { account, timeout: 60_000 })
    const balance = await Actions.token.getBalance(caller, {
      account: account.address,
      token: Tempo.addresses.pathUsd,
    })
    await Actions.token.transferSync(caller, {
      account,
      feeToken: Tempo.addresses.alphaUsd,
      token: Tempo.addresses.pathUsd,
      to: recipient.address,
      amount: balance.amount - 1n,
    })
    await Actions.fee.setUserTokenSync(caller, {
      account,
      token: Tempo.addresses.pathUsd,
      feeToken: Tempo.addresses.alphaUsd,
    })
    const client = createClient({
      chain: Tempo.chain,
      transport: withRelay(Tempo.http(), {
        plugins: [
          Relay.autoSwap(),
          Relay.feePayer({
            account: feePayerAccount,
            feeToken: Tempo.addresses.alphaUsd,
          }),
          Relay.feeToken({
            resolveTokens: () => [
              Tempo.addresses.pathUsd,
              Tempo.addresses.alphaUsd,
            ],
          }),
        ],
      }),
    })
    const { capabilities } = await fillTransaction(client, {
      account: account.address,
      ...(explicit ? { feeToken: Tempo.addresses.pathUsd } : {}),
      calls: [
        Actions.token.transfer.call(caller, {
          token,
          to: recipient.address,
          amount: parseUnits('5', 6),
        }),
      ],
    })
    expect(capabilities?.autoSwap?.maxIn.token.toLowerCase()).toBe(
      Tempo.addresses.alphaUsd,
    )
  },
)

test('preserves slippage precision without rounding the limit up', async () => {
  await Actions.dex.placeSync(caller, {
    account: feePayerAccount,
    token,
    amount: parseUnits('100', 6),
    type: 'sell',
    tick: Tick.fromPrice('1'),
  })
  const account = Tempo.accounts[11]!
  await Actions.faucet.fundSync(caller, { account, timeout: 60_000 })
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [Relay.autoSwap({ slippage: 0.0006 })],
    }),
  })
  const { capabilities } = await fillTransaction(client, {
    account: account.address,
    feeToken: Tempo.addresses.alphaUsd,
    calls: [
      Actions.token.transfer.call(caller, {
        token,
        to: recipient.address,
        amount: parseUnits('5', 6),
      }),
    ],
  })
  expect(capabilities?.autoSwap?.maxIn.formatted).toBe('5.003')
})

test('preserves a successful fill when its fee balance cannot be read', async () => {
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [
        Relay.autoSwap(),
        Relay.feePayer({ account: feePayerAccount }),
        (next) => async (request, options) => {
          if (
            request.method === 'eth_call' &&
            JSON.stringify(request.params).includes('70a08231')
          )
            throw new Error('Balance lookup unavailable')
          return next(request, options)
        },
      ] satisfies readonly Relay.Plugin[],
    }),
  })
  const { transaction, capabilities } = await fillTransaction(client, {
    account: userAccount.address,
    feeToken: Tempo.addresses.alphaUsd,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  expect(transaction.calls).toHaveLength(1)
  expect(capabilities?.autoSwap).toBeUndefined()
})
