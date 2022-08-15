import { testProvider } from './utils'

export async function setup() {
  testProvider.request({ method: 'evm_setAutomine', params: [false] })
}
