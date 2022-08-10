import { BaseProvider } from '../../providers'

export type FetchBlockNumberResponse = number

export async function fetchBlockNumber<TProvider extends BaseProvider>(
  provider: TProvider,
): Promise<FetchBlockNumberResponse> {
  const blockNumber = await provider.request({
    method: 'eth_blockNumber',
  })
  return Number(BigInt(blockNumber))
}
