import type { TestClientArg } from '../../clients'

export async function setAutomine(client: TestClientArg, enabled: boolean) {
  return await client.request({
    method: 'evm_setAutomine',
    params: [enabled],
  })
}
