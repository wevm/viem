import { Account, Actions, Channel, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'
import { Value } from 'viem/utils'

const alphaUsd = '0x20c0000000000000000000000000000000000001'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const payee = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const payerAccount = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const payerClient = Client.create({
  account: payerAccount,
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})
const payeeClient = Client.create({
  account: Account.fromSecp256k1(
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  await Actions.fee.setUserTokenSync(payeeClient, {
    feeToken: pathUsd,
    token: pathUsd,
  })

  const firstOpened = await Actions.channel.openSync(payerClient, {
    deposit: Value.from('100', 6),
    feeToken: pathUsd,
    payee,
    token: alphaUsd,
  })
  const firstChannel = Channel.from(firstOpened)
  const firstAmount = Value.from('32.5', 6)
  const firstSignature = await Actions.channel.signVoucher(payerClient, {
    channel: firstChannel,
    cumulativeAmount: firstAmount,
  })
  const firstSettlement = await Actions.channel.settleSync(payeeClient, {
    channel: firstChannel,
    cumulativeAmount: firstAmount,
    feeToken: pathUsd,
    signature: firstSignature,
  })

  const secondOpened = await Actions.channel.openSync(payerClient, {
    deposit: Value.from('10', 6),
    feeToken: pathUsd,
    payee,
    token: alphaUsd,
  })
  const secondChannel = Channel.from(secondOpened)
  const secondAmount = Value.from('0.75', 6)
  const secondSignature = await Actions.channel.signVoucher(payerClient, {
    channel: secondChannel,
    cumulativeAmount: secondAmount,
  })
  const secondSettlement = await Actions.channel.settleSync(payeeClient, {
    channel: secondChannel,
    cumulativeAmount: secondAmount,
    feeToken: pathUsd,
    signature: secondSignature,
  })

  return {
    first: {
      channel: firstChannel,
      opened: firstOpened,
      settlement: firstSettlement,
    },
    second: {
      channel: secondChannel,
      opened: secondOpened,
      settlement: secondSettlement,
    },
  }
}
