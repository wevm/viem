import { anvilMainnet } from './src/anvil.js'

export default async function () {
  if (process.env.SKIP_GLOBAL_SETUP) return
  const shutdown = await anvilMainnet.start()
  return () => shutdown()
}
