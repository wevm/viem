import type { TestClient } from '../../clients/index.js'
import { numberToHex } from '../../utils/index.js'

export type SetNextBlockTimestampParameters = {
  /** The timestamp (in seconds). */
  timestamp: bigint
}

export async function setNextBlockTimestamp(
  client: TestClient,
  { timestamp }: SetNextBlockTimestampParameters,
) {
  return await client.request({
    method: 'evm_setNextBlockTimestamp',
    params: [numberToHex(timestamp)],
  })
}
