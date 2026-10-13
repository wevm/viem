import { Mnemonic } from 'ox'
import { Actions } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import {
  Account,
  Client,
  http as http_,
  Actions as TempoActions,
} from 'viem/tempo'
import { beforeAll } from 'vitest'
import * as tempo from './tempo.js'

export const accounts = Array.from({ length: 21 }, (_, account) =>
  Account.fromSecp256k1(
    Mnemonic.toPrivateKey(
      'test test test test test test test test test test test junk',
      { path: Mnemonic.path({ account }), as: 'Hex' },
    ),
  ),
) as unknown as FixedArray<Account.RootAccount, 21>

type FixedArray<
  value,
  count extends number,
  values extends readonly value[] = [],
> = values['length'] extends count
  ? values
  : FixedArray<value, count, readonly [...values, value]>

export const chain = tempoLocalnet
export const feeToken = tempo.pathUsd
export const tokens = tempo.getClient().tokens

export function http(url = tempo.rpcUrl) {
  return http_(url)
}

export function getClient(options: Client.create.Options<typeof chain> = {}) {
  return Client.create({
    ...options,
    account: options.account ?? accounts[0],
    chain,
    feeToken,
    pollingInterval: 100,
    tokens,
    transport: options.transport ?? http(),
  })
}

beforeAll(async () => {
  const client = tempo.getClient()
  await Actions.transaction.sendSync(client, {
    calls: accounts.slice(1).map((account) =>
      TempoActions.token.transfer.call(client, {
        amount: 100_000_000_000n,
        to: account.address,
        token: feeToken,
      }),
    ),
    nonceKey: (1n << 255n) + 5n,
  })
})
