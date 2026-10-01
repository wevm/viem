import { fileURLToPath } from 'node:url'
import { Server } from 'prool'
import * as TestContainers from 'prool/testcontainers'
import { GenericContainer, Wait } from 'testcontainers'

export const image =
  'ghcr.io/paradigmxyz/reth:692d9e3e5a84ca385e47ba0a48049763d198f86d'
export const revision = '692d9e3e5a84ca385e47ba0a48049763d198f86d'

export const port = Number(import.meta.env.VITE_FRAMES_PORT ?? 10545)
export const rpcUrl = `http://localhost:${port}/${Number(import.meta.env.VITEST_POOL_ID ?? 1)}`

export function createServer() {
  return Server.create({
    instance: TestContainers.Instance.testcontainer({
      container: () =>
        new GenericContainer(image)
          .withCopyFilesToContainer([
            {
              source: fileURLToPath(
                new URL('./chainspec.json', import.meta.url),
              ),
              target: '/tmp/frames.json',
            },
          ])
          .withCommand([
            'node',
            '--chain',
            '/tmp/frames.json',
            '--dev',
            '--http',
            '--http.addr',
            '0.0.0.0',
            '--http.api',
            'eth,net,web3',
            '--ipcdisable',
          ])
          .withLogConsumer((stream) => {
            if (import.meta.env.VITE_FRAMES_LOG)
              stream.on('data', (data) => console.log(data.toString()))
          })
          .withStartupTimeout(120_000)
          .withWaitStrategy(Wait.forLogMessage('RPC HTTP server started')),
      endpoints: { default: { port: 8545, protocol: 'http' } },
      name: 'reth-frames',
    }),
    port,
  })
}
