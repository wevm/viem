import { BaseProvider } from '../../providers'

export async function fetchBlockNumber<TProvider extends BaseProvider>(
  provider: TProvider,
) {
  const blockNumber = await provider.request({
    method: 'eth_blockNumber',
  })
  return Number(BigInt(blockNumber))
}
