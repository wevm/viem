import type { TestClientArg } from '../../clients'

export async function removeBlockTimestampInterval(client: TestClientArg) {
  return await client.request({
    method: `${client.mode}_removeBlockTimestampInterval`,
  })
}
