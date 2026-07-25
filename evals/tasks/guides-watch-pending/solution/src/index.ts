import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: mainnet,
  pollingInterval: 200,
  transport: http('http://anvil:8545'),
})

export async function example() {
  await Actions.block.setAutomine(client, { enabled: false })
  let stopWatching = () => {}
  try {
    const pending = new Promise<`0x${string}`>((resolve, reject) => {
      const watch = Actions.transaction.watchPending(client)
      stopWatching = () => watch.off()
      watch.onTransactions(([hash]) => {
        if (!hash) return
        resolve(hash)
      })
      watch.onError(reject)
    })
    await new Promise((resolve) => setTimeout(resolve, client.pollingInterval))
    const hash = await Actions.transaction.send(client, {
      to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      value: 1n,
    })
    return { hash, observed: await pending }
  } finally {
    stopWatching()
    await Actions.block.setAutomine(client, { enabled: true })
    await Actions.block.mine(client, { blocks: 1 })
  }
}
