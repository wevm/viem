import type { Client } from 'viem'
import { Actions, Channel } from 'viem/tempo'
import { type Address, type Hex, Value } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'

export async function openChannel(
  client: Client.Client,
  options: openChannel.Options,
) {
  const { deposit, payee } = options
  const { receipt, ...opened } = await Actions.channel.openSync(client, {
    deposit: Value.from(deposit, 6),
    payee,
    token: pathUsd,
  })
  return {
    channel: Channel.from(opened),
    channelId: opened.channelId,
    receipt,
  }
}

export async function topUpChannel(
  client: Client.Client,
  options: topUpChannel.Options,
) {
  const { additionalDeposit, channel } = options
  const { receipt } = await Actions.channel.topUpSync(client, {
    additionalDeposit: Value.from(additionalDeposit, 6),
    channel,
  })
  return { receipt }
}

export async function getChannelState(
  client: Client.Client,
  options: getChannelState.Options,
) {
  return Actions.channel.getStates(client, { channel: options.channelId })
}

export declare namespace getChannelState {
  type Options = {
    channelId: Hex.Hex
  }
}

export declare namespace openChannel {
  type Options = {
    deposit: string
    payee: Address.Address
  }
}

export declare namespace topUpChannel {
  type Options = {
    additionalDeposit: string
    channel: Channel.Channel
  }
}
