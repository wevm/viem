import { stopAnvilInstances, createAnvilProxy } from './proxy.js'

export default async function () {
  const server = await createAnvilProxy({
    proxyPort: 8545,
    proxyHostname: '::',
    anvilOptions: {
      forkUrl: process.env.VITE_ANVIL_FORK_URL,
      forkBlockNumber: Number(process.env.VITE_ANVIL_BLOCK_NUMBER),
      blockTime: Number(process.env.VITE_ANVIL_BLOCK_TIME),
    },
  })

  return async () => {
    // Clean up all anvil instances and the anvil pool manager itself.
    await Promise.allSettled([
      stopAnvilInstances(),
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      }),
    ])
  }
}
