import type { Chain } from '@wagmi/chains'
import type {
  TestClient,
  TestClientMode,
  Transport,
} from '../../clients/index.js'
import { hexToNumber } from '../../utils/index.js'

export type GetTxpoolStatusReturnType = {
  pending: number
  queued: number
}

export async function getTxpoolStatus<TChain extends Chain | undefined>(
  client: TestClient<TestClientMode, Transport, TChain>,
): Promise<GetTxpoolStatusReturnType> {
  const { pending, queued } = await client.request({
    method: 'txpool_status',
  })
  return {
    pending: hexToNumber(pending),
    queued: hexToNumber(queued),
  }
}
