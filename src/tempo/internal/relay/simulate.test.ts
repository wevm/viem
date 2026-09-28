import { createClient } from 'viem'
import { fillTransaction } from 'viem/actions'
import { Actions, Relay, withRelay } from 'viem/tempo'
import { beforeAll, expect, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'

const userAccount = Tempo.accounts[9]!
const recipient = Tempo.accounts[7]!

const caller = Tempo.getClient({ chain: Tempo.chain })

beforeAll(async () => {
  await Actions.faucet.fundSync(caller, {
    account: userAccount,
    timeout: 60_000,
  })
})

test('returns fees and balance changes without executing the transfer', async () => {
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), { plugins: [Relay.simulate()] }),
  })
  const before = await Actions.token.getBalance(caller, {
    account: recipient.address,
    token: Tempo.addresses.alphaUsd,
  })
  const { capabilities } = await fillTransaction(client, {
    account: userAccount.address,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
    feeToken: Tempo.addresses.alphaUsd,
  })
  expect(capabilities?.fee?.symbol).toBe('AlphaUSD')
  expect(Object.values(capabilities?.balanceDiffs ?? {}).flat()).toMatchObject([
    {
      address: Tempo.addresses.alphaUsd,
      direction: 'outgoing',
      value: '0x1',
    },
  ])
  expect(
    await Actions.token.getBalance(caller, {
      account: recipient.address,
      token: Tempo.addresses.alphaUsd,
    }),
  ).toEqual(before)
})
