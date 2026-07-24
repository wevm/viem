import { Actions, type Client } from 'viem'

export async function collectBlockNumbers(
  client: Client.Client,
  options: collectBlockNumbers.Options,
): Promise<readonly bigint[]> {
  const { count } = options
  if (count <= 0) return []
  const watch = Actions.block.watch(client)
  const numbers: bigint[] = []
  try {
    for await (const { block } of watch) {
      numbers.push(block.number)
      if (numbers.length >= count) break
    }
  } finally {
    watch.off()
  }
  return numbers
}

export declare namespace collectBlockNumbers {
  type Options = {
    count: number
  }
}
