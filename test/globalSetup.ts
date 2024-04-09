import { startProxy } from '@viem/anvil'

import {
  forkBlockNumber,
  forkBlockNumberSepolia,
  forkUrl,
  forkUrlSepolia,
} from './src/constants.js'
import {
  forkBlockNumberOptimism,
  forkBlockNumberOptimismSepolia,
  forkUrlOptimism,
  forkUrlOptimismSepolia,
} from './src/opStack.js'
import { forkBlockNumberZkSync, forkUrlZkSync } from './src/zksync.js'

export default async function () {
  if (process.env.SKIP_GLOBAL_SETUP) return

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
  const shutdownMainnet = await startProxy({
    port: Number(process.env.VITE_ANVIL_PORT || '8545'),
    options: {
      forkUrl,
      forkBlockNumber,
      noMining: true,
      startTimeout: 20_000,
    },
  })
  const shutdownOptimism = await startProxy({
    port: Number(process.env.VITE_ANVIL_PORT_OPTIMISM || '8645'),
    options: {
      forkUrl: forkUrlOptimism,
      forkBlockNumber: forkBlockNumberOptimism,
      startTimeout: 20_000,
    },
  })
  const shutdownZkSync = await startProxy({
    port: Number(process.env.VITE_ANVIL_PORT_ZKSYNC || '8745'),
    options: {
      forkUrl: forkUrlZkSync,
      forkBlockNumber: forkBlockNumberZkSync,
      startTimeout: 20_000,
    },
  })
  // TODO(fault-proofs): remove when fault proofs deployed to mainnet.
  const shutdownSepolia = await startProxy({
    port: Number(process.env.VITE_ANVIL_PORT_SEPOLIA || '8845'),
    options: {
      forkUrl: forkUrlSepolia,
      forkBlockNumber: forkBlockNumberSepolia,
      noMining: true,
      startTimeout: 20_000,
    },
  })
  // TODO(fault-proofs): remove when fault proofs deployed to mainnet.
  const shutdownOptimismSepolia = await startProxy({
    port: Number(process.env.VITE_ANVIL_PORT_OPTIMISM_SEPOLIA || '8945'),
    options: {
      forkUrl: forkUrlOptimismSepolia,
      forkBlockNumber: forkBlockNumberOptimismSepolia,
      noMining: true,
      startTimeout: 20_000,
    },
  })
  return () => {
    shutdownMainnet()
    shutdownOptimism()
    shutdownZkSync()
    shutdownSepolia()
    shutdownOptimismSepolia()
  }
}
