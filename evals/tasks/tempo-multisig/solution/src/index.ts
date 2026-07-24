import { Actions, type Client } from 'viem'
import { Account } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'
import { type Address, Value } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'

export async function transferFromMultisig(
  client: Client.Client<typeof tempoLocalnet>,
  options: transferFromMultisig.Options,
) {
  const { amount, approvers, owners, to } = options

  // 2-of-3 multisig over the owners (equal weight).
  const account = Account.fromMultisig({
    owners: owners.map((owner) => ({
      owner: owner.address,
      weight: 1,
    })),
    threshold: 2,
  })

  // Fund the multisig with the transfer amount plus fee headroom.
  const value = Value.from(amount, 6)
  await Actions.token.transferSync(client, {
    amount: value + 1_000_000n,
    to: account.address,
    token: pathUsd,
  })

  const { request } = await Actions.transaction.prepare(client, {
    account,
    calls: [
      Actions.token.transfer.call(client, {
        amount: value,
        to,
        token: pathUsd,
      }),
    ],
    feeToken: pathUsd,
  })

  // Each approver signs over the prepared multisig request.
  const signatures = await Promise.all(
    approvers.map((approver) =>
      Actions.transaction.sign(client, {
        ...request,
        account: approver,
      }),
    ),
  )

  const receipt = await Actions.transaction.sendSync(client, {
    ...request,
    account,
    signatures,
  })
  return { multisig: account.address, receipt }
}

export declare namespace transferFromMultisig {
  type Options = {
    amount: string
    approvers: readonly Account.Account[]
    owners: readonly [Account.Account, Account.Account, Account.Account]
    to: Address.Address
  }
}
