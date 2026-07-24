import { Actions, type Client } from 'viem'

export async function collectNextBlockNumbers(
  client: Client.Client,
  options: collectNextBlockNumbers.Options,
): Promise<bigint[]> {
  const { seen } = options
  if (seen.length >= 3) return seen.slice(0, 3)

  return new Promise((resolve, reject) => {
    const watch = Actions.block.watchNumber(client)
    watch.onBlockNumber((blockNumber) => {
      seen.push(blockNumber)
      if (seen.length < 3) return
      watch.off()
      resolve(seen.slice(0, 3))
    })
    watch.onError((error) => {
      watch.off()
      reject(error)
    })
  })
}

export declare namespace collectNextBlockNumbers {
  type Options = {
    seen: bigint[]
  }
}
