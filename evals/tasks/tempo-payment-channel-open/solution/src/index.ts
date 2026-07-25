import { Account, Actions, Channel, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'
import { Value } from 'viem/utils'

const pathUsd = '0x20c0000000000000000000000000000000000000'
const client = Client.create({
  account: Account.fromSecp256k1(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const firstOpened = await Actions.channel.openSync(client, {
    deposit: Value.from('100', 6),
    payee: '0x4242424242424242424242424242424242424242',
    token: pathUsd,
  })
  const firstChannel = Channel.from(firstOpened)
  const firstTopUp = await Actions.channel.topUpSync(client, {
    additionalDeposit: Value.from('25.5', 6),
    channel: firstChannel,
  })
  const firstState = await Actions.channel.getStates(client, {
    channel: firstOpened.channelId,
  })

  const secondOpened = await Actions.channel.openSync(client, {
    deposit: Value.from('3.25', 6),
    payee: '0x4343434343434343434343434343434343434343',
    token: pathUsd,
  })
  const secondChannel = Channel.from(secondOpened)
  const secondTopUp = await Actions.channel.topUpSync(client, {
    additionalDeposit: Value.from('0.75', 6),
    channel: secondChannel,
  })
  const secondState = await Actions.channel.getStates(client, {
    channel: secondOpened.channelId,
  })

  const thirdOpened = await Actions.channel.openSync(client, {
    deposit: Value.from('1', 6),
    payee: '0x4343434343434343434343434343434343434343',
    token: pathUsd,
  })
  const thirdState = await Actions.channel.getStates(client, {
    channel: thirdOpened.channelId,
  })

  return {
    first: {
      channel: firstChannel,
      opened: firstOpened,
      state: firstState,
      topUp: firstTopUp,
    },
    second: {
      channel: secondChannel,
      opened: secondOpened,
      state: secondState,
      topUp: secondTopUp,
    },
    third: {
      channel: Channel.from(thirdOpened),
      opened: thirdOpened,
      state: thirdState,
    },
  }
}
