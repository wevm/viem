import { Actions, type Client } from 'viem'

export async function collectBlockNumbers(
  client: Client.Client,
  options: collectBlockNumbers.Options,
): Promise<bigint[]> {
  if (options.count <= 0) return []

  const numbers: bigint[] = []
  const watch = Actions.block.watchNumber(client)

  try {
    for await (const { blockNumber } of watch) {
      numbers.push(blockNumber)
      if (numbers.length === options.count) return numbers
    }
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
