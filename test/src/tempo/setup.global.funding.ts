import { Server } from 'prool'
import * as TestContainers from 'prool/testcontainers'

export default async function () {
  const server = Server.create({
    port: 9546,
    instance: TestContainers.Instance.tempo({
      image:
        'ghcr.io/tempoxyz/tempo@sha256:3278079c06f6b3c1dd30e27d2d2b031fe83d802bded3c86f87362c3fbab9f652',
      port: 9546,
      blockTime: '50ms',
    }),
  })
  return server.start()
}
