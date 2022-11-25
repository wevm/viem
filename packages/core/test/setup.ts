import { testProvider } from '../../test/src/utils'

export async function setup() {
  testProvider.request({
    method: 'anvil_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.VITE_ANVIL_FORK_URL,
          blockNumber: process.env.VITE_ANVIL_BLOCK_NUMBER,
        },
      },
    ],
  })
  testProvider.request({ method: 'evm_setAutomine', params: [false] })
}
