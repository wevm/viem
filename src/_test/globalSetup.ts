import { stopAnvilInstances, createAnvilProxy } from './proxy.js'

export default async function () {
  if (process.env.SKIP_GLOBAL_SETUP) {
    return
  }

  // Using this proxy, we can parallelize our test suite by spawning multiple "on demand" anvil
  // instances and proxying requests to them. Especially for local development, this is much faster
  // than running the tests serially.
  //
  // In vitest, each thread is assigned a unique, numerical id (`process.env.VITEST_POOL_ID`). We
  // append this id to the local rpc url (e.g. `http://127.0.0.1:8545/<ID>`).
  //
  // Whenever a request hits the proxy server at this url, it spawns (or reuses) an anvil instance
  // at a randomly assigned port and proxies the request to it. The anvil instance is added to a
  // [id:port] mapping for future request and is kept alive until the test suite finishes.
  //
  // Since each thread processes one test file after the other, we don't have to worry about
  // non-deterministic behavior caused by multiple tests hitting the same anvil instance concurrently
  // as long as we avoid `test.concurrent()`.
  //
  // We still need to remember to reset the anvil instance between test files. This is generally
  // handled in `setup.ts` but may require additional resetting (e.g. via `afterAll`), in case of
  // any custom per-test adjustments that persist beyond `anvil_reset`.
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
