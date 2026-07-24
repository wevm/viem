import { Actions, type Client } from 'viem'

export async function collectBlockNumbers(
  client: Client.Client,
  options: collectBlockNumbers.Options,
): Promise<bigint[]> {
  const { count } = options
  if (count <= 0) return []

  const numbers: bigint[] = []
  const watch = Actions.block.watchNumber(client)

  try {
    await new Promise<void>((resolve, reject) => {
      watch.onBlockNumber((blockNumber) => {
        numbers.push(blockNumber)
        if (numbers.length >= count) resolve()
      })
      watch.onError(reject)
    })
    return numbers
  } finally {
    watch.off()
  }
}

export declare namespace collectBlockNumbers {
  type Options = {
    count: number
  }
}
