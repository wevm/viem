import { Server } from 'prool'
import * as TestContainers from 'prool/testcontainers'

export default async function () {
  const server = Server.create({
    port: 9546,
    instance: TestContainers.Instance.tempo({
      image:
        'ghcr.io/tempoxyz/tempo@sha256:d0b61e0d918abdd1d434b8052dbda073c124665107817bc6e18e862588003ec4',
      port: 9546,
      blockTime: '50ms',
    }),
  })
  return server.start()
}
