import type { AddressInfo } from 'node:net'
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
    })
    const stop = await server.start()
    const { port } = server.address() as AddressInfo
    process.env[anvil.portEnv] = String(port)
    stops.push(stop)
  }

  return async () => {
    await Promise.all(stops.map((stop) => stop()))
  }
}
