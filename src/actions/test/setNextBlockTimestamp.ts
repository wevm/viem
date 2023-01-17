import type { TestClient } from '../../clients'
import { numberToHex } from '../../utils'

export type SetNextBlockTimestampArgs = {
  /** The timestamp (in seconds). */
  timestamp: bigint
}

export async function setNextBlockTimestamp(
  client: TestClient,
  { timestamp }: SetNextBlockTimestampArgs,
) {
  return await client.request({
    method: 'evm_setNextBlockTimestamp',
    params: [numberToHex(timestamp)],
  })
}
