import { testRpc } from '../../test/src/utils'

export async function setup() {
  await testRpc.request({
    method: 'anvil_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.VITE_ANVIL_FORK_URL,
          blockNumber: parseInt(process.env.VITE_ANVIL_BLOCK_NUMBER!),
        },
      },
    ],
  })
  await testRpc.request({ method: 'evm_setAutomine', params: [false] })
}
