import { Instance, Server } from 'prool'

import { instances } from './anvil.js'

export default async function setup() {
  if (process.env.SKIP_GLOBAL_SETUP) return

  const stops: (() => Promise<void>)[] = []

  for (const anvil of instances) {
    const server = Server.create({
      instance: Instance.anvil({
        chainId: Number(anvil.id),
      }),
      port: anvil.port,
    })
    const stop = await server.start()
    stops.push(stop)
  }

  return async () => {
    await Promise.all(stops.map((stop) => stop()))
  }
}
