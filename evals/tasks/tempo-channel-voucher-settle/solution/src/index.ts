import type { Client } from 'viem'
import { Account, Actions, Channel } from 'viem/tempo'
import { type Address, Value } from 'viem/utils'

const alphaUsd = '0x20c0000000000000000000000000000000000001'
const pathUsd = '0x20c0000000000000000000000000000000000000'

export async function openChannel(
  client: Client.Client,
  options: openChannel.Options,
) {
  const { deposit, payee } = options
  const opened = await Actions.channel.openSync(client, {
    deposit: Value.from(deposit, 6),
    feeToken: pathUsd,
    payee,
    token: alphaUsd,
  })
  return {
    channel: Channel.from(opened),
  }
}

export async function settleVoucher(
  client: Client.Client,
  options: settleVoucher.Options,
) {
  const { amount, channel, payer } = options
  const cumulativeAmount = Value.from(amount, 6)
  const signature = await Actions.channel.signVoucher(client, {
    account: payer,
    channel,
    cumulativeAmount,
  })
  return Actions.channel.settleSync(client, {
    channel,
    cumulativeAmount,
    feeToken: pathUsd,
    signature,
  })
}

export declare namespace openChannel {
  type Options = {
    deposit: string
    payee: Address.Address
  }
}

export declare namespace settleVoucher {
  type Options = {
    amount: string
    channel: Channel.Channel
    payer: Account.Account
  }
}
