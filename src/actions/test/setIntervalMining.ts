import type { TestClientArg } from '../../clients'

export type SetIntervalMiningParameters = {
  /** The mining interval. */
  interval: number
}

export async function setIntervalMining(
  client: TestClientArg,
  { interval }: SetIntervalMiningParameters,
) {
  return await client.request({
    method: 'evm_setIntervalMining',
    params: [interval],
  })
}
