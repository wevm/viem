import { TxEnvelopeTempo } from 'ox/tempo'
import { type Address, createClient, parseUnits } from 'viem'
import {
  fillTransaction,
  sendRawTransactionSync,
  sendTransactionSync,
} from 'viem/actions'
import { Actions, Addresses, Relay, Store, Tick, withRelay } from 'viem/tempo'
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
