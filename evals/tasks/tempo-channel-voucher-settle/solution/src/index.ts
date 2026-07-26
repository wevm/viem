import { Account, Actions, Channel, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'
import { Value } from 'viem/utils'

const alphaUsd = '0x20c0000000000000000000000000000000000001'
const payee = Account.fromSecp256k1(
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
)
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
    payee: payee.address,
    token: alphaUsd,
  })
  const firstChannel = Channel.from(firstOpened)
  const firstAmount = Value.from('32.5', 6)
  const firstSignature = await Actions.channel.signVoucher(client, {
    channel: firstChannel,
    cumulativeAmount: firstAmount,
  })
  const firstSettlement = await Actions.channel.settleSync(client, {
    account: payee,
    channel: firstChannel,
    cumulativeAmount: firstAmount,
    signature: firstSignature,
  })

  const secondOpened = await Actions.channel.openSync(client, {
    deposit: Value.from('10', 6),
    payee: payee.address,
    token: alphaUsd,
  })
  const secondChannel = Channel.from(secondOpened)
  const secondAmount = Value.from('0.75', 6)
  const secondSignature = await Actions.channel.signVoucher(client, {
    channel: secondChannel,
    cumulativeAmount: secondAmount,
  })
  const secondSettlement = await Actions.channel.settleSync(client, {
    account: payee,
    channel: secondChannel,
    cumulativeAmount: secondAmount,
    signature: secondSignature,
  })

  return {
    first: {
      opened: firstOpened,
      settlement: firstSettlement,
    },
    second: {
      opened: secondOpened,
      settlement: secondSettlement,
    },
  }
}
