import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const [gas, fees] = await Promise.all([
    Actions.transaction.estimateGas(client, {
      account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      value: 1_000_000_000_000_000_000n,
    }),
    Actions.fee.estimateFeesPerGas(client),
  ])
  return { fees, gas }
}
