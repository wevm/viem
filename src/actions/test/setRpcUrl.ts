import type { TestClientArg } from '../../clients'

export async function setRpcUrl(client: TestClientArg, jsonRpcUrl: string) {
  return await client.request({
    method: `${client.mode}_setRpcUrl`,
    params: [jsonRpcUrl],
  })
}
