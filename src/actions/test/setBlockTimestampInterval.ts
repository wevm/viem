import type { TestClientArg } from '../../clients'

export type SetBlockTimestampIntervalParameters = {
  /** The interval (in seconds). */
  interval: number
}

export async function setBlockTimestampInterval(
  client: TestClientArg,
  { interval }: SetBlockTimestampIntervalParameters,
) {
  return await client.request({
    method: `${client.mode}_setBlockTimestampInterval`,
    params: [interval],
  })
}
