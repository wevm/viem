import type { TestClientArg } from '../../clients'

export async function setLoggingEnabled(
  client: TestClientArg,
  enabled: boolean,
) {
  return await client.request({
    method: `${client.mode}_setLoggingEnabled`,
    params: [enabled],
  })
}
