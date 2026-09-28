import { type Address, createClient, parseUnits } from 'viem'
import {
  fillTransaction,
  sendRawTransactionSync,
  sendTransactionSync,
} from 'viem/actions'
import { Actions, Addresses, Relay, Tick, withRelay } from 'viem/tempo'
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
