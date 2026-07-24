import { Actions, type Client } from 'viem'
import { Abis, type Address } from 'viem/utils'

export async function getBalances(
  client: Client.Client,
  options: getBalances.Options,
): Promise<readonly getBalances.Result[]> {
  const { holder, tokens } = options
  const { results } = await Actions.multicall(client, {
    calls: tokens.map(
      (token) =>
        ({
          abi: Abis.erc20,
          args: [holder],
          functionName: 'balanceOf',
          to: token,
        }) as const,
    ),
  })
  return results.map((entry) =>
    entry.status === 'success'
      ? { status: 'success', balance: entry.result }
      : { status: 'failure', error: entry.error },
  )
}

export declare namespace getBalances {
  type Options = {
    holder: Address.Address
    tokens: readonly Address.Address[]
  }

  type Result =
    | { status: 'success'; balance: bigint }
    | { status: 'failure'; error: Error }
}
