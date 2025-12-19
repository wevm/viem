import { RpcTransport } from 'ox'
import { type Instance, Server } from 'prool'
import * as TestContainers from 'prool/testcontainers'

export const port = 9545

export const rpcUrl = (() => {
  if (import.meta.env.VITE_TEMPO_ENV === 'devnet')
    return 'https://rpc.devnet.tempoxyz.dev'
  if (import.meta.env.VITE_TEMPO_ENV === 'testnet')
    return 'https://rpc.testnet.tempo.xyz'
  const id =
    (typeof import.meta !== 'undefined' &&
      Number(import.meta.env.VITEST_POOL_ID ?? 1) +
        Math.floor(Math.random() * 10_000)) ||
    1 + Math.floor(Math.random() * 10_000)
  return `http://localhost:${port}/${id}`
})()

export async function createServer() {
  const tag = await (async () => {
    if (!import.meta.env.VITE_TEMPO_TAG?.startsWith('http'))
      return import.meta.env.VITE_TEMPO_TAG

    const transport = RpcTransport.fromHttp(import.meta.env.VITE_TEMPO_TAG)
    const result = (await transport.request({
      method: 'web3_clientVersion',
    })) as string
    const sha = result.match(/tempo\/v[\d.]+-([a-f0-9]+)\//)?.[1]
    return `sha-${sha}`
  })()

  const args = {
    blockTime: '2ms',
    log: import.meta.env.VITE_TEMPO_LOG,
    port,
  } satisfies Instance.tempo.Parameters

  console.log({ tag })
  return Server.create({
    instance: TestContainers.Instance.tempo({
      ...args,
      image: `ghcr.io/tempoxyz/tempo:${tag ?? 'latest'}`,
    }),
    port,
  })
}
