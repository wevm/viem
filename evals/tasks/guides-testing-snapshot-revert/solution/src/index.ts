import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

export async function example() {
  const before = await Actions.address.getBalance(client, { address })
  const value = before + 123_456_789n
  const id = await Actions.state.snapshot(client)
  const during = await (async () => {
    try {
      await Actions.address.setBalance(client, { address, value })
      return await Actions.address.getBalance(client, { address })
    } finally {
      await Actions.state.revert(client, { id })
    }
  })()
  const after = await Actions.address.getBalance(client, { address })
  return { after, before, during }
}
