import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { usdc } from 'viem/tokens'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const token = usdc(mainnet.id).address
  const { results } = await Actions.multicall(client, {
    allowFailure: false,
    calls: [
      Actions.token.getBalance.call(client, {
        account: '0x28C6c06298d514Db089934071355E5743bf21d60',
        token,
      }),
      Actions.token.getBalance.call(client, {
        account: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        token,
      }),
      Actions.token.getBalance.call(client, {
        account: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        token,
      }),
    ],
  })
  return results
}
