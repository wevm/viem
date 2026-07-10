import { history, local, mainnet } from './src/anvil.js'
import { bundler } from './src/bundler.js'

export default async function () {
  if (process.env.SKIP_GLOBAL_SETUP) return
  const shutdowns = await Promise.all([
    mainnet.start(),
    local.start(),
    history.start(),
    bundler.start(),
  ])
  return async () => {
    await Promise.all(shutdowns.map((shutdown) => shutdown()))
  }
}
