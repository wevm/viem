import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Value } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const { transaction } = await Actions.transaction.fill(client, {
    account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    value: Value.fromEther('0.25'),
  })
  return transaction
}
