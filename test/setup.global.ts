import { mainnet } from './src/anvil.js'

export default async function () {
  if (process.env.SKIP_GLOBAL_SETUP) return
  const shutdown = await mainnet.start()
  return () => shutdown()
}
