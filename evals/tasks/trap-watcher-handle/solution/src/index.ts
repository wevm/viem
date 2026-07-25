import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  chain: mainnet,
  pollingInterval: 100,
  transport: http('http://anvil:8545'),
})

export function example(): Promise<bigint[]> {
  const numbers: bigint[] = []
  return new Promise((resolve, reject) => {
    const watch = Actions.block.watchNumber(client)
    watch.onBlockNumber((blockNumber) => {
      numbers.push(blockNumber)
      if (numbers.length < 3) return
      watch.off()
      resolve(numbers)
    })
    watch.onError((error) => {
      watch.off()
      reject(error)
    })
  })
}
