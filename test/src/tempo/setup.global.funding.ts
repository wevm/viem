import { Server } from 'prool'
import * as TestContainers from 'prool/testcontainers'

export default async function () {
  const server = Server.create({
    port: 9546,
    instance: TestContainers.Instance.tempo({
      image: 'ghcr.io/tempoxyz/tempo:sha-0f0e058',
      port: 9546,
      blockTime: '50ms',
    }),
  })
  return server.start()
}
