import type { TestClient } from '../../clients'

export type SetBlockTimestampIntervalArgs = {
  /** The interval (in seconds). */
  interval: number
}

export async function setBlockTimestampInterval(
  client: TestClient,
  { interval }: SetBlockTimestampIntervalArgs,
) {
  return await client.request({
    method: `${client.mode}_setBlockTimestampInterval`,
    params: [interval],
  })
}
