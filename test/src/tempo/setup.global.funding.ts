import { Server } from 'prool'
import * as TestContainers from 'prool/testcontainers'

// Tempo 492639758d54b83ddd68f4a4b7a67e5c51221c0e, actions run 35911644417.
export default async function () {
  const server = Server.create({
    port: 9546,
    instance: TestContainers.Instance.tempo({
      image:
        'ghcr.io/tempoxyz/tempo@sha256:485e878fb0a68894ceb4743280f1d2747932ae3728e94cf51302d0cae5476f5a',
      port: 9546,
      blockTime: '50ms',
    }),
  })
  return server.start()
}
