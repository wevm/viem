import { BaseProvider } from '../providers/createBaseProvider'

export async function fetchBlockNumber<TProvider extends BaseProvider>(
  provider: TProvider,
) {
  const blockNumber = await provider.request({
    method: 'eth_blockNumber',
  })
  return BigInt(blockNumber)
}
