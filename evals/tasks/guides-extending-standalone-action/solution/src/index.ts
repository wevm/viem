import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const address = '0x1111111111111111111111111111111111111111'

const baseClient = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

async function getAccountSummary(client: Client.Client) {
  const [balance, nonce] = await Promise.all([
    Actions.address.getBalance(client, { address }),
    Actions.address.getTransactionCount(client, { address }),
  ])
  return { balance, nonce }
}

const client = baseClient.extend((client) => ({
  accounts: {
    getSummary: () => getAccountSummary(client),
  },
}))

export async function example() {
  const [viaAction, viaMethod] = await Promise.all([
    getAccountSummary(client),
    client.accounts.getSummary(),
  ])
  return { viaAction, viaMethod }
}
