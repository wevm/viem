import { fileURLToPath } from 'node:url'
import { Server } from 'prool'
import * as TestContainers from 'prool/testcontainers'
import { GenericContainer, Wait } from 'testcontainers'

export const image =
  'ghcr.io/wevm/nethermind-frames@sha256:1f8e5b5698e18af41849fd95016271a96f8d7fd192014270c08d0306283dc07a'
export const revision = 'db50104a5b66652768b0f877d293fc784ea8c44f'

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
            '--config',
            'spaceneth',
            '--Init.ChainSpecPath',
            '/tmp/frames.json',
            '--Init.EnableUnsecuredDevWallet',
            'false',
            '--Init.LogDirectory',
            '/tmp/logs',
            '--TxPool.BlobsSupport',
            'InMemory',
            '--JsonRpc.Host',
            '0.0.0.0',
            '--JsonRpc.EnabledModules',
            'Eth,Net,Web3',
          ])
          .withLogConsumer((stream) => {
            if (import.meta.env.VITE_FRAMES_LOG)
              stream.on('data', (data) => console.log(data.toString()))
          })
          .withStartupTimeout(120_000)
          .withWaitStrategy(Wait.forLogMessage('Initialization Completed')),
      endpoints: { default: { port: 8545, protocol: 'http' } },
      name: 'nethermind-frames',
    }),
    port,
  })
}
