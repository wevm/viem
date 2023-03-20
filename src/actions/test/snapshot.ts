import type { TestClientArg } from '../../clients'

export async function snapshot(client: TestClientArg) {
  return await client.request({
    method: 'evm_snapshot',
  })
}
