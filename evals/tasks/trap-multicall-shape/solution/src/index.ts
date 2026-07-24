import { Actions, type Client } from 'viem'
import { mainnet } from 'viem/chains'

export async function batchRead<const calls extends readonly unknown[]>(
  client: Client.Client,
  options: batchRead.Options<calls>,
): Promise<
  Actions.multicall.ReturnType<typeof mainnet, calls, 'auto', false>['results']
> {
  // The public intersection validates every descriptor while preserving the tuple.
  const parameters = {
    allowFailure: false,
    calls: options.reads,
  } as Actions.multicall.Options<calls, 'auto', false>
  const { results } = await Actions.multicall(client, parameters)
  return results as Actions.multicall.ReturnType<
    typeof mainnet,
    calls,
    'auto',
    false
  >['results']
}

export declare namespace batchRead {
  type Options<calls extends readonly unknown[]> = {
    reads: calls & Actions.multicall.Options<calls, 'auto', false>['calls']
  }
}
