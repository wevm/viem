import * as Anvil from './src/anvil.js'

export default async function () {
  // Set up Anvil instances
  const shutdown = await Promise.all(
    Object.values(Anvil.instances).map((instance) => instance.start()),
  )

  // Teardown
  return () => Promise.all(shutdown.map((fn) => fn()))
}
