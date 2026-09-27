import { Server } from 'prool'
import * as TestContainers from 'prool/testcontainers'

export default async function () {
  const server = Server.create({
    port: 9546,
    instance: TestContainers.Instance.tempo({
      image:
        'ghcr.io/tempoxyz/tempo@sha256:49eebda642ba540f6fcfd505e2e16ee7c5570612ce7b348772a095ef51e9ae96',
      port: 9546,
      blockTime: '50ms',
    }),
  })
  return server.start()
}
